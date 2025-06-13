import React, { useState, useEffect } from 'react';
import { Trophy, Star, RotateCcw, Home, Medal, Zap, Crown, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { LeaderboardEntry } from '../types/game';

interface GameResultsProps {
  leaderboard: LeaderboardEntry[];
  currentPlayerName: string;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

const GameResults: React.FC<GameResultsProps> = ({ 
  leaderboard, 
  currentPlayerName, 
  onPlayAgain, 
  onGoHome 
}) => {
  const [showConfetti, setShowConfetti] = useState(true);
  const currentPlayerRank = leaderboard.findIndex(entry => entry.name === currentPlayerName) + 1;
  const winner = leaderboard[0];
  const currentPlayerEntry = leaderboard.find(entry => entry.name === currentPlayerName);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
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

  const getRankMessage = (rank: number) => {
    switch (rank) {
      case 1: return "🏆 Champion! Amazing performance!";
      case 2: return "🥈 Excellent! So close to victory!";
      case 3: return "🥉 Great job! You made the podium!";
      default: return `#${rank} - Well played! Keep improving!`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {showConfetti && <Confetti recycle={false} numberOfPieces={300} />}
      
      <div className="absolute inset-0 bg-black/20"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div 
            className="text-center mb-12"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div 
              className="bg-yellow-500/20 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6"
              variants={itemVariants}
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Trophy className="w-12 h-12 text-yellow-400" />
            </motion.div>
            <motion.h1 
              className="text-5xl font-bold text-white mb-4"
              variants={itemVariants}
            >
              Game Over!
            </motion.h1>
            <motion.p 
              className="text-xl text-white/70"
              variants={itemVariants}
            >
              Congratulations to <span className="text-yellow-400 font-semibold">{winner.name}</span> for winning!
            </motion.p>
          </motion.div>

          {/* Player's Performance */}
          <motion.div 
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 mb-8"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-6">Your Performance</h2>
              <div className="text-lg text-white/80 mb-6">
                {getRankMessage(currentPlayerRank)}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <motion.div 
                  className="bg-white/5 rounded-lg p-6"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-center mb-2">
                    <Medal className="w-8 h-8 text-orange-400 mr-2" />
                    <span className="text-3xl font-bold text-white">#{currentPlayerRank}</span>
                  </div>
                  <div className="text-white/70">Final Rank</div>
                </motion.div>
                
                <motion.div 
                  className="bg-white/5 rounded-lg p-6"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-center mb-2">
                    <Star className="w-8 h-8 text-yellow-400 mr-2" />
                    <span className="text-3xl font-bold text-white">
                      {currentPlayerEntry?.score || 0}
                    </span>
                  </div>
                  <div className="text-white/70">Total Score</div>
                </motion.div>
                
                <motion.div 
                  className="bg-white/5 rounded-lg p-6"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-center mb-2">
                    <Zap className="w-8 h-8 text-purple-400 mr-2" />
                    <span className="text-3xl font-bold text-white">
                      {currentPlayerEntry?.maxStreak || 0}
                    </span>
                  </div>
                  <div className="text-white/70">Best Streak</div>
                </motion.div>
                
                <motion.div 
                  className="bg-white/5 rounded-lg p-6"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-center mb-2">
                    <Award className="w-8 h-8 text-teal-400 mr-2" />
                    <span className="text-3xl font-bold text-white">
                      {currentPlayerEntry?.achievements?.length || 0}
                    </span>
                  </div>
                  <div className="text-white/70">Achievements</div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Final Leaderboard */}
          <motion.div 
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 mb-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Final Leaderboard</h2>
            
            <div className="space-y-4">
              {leaderboard.map((entry, index) => (
                <motion.div
                  key={index}
                  className={`flex items-center justify-between p-6 rounded-xl transition-all ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-2 border-yellow-400/30' :
                    index === 1 ? 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border border-gray-400/30' :
                    index === 2 ? 'bg-gradient-to-r from-orange-500/20 to-orange-600/20 border border-orange-400/30' :
                    entry.name === currentPlayerName ? 'bg-purple-500/20 border border-purple-400/30' :
                    'bg-white/5 border border-white/10'
                  }`}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center">
                    <motion.div 
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold mr-4 ${
                        index === 0 ? 'bg-yellow-400 text-black' :
                        index === 1 ? 'bg-gray-400 text-black' :
                        index === 2 ? 'bg-orange-400 text-black' :
                        'bg-white/20 text-white'
                      }`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      {index === 0 ? <Crown className="w-6 h-6" /> : index + 1}
                    </motion.div>
                    
                    <div>
                      <div className="flex items-center">
                        <span className="text-xl font-semibold text-white mr-2">
                          {entry.name}
                        </span>
                        {entry.name === currentPlayerName && (
                          <span className="bg-purple-500/30 text-purple-300 px-2 py-1 rounded-full text-xs">
                            You
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 mt-1">
                        {index < 3 && (
                          <div className="text-white/70 text-sm">
                            {index === 0 ? '🏆 Champion!' : index === 1 ? '🥈 Runner-up' : '🥉 Third Place'}
                          </div>
                        )}
                        {entry.achievements && entry.achievements.length > 0 && (
                          <div className="flex items-center text-teal-400 text-sm">
                            <Award className="w-3 h-3 mr-1" />
                            {entry.achievements.length} achievements
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{entry.score}</div>
                    <div className="text-white/70 text-sm">points</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.button
              onClick={onPlayAgain}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 px-8 rounded-full transition-all duration-300 flex items-center justify-center"
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Play Again
            </motion.button>
            
            <motion.button
              onClick={onGoHome}
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold py-4 px-8 rounded-full transition-all duration-300 border border-white/20 hover:border-white/30 flex items-center justify-center"
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Home className="w-5 h-5 mr-2" />
              Go Home
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default GameResults;