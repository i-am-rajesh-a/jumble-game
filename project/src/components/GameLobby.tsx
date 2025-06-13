import React, { useState} from 'react';
import { Crown, Users, Play, Copy, Check, ArrowLeft, Zap, Clock, Globe, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Room, Player } from '../types/game';
import { useSocket } from '../contexts/SocketContext';

interface GameLobbyProps {
  room: Room;
  currentPlayer: Player;
  onNavigate: (page: string) => void;
}

const GameLobby: React.FC<GameLobbyProps> = ({ room, currentPlayer, onNavigate }) => {
  const { socket } = useSocket();
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(room.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const startGame = () => {
    if (currentPlayer.isHost && socket) {
      setCountdown(3);
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            socket.emit('start-game', { roomId: room.id });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="absolute inset-0 bg-black/20"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <motion.button
            onClick={() => onNavigate('home')}
            className="flex items-center text-white/80 hover:text-white mb-8 transition-colors"
            whileHover={{ x: -5 }}
            transition={{ duration: 0.2 }}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Leave Room
          </motion.button>

          <motion.div 
            className="grid lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Room Info */}
            <div className="lg:col-span-2">
              <motion.div 
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 mb-8"
                variants={itemVariants}
              >
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-3xl font-bold text-white">{room.name}</h1>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    room.isPublic 
                      ? 'bg-green-500/20 text-green-300 border border-green-400/30' 
                      : 'bg-orange-500/20 text-orange-300 border border-orange-400/30'
                  }`}>
                    {room.isPublic ? (
                      <>
                        <Globe className="w-3 h-3 inline mr-1" />
                        Public
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3 inline mr-1" />
                        Private
                      </>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <motion.div 
                    className="bg-white/5 rounded-lg p-4"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="text-white/70 text-sm">Room Code</div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-white tracking-widest">{room.id}</span>
                      <motion.button
                        onClick={copyRoomCode}
                        className="text-white/70 hover:text-white transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </motion.button>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-white/5 rounded-lg p-4"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="text-white/70 text-sm">Players</div>
                    <div className="text-2xl font-bold text-white">
                      {room.players.length}/{room.maxPlayers}
                    </div>
                  </motion.div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <motion.div 
                    className="bg-white/5 rounded-lg p-4"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="text-white/70 text-sm flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      Time per Round
                    </div>
                    <div className="text-xl font-semibold text-white">{room.timePerRound}s</div>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-white/5 rounded-lg p-4"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="text-white/70 text-sm flex items-center">
                      <Zap className="w-3 h-3 mr-1" />
                      Difficulty
                    </div>
                    <div className={`text-xl font-semibold capitalize ${
                      room.difficulty === 'easy' ? 'text-green-400' :
                      room.difficulty === 'medium' ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {room.difficulty}
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-white/5 rounded-lg p-4"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="text-white/70 text-sm">Rounds</div>
                    <div className="text-xl font-semibold text-white">{room.maxRounds}</div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Start Game Button */}
              <motion.div variants={itemVariants}>
                {currentPlayer.isHost && (
                  <motion.button
                    onClick={startGame}
                    disabled={room.players.length < 2 || countdown > 0}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-700 disabled:opacity-50 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 text-xl relative overflow-hidden"
                    whileHover={{ scale: countdown > 0 ? 1 : 1.02 }}
                    whileTap={{ scale: countdown > 0 ? 1 : 0.98 }}
                  >
                    <AnimatePresence>
                      {countdown > 0 ? (
                        <motion.div
                          key="countdown"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="flex items-center justify-center"
                        >
                          <motion.span
                            className="text-4xl font-bold"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                          >
                            {countdown}
                          </motion.span>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="start"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center justify-center"
                        >
                          <Play className="w-6 h-6 inline mr-3" />
                          Start Game
                          {room.players.length < 2 && (
                            <div className="text-sm font-normal mt-1 absolute bottom-2 left-1/2 transform -translate-x-1/2">
                              Need at least 2 players to start
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                )}

                {!currentPlayer.isHost && (
                  <div className="bg-white/5 rounded-xl p-6 text-center">
                    <div className="text-white/70 mb-2">Waiting for host to start the game...</div>
                    <div className="animate-pulse flex justify-center">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Players List */}
            <motion.div 
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 h-fit"
              variants={itemVariants}
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Players
              </h2>
              
              <div className="space-y-3">
                <AnimatePresence>
                  {room.players.map((player, index) => (
                    <motion.div
                      key={player.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        player.id === currentPlayer.id
                          ? 'bg-purple-500/20 border border-purple-400/30'
                          : 'bg-white/5'
                      }`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center">
                        {player.isHost && (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          >
                            <Crown className="w-4 h-4 text-yellow-400 mr-2" />
                          </motion.div>
                        )}
                        <span className="text-white font-medium">{player.name}</span>
                        {player.id === currentPlayer.id && (
                          <span className="text-purple-300 text-sm ml-2">(You)</span>
                        )}
                      </div>
                      <div className="text-white/70 text-sm">
                        {player.isHost ? 'Host' : 'Player'}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {room.players.length < room.maxPlayers && (
                <motion.div 
                  className="mt-4 p-3 border-2 border-dashed border-white/20 rounded-lg text-center"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="text-white/50 text-sm">
                    Waiting for more players...
                  </div>
                </motion.div>
              )}

              {/* Game Rules */}
              <motion.div 
                className="mt-6 p-4 bg-white/5 rounded-lg"
                variants={itemVariants}
              >
                <h3 className="text-white font-semibold mb-2">How to Play</h3>
                <ul className="text-white/70 text-sm space-y-1">
                  <li>• Take turns giving words to scramble</li>
                  <li>• Race to unscramble other players' words</li>
                  <li>• Earn points based on speed and accuracy</li>
                  <li>• Use hints if you get stuck (-10 points)</li>
                  <li>• Build streaks for bonus points!</li>
                </ul>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default GameLobby;