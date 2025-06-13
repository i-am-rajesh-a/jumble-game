import React, { useState } from 'react';
import { ArrowLeft, Settings, Users, Clock, Lock, Globe, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { GameSettings } from '../types/game';

interface CreateRoomProps {
  onNavigate: (page: string) => void;
  onCreateRoom: (settings: GameSettings) => void;
}

const CreateRoom: React.FC<CreateRoomProps> = ({ onNavigate, onCreateRoom }) => {
  const [settings, setSettings] = useState<GameSettings>({
    roomName: '',
    isPublic: true,
    timePerRound: 30,
    maxPlayers: 6,
    difficulty: 'medium'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (settings.roomName.trim()) {
      onCreateRoom(settings);
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
        <div className="max-w-2xl mx-auto">
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
                className="bg-purple-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Settings className="w-8 h-8 text-purple-300" />
              </motion.div>
              <h1 className="text-3xl font-bold text-white mb-2">Create Game Room</h1>
              <p className="text-white/70">Set up your perfect word scramble game</p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div variants={itemVariants}>
                <label className="block text-white font-medium mb-2">
                  Room Name
                </label>
                <input
                  type="text"
                  value={settings.roomName}
                  onChange={(e) => setSettings({ ...settings, roomName: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Enter room name..."
                  required
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <label className="block text-white font-medium mb-3">
                  Room Type
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <motion.button
                    type="button"
                    onClick={() => setSettings({ ...settings, isPublic: true })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      settings.isPublic
                        ? 'border-green-400 bg-green-400/20'
                        : 'border-white/20 bg-white/5 hover:bg-white/10'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Globe className="w-6 h-6 text-green-400 mx-auto mb-2" />
                    <div className="text-white font-medium">Public</div>
                    <div className="text-white/70 text-sm">Anyone can join</div>
                  </motion.button>
                  
                  <motion.button
                    type="button"
                    onClick={() => setSettings({ ...settings, isPublic: false })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      !settings.isPublic
                        ? 'border-orange-400 bg-orange-400/20'
                        : 'border-white/20 bg-white/5 hover:bg-white/10'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Lock className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                    <div className="text-white font-medium">Private</div>
                    <div className="text-white/70 text-sm">Invite only</div>
                  </motion.button>
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <label className="block text-white font-medium mb-3">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['easy', 'medium', 'hard'].map((level) => (
                    <motion.button
                      key={level}
                      type="button"
                      onClick={() => setSettings({ ...settings, difficulty: level })}
                      className={`p-3 rounded-lg border-2 transition-all capitalize ${
                        settings.difficulty === level
                          ? 'border-purple-400 bg-purple-400/20'
                          : 'border-white/20 bg-white/5 hover:bg-white/10'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="text-white font-medium">{level}</div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              <motion.div className="grid grid-cols-2 gap-6" variants={itemVariants}>
                <div>
                  <label htmlFor="timePerRound" className="block text-white font-medium mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Time per Round
                  </label>
                  <select
                    id="timePerRound"
                    value={settings.timePerRound}
                    onChange={(e) => setSettings({ ...settings, timePerRound: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  >
                    <option value={15}>15 seconds</option>
                    <option value={30}>30 seconds</option>
                    <option value={45}>45 seconds</option>
                    <option value={60}>60 seconds</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="maxPlayers" className="block text-white font-medium mb-2">
                    <Users className="w-4 h-4 inline mr-1" />
                    Max Players
                  </label>
                  <select
                    id="maxPlayers"
                    value={settings.maxPlayers}
                    onChange={(e) => setSettings({ ...settings, maxPlayers: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  >
                    <option value={2}>2 players</option>
                    <option value={4}>4 players</option>
                    <option value={6}>6 players</option>
                    <option value={8}>8 players</option>
                  </select>
                </div>
              </motion.div>

              <motion.button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300"
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Zap className="w-5 h-5 inline mr-2" />
                Create Room
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CreateRoom;