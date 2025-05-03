import React, { useState, useEffect } from 'react';
import { DraftPlayer } from '../../types/draft';
import { Star, Zap, TrendingUp, AlertTriangle, Shield, Brain } from 'lucide-react';

interface EnhancedPlayerCardProps {
  player: DraftPlayer;
  onDraft?: (player_id: string) => void;
  showDetails?: boolean;
  isDrafted?: boolean;
  showProjections?: boolean;
}

export const EnhancedPlayerCard: React.FC<EnhancedPlayerCardProps> = ({ 
  player, 
  onDraft,
  showDetails = true,
  isDrafted = false,
  showProjections = false
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [teamLogoLoaded, setTeamLogoLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleDraft = () => {
    if (onDraft && !isDrafted) {
      onDraft(player.player_id);
    }
  };
  
  // Get position color class
  const getPositionColorClass = (position: string): string => {
    switch (position) {
      case 'QB':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'RB':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'WR':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'TE':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'K':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'DEF':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  // Get position gradient class
  const getPositionGradientClass = (position: string): string => {
    switch (position) {
      case 'QB':
        return 'from-red-600 to-red-800';
      case 'RB':
        return 'from-blue-600 to-blue-800';
      case 'WR':
        return 'from-green-600 to-green-800';
      case 'TE':
        return 'from-purple-600 to-purple-800';
      case 'K':
        return 'from-yellow-600 to-yellow-800';
      case 'DEF':
        return 'from-gray-600 to-gray-800';
      default:
        return 'from-gray-600 to-gray-800';
    }
  };
  
  // Get injury status color
  const getInjuryStatusColor = (status: string | null | undefined): string => {
    if (!status) return '';
    
    switch (status) {
      case 'Questionable':
        return 'text-yellow-600';
      case 'Doubtful':
        return 'text-orange-600';
      case 'Out':
      case 'IR':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // Get player image URL
  const getPlayerImageUrl = (player_id: string) => {
    return `https://sleepercdn.com/content/nfl/players/thumb/${player_id}.jpg`;
  };

  // Get team logo URL
  const getTeamLogoUrl = (team: string) => {
    return `https://sleepercdn.com/images/team_logos/nfl/${team?.toLowerCase()}.png`;
  };

  // Get value color class
  const getValueColorClass = (adp?: number, rank?: number): string => {
    if (!adp || !rank) return 'text-gray-800';
    
    const value = adp - rank;
    if (value > 20) return 'text-green-600 font-semibold';
    if (value > 10) return 'text-green-500';
    if (value < -20) return 'text-red-600 font-semibold';
    if (value < -10) return 'text-red-500';
    return 'text-gray-800';
  };
  
  return (
    <div 
      className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${
        isDrafted ? 'opacity-60' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header with player image and team logo */}
      <div className={`relative h-24 bg-gradient-to-r ${getPositionGradientClass(player.position)}`}>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative h-full flex items-end p-3">
          <div className="absolute bottom-0 translate-y-1/2 left-3">
            <div className="w-16 h-16 rounded-full border-2 border-white overflow-hidden bg-white">
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
          </div>
          
          <div className="ml-20 pb-1">
            <h3 className="font-semibold text-white text-lg drop-shadow-sm">
              {player.first_name} {player.last_name}
            </h3>
            <div className="flex items-center">
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
          
          {player.rank && (
            <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-lg">
              <div className="text-xs text-white/80">Rank</div>
              <div className="font-bold text-white text-center">{player.rank}</div>
            </div>
          )}
        </div>
      </div>
      
      {/* Player info */}
      <div className="p-3 pt-6">
        {/* Player metrics */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div>
            <div className="text-xs text-gray-500">ADP</div>
            <div className="font-semibold text-gray-800">{player.adp?.toFixed(1) || 'N/A'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Tier</div>
            <div className="font-semibold text-gray-800">{player.tier || 'N/A'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Value</div>
            <div className={getValueColorClass(player.adp, player.rank)}>
              {player.adp && player.rank ? 
                (player.adp - player.rank > 0 ? '+' : '') + (player.adp - player.rank).toFixed(1) : 
                'N/A'}
            </div>
          </div>
        </div>
        
        {showDetails && (
          <>
            {/* Player metrics */}
            <div className="space-y-2 mb-3">
              {player.boom_probability !== undefined && (
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="flex items-center text-gray-500">
                      <Zap size={12} className="mr-1 text-primary-500" />
                      Boom Potential
                    </span>
                    <span className="font-medium">{player.boom_probability}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full">
                    <div 
                      className="h-full bg-primary-500 rounded-full"
                      style={{ width: `${player.boom_probability}%` }}
                    />
                  </div>
                </div>
              )}
              
              {player.bust_risk !== undefined && (
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="flex items-center text-gray-500">
                      <AlertTriangle size={12} className="mr-1 text-red-500" />
                      Bust Risk
                    </span>
                    <span className="font-medium">{player.bust_risk}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full">
                    <div 
                      className="h-full bg-red-500 rounded-full"
                      style={{ width: `${player.bust_risk}%` }}
                    />
                  </div>
                </div>
              )}
              
              {player.breakout_score !== undefined && (
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="flex items-center text-gray-500">
                      <TrendingUp size={12} className="mr-1 text-green-500" />
                      Breakout Score
                    </span>
                    <span className="font-medium">{player.breakout_score}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full">
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
              <div className="flex flex-wrap gap-1 mt-2 mb-3">
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
            
            {/* Draft button */}
            <button
              onClick={handleDraft}
              disabled={isDrafted}
              className={`w-full px-3 py-1.5 rounded-lg text-sm font-medium ${
                isDrafted 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-primary-500 text-white hover:bg-primary-600 transition-colors'
              }`}
            >
              {isDrafted ? 'Already Drafted' : 'Draft Player'}
            </button>
          </>
        )}
        
        {/* Hover overlay with quick stats */}
        {isHovered && !showDetails && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center p-4 transition-opacity duration-200">
            <div className="text-center text-white">
              <div className="mb-2">
                <div className="text-xs opacity-80">Boom / Bust / Breakout</div>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <div className="flex items-center">
                    <Zap size={12} className="text-primary-400 mr-1" />
                    <span>{player.boom_probability || 'N/A'}%</span>
                  </div>
                  <div className="flex items-center">
                    <AlertTriangle size={12} className="text-red-400 mr-1" />
                    <span>{player.bust_risk || 'N/A'}%</span>
                  </div>
                  <div className="flex items-center">
                    <TrendingUp size={12} className="text-green-400 mr-1" />
                    <span>{player.breakout_score || 'N/A'}%</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleDraft}
                disabled={isDrafted}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                  isDrafted 
                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                    : 'bg-primary-500 text-white hover:bg-primary-600 transition-colors'
                }`}
              >
                {isDrafted ? 'Already Drafted' : 'Draft Player'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};