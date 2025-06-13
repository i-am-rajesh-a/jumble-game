import React, { useState, useEffect } from 'react';
import { Trophy, Send, Zap, Lightbulb, MessageCircle, X, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { Room, Player, RoundWinner } from '../types/game';
import { useSocket } from '../contexts/SocketContext';

interface GamePlayProps {
  room: Room;
  currentPlayer: Player;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface Message {
  playerId: string;
  playerName: string;
  message: string;
  timestamp: number;
}

const GamePlay: React.FC<GamePlayProps> = ({ room, currentPlayer }) => {
  const { socket } = useSocket();
  const [guess, setGuess] = useState('');
  const [timeLeft, setTimeLeft] = useState(room.timePerRound);
  const [currentTurn, setCurrentTurn] = useState('');
  const [currentTurnId, setCurrentTurnId] = useState('');
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [wordToSubmit, setWordToSubmit] = useState('');
  const [showWordModal, setShowWordModal] = useState(false);
  const [scrambledWord, setScrambledWord] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect' | 'info'; message: string } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [showAchievement, setShowAchievement] = useState(false);
  const [streak, setStreak] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [hintUsed, setHintUsed] = useState(false);
  const [wordSetterId, setWordSetterId] = useState('');
  const [roundWinner, setRoundWinner] = useState<RoundWinner | null>(null);
  const [showRoundWinner, setShowRoundWinner] = useState(false);

  useEffect(() => {
    if (!socket) return;

    socket.on('new-round', (data) => {
      setCurrentTurn(data.currentPlayer);
      setCurrentTurnId(data.currentPlayerId);
      setIsMyTurn(data.isYourTurn);
      setTimeLeft(room.timePerRound);
      setScrambledWord('');
      setGuess('');
      setFeedback(null);
      setHintUsed(false);
      setWordSetterId('');
      console.log(`Frontend: New round ${data.round}, Current player: ${data.currentPlayer}, isYourTurn: ${data.isYourTurn}`);
    });

    socket.on('your-turn', () => {
      setIsMyTurn(true);
      setShowWordModal(true);
      console.log(`Frontend: Your turn for player ${currentPlayer.name}`);
    });

    socket.on('word-scrambled', (data) => {
      setScrambledWord(data.scrambledWord);
      setShowWordModal(false);
      setIsMyTurn(false);
      setTimeLeft(room.timePerRound);
      setWordSetterId(data.wordSetterId);
      
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    });

    socket.on('correct-guess', (data) => {
      setFeedback({
        type: 'correct',
        message: `${data.playerName} guessed "${data.word}" correctly! (+${data.score} points${
          data.position === 1 ? ' - 1st!' : data.position === 2 ? ' - 2nd!' : ` - ${data.position}th!`
        })`
      });
      setStreak(data.streak || 0);
      
      if (data.playerId === currentPlayer.id) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    });

    socket.on('incorrect-guess', (incorrectGuess) => {
      setFeedback({
        type: 'incorrect',
        message: `"${incorrectGuess}" is not correct. Try again!`
      });
      setTimeout(() => setFeedback(null), 2000);
    });

    socket.on('round-ended', (data) => {
      if (data.word) {
        setFeedback({
          type: 'info',
          message: `Time's up! The word was "${data.word}"`
        });
      }
    });

    socket.on('no-guesses', (data) => {
      if (data.wordSetterId === currentPlayer.id) {
        setFeedback({
          type: 'info',
          message: `No one guessed your word! (+${data.score} points)`
        });
      }
    });

    socket.on('all-guessed', (data) => {
      if (data.wordSetterId === currentPlayer.id) {
        setFeedback({
          type: 'info',
          message: `Everyone guessed your word! (+${data.score} points)`
        });
      }
    });

    socket.on('achievement-unlocked', (newAchievements) => {
      setAchievements(newAchievements);
      setShowAchievement(true);
      setTimeout(() => setShowAchievement(false), 4000);
    });

    socket.on('hint-used', (data) => {
      setFeedback({
        type: 'info',
        message: `Hint: ${data.hint} (-${data.cost} points)`
      });
      setHintUsed(true);
      setTimeout(() => setFeedback(null), 3000);
    });

    socket.on('new-message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on('round-winner', (winner) => {
      setRoundWinner(winner);
      setShowRoundWinner(true);
      setTimeout(() => setShowRoundWinner(false), 5000);
      console.log(`Frontend: Round ${room.currentRound} winner: ${winner.playerName} with ${winner.score} points`);
    });

    socket.on('error', (message) => {
      console.log(`Frontend: Error received: ${message}`);
      setFeedback({
        type: 'incorrect',
        message: message
      });
      setTimeout(() => setFeedback(null), 3000);
    });

    return () => {
      socket.off('new-round');
      socket.off('your-turn');
      socket.off('word-scrambled');
      socket.off('correct-guess');
      socket.off('incorrect-guess');
      socket.off('round-ended');
      socket.off('no-guesses');
      socket.off('all-guessed');
      socket.off('achievement-unlocked');
      socket.off('hint-used');
      socket.off('new-message');
      socket.off('round-winner');
      socket.off('error');
    };
  }, [socket, room, currentPlayer.id]);

  const submitWord = () => {
    if (wordToSubmit.trim() && socket && isMyTurn) {
      socket.emit('submit-word', { roomId: room.id, word: wordToSubmit });
      setWordToSubmit('');
      setShowWordModal(false);
      console.log(`Frontend: Submitted word by ${currentPlayer.name}`);
    }
  };

  const submitGuess = (e: React.FormEvent) => {
    e.preventDefault();
    if (guess.trim() && socket && currentPlayer.id !== wordSetterId) {
      socket.emit('submit-guess', { roomId: room.id, guess });
      setGuess('');
    }
  };

  const useHint = () => {
    if (socket && !hintUsed && currentPlayer.id !== wordSetterId) {
      socket.emit('use-hint', { roomId: room.id });
    }
  };

  const sendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const input = form.elements[0] as HTMLInputElement;
    const message = input.value.trim();
    if (message && socket) {
      socket.emit('send-message', { roomId: room.id, message });
      input.value = '';
    }
  };

  const sortedPlayers = [...room.players].sort((a, b) => (room.scores[b.id] || 0) - (room.scores[a.id] || 0));

  // Define animation delay classes
  const bounceDelays = ['animate-bounce', 'animate-bounce delay-100', 'animate-bounce delay-200'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      
      <div className="absolute inset-0 bg-black/20"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div 
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-center md:text-left mb-4 md:mb-0">
                <h1 className="text-2xl font-bold text-white">Round {room.currentRound}/{room.maxRounds}</h1>
                <p className="text-white/70">
                  {isMyTurn ? 'Your turn to submit a word!' : `Waiting for ${currentTurn} to submit a word`}
                  {currentPlayer.isHost && <span className="text-yellow-400 ml-2">(Host)</span>}
                </p>
                {streak > 0 && (
                  <div className="flex items-center mt-2">
                    <Zap className="w-4 h-4 text-yellow-400 mr-1" />
                    <span className="text-yellow-400 font-semibold">{streak} streak!</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-white/70 text-sm">Time Left</div>
                  <motion.div 
                    className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-red-400' : 'text-white'}`}
                    animate={timeLeft <= 10 ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.5, repeat: timeLeft <= 10 ? Infinity : 0 }}
                  >
                    {timeLeft}s
                  </motion.div>
                </div>
                
                <button
                  onClick={() => setShowChat(!showChat)}
                  className="relative bg-white/10 hover:bg-white/20 p-3 rounded-lg transition-all"
                  title="Open chat"
                >
                  <MessageCircle className="w-5 h-5 text-white" />
                  {messages.length > 0 && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {messages.length}
                    </div>
                  )}
                </button>
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Game Area */}
            <div className="lg:col-span-2">
              {/* Word Display */}
              <motion.div 
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 mb-8 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                {scrambledWord ? (
                  <>
                    <div className="text-white/70 mb-4">Unscramble this word:</div>
                    <div className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-wider">
                      {scrambledWord.split('').map((letter, index) => (
                        <motion.span
                          key={index}
                          className="inline-block mx-1 p-3 bg-white/20 rounded-lg"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.5 }}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                        >
                          {letter.toUpperCase()}
                        </motion.span>
                      ))}
                    </div>
                    
                    {!hintUsed && currentPlayer.id !== wordSetterId && (
                      <motion.button
                        onClick={useHint}
                        className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 px-4 py-2 rounded-lg transition-all mb-4"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Lightbulb className="w-4 h-4 inline mr-2" />
                        Use Hint (-10 points)
                      </motion.button>
                    )}
                  </>
                ) : (
                  <div className="text-white/50 text-xl">
                    Waiting for {currentTurn} to submit a word...
                    <div className="mt-4">
                      <div className="animate-pulse flex justify-center">
                        <div className="flex space-x-1">
                          {bounceDelays.map((delayClass, index) => (
                            <div
                              key={index}
                              className={`w-2 h-2 bg-white/50 rounded-full ${delayClass}`}
                            ></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Guess Input */}
              {scrambledWord && !isMyTurn && currentPlayer.id !== wordSetterId && (
                <motion.form 
                  onSubmit={submitGuess} 
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="flex gap-4">
                    <input
                      type="text"
                      value={guess}
                      onChange={(e) => setGuess(e.target.value)}
                      className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg transition-all"
                      placeholder="Enter your guess..."
                      disabled={timeLeft === 0}
                    />
                    <motion.button
                      type="submit"
                      disabled={!guess.trim() || timeLeft === 0}
                      className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 disabled:from-gray-600 disabled:to-gray-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg transition-all font-semibold"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Send className="w-5 h-5" />
                    </motion.button>
                  </div>
                </motion.form>
              )}

              {/* Feedback */}
              <AnimatePresence>
                {feedback && (
                  <motion.div 
                    className={`mt-4 p-4 rounded-lg ${
                      feedback.type === 'correct' ? 'bg-green-500/20 border border-green-400/30' :
                      feedback.type === 'incorrect' ? 'bg-red-500/20 border border-red-400/30' :
                      'bg-blue-500/20 border border-blue-400/30'
                    }`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className={`font-semibold ${
                      feedback.type === 'correct' ? 'text-green-300' :
                      feedback.type === 'incorrect' ? 'text-red-300' :
                      'text-blue-300'
                    }`}>
                      {feedback.message}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Scoreboard */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 h-fit">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                Leaderboard
              </h2>
              
              <div className="space-y-3">
                {sortedPlayers.map((player, index) => (
                  <motion.div
                    key={player.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      index === 0 ? 'bg-yellow-500/20 border border-yellow-400/30' :
                      player.id === currentPlayer.id ? 'bg-purple-500/20 border border-purple-400/30' :
                      'bg-white/5'
                    }`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 ${
                        index === 0 ? 'bg-yellow-400 text-black' :
                        index === 1 ? 'bg-gray-400 text-black' :
                        index === 2 ? 'bg-orange-400 text-black' :
                        'bg-white/20 text-white'
                      }`}>
                        {index === 0 ? '👑' : index + 1}
                      </div>
                      <span className="text-white font-medium">{player.name}</span>
                      {player.id === currentPlayer.id && (
                        <span className="text-purple-300 text-sm ml-2">(You{currentPlayer.isHost ? ', Host' : ''})</span>
                      )}
                      {player.id === currentTurnId && (
                        <span className="text-green-300 text-sm ml-2">(Turn)</span>
                      )}
                    </div>
                    <div className="flex items-center">
                      <Zap className="w-4 h-4 text-yellow-400 mr-1" />
                      <span className="text-white font-bold">{room.scores[player.id] || 0}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Word Submission Modal */}
      <AnimatePresence>
        {showWordModal && isMyTurn && (
          <motion.div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 max-w-md w-full mx-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-6">
                <div className="bg-purple-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-purple-300" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Your Turn!</h2>
                <p className="text-white/70">Enter a word for other players to guess</p>
              </div>
              
              <div className="space-y-4">
                <input
                  type="text"
                  value={wordToSubmit}
                  onChange={(e) => setWordToSubmit(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-xl"
                  placeholder="Enter a word..."
                  autoFocus
                />
                
                <motion.button
                  onClick={submitWord}
                  disabled={!wordToSubmit.trim() || !isMyTurn}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-600 disabled:to-gray-700 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-lg transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Submit Word
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievement Notification */}
      <AnimatePresence>
        {showAchievement && achievements.length > 0 && (
          <motion.div 
            className="fixed top-4 right-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-2xl p-6 border border-yellow-400/30 z-50 max-w-sm"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center">
              <div className="text-4xl mb-2">{achievements[0].icon}</div>
              <h3 className="text-lg font-bold text-white mb-1">Achievement Unlocked!</h3>
              <p className="text-yellow-300 font-semibold">{achievements[0].name}</p>
              <p className="text-white/70 text-sm">{achievements[0].description}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Round Winner Notification */}
      <AnimatePresence>
        {showRoundWinner && roundWinner && (
          <motion.div 
            className="fixed top-20 right-4 bg-gradient-to-r from-green-500/20 to-teal-500/20 backdrop-blur-sm rounded-2xl p-6 border border-green-400/30 z-50 max-w-sm"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center">
              <div className="text-4xl mb-2">
                <Crown className="w-10 h-10 text-yellow-400 mx-auto" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Round {room.currentRound - 1} Winner!</h3>
              <p className="text-green-300 font-semibold">{roundWinner.playerName}</p>
              <p className="text-white/70 text-sm">{roundWinner.score} points</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {showChat && (
          <motion.div 
            className="fixed right-4 bottom-4 w-80 h-96 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 z-40 flex flex-col"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between p-4 border-b border-white/20">
              <h3 className="text-white font-semibold">Chat</h3>
              <button
                onClick={() => setShowChat(false)}
                className="text-white/70 hover:text-white"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {messages.map((message, index) => (
                <div key={index} className="text-sm">
                  <span className="text-purple-300 font-semibold">{message.playerName}: </span>
                  <span className="text-white">{message.message}</span>
                </div>
              ))}
            </div>
            
            <form onSubmit={sendMessage} className="p-4 border-t border-white/20">
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  placeholder="Type a message..."
                />
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg transition-all"
                  title="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GamePlay;