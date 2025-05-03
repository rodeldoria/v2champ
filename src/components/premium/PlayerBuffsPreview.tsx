import React, { useState } from 'react';
import { Zap, Shield, Target, Brain, Flame, Lock, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const PlayerBuffsPreview: React.FC = () => {
  const [showDetails, setShowDetails] = useState(false);

  const playerBuffs = [
    {
      name: 'Speed Boost',
      icon: <Zap className="text-yellow-500" size={24} />,
      description: 'Increase player speed and big play potential',
      effects: [
        { stat: 'Breakaway runs', impact: '+15%' },
        { stat: 'Long TDs', impact: '+10%' },
        { stat: 'YAC', impact: '+12%' }
      ],
      cost: 75
    },
    {
      name: 'Accuracy Boost',
      icon: <Target className="text-blue-500" size={24} />,
      description: 'Improve passing and catching accuracy',
      effects: [
        { stat: 'Completion %', impact: '+8%' },
        { stat: 'Catch rate', impact: '+10%' },
        { stat: 'Drop rate', impact: '-15%' }
      ],
      cost: 75
    },
    {
      name: 'Endurance Shield',
      icon: <Shield className="text-green-500" size={24} />,
      description: 'Increase stamina and reduce injury risk',
      effects: [
        { stat: 'Snap count', impact: '+10%' },
        { stat: 'Injury risk', impact: '-20%' },
        { stat: 'Late-game performance', impact: '+8%' }
      ],
      cost: 100
    },
    {
      name: 'Football IQ',
      icon: <Brain className="text-purple-500" size={24} />,
      description: 'Enhance decision making and awareness',
      effects: [
        { stat: 'Red zone efficiency', impact: '+12%' },
        { stat: 'Broken tackles', impact: '+10%' },
        { stat: 'Route running', impact: '+8%' }
      ],
      cost: 100
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-4 text-white">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Flame className="mr-2" size={24} />
            <h3 className="font-bold text-lg">Player Buffs</h3>
          </div>
          <div className="bg-white/20 px-3 py-1 rounded-full text-sm">
            Coming Soon
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-4">
          <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Boost Your Players</h4>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Use Fantasy Coins to purchase temporary buffs for your players. These buffs will enhance 
            specific attributes and improve performance for a limited time.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {playerBuffs.map((buff, index) => (
            <motion.div 
              key={index}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600 relative"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex flex-col items-center justify-center">
                {buff.icon}
                <h5 className="font-medium text-gray-800 dark:text-gray-200 mt-2 text-center">{buff.name}</h5>
                <div className="absolute top-2 right-2">
                  <Lock size={14} className="text-gray-400 dark:text-gray-500" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center justify-between w-full px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg text-sm font-medium"
        >
          <span>Buff details</span>
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
            <div className="space-y-4">
              {playerBuffs.map((buff, index) => (
                <div key={index} className="border-b border-gray-200 dark:border-gray-600 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center mb-2">
                    {buff.icon}
                    <div className="ml-2">
                      <h5 className="font-medium text-gray-800 dark:text-gray-200">{buff.name}</h5>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{buff.description}</p>
                    </div>
                    <div className="ml-auto bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 rounded text-xs font-medium text-purple-700 dark:text-purple-400">
                      {buff.cost} coins
                    </div>
                  </div>
                  <ul className="space-y-1">
                    {buff.effects.map((effect, idx) => (
                      <li key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700 dark:text-gray-300">{effect.stat}</span>
                        <span className="text-green-600 dark:text-green-400 font-medium">{effect.impact}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};