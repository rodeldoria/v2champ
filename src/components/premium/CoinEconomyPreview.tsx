import React, { useState } from 'react';
import { Coins, Zap, Gift, Lock, ChevronRight, Award, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export const CoinEconomyPreview: React.FC = () => {
  const [coinBalance, setCoinBalance] = useState(100);
  const [showDetails, setShowDetails] = useState(false);

  const coinFeatures = [
    {
      title: 'Player Buffs',
      description: 'Boost player projections by 5-15% for a week',
      icon: <Zap className="text-yellow-500" />,
      cost: 50,
      comingSoon: true
    },
    {
      title: 'Weather Immunity',
      description: 'Protect players from weather effects',
      icon: <Star className="text-blue-500" />,
      cost: 75,
      comingSoon: true
    },
    {
      title: 'Injury Protection',
      description: 'Reduce injury impact on player performance',
      icon: <Award className="text-green-500" />,
      cost: 100,
      comingSoon: true
    }
  ];

  const earnMethods = [
    'Make accurate predictions',
    'Complete weekly challenges',
    'Win matchups against rivals',
    'Participate in community contests',
    'Daily login streaks'
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-yellow-500 to-amber-600 p-4 text-white">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Coins className="mr-2" size={24} />
            <h3 className="font-bold text-lg">Fantasy Coins</h3>
          </div>
          <div className="flex items-center bg-white/20 px-3 py-1 rounded-full">
            <Coins className="mr-1 text-yellow-300" size={16} />
            <span className="font-semibold">{coinBalance}</span>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-4">
          <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Coming Soon: Coin Economy</h4>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Earn coins by making accurate predictions and spend them on player buffs, 
            weather immunity, and other advantages in your fantasy league.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          {coinFeatures.map((feature, index) => (
            <motion.div 
              key={index}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600 relative overflow-hidden"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  {feature.icon}
                  <h5 className="font-medium text-gray-800 dark:text-gray-200 ml-2">{feature.title}</h5>
                </div>
                <div className="flex items-center bg-yellow-100 dark:bg-yellow-900/30 px-2 py-0.5 rounded text-xs font-medium text-yellow-700 dark:text-yellow-400">
                  <Coins size={12} className="mr-1" />
                  {feature.cost}
                </div>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{feature.description}</p>
              
              {feature.comingSoon && (
                <div className="absolute top-0 right-0 bg-primary-500 text-white text-xs px-2 py-0.5 rounded-bl">
                  Coming Soon
                </div>
              )}
              
              <button className="w-full mt-2 px-3 py-1.5 bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 rounded text-xs flex items-center justify-center opacity-70 cursor-not-allowed">
                <Lock size={12} className="mr-1" />
                Locked
              </button>
            </motion.div>
          ))}
        </div>

        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center justify-between w-full px-4 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg text-sm font-medium"
        >
          <span>How to earn coins</span>
          <ChevronRight className={`transition-transform duration-300 ${showDetails ? 'rotate-90' : ''}`} size={16} />
        </button>

        {showDetails && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-3 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg"
          >
            <ul className="space-y-2">
              {earnMethods.map((method, index) => (
                <li key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Coins size={14} className="text-yellow-500 mr-2" />
                  {method}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>
    </div>
  );
};