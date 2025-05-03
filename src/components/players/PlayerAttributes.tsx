import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Info, Dumbbell, Crosshair, Eye, Wind, Zap, Route, HandMetal, Shield, Star, Crown, TrendingUp, TrendingDown, Target } from 'lucide-react';
import { Player } from '../../types/sleeper';
import { calculateAttributes, calculateOverallRating } from '../../services/playerRatingService';
import { PlayerPerformanceRadar } from './PlayerPerformanceRadar';

interface PlayerAttributesProps {
  player: Player;
  stats?: Record<string, number>;
}

export const PlayerAttributes: React.FC<PlayerAttributesProps> = ({ player, stats }) => {
  const [hoveredAttribute, setHoveredAttribute] = useState<string | null>(null);
  const [overallRating, setOverallRating] = useState<{
    overall: number;
    role: string;
    snapShare: number;
  }>({ overall: 75, role: 'Unknown', snapShare: 0 });
  const [loading, setLoading] = useState(true);
  const [gameStats, setGameStats] = useState<Record<string, number>>({});
  
  const attributes = calculateAttributes(player, stats);

  // Load overall rating and game stats
  useEffect(() => {
    const loadData = async () => {
      try {
        const rating = calculateOverallRating(player, stats || {});
        setOverallRating(rating);
        setGameStats(stats || {});
      } catch (error) {
        console.error('Error calculating rating:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [player, stats]);

  // Get tier based on overall rating
  const getTier = () => {
    if (overallRating.overall >= 90) return { text: 'Elite', color: 'text-primary-600 bg-primary-50' };
    if (overallRating.overall >= 85) return { text: 'Pro', color: 'text-success-600 bg-success-50' };
    if (overallRating.overall >= 80) return { text: 'Veteran', color: 'text-blue-600 bg-blue-50' };
    if (overallRating.overall >= 75) return { text: 'Starter', color: 'text-purple-600 bg-purple-50' };
    if (overallRating.overall >= 70) return { text: 'Rotation', color: 'text-orange-600 bg-orange-50' };
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
      separation: <Route size={20} />,
      power: <Dumbbell size={20} />,
      blocking: <Shield size={20} />,
      decision: <Eye size={20} />,
      pocket: <Shield size={20} />,
      yac: <Zap size={20} />,
      redzone: <Target size={20} />
    };

    const getColor = (val: number) => {
      if (val >= 90) return 'text-primary-500';
      if (val >= 80) return 'text-success-500';
      if (val >= 70) return 'text-warning-500';
      return 'text-error-500';
    };

    return {
      icon: icons[name.toLowerCase()] || <Shield size={20} />,
      color: getColor(value)
    };
  };

  // Get position-specific attributes
  const getPositionAttributes = () => {
    switch (player.position) {
      case 'QB':
        return {
          arm: attributes.arm || 0,
          accuracy: attributes.accuracy || 0,
          awareness: attributes.awareness || 0,
          agility: attributes.agility || 0,
          decision: attributes.awareness || 75, // Use awareness or default
          pocket: attributes.agility || 75 // Use agility or default
        };
      case 'RB':
        return {
          speed: attributes.speed || 0,
          agility: attributes.agility || 0,
          power: attributes.power || 0,
          vision: attributes.vision || 0,
          hands: attributes.hands || 75, // Default if not available
          blocking: attributes.blocking || 75 // Default if not available
        };
      case 'WR':
        return {
          speed: attributes.speed || 0,
          hands: attributes.hands || 0,
          route: attributes.route || 0,
          separation: attributes.separation || 0,
          yac: attributes.speed || 75, // Use speed as proxy or default
          blocking: attributes.blocking || 75 // Default if not available
        };
      case 'TE':
        return {
          speed: attributes.speed || 0,
          hands: attributes.hands || 0,
          route: attributes.route || 0,
          blocking: attributes.blocking || 0,
          yac: attributes.speed || 75, // Use speed as proxy or default
          redzone: attributes.hands || 75 // Use hands as proxy or default
        };
      default:
        return attributes;
    }
  };

  const positionAttributes = getPositionAttributes();

  // Get game stats based on position
  const getGameStats = () => {
    const stats = gameStats || {};
    
    switch (player.position) {
      case 'QB':
        return [
          { label: 'Pass Yards', value: stats.pass_yd || 0 },
          { label: 'Pass TD', value: stats.pass_td || 0 },
          { label: 'INT', value: stats.pass_int || 0 },
          { label: 'Rush Yards', value: stats.rush_yd || 0 }
        ];
      case 'RB':
        return [
          { label: 'Rush Yards', value: stats.rush_yd || 0 },
          { label: 'Rush TD', value: stats.rush_td || 0 },
          { label: 'Receptions', value: stats.rec || 0 },
          { label: 'Rec Yards', value: stats.rec_yd || 0 }
        ];
      case 'WR':
      case 'TE':
        return [
          { label: 'Receptions', value: stats.rec || 0 },
          { label: 'Rec Yards', value: stats.rec_yd || 0 },
          { label: 'Rec TD', value: stats.rec_td || 0 },
          { label: 'Targets', value: stats.targets || 0 }
        ];
      case 'K':
        return [
          { label: 'FG Made', value: stats.fg_made || 0 },
          { label: 'FG Att', value: stats.fg_att || 0 },
          { label: 'XP Made', value: stats.xp_made || 0 },
          { label: 'XP Att', value: stats.xp_att || 0 }
        ];
      case 'DEF':
        return [
          { label: 'Sacks', value: stats.def_sack || 0 },
          { label: 'INT', value: stats.def_int || 0 },
          { label: 'Fum Rec', value: stats.def_fr || 0 },
          { label: 'TD', value: stats.def_td || 0 }
        ];
      case 'DL':
      case 'LB':
      case 'DB':
        return [
          { label: 'Tackles', value: stats.tackle_solo || 0 },
          { label: 'Sacks', value: stats.sack || 0 },
          { label: 'INT', value: stats.int || 0 },
          { label: 'PD', value: stats.pass_defended || 0 }
        ];
      default:
        return [];
    }
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

  // Skip rendering for IDP positions
  const isIDP = ['DL', 'LB', 'DB', 'IDP', 'IDP_FLEX'].includes(player.position || '');
  if (isIDP) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center py-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">IDP Player</h3>
          <p className="text-gray-500">
            Detailed attributes for Individual Defensive Players (IDP) are not currently available.
          </p>
          <div className="mt-6">
            <h4 className="font-medium text-gray-700 mb-3">Game Performance</h4>
            <div className="grid grid-cols-2 gap-4">
              {getGameStats().map((stat, index) => (
                <div key={index} className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="text-sm text-gray-500 mb-1">{stat.label}</div>
                  <div className="text-lg font-bold text-gray-800">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header with overall rating and tier */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Athletic Profile</h3>
        <div className="flex items-center gap-4">
          <div className="text-4xl font-bold text-gray-900">{overallRating.overall}</div>
          <div className={`px-4 py-2 rounded-lg text-sm font-semibold ${tier.color}`}>
            {tier.text}
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.floor(overallRating.overall / 20) }).map((_, i) => (
              <Star key={i} size={20} className="text-yellow-400 fill-current" />
            ))}
          </div>
        </div>
      </div>

      {/* Role and Snap Share */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Crown size={20} className="text-primary-500" />
          <span className="font-medium text-gray-700">{overallRating.role}</span>
        </div>
        <div className="flex items-center gap-2">
          <Shield size={20} className="text-success-500" />
          <span className="font-medium text-gray-700">{overallRating.snapShare}% Snaps</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left side - Attributes */}
        <div className="space-y-4">
          {Object.entries(positionAttributes).map(([key, value]) => {
            const { icon, color } = getAttributeDisplay(key, value);
            
            return (
              <div 
                key={key} 
                className="bg-gray-50 rounded-lg p-4 relative group"
                onMouseEnter={() => setHoveredAttribute(key)}
                onMouseLeave={() => setHoveredAttribute(null)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={color}>{icon}</div>
                    <span className="font-medium text-gray-700 capitalize">{key}</span>
                  </div>
                  <span className={`text-lg font-bold ${color}`}>
                    {value}
                  </span>
                </div>

                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
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

                {/* Attribute description tooltip */}
                {hoveredAttribute === key && (
                  <div className="absolute z-10 w-64 p-4 bg-white rounded-lg shadow-lg border border-gray-100 -right-72 top-0">
                    <p className="text-sm text-gray-600 mb-2">
                      {getAttributeDescription(key, player.position)}
                    </p>
                    <div className="text-xs text-gray-500">
                      Rating based on 2024 performance metrics
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right side - Radar Chart and Game Stats */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-100 p-2">
            <PlayerPerformanceRadar 
              player={player}
              stats={stats}
              height={300}
            />
          </div>

          {/* Game Stats */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-4">Game Performance</h4>
            <div className="grid grid-cols-2 gap-4">
              {getGameStats().map((stat, index) => (
                <div key={index} className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="text-sm text-gray-500 mb-1">{stat.label}</div>
                  <div className="text-lg font-bold text-gray-800">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-sm text-gray-500 text-center">
            Player attributes based on 2024 performance metrics
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get attribute descriptions
const getAttributeDescription = (attribute: string, position?: string): string => {
  const descriptions: Record<string, Record<string, string>> = {
    QB: {
      arm: 'Throwing power and deep ball ability',
      accuracy: 'Passing precision and ball placement',
      awareness: 'Decision making and reading defenses',
      agility: 'Mobility and ability to extend plays',
      decision: 'Decision-making under pressure and ability to read defenses',
      pocket: 'Ability to maneuver and throw from the pocket'
    },
    RB: {
      speed: 'Straight-line speed and acceleration',
      agility: 'Quickness and change of direction',
      power: 'Running strength and breaking tackles',
      vision: 'Finding holes and reading blocks',
      hands: 'Receiving ability out of the backfield',
      blocking: 'Pass protection and blocking skills'
    },
    WR: {
      speed: 'Deep threat and separation speed',
      hands: 'Catching ability and consistency',
      route: 'Route running precision',
      separation: 'Ability to get open',
      yac: 'Yards after catch ability',
      blocking: 'Downfield and perimeter blocking'
    },
    TE: {
      speed: 'Movement and seam threat ability',
      hands: 'Catching in traffic',
      route: 'Route running technique',
      blocking: 'Run and pass blocking ability',
      yac: 'Yards after catch ability',
      redzone: 'Effectiveness in the red zone'
    }
  };

  if (!position) return 'Physical attribute rating';
  return descriptions[position]?.[attribute] || 'Physical attribute rating';
};