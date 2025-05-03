import React, { useState } from 'react';
import { CloudRain, Wind, Snowflake, Sun, CloudLightning, Thermometer, Lock, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const WeatherEffectsPreview: React.FC = () => {
  const [showDetails, setShowDetails] = useState(false);

  const weatherEffects = [
    {
      type: 'Rain',
      icon: <CloudRain className="text-blue-500" size={24} />,
      effects: [
        { position: 'QB', impact: 'Passing accuracy -10%', severity: 'high' },
        { position: 'WR', impact: 'Receiving yards -8%', severity: 'high' },
        { position: 'K', impact: 'FG accuracy -15%', severity: 'high' },
        { position: 'RB', impact: 'Rushing yards -3%', severity: 'low' }
      ]
    },
    {
      type: 'Wind',
      icon: <Wind className="text-gray-500" size={24} />,
      effects: [
        { position: 'QB', impact: 'Deep passes -15%', severity: 'high' },
        { position: 'K', impact: 'FG range -10 yards', severity: 'high' },
        { position: 'WR', impact: 'Deep targets -12%', severity: 'medium' },
        { position: 'TE', impact: 'Receiving yards -5%', severity: 'low' }
      ]
    },
    {
      type: 'Snow',
      icon: <Snowflake className="text-blue-300" size={24} />,
      effects: [
        { position: 'QB', impact: 'Passing yards -12%', severity: 'high' },
        { position: 'WR', impact: 'Receiving yards -10%', severity: 'high' },
        { position: 'RB', impact: 'Rushing attempts +8%', severity: 'positive' },
        { position: 'K', impact: 'FG accuracy -20%', severity: 'high' }
      ]
    },
    {
      type: 'Heat',
      icon: <Thermometer className="text-red-500" size={24} />,
      effects: [
        { position: 'RB', impact: 'Stamina -8%', severity: 'medium' },
        { position: 'DEF', impact: 'Points allowed +5%', severity: 'medium' },
        { position: 'WR', impact: 'YAC -5%', severity: 'low' },
        { position: 'TE', impact: 'Snap count -5%', severity: 'low' }
      ]
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-orange-500';
      case 'low':
        return 'text-yellow-500';
      case 'positive':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-4 text-white">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <CloudRain className="mr-2" size={24} />
            <h3 className="font-bold text-lg">Weather Effects</h3>
          </div>
          <div className="bg-white/20 px-3 py-1 rounded-full text-sm">
            Coming Soon
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-4">
          <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Real-time Weather Impact</h4>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Weather conditions will affect player performance in real-time. Rain, snow, wind, and extreme temperatures
            will impact different positions in various ways.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {weatherEffects.map((weather, index) => (
            <motion.div 
              key={index}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600 relative"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex flex-col items-center justify-center">
                {weather.icon}
                <h5 className="font-medium text-gray-800 dark:text-gray-200 mt-2">{weather.type}</h5>
                <div className="absolute top-2 right-2">
                  <Lock size={14} className="text-gray-400 dark:text-gray-500" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center justify-between w-full px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium"
        >
          <span>Weather impact details</span>
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
              {weatherEffects.map((weather, index) => (
                <div key={index} className="border-b border-gray-200 dark:border-gray-600 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center mb-2">
                    {weather.icon}
                    <h5 className="font-medium text-gray-800 dark:text-gray-200 ml-2">{weather.type} Effects</h5>
                  </div>
                  <ul className="space-y-1">
                    {weather.effects.map((effect, idx) => (
                      <li key={idx} className="flex items-center text-sm">
                        <span className="font-medium text-gray-700 dark:text-gray-300 w-10">{effect.position}</span>
                        <span className={`ml-2 ${getSeverityColor(effect.severity)}`}>{effect.impact}</span>
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