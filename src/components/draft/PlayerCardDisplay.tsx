import React, { useState, useEffect } from 'react';
import { DraftPlayer } from '../../types/draft';
import { Star, Zap, TrendingUp, AlertTriangle, Shield } from 'lucide-react';

interface PlayerCardDisplayProps {
  player: DraftPlayer;
  showDetails?: boolean;
  className?: string;
}

export const PlayerCardDisplay: React.FC<PlayerCardDisplayProps> = ({
  player,
  showDetails = true,
  className = ''
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [teamLogoLoaded, setTeamLogoLoaded] = useState(false);

  // Get position color class
  const getPositionColorClass = (position: string): string => {
    switch (position) {
      case 'QB':
        return 'bg-red-100 text-red-800';
      case 'RB':
        return 'bg-blue-100 text-blue-800';
      case 'WR':
        return 'bg-green-100 text-green-800';
      case 'TE':
        return 'bg-purple-100 text-purple-800';
      case 'K':
        return 'bg-yellow-100 text-yellow-800';
      case 'DEF':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get position background gradient
  const getPositionGradient = (position: string): string => {
    switch (position) {
      case 'QB':
        return 'bg-gradient-to-r from-red-600 to-red-800';
      case 'RB':
        return 'bg-gradient-to-r from-blue-600 to-blue-800';
      case 'WR':
        return 'bg-gradient-to-r from-green-600 to-green-800';
      case 'TE':
        return 'bg-gradient-to-r from-purple-600 to-purple-800';
      case 'K':
        return 'bg-gradient-to-r from-yellow-600 to-yellow-800';
      case 'DEF':
        return 'bg-gradient-to-r from-gray-600 to-gray-800';
      default:
        return 'bg-gradient-to-r from-gray-600 to-gray-800';
    }
  };

  // Get player image URL
  const getPlayerImageUrl = (player_id: string) => {
    return `https://sleepercdn.com/content/nfl/players/thumb/${player_id}.jpg`;
  };

  // Get team logo URL
  const getTeamLogoUrl = (team: string) => {
    if (!team) return null;
    return `https://sleepercdn.com/images/team_logos/nfl/${team.toLowerCase()}.png`;
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${className}`}>
      {/* Player header with image and team */}
      <div className={`relative ${getPositionGradient(player.position)} p-4`}>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex items-center">
          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-white border-2 border-white">
            <img
              src={getPlayerImageUrl(player.player_id)}
              alt={`${player.first_name} ${player.last_name}`}
              className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${player.first_name}+${player.last_name}&background=6366f1&color=fff`;
                setImageLoaded(true);
              }}
            />
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-bold text-white">
              {player.first_name} {player.last_name}
            </h3>
            <div className="flex items-center mt-1">
              {player.team && (
                <div className="flex items-center bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                  <img 
                    src={getTeamLogoUrl(player.team)} 
                    alt={player.team} 
                    className={`w-4 h-4 mr-1 transition-opacity duration-300 ${teamLogoLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setTeamLogoLoaded(true)}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      setTeamLogoLoaded(true);
                    }}
                  />
                  {!teamLogoLoaded && (
                    <div className="w-4 h-4 mr-1 bg-white/30 rounded-full"></div>
                  )}
                  <span className="text-xs text-white">{player.team}</span>
                </div>
              )}
              <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                getPositionColorClass(player.position)
              }`}>
                {player.position}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Player info */}
      <div className="p-4">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-xs text-gray-500">Rank</div>
            <div className="text-lg font-bold text-gray-800">{player.rank || 'N/A'}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500">ADP</div>
            <div className="text-lg font-bold text-gray-800">{player.adp?.toFixed(1) || 'N/A'}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500">Tier</div>
            <div className="text-lg font-bold text-gray-800">{player.tier || 'N/A'}</div>
          </div>
        </div>

        {showDetails && (
          <>
            <div className="space-y-3 mb-4">
              {player.boom_probability !== undefined && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <Zap size={16} className="text-primary-500 mr-2" />
                      <span className="text-sm font-medium">Boom Potential</span>
                    </div>
                    <span className="font-bold">{player.boom_probability}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary-500 rounded-full"
                      style={{ width: `${player.boom_probability}%` }}
                    />
                  </div>
                </div>
              )}
              
              {player.bust_risk !== undefined && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <AlertTriangle size={16} className="text-red-500 mr-2" />
                      <span className="text-sm font-medium">Bust Risk</span>
                    </div>
                    <span className="font-bold">{player.bust_risk}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500 rounded-full"
                      style={{ width: `${player.bust_risk}%` }}
                    />
                  </div>
                </div>
              )}
              
              {player.breakout_score !== undefined && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <TrendingUp size={16} className="text-green-500 mr-2" />
                      <span className="text-sm font-medium">Breakout Score</span>
                    </div>
                    <span className="font-bold">{player.breakout_score}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${player.breakout_score}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Tags */}
            {player.tags && player.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {player.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};