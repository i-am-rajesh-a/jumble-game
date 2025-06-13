import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

// In-memory storage (in production, use a database)
const rooms = new Map();
const players = new Map();

// Enhanced word lists with categories
const wordCategories = {
  technology: [
    'javascript', 'python', 'computer', 'programming', 'algorithm', 'database',
    'frontend', 'backend', 'developer', 'software', 'website', 'application',
    'function', 'variable', 'array', 'object', 'string', 'number', 'boolean',
    'framework', 'library', 'component', 'interface', 'responsive', 'design',
    'artificial', 'intelligence', 'machine', 'learning', 'blockchain', 'cryptocurrency'
  ],
  animals: [
    'elephant', 'giraffe', 'penguin', 'butterfly', 'dolphin', 'kangaroo',
    'cheetah', 'octopus', 'flamingo', 'rhinoceros', 'hippopotamus', 'crocodile',
    'chameleon', 'platypus', 'armadillo', 'hedgehog', 'mongoose', 'meerkat'
  ],
  food: [
    'pizza', 'hamburger', 'spaghetti', 'chocolate', 'strawberry', 'pineapple',
    'avocado', 'broccoli', 'sandwich', 'pancake', 'croissant', 'lasagna',
    'quesadilla', 'enchilada', 'burrito', 'tacos', 'sushi', 'ramen'
  ],
  nature: [
    'mountain', 'ocean', 'forest', 'desert', 'rainbow', 'thunder', 'lightning',
    'waterfall', 'volcano', 'glacier', 'meadow', 'canyon', 'valley', 'plateau',
    'archipelago', 'peninsula', 'tundra', 'savanna', 'prairie', 'oasis'
  ]
};

// Get all words from all categories
const getAllWords = () => {
  return Object.values(wordCategories).flat();
};

// Utility functions
function scrambleWord(word) {
  const arr = word.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  // Ensure the scrambled word is different from original
  const scrambled = arr.join('');
  return scrambled === word ? scrambleWord(word) : scrambled;
}

function calculatePositionScore(position, wordLength) {
  if (position === 1) return 10 + wordLength * 10; // First correct guess
  if (position === 2) return 8 + wordLength * 10;  // Second correct guess
  return 5 + wordLength * 10;                     // Later correct guesses
}

function getWordHint(word) {
  const hints = {
    // Technology hints
    'javascript': 'A popular programming language for web development',
    'python': 'A snake-named programming language',
    'algorithm': 'A step-by-step procedure for solving problems',
    'database': 'Organized collection of data',
    'frontend': 'The user-facing part of an application',
    'backend': 'Server-side of an application',
    'framework': 'A platform for developing software applications',
    'responsive': 'Design that adapts to different screen sizes',
    
    // Animals hints
    'elephant': 'Largest land mammal with a trunk',
    'giraffe': 'Tallest mammal with a long neck',
    'penguin': 'Flightless bird that lives in cold climates',
    'dolphin': 'Intelligent marine mammal',
    'kangaroo': 'Marsupial that hops and has a pouch',
    'cheetah': 'Fastest land animal',
    
    // Food hints
    'pizza': 'Italian dish with cheese and toppings',
    'hamburger': 'Sandwich with a meat patty',
    'chocolate': 'Sweet treat made from cocoa',
    'avocado': 'Green fruit rich in healthy fats',
    'spaghetti': 'Long thin pasta',
    
    // Nature hints
    'mountain': 'Large natural elevation of earth',
    'ocean': 'Large body of salt water',
    'rainbow': 'Colorful arc in the sky after rain',
    'waterfall': 'Water falling from a height',
    'volcano': 'Mountain that can erupt lava'
  };
  
  return hints[word.toLowerCase()] || `A word with ${word.length} letters`;
}

// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.post('/api/create-room', (req, res) => {
  try {
    const { roomName, isPublic, timePerRound, maxPlayers, difficulty } = req.body;
    const parsedMaxPlayers = parseInt(maxPlayers);
    
    // Enforce max 8 players
    if (parsedMaxPlayers > 8 || parsedMaxPlayers < 2) {
      return res.status(400).json({ error: 'Maximum players must be between 2 and 8' });
    }

    const roomId = uuidv4().substring(0, 8).toUpperCase();
    
    const room = {
      id: roomId,
      name: roomName,
      isPublic,
      timePerRound: parseInt(timePerRound),
      maxPlayers: parsedMaxPlayers,
      difficulty: difficulty || 'medium',
      players: [],
      status: 'waiting', // waiting, playing, finished
      currentRound: 0,
      maxRounds: 5,
      currentWord: '',
      scrambledWord: '',
      currentPlayerIndex: 0,
      scores: {},
      roundScores: {}, // Track scores earned in current round
      achievements: {},
      gameTimer: null,
      roundStartTime: null,
      hints: [],
      powerUps: {},
      streaks: {},
      turnOrder: [],
      correctGuesses: []
    };
    
    rooms.set(roomId, room);
    res.json({ roomId, room });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

app.get('/api/rooms', (req, res) => {
  try {
    const publicRooms = Array.from(rooms.values())
      .filter(room => room.isPublic && room.status === 'waiting')
      .map(room => ({
        id: room.id,
        name: room.name,
        players: room.players.length,
        maxPlayers: room.maxPlayers,
        difficulty: room.difficulty
      }));
    
    res.json(publicRooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

app.get('/api/room/:id', (req, res) => {
  try {
    const room = rooms.get(req.params.id);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json(room);
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ error: 'Failed to fetch room' });
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', ({ roomId, playerName }) => {
    try {
      const room = rooms.get(roomId);
      if (!room) {
        socket.emit('error', 'Room not found');
        return;
      }

      if (room.players.length >= room.maxPlayers) {
        socket.emit('error', 'Room is full');
        return;
      }

      if (room.players.some(p => p.name === playerName)) {
        socket.emit('error', 'Player name already taken');
        return;
      }

      const player = {
        id: socket.id,
        name: playerName,
        score: 0,
        isHost: room.players.length === 0,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${playerName}`,
        achievements: [],
        streak: 0,
        powerUps: []
      };

      room.players.push(player);
      room.scores[socket.id] = 0;
      room.roundScores[socket.id] = 0;
      room.achievements[socket.id] = [];
      room.streaks[socket.id] = 0;
      if (room.status !== 'playing') {
        room.turnOrder.push(player); // Add to turn order in waiting state
      }
      players.set(socket.id, { ...player, roomId });

      socket.join(roomId);
      socket.emit('joined-room', { room, player });
      socket.to(roomId).emit('player-joined', player);
      io.to(roomId).emit('room-updated', room);
      console.log(`Player ${playerName} joined room ${roomId}. Turn order: ${room.turnOrder.map(p => p.name).join(', ')}`);
    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', 'Failed to join room');
    }
  });

  socket.on('start-game', ({ roomId }) => {
    try {
      const room = rooms.get(roomId);
      const player = players.get(socket.id);
      
      if (!room || !player || !player.isHost) {
        socket.emit('error', 'Only the host can start the game');
        return;
      }

      if (room.players.length < 2) {
        socket.emit('error', 'Need at least 2 players to start');
        return;
      }

      room.status = 'playing';
      room.currentRound = 1;
      room.currentPlayerIndex = 0;
      room.turnOrder = shuffleArray(room.players); // Initialize turn order
      room.roundScores = room.players.reduce((acc, p) => ({ ...acc, [p.id]: 0 }), {});
      
      console.log(`Game started in room ${roomId}. Round 1 turn order: ${room.turnOrder.map(p => p.name).join(', ')}`);
      startNewRound(room);
      io.to(roomId).emit('game-started', room);
    } catch (error) {
      console.error('Error starting game:', error);
      socket.emit('error', 'Failed to start game');
    }
  });

  socket.on('submit-word', ({ roomId, word }) => {
    try {
      const room = rooms.get(roomId);
      if (!room || room.status !== 'playing') {
        socket.emit('error', 'Game not in progress');
        return;
      }

      const currentPlayer = room.turnOrder[room.currentPlayerIndex];
      if (socket.id !== currentPlayer.id) {
        console.log(`Invalid word submission attempt by ${socket.id} (not ${currentPlayer.id}) in room ${roomId}`);
        socket.emit('error', 'Not your turn to submit a word');
        return;
      }

      const selectedWord = word.toLowerCase().trim();
      if (selectedWord.length < 3) {
        socket.emit('error', 'Word must be at least 3 letters long');
        return;
      }

      room.currentWord = selectedWord;
      room.scrambledWord = scrambleWord(selectedWord);
      room.roundStartTime = Date.now();
      room.hints = [getWordHint(selectedWord)];
      room.correctGuesses = [];

      io.to(roomId).emit('word-scrambled', {
        scrambledWord: room.scrambledWord,
        round: room.currentRound,
        hint: room.hints[0],
        wordLength: selectedWord.length,
        wordSetterId: currentPlayer.id
      });

      room.gameTimer = setTimeout(() => {
        endRound(room);
      }, room.timePerRound * 1000);
      console.log(`Word submitted by ${currentPlayer.name} in room ${roomId}: ${selectedWord}`);
    } catch (error) {
      console.error('Error submitting word:', error);
      socket.emit('error', 'Failed to submit word');
    }
  });

  socket.on('submit-guess', ({ roomId, guess }) => {
    try {
      const room = rooms.get(roomId);
      const player = players.get(socket.id);
      
      if (!room || !player || room.status !== 'playing') return;

      const currentPlayer = room.turnOrder[room.currentPlayerIndex];
      if (player.id === currentPlayer.id) {
        socket.emit('error', 'You cannot guess your own word');
        return;
      }

      const isCorrect = guess.toLowerCase().trim() === room.currentWord;
      
      if (isCorrect) {
        room.correctGuesses.push({ playerId: socket.id, timestamp: Date.now() });
        const position = room.correctGuesses.length;
        const timeElapsed = Date.now() - room.roundStartTime;
        const timeLeft = Math.max(0, room.timePerRound * 1000 - timeElapsed);
        const score = calculatePositionScore(position, room.currentWord.length);
        
        room.scores[socket.id] += score;
        room.roundScores[socket.id] += score;
        player.score += score;
        
        room.streaks[socket.id] = (room.streaks[socket.id] || 0) + 1;
        
        checkAchievements(room, socket.id, score, room.streaks[socket.id]);

        io.to(roomId).emit('correct-guess', {
          playerId: socket.id,
          playerName: player.name,
          word: room.currentWord,
          score,
          streak: room.streaks[socket.id],
          position
        });

        const nonWordSetterPlayers = room.players.length - 1;
        if (room.correctGuesses.length === nonWordSetterPlayers) {
          const wordSetterId = currentPlayer.id;
          const secondPlaceScore = calculatePositionScore(2, room.currentWord.length);
          room.scores[wordSetterId] += secondPlaceScore;
          room.roundScores[wordSetterId] += secondPlaceScore;
          room.players.find(p => p.id === wordSetterId).score += secondPlaceScore;

          clearTimeout(room.gameTimer);
          io.to(roomId).emit('all-guessed', {
            wordSetterId,
            score: secondPlaceScore
          });

          setTimeout(() => {
            nextTurn(room);
          }, 2000);
        }
      } else {
        room.streaks[socket.id] = 0;
        socket.emit('incorrect-guess', guess);
      }
    } catch (error) {
      console.error('Error submitting guess:', error);
      socket.emit('error', 'Failed to submit guess');
    }
  });

  socket.on('use-hint', ({ roomId }) => {
    try {
      const room = rooms.get(roomId);
      const player = players.get(socket.id);
      
      if (!room || !player || room.status !== 'playing') return;
      
      const currentPlayer = room.turnOrder[room.currentPlayerIndex];
      if (player.id === currentPlayer.id) {
        socket.emit('error', 'You cannot use hints for your own word');
        return;
      }
      
      const hintCost = 10;
      room.scores[socket.id] = Math.max(0, room.scores[socket.id] - hintCost);
      room.roundScores[socket.id] = Math.max(0, room.roundScores[socket.id] - hintCost);
      player.score = Math.max(0, player.score - hintCost);
      
      socket.emit('hint-used', {
        hint: room.hints[0],
        cost: hintCost
      });
    } catch (error) {
      console.error('Error using hint:', error);
      socket.emit('error', 'Failed to use hint');
    }
  });

  socket.on('send-message', ({ roomId, message }) => {
    try {
      const room = rooms.get(roomId);
      const player = players.get(socket.id);
      
      if (!room || !player) return;
      
      io.to(roomId).emit('new-message', {
        playerId: socket.id,
        playerName: player.name,
        message,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    try {
      const player = players.get(socket.id);
      
      if (player) {
        const room = rooms.get(player.roomId);
        if (room) {
          room.players = room.players.filter(p => p.id !== socket.id);
          room.turnOrder = room.turnOrder.filter(p => p.id !== socket.id);
          delete room.scores[socket.id];
          delete room.roundScores[socket.id];
          delete room.achievements[socket.id];
          delete room.streaks[socket.id];
          
          if (room.players.length === 0) {
            clearTimeout(room.gameTimer);
            rooms.delete(player.roomId);
            console.log(`Room ${player.roomId} deleted (no players left)`);
          } else {
            if (player.isHost && room.players.length > 0) {
              room.players[0].isHost = true;
              console.log(`New host assigned: ${room.players[0].name} in room ${roomId}`);
            }
            
            if (room.status === 'playing') {
              if (room.turnOrder.length < 2) {
                endGame(room);
              } else {
                if (room.currentPlayerIndex >= room.turnOrder.length) {
                  room.currentPlayerIndex = 0;
                }
                if (room.turnOrder[room.currentPlayerIndex]?.id === socket.id) {
                  clearTimeout(room.gameTimer);
                  nextTurn(room);
                }
              }
            }
            
            io.to(player.roomId).emit('player-left', socket.id);
            io.to(player.roomId).emit('room-updated', room);
            console.log(`Player ${player.name} left room ${player.roomId}. New turn order: ${room.turnOrder.map(p => p.name).join(', ')}`);
          }
        }
        players.delete(socket.id);
      }
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  });
});

function startNewRound(room) {
  if (room.players.length < 2) {
    room.status = 'waiting';
    io.to(room.id).emit('error', 'Not enough players to continue. Returning to lobby.');
    io.to(room.id).emit('room-updated', room);
    return;
  }

  // Shuffle turn order only at the start of a new round
  if (room.currentPlayerIndex === 0) {
    room.turnOrder = shuffleArray(room.players);
    room.roundScores = room.players.reduce((acc, p) => ({ ...acc, [p.id]: 0 }), {});
    console.log(`Shuffled turn order for round ${room.currentRound} in room ${room.id}: ${room.turnOrder.map(p => p.name).join(', ')}`);
  }

  room.currentWord = '';
  room.scrambledWord = '';
  room.roundStartTime = null;
  room.correctGuesses = [];
  
  const currentPlayer = room.turnOrder[room.currentPlayerIndex];
  // Emit new-round to each player with personalized isYourTurn
  room.players.forEach(player => {
    io.to(player.id).emit('new-round', {
      round: room.currentRound,
      maxRounds: room.maxRounds,
      currentPlayerId: currentPlayer.id,
      currentPlayer: currentPlayer.name,
      isYourTurn: player.id === currentPlayer.id
    });
  });
  
  io.to(currentPlayer.id).emit('your-turn');
  console.log(`Turn in round ${room.currentRound} in room ${room.id}. Current player: ${currentPlayer.name}, Index: ${room.currentPlayerIndex}`);
}

function nextTurn(room) {
  if (room.turnOrder.length < 2) {
    endGame(room);
    return;
  }

  room.currentPlayerIndex++;

  if (room.currentPlayerIndex >= room.turnOrder.length) {
    // Round complete, announce winner
    const winner = determineRoundWinner(room);
    io.to(room.id).emit('round-winner', winner);
    console.log(`Round ${room.currentRound} winner in room ${room.id}: ${winner.playerName} with ${winner.score} points`);

    room.currentRound++;
    room.currentPlayerIndex = 0;
    if (room.currentRound > room.maxRounds) {
      endGame(room);
      return;
    }
  }
  
  startNewRound(room);
  console.log(`Next turn in room ${room.id}. Round: ${room.currentRound}, Current player index: ${room.currentPlayerIndex}`);
}

function determineRoundWinner(room) {
  let maxScore = -Infinity;
  let winnerId = null;
  let winnerName = '';

  for (const player of room.players) {
    const score = room.roundScores[player.id] || 0;
    if (score > maxScore) {
      maxScore = score;
      winnerId = player.id;
      winnerName = player.name;
    }
  }

  return {
    playerId: winnerId,
    playerName: winnerName,
    score: maxScore
  };
}

function endRound(room) {
  clearTimeout(room.gameTimer);
  if (room.correctGuesses.length === 0) {
    const wordSetterId = room.turnOrder[room.currentPlayerIndex].id;
    const bonusPoints = 5;
    room.scores[wordSetterId] = (room.scores[wordSetterId] || 0) + bonusPoints;
    room.roundScores[wordSetterId] = (room.roundScores[wordSetterId] || 0) + bonusPoints;
    room.players.find(p => p.id === wordSetterId).score += bonusPoints;
    io.to(room.id).emit('no-guesses', {
      wordSetterId,
      score: bonusPoints
    });
  }

  io.to(room.id).emit('round-ended', {
    word: room.currentWord,
    scrambledWord: room.scrambledWord
  });
  
  setTimeout(() => {
    nextTurn(room);
  }, 3000);

  io.to(room.id).emit('room-updated', room);
  console.log(`Round ${room.currentRound} turn ended in room ${room.id} for player ${room.turnOrder[room.currentPlayerIndex].name}`);
}

function endGame(room) {
  room.status = 'finished';
  clearTimeout(room.gameTimer);
  
  const leaderboard = room.players
    .map(player => ({
      name: player.name,
      score: room.scores[player.id] || 0,
      achievements: room.achievements[player.id] || [],
      maxStreak: room.streaks[player.id] || 0
    }))
    .sort((a, b) => b.score - a.score);
  
  io.to(room.id).emit('game-ended', { leaderboard });
  console.log(`Game ended in room ${room.id}. Leaderboard: ${JSON.stringify(leaderboard.map(p => p.name + ': ' + p.score))}`);
}

function checkAchievements(room, playerId, score, streak) {
  const achievements = room.achievements[playerId] || [];
  const newAchievements = [];
  
  if (achievements.length === 0) {
    newAchievements.push({
      id: 'first-correct',
      name: 'First Success',
      description: 'Got your first word correct!',
      icon: '🎯'
    });
  }
  
  if (score >= 100 && !achievements.some(a => a.id === 'high-scorer')) {
    newAchievements.push({
      id: 'high-scorer',
      name: 'High Scorer',
      description: 'Scored 100+ points in a single round!',
      icon: '⭐'
    });
  }
  
  if (streak === 3 && !achievements.some(a => a.id === 'streak-3')) {
    newAchievements.push({
      id: 'streak-3',
      name: 'On Fire',
      description: 'Got 3 words correct in a row!',
      icon: '🔥'
    });
  }
  
  if (streak === 5 && !achievements.some(a => a.id === 'streak-5')) {
    newAchievements.push({
      id: 'streak-5',
      name: 'Unstoppable',
      description: 'Got 5 words correct in a row!',
      icon: '🚀'
    });
  }
  
  if (newAchievements.length > 0) {
    room.achievements[playerId] = [...achievements, ...newAchievements];
    io.to(playerId).emit('achievement-unlocked', newAchievements);
  }
}

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🎮 Game server ready for connections!`);
  console.log(`📱 Frontend will be available at http://localhost:${PORT}`);
});