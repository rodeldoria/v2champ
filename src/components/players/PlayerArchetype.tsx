import React from 'react';
import { Shield, Star, TrendingUp, Brain } from 'lucide-react';
import { inferPlayerArchetype } from '../../services/playerArchetype';
import { Player } from '../../types/sleeper';

interface PlayerArchetypeProps {
  player: Player;
  stats: Record<string, number>;
}

export const PlayerArchetype: React.FC<PlayerArchetypeProps> = ({ player, stats }) => {
  const archetype = inferPlayerArchetype(player, stats);

  const getArchetypeIcon = () => {
    switch (archetype.archetype) {
      case 'Route Technician':
        return <Brain className="text-primary-500" />;
      case 'YAC Monster':
        return <TrendingUp className="text-success-500" />;
      case 'Contested Catch King':
        return <Shield className="text-warning-500" />;
      default:
        return <Star className="text-primary-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Player Archetype</h3>
        <div className="flex items-center">
          {getArchetypeIcon()}
          <span className="ml-2 text-sm font-medium">{archetype.archetype}</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Description */}
        <div>
          <p className="text-gray-600">{archetype.description}</p>
        </div>

        {/* Traits */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Key Traits</h4>
          <div className="flex flex-wrap gap-2">
            {archetype.traits.map((trait, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-primary-50 text-primary-700 text-sm rounded-full"
              >
                {trait}
              </span>
            ))}
          </div>
        </div>

        {/* Playstyle */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Playstyle</h4>
          <div className="flex flex-wrap gap-2">
            {archetype.playstyle.map((style, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
              >
                {style}
              </span>
            ))}
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Strengths</h4>
            <ul className="space-y-1">
              {archetype.strengths.map((strength, index) => (
                <li key={index} className="flex items-center text-sm text-success-600">
                  <TrendingUp size={14} className="mr-1" />
                  {strength}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Weaknesses</h4>
            <ul className="space-y-1">
              {archetype.weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-center text-sm text-error-600">
                  <TrendingUp size={14} className="mr-1 transform rotate-180" />
                  {weakness}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Comparison */}
        {archetype.comparison && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Player Comparison: <span className="font-medium text-gray-700">{archetype.comparison}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};