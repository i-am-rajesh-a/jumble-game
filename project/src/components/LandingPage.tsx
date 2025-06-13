import { useState, useEffect } from 'react';
import { Play, Users, Plus, LogIn, Zap, Trophy, Star, Gamepad2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState({
    activeRooms: 0,
    playersOnline: 0,
    gamesPlayed: 1247
  });

  useEffect(() => {
    // Simulate real-time stats
    const interval = setInterval(() => {
      setStats(prev => ({
        activeRooms: Math.floor(Math.random() * 15) + 5,
        playersOnline: Math.floor(Math.random() * 50) + 20,
        gamesPlayed: prev.gamesPlayed + Math.floor(Math.random() * 3)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse animation-delay-2s"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div 
          className="text-center mb-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="flex items-center justify-center mb-8"
            variants={itemVariants}
          >
            <motion.div 
              className="bg-white/10 backdrop-blur-sm rounded-full p-4 mr-4 border border-white/20"
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Gamepad2 className="w-12 h-12 text-white" />
            </motion.div>
            <motion.h1 
              className="text-6xl font-bold text-white"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              WordScramble
            </motion.h1>
          </motion.div>
          
          <motion.p 
            className="text-xl text-white/80 max-w-2xl mx-auto mb-8"
            variants={itemVariants}
          >
            Challenge your friends in this exciting real-time word guessing game. 
            Unscramble words, compete for points, and climb the leaderboard!
          </motion.p>

          {/* Live Stats */}
          <motion.div 
            className="flex justify-center space-x-8 mb-12"
            variants={itemVariants}
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-400">{stats.activeRooms}</div>
              <div className="text-white/70 text-sm">Active Rooms</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">{stats.playersOnline}</div>
              <div className="text-white/70 text-sm">Players Online</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-400">{stats.gamesPlayed}</div>
              <div className="text-white/70 text-sm">Games Played</div>
            </div>
          </motion.div>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="grid md:grid-cols-3 gap-8 mb-12"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div 
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/20 hover:bg-white/15 transition-all duration-300"
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <div className="bg-purple-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-300" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Multiplayer Fun</h3>
              <p className="text-white/70">Play with friends in real-time with up to 8 players per room</p>
            </motion.div>

            <motion.div 
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/20 hover:bg-white/15 transition-all duration-300"
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <div className="bg-teal-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-teal-300" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Fast-Paced Action</h3>
              <p className="text-white/70">Quick rounds with instant feedback and dynamic scoring</p>
            </motion.div>

            <motion.div 
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/20 hover:bg-white/15 transition-all duration-300"
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <div className="bg-orange-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-orange-300" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Achievements & Rewards</h3>
              <p className="text-white/70">Unlock achievements and climb the global leaderboard</p>
            </motion.div>
          </motion.div>

          <motion.div 
            className="text-center space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.button
              onClick={() => onNavigate('quickPlay')}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-4 px-12 rounded-full text-xl transition-all duration-300 shadow-2xl"
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play className="w-6 h-6 inline mr-3" />
              Quick Play
            </motion.button>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              variants={itemVariants}
            >
              <motion.button
                onClick={() => onNavigate('createRoom')}
                className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 border border-white/20 hover:border-white/30"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-5 h-5 inline mr-2" />
                Create Room
              </motion.button>
              
              <motion.button
                onClick={() => onNavigate('joinRoom')}
                className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 border border-white/20 hover:border-white/30"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogIn className="w-5 h-5 inline mr-2" />
                Join Room
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Features showcase */}
          <motion.div 
            className="mt-20 grid md:grid-cols-2 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div 
              className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
              variants={itemVariants}
            >
              <Star className="w-8 h-8 text-yellow-400 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-4">New Features</h3>
              <ul className="text-white/80 space-y-2">
                <li>• Achievement system with unlockable rewards</li>
                <li>• Streak bonuses for consecutive correct answers</li>
                <li>• Hint system to help when you're stuck</li>
                <li>• Real-time chat during games</li>
                <li>• Multiple difficulty levels</li>
              </ul>
            </motion.div>

            <motion.div 
              className="bg-gradient-to-r from-teal-500/20 to-blue-500/20 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
              variants={itemVariants}
            >
              <Gamepad2 className="w-8 h-8 text-teal-400 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-4">How to Play</h3>
              <ul className="text-white/80 space-y-2">
                <li>• Join or create a room with friends</li>
                <li>• Take turns giving words to scramble</li>
                <li>• Race to unscramble other players' words</li>
                <li>• Earn points based on speed and accuracy</li>
                <li>• Compete for the highest score!</li>
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;