import { useState, useEffect } from 'react';
import { SocketProvider, useSocket } from './contexts/SocketContext';
import LandingPage from './components/LandingPage';
import CreateRoom from './components/CreateRoom';
import JoinRoom from './components/JoinRoom';
import GameLobby from './components/GameLobby';
import GamePlay from './components/GamePlay';
import GameResults from './components/GameResults';
import { Room, Player, GameSettings, LeaderboardEntry } from './types/game';

type Page = 'home' | 'createRoom' | 'joinRoom' | 'lobby' | 'game' | 'results' | 'quickPlay';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [room, setRoom] = useState<Room | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on('joined-room', ({ room, player }) => {
      setRoom(room);
      setCurrentPlayer(player);
      setCurrentPage('lobby');
    });

    socket.on('room-updated', (updatedRoom) => {
      setRoom(updatedRoom);
    });

    socket.on('game-started', (gameRoom) => {
      setRoom(gameRoom);
      setCurrentPage('game');
    });

    socket.on('game-ended', ({ leaderboard: finalLeaderboard }) => {
      setLeaderboard(finalLeaderboard);
      setCurrentPage('results');
    });

    socket.on('error', (error) => {
      alert(error);
    });

    return () => {
      socket.off('joined-room');
      socket.off('room-updated');
      socket.off('game-started');
      socket.off('game-ended');
      socket.off('error');
    };
  }, [socket]);

  const getApiUrl = () => {
    return window.location.hostname === 'localhost' 
      ? 'http://localhost:3001' 
      : window.location.origin;
  };

  const handleCreateRoom = async (settings: GameSettings) => {
    try {
      const response = await fetch(`${getApiUrl()}/api/create-room`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      const data = await response.json();
      if (data.roomId && socket) {
        const playerName = prompt('Enter your name:');
        if (playerName) {
          socket.emit('join-room', { roomId: data.roomId, playerName });
        }
      }
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Failed to create room. Please try again.');
    }
  };

  const handleJoinRoom = (roomId: string, playerName: string) => {
    if (socket) {
      socket.emit('join-room', { roomId, playerName });
    }
  };

  const handleQuickPlay = async () => {
    try {
      const response = await fetch(`${getApiUrl()}/api/rooms`);
      const publicRooms = await response.json();
      
      if (publicRooms.length > 0) {
        const playerName = prompt('Enter your name:');
        if (playerName) {
          handleJoinRoom(publicRooms[0].id, playerName);
        }
      } else {
        // Create a quick room
        const quickSettings = {
          roomName: 'Quick Game',
          isPublic: true,
          timePerRound: 30,
          maxPlayers: 6,
        };
        handleCreateRoom(quickSettings);
      }
    } catch (error) {
      console.error('Error with quick play:', error);
      setCurrentPage('joinRoom');
    }
  };

  const handlePlayAgain = () => {
    setCurrentPage('home');
    setRoom(null);
    setCurrentPlayer(null);
    setLeaderboard([]);
  };

  const handleGoHome = () => {
    setCurrentPage('home');
    setRoom(null);
    setCurrentPlayer(null);
    setLeaderboard([]);
  };

  // Show connection status
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-white mb-2">Connecting to server...</h2>
          <p className="text-white/70">Please wait while we establish connection</p>
        </div>
      </div>
    );
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <LandingPage onNavigate={(page) => {
          if (page === 'quickPlay') {
            handleQuickPlay();
          } else {
            setCurrentPage(page as Page);
          }
        }} />;
      case 'createRoom':
        return <CreateRoom onNavigate={(page: string) => setCurrentPage(page as Page)} onCreateRoom={handleCreateRoom} />;
      case 'joinRoom':
        return <JoinRoom onNavigate={(page: string) => setCurrentPage(page as Page)} onJoinRoom={handleJoinRoom} />;
      case 'lobby':
        return room && currentPlayer ? (
          <GameLobby room={room} currentPlayer={currentPlayer} onNavigate={(page: string) => setCurrentPage(page as Page)} />
        ) : null;
      case 'game':
        return room && currentPlayer ? (
          <GamePlay room={room} currentPlayer={currentPlayer} />
        ) : null;
      case 'results':
        return currentPlayer ? (
          <GameResults 
            leaderboard={leaderboard}
            currentPlayerName={currentPlayer.name}
            onPlayAgain={handlePlayAgain}
            onGoHome={handleGoHome}
          />
        ) : null;
      default:
        return <LandingPage onNavigate={(page: string) => setCurrentPage(page as Page)} />;
    }
  };

  return renderCurrentPage();
}

function App() {
  return (
    <SocketProvider>
      <AppContent />
    </SocketProvider>
  );
}

export default App;