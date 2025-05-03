import React, { useEffect, useState } from 'react';
import { Shield, Star, Zap, Target, Award, TrendingUp, TrendingDown, Dumbbell, Crosshair, Eye, Wind, Brain, HandMetal, Route, SlidersHorizontal, Gauge } from 'lucide-react';
import { Player } from '../../types/sleeper';
import { calculateAttributes, calculateOverallRating } from '../../services/playerRatingService';

interface PlayerGameStatsProps {
  player: Player;
  stats?: Record<string, number>;
}

export const PlayerGameStats: React.FC<PlayerGameStatsProps> = ({ player, stats }) => {
  const [overallRating, setOverallRating] = useState<number>(70);
  const [loading, setLoading] = useState(true);
  
  const attributes = calculateAttributes(player, stats);

  useEffect(() => {
    const fetchRating = async () => {
      try {
        const rating = await calculateOverallRating(player, stats || {});
        setOverallRating(rating.overall);
      } catch (error) {
        console.error('Error calculating rating:', error);
        setOverallRating(70);
      } finally {
        setLoading(false);
      }
    };

    fetchRating();
  }, [player, stats]);

  // Get tier based on overall rating
  const getTier = () => {
    if (overallRating >= 90) return { text: 'Elite', color: 'text-primary-600 bg-primary-50' };
    if (overallRating >= 85) return { text: 'Pro', color: 'text-success-600 bg-success-50' };
    if (overallRating >= 80) return { text: 'Veteran', color: 'text-blue-600 bg-blue-50' };
    if (overallRating >= 75) return { text: 'Starter', color: 'text-purple-600 bg-purple-50' };
    if (overallRating >= 70) return { text: 'Rotation', color: 'text-orange-600 bg-orange-50' };
    return { text: 'Rookie', color: 'text-gray-600 bg-gray-50' };
  };

  const tier = getTier();

  // Get attribute icon and color
  const getAttributeDisplay = (name: string, value: number) => {
    const icons: Record<string, React.ReactNode> = {
      arm: <Dumbbell size={20} />,
      accuracy: <Crosshair size={20} />,
      awareness: <Eye size={20} />,
      agility: <Wind size={20} />,
      speed: <Zap size={20} />,
      strength: <Dumbbell size={20} />,
      vision: <Eye size={20} />,
      hands: <HandMetal size={20} />,
      route: <Route size={20} />,
      separation: <SlidersHorizontal size={20} />,
      power: <Gauge size={20} />,
      brain: <Brain size={20} />
    };

    const getColor = (val: number) => {
      if (val >= 90) return 'text-primary-500';
      if (val >= 80) return 'text-success-500';
      if (val >= 70) return 'text-warning-500';
      return 'text-error-500';
    };

    return {
      icon: icons[name.toLowerCase()] || <Target size={20} />,
      color: getColor(value)
    };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header with overall rating and tier */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="text-4xl font-bold text-gray-900">{overallRating}</div>
          <div className={`px-4 py-2 rounded-lg text-sm font-semibold ${tier.color}`}>
            {tier.text}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.floor(overallRating / 20) }).map((_, i) => (
            <Star key={i} size={20} className="text-yellow-400 fill-current" />
          ))}
        </div>
      </div>

      {/* Attributes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {Object.entries(attributes).map(([key, value]) => {
          const { icon, color } = getAttributeDisplay(key, value);
          return (
            <div key={key} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`${color}`}>{icon}</div>
                  <span className="font-medium text-gray-700 capitalize">
                    {key}
                  </span>
                </div>
                <span className={`font-bold ${color}`}>
                  {value}
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    value >= 90 ? 'bg-primary-500' :
                    value >= 80 ? 'bg-success-500' :
                    value >= 70 ? 'bg-warning-500' :
                    'bg-error-500'
                  }`}
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Performance Trend */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Performance Trend</span>
          <div className="flex items-center gap-2">
            {overallRating >= 80 ? (
              <>
                <TrendingUp size={16} className="text-success-500" />
                <span className="text-sm font-medium text-success-500">Improving</span>
              </>
            ) : (
              <>
                <TrendingDown size={16} className="text-warning-500" />
                <span className="text-sm font-medium text-warning-500">Developing</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Info Footer */}
      <div className="mt-6 text-xs text-gray-500">
        Ratings updated for 2024 season based on performance, team situation, and role.
      </div>
    </div>
  );
};