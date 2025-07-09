import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Users, Lock, Globe, RefreshCw, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PublicRoom {
  id: string;
  name: string;
  players: number;
  maxPlayers: number;
  difficulty: string;
}

interface JoinRoomProps {
  onNavigate: (page: string) => void;
  onJoinRoom: (roomId: string, playerName: string) => void;
}

const JoinRoom: React.FC<JoinRoomProps> = ({ onNavigate, onJoinRoom }) => {
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [publicRooms, setPublicRooms] = useState<PublicRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'public' | 'private'>('public');
  const [error, setError] = useState('');

  const getApiUrl = () => {
    return window.location.hostname === 'localhost' 
        ? 'http://localhost:3001'
    : 'https://jumble-backend.onrender.com';
  };

  const fetchPublicRooms = React.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${getApiUrl()}/api/rooms`);
      if (!response.ok) throw new Error('Failed to fetch rooms');
      const rooms = await response.json();
      setPublicRooms(rooms);
    } catch (error) {
      console.error('Error fetching public rooms:', error);
      setError('Failed to load rooms. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPublicRooms();
    const interval = setInterval(fetchPublicRooms, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [fetchPublicRooms]);

  const handleJoinPublicRoom = (roomId: string) => {
    if (playerName.trim()) {
      onJoinRoom(roomId, playerName);
    }
  };

  const handleJoinPrivateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomCode.trim() && playerName.trim()) {
      onJoinRoom(roomCode.toUpperCase(), playerName);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      default: return 'text-white';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="absolute inset-0 bg-black/20"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <motion.button
            onClick={() => onNavigate('home')}
            className="flex items-center text-white/80 hover:text-white mb-8 transition-colors"
            whileHover={{ x: -5 }}
            transition={{ duration: 0.2 }}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </motion.button>

          <motion.div 
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div className="text-center mb-8" variants={itemVariants}>
              <motion.div 
                className="bg-teal-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Search className="w-8 h-8 text-teal-300" />
              </motion.div>
              <h1 className="text-3xl font-bold text-white mb-2">Join Game Room</h1>
              <p className="text-white/70">Find and join an existing game</p>
            </motion.div>

            <motion.div className="mb-6" variants={itemVariants}>
              <label className="block text-white font-medium mb-2">Your Name</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Enter your name..."
                required
              />
            </motion.div>

            <motion.div className="flex space-x-1 mb-6" variants={itemVariants}>
              <button
                onClick={() => setActiveTab('public')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                  activeTab === 'public'
                    ? 'bg-white/20 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <Globe className="w-4 h-4 inline mr-2" />
                Public Rooms
              </button>
              <button
                onClick={() => setActiveTab('private')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                  activeTab === 'private'
                    ? 'bg-white/20 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <Lock className="w-4 h-4 inline mr-2" />
                Private Room
              </button>
            </motion.div>

            <AnimatePresence mode="wait">
              {activeTab === 'public' && (
                <motion.div
                  key="public"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-white">Available Rooms</h3>
                    <motion.button
                      onClick={fetchPublicRooms}
                      disabled={loading}
                      className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </motion.button>
                  </div>

                  {error && (
                    <motion.div 
                      className="bg-red-500/20 border border-red-400/30 text-red-300 p-3 rounded-lg mb-4"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      {error}
                    </motion.div>
                  )}

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white rounded-full mx-auto mb-2"></div>
                        <div className="text-white/50">Loading rooms...</div>
                      </div>
                    ) : publicRooms.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-white/50 mb-2">No public rooms available</div>
                        <div className="text-white/30 text-sm">Create a new room to get started!</div>
                      </div>
                    ) : (
                      publicRooms.map((room, index) => (
                        <motion.div
                          key={room.id}
                          className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-white font-medium">{room.name}</h4>
                              <div className="flex items-center space-x-4 text-sm mt-1">
                                <div className="flex items-center text-white/70">
                                  <Users className="w-4 h-4 mr-1" />
                                  {room.players}/{room.maxPlayers} players
                                </div>
                                <div className={`flex items-center ${getDifficultyColor(room.difficulty)}`}>
                                  <Zap className="w-4 h-4 mr-1" />
                                  {room.difficulty}
                                </div>
                              </div>
                            </div>
                            <motion.button
                              onClick={() => handleJoinPublicRoom(room.id)}
                              disabled={!playerName.trim() || room.players >= room.maxPlayers}
                              className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-all"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {room.players >= room.maxPlayers ? 'Full' : 'Join'}
                            </motion.button>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'private' && (
                <motion.form 
                  key="private"
                  onSubmit={handleJoinPrivateRoom}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-6">
                    <label className="block text-white font-medium mb-2">Room Code</label>
                    <input
                      type="text"
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-2xl tracking-widest transition-all"
                      placeholder="ABCD1234"
                      maxLength={8}
                      required
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={!roomCode.trim() || !playerName.trim()}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-600 disabled:to-gray-700 disabled:opacity-50 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Join Private Room
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default JoinRoom;