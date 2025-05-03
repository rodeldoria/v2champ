import React, { useState, useEffect } from 'react';
import { useDraftStore } from '../../../store/draftStore';
import { DraftPlayer } from '../../../types/draft';
import { ChevronDown, ChevronUp, Filter, Star, TrendingUp, AlertTriangle } from 'lucide-react';
import { PlayerCardModal } from '../PlayerCardModal';

interface TierGroup {
  tier: number;
  name: string;
  players: DraftPlayer[];
  color: string;
}

export const DraftTiersSort: React.FC = () => {
  const { availablePlayers, picks } = useDraftStore();
  const [selectedPosition, setSelectedPosition] = useState<string>('ALL');
  const [expandedTiers, setExpandedTiers] = useState<Record<number, boolean>>({1: true});
  const [selectedPlayer, setSelectedPlayer] = useState<DraftPlayer | null>(null);
  
  // Get drafted player IDs
  const draftedPlayerIds = picks.map(pick => pick.player_id);
  
  // Filter out drafted players and by position
  const filteredPlayers = availablePlayers.filter(player => {
    const isAvailable = !draftedPlayerIds.includes(player.player_id);
    const matchesPosition = selectedPosition === 'ALL' || 
      player.position === selectedPosition ||
      (selectedPosition === 'FLEX' && ['RB', 'WR', 'TE'].includes(player.position));
    
    return isAvailable && matchesPosition;
  });
  
  // Define tier thresholds and names
  const tiers = [
    { tier: 1, name: 'Elite', threshold: 25, color: 'bg-primary-100 border-primary-300 text-primary-800' },
    { tier: 2, name: 'Starter', threshold: 75, color: 'bg-green-100 border-green-300 text-green-800' },
    { tier: 3, name: 'Flex', threshold: 150, color: 'bg-blue-100 border-blue-300 text-blue-800' },
    { tier: 4, name: 'Bench', threshold: 250, color: 'bg-yellow-100 border-yellow-300 text-yellow-800' },
    { tier: 5, name: 'Flier', threshold: 999, color: 'bg-gray-100 border-gray-300 text-gray-800' }
  ];
  
  // Group players by tier
  const tierGroups: TierGroup[] = [];
  
  tiers.forEach(tierInfo => {
    const tierPlayers = filteredPlayers.filter(player => {
      const rank = player.rank || 999;
      const prevThreshold = tiers.find(t => t.tier === tierInfo.tier - 1)?.threshold || 0;
      return rank > prevThreshold && rank <= tierInfo.threshold;
    }).sort((a, b) => (a.rank || 999) - (b.rank || 999));
    
    if (tierPlayers.length > 0) {
      tierGroups.push({
        tier: tierInfo.tier,
        name: tierInfo.name,
        players: tierPlayers,
        color: tierInfo.color
      });
    }
  });
  
  // Toggle tier expansion
  const toggleTier = (tier: number) => {
    setExpandedTiers(prev => ({
      ...prev,
      [tier]: !prev[tier]
    }));
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

  // Get player image URL
  const getPlayerImageUrl = (playerId: string) => {
    return `https://sleepercdn.com/content/nfl/players/thumb/${playerId}.jpg`;
  };

  // Get team logo URL
  const getTeamLogoUrl = (team: string) => {
    return `https://sleepercdn.com/images/team_logos/nfl/${team?.toLowerCase()}.png`;
  };

  // Handle player click
  const handlePlayerClick = (player: DraftPlayer) => {
    setSelectedPlayer(player);
  };
  
  return (
    <>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h3 className="font-semibold text-gray-800">Player Tiers</h3>
            
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-400" />
              <select
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              >
                <option value="ALL">All Positions</option>
                <option value="QB">QB</option>
                <option value="RB">RB</option>
                <option value="WR">WR</option>
                <option value="TE">TE</option>
                <option value="FLEX">FLEX (RB/WR/TE)</option>
                <option value="K">K</option>
                <option value="DEF">DEF</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="overflow-y-auto max-h-[600px]">
          {tierGroups.map(group => (
            <div key={group.tier} className="border-b border-gray-200 last:border-b-0">
              <button
                onClick={() => toggleTier(group.tier)}
                className={`w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors ${group.color}`}
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-semibold bg-white">
                    {group.tier}
                  </div>
                  <div className="ml-3">
                    <h4 className="font-medium">{group.name} Tier</h4>
                    <p className="text-xs">{group.players.length} players</p>
                  </div>
                </div>
                {expandedTiers[group.tier] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              
              {expandedTiers[group.tier] && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4 bg-gray-50">
                  {group.players.map(player => (
                    <div 
                      key={player.player_id} 
                      className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                      onClick={() => handlePlayerClick(player)}
                    >
                      <div className="flex items-center p-3 border-b border-gray-100">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                          <img
                            src={getPlayerImageUrl(player.player_id)}
                            alt={`${player.first_name} ${player.last_name}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${player.first_name}+${player.last_name}&background=6366f1&color=fff`;
                            }}
                          />
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-800 truncate">
                              {player.first_name} {player.last_name}
                            </h3>
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
                                  className="w-4 h-4 mr-1"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                                <span className="text-xs text-gray-500">{player.team}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-3">
                        <div className="grid grid-cols-3 gap-2 mb-2">
                          <div>
                            <div className="text-xs text-gray-500">Rank</div>
                            <div className="font-semibold text-gray-800">{player.rank || 'N/A'}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">ADP</div>
                            <div className="font-semibold text-gray-800">{player.adp?.toFixed(1) || 'N/A'}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Tier</div>
                            <div className="font-semibold text-gray-800">{player.tier || 'N/A'}</div>
                          </div>
                        </div>
                        
                        {/* Player metrics */}
                        <div className="space-y-1.5 mt-2">
                          {player.boom_probability !== undefined && (
                            <div>
                              <div className="flex items-center justify-between text-xs mb-0.5">
                                <span className="flex items-center text-gray-500">
                                  <Star size={10} className="mr-1 text-primary-500" />
                                  Boom
                                </span>
                                <span>{player.boom_probability}%</span>
                              </div>
                              <div className="h-1 bg-gray-200 rounded-full">
                                <div 
                                  className="h-full bg-primary-500 rounded-full"
                                  style={{ width: `${player.boom_probability}%` }}
                                />
                              </div>
                            </div>
                          )}
                          
                          {player.bust_risk !== undefined && (
                            <div>
                              <div className="flex items-center justify-between text-xs mb-0.5">
                                <span className="flex items-center text-gray-500">
                                  <AlertTriangle size={10} className="mr-1 text-red-500" />
                                  Bust
                                </span>
                                <span>{player.bust_risk}%</span>
                              </div>
                              <div className="h-1 bg-gray-200 rounded-full">
                                <div 
                                  className="h-full bg-red-500 rounded-full"
                                  style={{ width: `${player.bust_risk}%` }}
                                />
                              </div>
                            </div>
                          )}
                          
                          {player.breakout_score !== undefined && (
                            <div>
                              <div className="flex items-center justify-between text-xs mb-0.5">
                                <span className="flex items-center text-gray-500">
                                  <TrendingUp size={10} className="mr-1 text-green-500" />
                                  Breakout
                                </span>
                                <span>{player.breakout_score}%</span>
                              </div>
                              <div className="h-1 bg-gray-200 rounded-full">
                                <div 
                                  className="h-full bg-green-500 rounded-full"
                                  style={{ width: `${player.breakout_score}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          {tierGroups.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No players found matching your criteria
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            Tiers based on player rankings: Elite (1-25), Starter (26-75), Flex (76-150), Bench (151-250), Flier (251+)
          </div>
        </div>
      </div>

      {/* Player Card Modal */}
      {selectedPlayer && (
        <PlayerCardModal 
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
          isDrafted={draftedPlayerIds.includes(selectedPlayer.player_id)}
        />
      )}
    </>
  );
};