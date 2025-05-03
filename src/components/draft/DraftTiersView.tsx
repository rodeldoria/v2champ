import React, { useState, useEffect } from 'react';
import { useDraftStore } from '../../store/draftStore';
import { DraftPlayer } from '../../types/draft';
import { ChevronDown, ChevronUp, Filter, Search, Star, TrendingUp, AlertTriangle, Zap } from 'lucide-react';
import { PlayerCardModal } from './PlayerCardModal';

interface TierGroup {
  tier: number;
  name: string;
  players: DraftPlayer[];
  color: string;
}

export const DraftTiersView: React.FC = () => {
  const { availablePlayers } = useDraftStore();
  const [selectedPosition, setSelectedPosition] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<DraftPlayer | null>(null);
  const [expandedTiers, setExpandedTiers] = useState<Record<number, boolean>>({1: true});
  
  // Filter players based on position and search term
  const filteredPlayers = availablePlayers.filter(player => {
    const matchesPosition = selectedPosition === 'ALL' || 
      player.position === selectedPosition ||
      (selectedPosition === 'FLEX' && ['RB', 'WR', 'TE'].includes(player.position));
    
    const matchesSearch = searchTerm === '' || 
      `${player.first_name} ${player.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.team?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesPosition && matchesSearch;
  });
  
  // Group players by tier
  const tierGroups: TierGroup[] = [];
  
  // Define tier thresholds and names
  const tiers = [
    { tier: 1, name: 'Elite', threshold: 25, color: 'bg-primary-100 border-primary-300 text-primary-800' },
    { tier: 2, name: 'Starter', threshold: 75, color: 'bg-green-100 border-green-300 text-green-800' },
    { tier: 3, name: 'Solid', threshold: 150, color: 'bg-blue-100 border-blue-300 text-blue-800' },
    { tier: 4, name: 'Depth', threshold: 250, color: 'bg-yellow-100 border-yellow-300 text-yellow-800' },
    { tier: 5, name: 'Flier', threshold: 999, color: 'bg-gray-100 border-gray-300 text-gray-800' }
  ];
  
  // Group players by tier
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
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Left Panel - Tier Groups */}
      <div className="lg:col-span-1 bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800">Player Tiers</h3>
          <p className="text-sm text-gray-500 mt-1">
            {filteredPlayers.length} players available
          </p>
        </div>
        
        {/* Position Filter */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-wrap gap-2">
            {['ALL', 'QB', 'RB', 'WR', 'TE', 'FLEX', 'K', 'DEF'].map(pos => (
              <button
                key={pos}
                onClick={() => setSelectedPosition(pos)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedPosition === pos
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>
        
        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search players..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm"
            />
          </div>
        </div>
        
        {/* Tier Groups */}
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
                <div className="px-4 pb-4 divide-y divide-gray-100">
                  {group.players.map(player => (
                    <button
                      key={player.player_id}
                      onClick={() => setSelectedPlayer(player)}
                      className={`w-full flex items-center justify-between py-3 px-2 text-left hover:bg-gray-50 rounded-lg transition-colors ${
                        selectedPlayer?.player_id === player.player_id ? 'bg-primary-50' : ''
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                          getPositionColorClass(player.position)
                        }`}>
                          {player.position}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-800 text-sm">
                            {player.first_name} {player.last_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {player.team} - Rank: {player.rank || 'N/A'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        {player.boom_probability && player.boom_probability > 75 && (
                          <Zap size={16} className="text-primary-500 mr-1" />
                        )}
                        {player.bust_risk && player.bust_risk > 75 && (
                          <AlertTriangle size={16} className="text-red-500 mr-1" />
                        )}
                        {player.breakout_score && player.breakout_score > 75 && (
                          <TrendingUp size={16} className="text-green-500 mr-1" />
                        )}
                      </div>
                    </button>
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
      </div>
      
      {/* Right Panel - Draft Board */}
      <div className="lg:col-span-2 bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800">Draft Board</h3>
          <p className="text-sm text-gray-500 mt-1">
            Position breakdown of available players
          </p>
        </div>
        
        {/* Position Breakdown */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {['QB', 'RB', 'WR', 'TE', 'K', 'DEF'].map(position => {
            const positionPlayers = filteredPlayers.filter(p => p.position === position);
            
            // Count players by tier
            const tierCounts = tiers.reduce((acc, tier) => {
              const prevThreshold = tiers.find(t => t.tier === tier.tier - 1)?.threshold || 0;
              const count = positionPlayers.filter(p => {
                const rank = p.rank || 999;
                return rank > prevThreshold && rank <= tier.threshold;
              }).length;
              
              return { ...acc, [tier.tier]: count };
            }, {} as Record<number, number>);
            
            return (
              <div key={position} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                      getPositionColorClass(position)
                    }`}>
                      {position}
                    </div>
                    <h4 className="ml-2 font-medium text-gray-800">{position}s</h4>
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    {positionPlayers.length} available
                  </span>
                </div>
                
                {/* Tier breakdown */}
                <div className="space-y-2">
                  {tiers.map(tier => (
                    <div key={tier.tier} className="flex items-center">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium bg-white border border-gray-200">
                        {tier.tier}
                      </div>
                      <div className="ml-2 flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600">{tier.name}</span>
                          <span className="font-medium text-gray-800">{tierCounts[tier.tier] || 0}</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              tier.tier === 1 ? 'bg-primary-500' :
                              tier.tier === 2 ? 'bg-green-500' :
                              tier.tier === 3 ? 'bg-blue-500' :
                              tier.tier === 4 ? 'bg-yellow-500' :
                              'bg-gray-500'
                            }`}
                            style={{ width: `${Math.min((tierCounts[tier.tier] || 0) * 5, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Selected Player Details */}
        {selectedPlayer && (
          <div className="p-4 border-t border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-4">Player Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Player Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium ${
                    getPositionColorClass(selectedPlayer.position)
                  }`}>
                    {selectedPlayer.position}
                  </div>
                  <div className="ml-3">
                    <h4 className="font-semibold text-gray-800">
                      {selectedPlayer.first_name} {selectedPlayer.last_name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {selectedPlayer.team} - Rank: {selectedPlayer.rank || 'N/A'}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">ADP</p>
                    <p className="font-medium text-gray-800">{selectedPlayer.adp?.toFixed(1) || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Tier</p>
                    <p className="font-medium text-gray-800">{selectedPlayer.tier || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Value</p>
                    <p className="font-medium text-gray-800">
                      {selectedPlayer.adp && selectedPlayer.rank 
                        ? (selectedPlayer.adp - selectedPlayer.rank).toFixed(1) 
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Experience</p>
                    <p className="font-medium text-gray-800">
                      {selectedPlayer.years_exp === 0 
                        ? 'Rookie' 
                        : `${selectedPlayer.years_exp} Years`}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Player Metrics */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-3">Player Metrics</h4>
                
                <div className="space-y-3">
                  {selectedPlayer.boom_probability !== undefined && (
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="flex items-center text-gray-600">
                          <Zap size={12} className="mr-1" />
                          Boom Potential
                        </span>
                        <span className="font-medium text-gray-800">{selectedPlayer.boom_probability}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary-500 rounded-full"
                          style={{ width: `${selectedPlayer.boom_probability}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {selectedPlayer.bust_risk !== undefined && (
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="flex items-center text-gray-600">
                          <AlertTriangle size={12} className="mr-1" />
                          Bust Risk
                        </span>
                        <span className="font-medium text-gray-800">{selectedPlayer.bust_risk}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-red-500 rounded-full"
                          style={{ width: `${selectedPlayer.bust_risk}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {selectedPlayer.breakout_score !== undefined && (
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="flex items-center text-gray-600">
                          <TrendingUp size={12} className="mr-1" />
                          Breakout Score
                        </span>
                        <span className="font-medium text-gray-800">{selectedPlayer.breakout_score}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${selectedPlayer.breakout_score}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Draft Button */}
                <button
                  className="w-full mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Draft Player
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Player Card Modal */}
      {selectedPlayer && (
        <PlayerCardModal 
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </div>
  );
};