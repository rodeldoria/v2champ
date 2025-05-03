import React from 'react';
import { DraftPlayer } from '../../types/draft';
import { X, Star, Zap, TrendingUp, AlertTriangle, Shield, Info, Brain } from 'lucide-react';

interface PlayerCardModalProps {
  player: DraftPlayer;
  onClose: () => void;
  onDraft?: (player_id: string) => void;
  isDrafted?: boolean;
}

export const PlayerCardModal: React.FC<PlayerCardModalProps> = ({
  player,
  onClose,
  onDraft,
  isDrafted = false
}) => {
  // Handle draft button click
  const handleDraft = () => {
    if (onDraft && !isDrafted) {
      onDraft(player.player_id);
      onClose();
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

  // Get player image URL
  const getPlayerImageUrl = (player_id: string) => {
    return `https://sleepercdn.com/content/nfl/players/thumb/${player_id}.jpg`;
  };

  // Get team logo URL
  const getTeamLogoUrl = (team: string) => {
    if (!team) return null;
    return `https://sleepercdn.com/images/team_logos/nfl/${team.toLowerCase()}.png`;
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative">
          <div className={`h-24 ${player.position === 'QB' ? 'bg-gradient-to-r from-red-600 to-red-800' :
                                  player.position === 'RB' ? 'bg-gradient-to-r from-blue-600 to-blue-800' :
                                  player.position === 'WR' ? 'bg-gradient-to-r from-green-600 to-green-800' :
                                  player.position === 'TE' ? 'bg-gradient-to-r from-purple-600 to-purple-800' :
                                  player.position === 'K' ? 'bg-gradient-to-r from-yellow-600 to-yellow-800' :
                                  'bg-gradient-to-r from-gray-600 to-gray-800'}`}>
            <div className="absolute inset-0 bg-black/20"></div>
          </div>
          
          <button 
            onClick={onClose}
            className="absolute top-3 right-3 p-1 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors z-10"
          >
            <X size={20} />
          </button>
          
          <div className="absolute -bottom-16 left-6 flex items-end">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-white">
                <img
                  src={getPlayerImageUrl(player.player_id)}
                  alt={`${player.first_name} ${player.last_name}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${player.first_name}+${player.last_name}&background=6366f1&color=fff`;
                  }}
                />
              </div>
              <div className={`absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 border-white ${
                getPositionColorClass(player.position)
              }`}>
                {player.position}
              </div>
            </div>
            
            <div className="ml-4 pb-4">
              <h2 className="text-xl font-bold text-white drop-shadow-md">
                {player.first_name} {player.last_name}
              </h2>
              <div className="flex items-center">
                {player.team && (
                  <div className="flex items-center bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                    <img 
                      src={getTeamLogoUrl(player.team)} 
                      alt={player.team} 
                      className="w-4 h-4 mr-1"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <span className="text-xs text-white">{player.team}</span>
                  </div>
                )}
                {player.injury_status && (
                  <span className="ml-2 px-2 py-0.5 bg-red-500/80 text-white text-xs rounded-full">
                    {player.injury_status}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto mt-20 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="space-y-6">
              {/* Player info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-800 mb-3">Player Info</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Rank</p>
                    <p className="font-medium text-gray-800">{player.rank || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">ADP</p>
                    <p className="font-medium text-gray-800">{player.adp?.toFixed(1) || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Tier</p>
                    <p className="font-medium text-gray-800">{player.tier || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Value</p>
                    <p className={getValueColorClass(player.adp, player.rank)}>
                      {player.adp && player.rank ? 
                        (player.adp - player.rank > 0 ? '+' : '') + (player.adp - player.rank).toFixed(1) : 
                        'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Experience</p>
                    <p className="font-medium text-gray-800">
                      {player.years_exp === 0 
                        ? 'Rookie' 
                        : player.years_exp === undefined 
                          ? 'N/A' 
                          : `${player.years_exp} Years`}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Bye Week</p>
                    <p className="font-medium text-gray-800">{player.bye_week || 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              {/* Player metrics */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-800 mb-3">Player Metrics</h3>
                <div className="space-y-3">
                  {player.boom_probability !== undefined && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="flex items-center text-gray-600">
                          <Zap size={16} className="mr-2 text-primary-500" />
                          Boom Potential
                        </span>
                        <span className="font-medium text-gray-800">{player.boom_probability}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary-500 rounded-full"
                          style={{ width: `${player.boom_probability}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Likelihood of significantly outperforming expectations
                      </p>
                    </div>
                  )}
                  
                  {player.bust_risk !== undefined && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="flex items-center text-gray-600">
                          <AlertTriangle size={16} className="mr-2 text-red-500" />
                          Bust Risk
                        </span>
                        <span className="font-medium text-gray-800">{player.bust_risk}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-red-500 rounded-full"
                          style={{ width: `${player.bust_risk}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Likelihood of underperforming relative to draft position
                      </p>
                    </div>
                  )}
                  
                  {player.breakout_score !== undefined && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="flex items-center text-gray-600">
                          <TrendingUp size={16} className="mr-2 text-green-500" />
                          Breakout Score
                        </span>
                        <span className="font-medium text-gray-800">{player.breakout_score}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${player.breakout_score}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Potential for a significant leap in production this season
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Right column */}
            <div className="space-y-6">
              {/* AI Insights */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <Brain size={18} className="text-primary-500 mr-2" />
                  <h3 className="font-medium text-gray-800">AI Insights</h3>
                </div>
                
                <div className="space-y-3">
                  {player.boom_probability !== undefined && player.boom_probability > 70 && (
                    <div className="bg-primary-50 border border-primary-100 rounded-lg p-3">
                      <div className="flex items-center text-primary-700 font-medium mb-1">
                        <Zap size={16} className="mr-2" />
                        High Boom Potential
                      </div>
                      <p className="text-sm text-primary-600">
                        {player.first_name} {player.last_name} has excellent upside and could significantly outperform their ADP. Consider prioritizing in your draft.
                      </p>
                    </div>
                  )}
                  
                  {player.bust_risk !== undefined && player.bust_risk > 70 && (
                    <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                      <div className="flex items-center text-red-700 font-medium mb-1">
                        <AlertTriangle size={16} className="mr-2" />
                        High Bust Risk
                      </div>
                      <p className="text-sm text-red-600">
                        {player.first_name} {player.last_name} carries significant downside risk at their current draft position. Consider alternatives with similar upside.
                      </p>
                    </div>
                  )}
                  
                  {player.breakout_score !== undefined && player.breakout_score > 75 && player.years_exp !== undefined && player.years_exp <= 3 && (
                    <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                      <div className="flex items-center text-green-700 font-medium mb-1">
                        <TrendingUp size={16} className="mr-2" />
                        Breakout Candidate
                      </div>
                      <p className="text-sm text-green-600">
                        {player.first_name} {player.last_name} shows strong indicators for a potential breakout season. Consider targeting before ADP.
                      </p>
                    </div>
                  )}
                  
                  {player.adp && player.rank && player.adp - player.rank > 15 && (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                      <div className="flex items-center text-blue-700 font-medium mb-1">
                        <Star size={16} className="mr-2" />
                        Value Pick
                      </div>
                      <p className="text-sm text-blue-600">
                        {player.first_name} {player.last_name} is currently being drafted significantly later than their rank suggests. Excellent value opportunity.
                      </p>
                    </div>
                  )}
                  
                  {/* Default insight if none of the above apply */}
                  {!(
                    (player.boom_probability !== undefined && player.boom_probability > 70) ||
                    (player.bust_risk !== undefined && player.bust_risk > 70) ||
                    (player.breakout_score !== undefined && player.breakout_score > 75 && player.years_exp !== undefined && player.years_exp <= 3) ||
                    (player.adp && player.rank && player.adp - player.rank > 15)
                  ) && (
                    <div className="bg-gray-100 border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center text-gray-700 font-medium mb-1">
                        <Info size={16} className="mr-2" />
                        Player Analysis
                      </div>
                      <p className="text-sm text-gray-600">
                        {player.first_name} {player.last_name} is a {player.position} for the {player.team || 'N/A'} with a current ADP of {player.adp?.toFixed(1) || 'N/A'} and rank of {player.rank || 'N/A'}. Consider their role and team situation when drafting.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Tags */}
              {player.tags && player.tags.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-800 mb-3">Player Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {player.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-800 rounded-lg text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Draft button */}
              <button
                onClick={handleDraft}
                disabled={isDrafted}
                className={`w-full py-3 rounded-lg text-sm font-medium ${
                  isDrafted 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-primary-500 text-white hover:bg-primary-600 transition-colors'
                }`}
              >
                {isDrafted ? 'Already Drafted' : 'Draft Player'}
              </button>
            </div>
          </div>
          
          {/* Comparison section */}
          <div className="mt-6">
            <h3 className="font-medium text-gray-800 mb-3">Rank Comparison</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Sleeper</p>
                  <p className="font-medium text-gray-800">{player.rank || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">ESPN</p>
                  <p className="font-medium text-gray-800">{player.espn_rank || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Yahoo</p>
                  <p className="font-medium text-gray-800">{player.yahoo_rank || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">NFL</p>
                  <p className="font-medium text-gray-800">{player.nfl_rank || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">ECR</p>
                  <p className="font-medium text-gray-800">{player.ecr || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};