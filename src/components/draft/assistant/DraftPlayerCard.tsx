import React, { useState } from 'react';
import { DraftPlayer } from '../../../types/draft';
import { Star, Zap, AlertTriangle, TrendingUp, Shield, Brain } from 'lucide-react';

interface DraftPlayerCardProps {
  player: DraftPlayer;
  onDraft?: (player_id: string) => void;
  showDetails?: boolean;
  isDrafted?: boolean;
}

export const DraftPlayerCard: React.FC<DraftPlayerCardProps> = ({ 
  player, 
  onDraft,
  showDetails = true,
  isDrafted = false
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [teamLogoLoaded, setTeamLogoLoaded] = useState(false);

  const handleDraft = () => {
    if (onDraft && !isDrafted) {
      onDraft(player.player_id);
    }
  };
  
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
  
  return (
    <div className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${
      isDrafted ? 'opacity-60' : ''
    }`}>
      <div className="p-3 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
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
            <div className="ml-3">
              <div className="flex items-center">
                <span className="font-medium text-gray-900 text-sm">
                  {player.first_name} {player.last_name}
                </span>
                <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                  getPositionColorClass(player.position)
                }`}>
                  {player.position}
                </span>
              </div>
              <div className="flex items-center mt-1">
                {player.team && (
                  <div className="flex items-center">
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
                      <div className="w-4 h-4 mr-1 bg-gray-200 rounded-full"></div>
                    )}
                    <span className="text-xs text-gray-500">{player.team}</span>
                  </div>
                )}
                {player.injury_status && (
                  <span className={`ml-2 text-xs ${getInjuryStatusColor(player.injury_status)}`}>
                    {player.injury_status}
                  </span>
                )}
                {player.bye_week && (
                  <span className="ml-2 text-xs text-gray-500">
                    Bye: {player.bye_week}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {player.rank && (
            <div className="text-right">
              <div className="text-xs text-gray-500">Rank</div>
              <div className="font-semibold text-gray-800">{player.rank}</div>
            </div>
          )}
        </div>
      </div>
      
      {showDetails && (
        <div className="p-3">
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
              <div className={`font-semibold ${
                player.adp && player.rank && player.adp - player.rank > 10 ? 'text-green-600' :
                player.adp && player.rank && player.adp - player.rank < -10 ? 'text-red-600' :
                'text-gray-800'
              }`}>
                {player.adp && player.rank ? 
                  (player.adp - player.rank > 0 ? '+' : '') + (player.adp - player.rank).toFixed(1) : 
                  'N/A'}
              </div>
            </div>
          </div>
          
          {/* Player metrics */}
          <div className="space-y-2 mb-3">
            {player.boom_probability !== undefined && (
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="flex items-center text-gray-500">
                    <Star size={12} className="mr-1 text-primary-500" />
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
        </div>
      )}
    </div>
  );
};