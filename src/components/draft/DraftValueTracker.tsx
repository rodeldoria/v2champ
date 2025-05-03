import React, { useState, useEffect } from 'react';
import { useDraftStore } from '../../store/draftStore';
import { DraftPlayer } from '../../types/draft';
import { AlertTriangle, Star } from 'lucide-react';

interface PositionValue {
  position: string;
  topPlayers: DraftPlayer[];
  averageRank: number;
  scarcityScore: number;
}

export const DraftValueTracker: React.FC = () => {
  const { availablePlayers } = useDraftStore();
  const [positionValues, setPositionValues] = useState<PositionValue[]>([]);
  
  // Calculate position values whenever available players change
  useEffect(() => {
    if (!availablePlayers.length) return;
    
    // Group players by position
    const groupedPlayers: Record<string, DraftPlayer[]> = {};
    
    availablePlayers.forEach(player => {
      if (!player.position) return;
      
      if (!groupedPlayers[player.position]) {
        groupedPlayers[player.position] = [];
      }
      
      groupedPlayers[player.position].push(player);
    });
    
    // Calculate values for each position
    const values: PositionValue[] = Object.entries(groupedPlayers).map(([position, players]) => {
      // Sort players by rank
      const sortedPlayers = [...players].sort((a, b) => (a.rank || 999) - (b.rank || 999));
      
      // Get top 5 players
      const topPlayers = sortedPlayers.slice(0, 5);
      
      // Calculate average rank of top 5 players
      const avgRank = topPlayers.reduce((sum, p) => sum + (p.rank || 999), 0) / topPlayers.length;
      
      // Calculate scarcity score (lower is more scarce)
      // Based on number of top 100 players and drop-off between tiers
      const top100Players = sortedPlayers.filter(p => (p.rank || 999) <= 100).length;
      const tier1Players = sortedPlayers.filter(p => (p.rank || 999) <= 25).length;
      const tier2Players = sortedPlayers.filter(p => (p.rank || 999) > 25 && (p.rank || 999) <= 75).length;
      
      // Higher score means more scarce
      const scarcityScore = 100 - (tier1Players * 10 + tier2Players * 5 + top100Players);
      
      return {
        position,
        topPlayers,
        averageRank: avgRank,
        scarcityScore
      };
    });
    
    // Sort by highest value (lowest average rank)
    const sortedValues = [...values].sort((a, b) => a.averageRank - b.averageRank);
    
    setPositionValues(sortedValues);
  }, [availablePlayers]);
  
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
  
  // Get scarcity indicator
  const getScarcityIndicator = (score: number): { color: string; label: string } => {
    if (score >= 80) {
      return { color: 'text-red-500', label: 'Critical' };
    }
    if (score >= 60) {
      return { color: 'text-orange-500', label: 'High' };
    }
    if (score >= 40) {
      return { color: 'text-yellow-500', label: 'Moderate' };
    }
    return { color: 'text-green-500', label: 'Low' };
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-800">Position Value Tracker</h3>
        <p className="text-sm text-gray-500 mt-1">
          Positions sorted by highest remaining value
        </p>
      </div>
      
      <div className="divide-y divide-gray-200">
        {positionValues.map((posValue) => {
          const scarcity = getScarcityIndicator(posValue.scarcityScore);
          
          return (
            <div key={posValue.position} className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center">
                  <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium ${
                    getPositionColorClass(posValue.position)
                  }`}>
                    {posValue.position}
                  </span>
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    Avg Rank: {Math.round(posValue.averageRank)}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <span className={`text-sm font-medium ${scarcity.color} mr-1`}>
                    {scarcity.label} Scarcity
                  </span>
                  {posValue.scarcityScore >= 60 && (
                    <AlertTriangle size={16} className={scarcity.color} />
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {posValue.topPlayers.slice(0, 3).map((player) => (
                  <div key={player.player_id} className="flex items-center bg-gray-50 rounded-lg p-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border border-gray-200">
                      <span className="text-xs font-medium text-gray-700">{player.rank || '-'}</span>
                    </div>
                    <div className="ml-2 overflow-hidden">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {player.first_name} {player.last_name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {player.team}
                      </p>
                    </div>
                    {(player.rank || 999) <= 25 && (
                      <Star size={14} className="ml-1 text-yellow-400 fill-current" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        
        {positionValues.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            No player data available
          </div>
        )}
      </div>
    </div>
  );
};