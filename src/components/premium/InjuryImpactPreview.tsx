import React, { useState } from 'react';
import { Droplet, Activity, AlertTriangle, ChevronRight, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export const InjuryImpactPreview: React.FC = () => {
  const [showDetails, setShowDetails] = useState(false);

  const injuryImpacts = [
    {
      type: 'Questionable',
      icon: <Activity className="text-yellow-500" size={24} />,
      description: 'Player has a minor injury but will likely play',
      effects: [
        { stat: 'Snap count', impact: '-10%' },
        { stat: 'Fantasy points', impact: '-5%' },
        { stat: 'Big play potential', impact: '-8%' }
      ]
    },
    {
      type: 'Doubtful',
      icon: <AlertTriangle className="text-orange-500" size={24} />,
      description: 'Player has a significant injury and may not play',
      effects: [
        { stat: 'Snap count', impact: '-40%' },
        { stat: 'Fantasy points', impact: '-25%' },
        { stat: 'Injury aggravation risk', impact: '+30%' }
      ]
    },
    {
      type: 'Out',
      icon: <Droplet className="text-red-500" size={24} />,
      description: 'Player will not play this week',
      effects: [
        { stat: 'Snap count', impact: '-100%' },
        { stat: 'Fantasy points', impact: '-100%' },
        { stat: 'Backup player usage', impact: '+80%' }
      ]
    }
  ];

  const injuryTypes = [
    { name: 'Ankle Sprain', recovery: '1-4 weeks', impact: 'High for RB/WR' },
    { name: 'Hamstring', recovery: '2-6 weeks', impact: 'High for all positions' },
    { name: 'Concussion', recovery: '1-3 weeks', impact: 'Unpredictable' },
    { name: 'ACL Tear', recovery: 'Season ending', impact: 'Complete loss' },
    { name: 'Shoulder', recovery: '1-8 weeks', impact: 'High for QB/WR' }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-red-500 to-pink-600 p-4 text-white">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Droplet className="mr-2" size={24} />
            <h3 className="font-bold text-lg">Injury Impact</h3>
          </div>
          <div className="bg-white/20 px-3 py-1 rounded-full text-sm">
            Coming Soon
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-4">
          <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Real-time Injury Effects</h4>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Injuries will dynamically affect player projections and performance in real-time. 
            Different injury types and severities will impact different positions in various ways.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          {injuryImpacts.map((impact, index) => (
            <motion.div 
              key={index}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600 relative"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center mb-2">
                {impact.icon}
                <h5 className="font-medium text-gray-800 dark:text-gray-200 ml-2">{impact.type}</h5>
                <div className="absolute top-2 right-2">
                  <Lock size={14} className="text-gray-400 dark:text-gray-500" />
                </div>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{impact.description}</p>
            </motion.div>
          ))}
        </div>

        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center justify-between w-full px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium"
        >
          <span>Injury details</span>
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
            <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Common Injury Types</h5>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                <thead>
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Injury</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Recovery</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {injuryTypes.map((injury, idx) => (
                    <tr key={idx} className="hover:bg-gray-100 dark:hover:bg-gray-600">
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{injury.name}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{injury.recovery}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{injury.impact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};