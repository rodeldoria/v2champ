import React, { useState, useEffect } from 'react';
import { useDraftStore } from '../../store/draftStore';
import { DraftPlayer } from '../../types/draft';
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

interface PositionTier {
  position: string;
  tiers: {
    elite: DraftPlayer[];
    starter: DraftPlayer[];
    backup: DraftPlayer[];
    depth: DraftPlayer[];
  };
  counts: {
    elite: number;
    starter: number;
    backup: number;
    depth: number;
    total: number;
  };
}

export const DraftTierTracker: React.FC = () => {
  const { availablePlayers } = useDraftStore();
  const [positionTiers, setPositionTiers] = useState<PositionTier[]>([]);
  const [expandedPosition, setExpandedPosition] = useState<string | null>(null);
  
  // Define tier thresholds by position
  const tierThresholds: Record<string, { elite: number; starter: number; backup: number }> = {
    QB: { elite: 50, starter: 100, backup: 150 },
    RB: { elite: 40, starter: 80, backup: 120 },
    WR: { elite: 40, starter: 80, backup: 120 },
    TE: { elite: 30, starter: 60, backup: 100 },
    K: { elite: 20, starter: 40, backup: 80 },
    DEF: { elite: 20, starter: 40, backup: 80 }
  };
  
  // Calculate position tiers whenever available players change
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
    
    // Calculate tiers for each position
    const tiers: PositionTier[] = Object.entries(groupedPlayers).map(([position, players]) => {
      // Get tier thresholds for this position
      const thresholds = tierThresholds[position] || { elite: 50, starter: 100, backup: 150 };
      
      // Sort players by rank
      const sortedPlayers = [...players].sort((a, b) => (a.rank || 999) - (b.rank || 999));
      
      // Categorize players by tier
      const elite = sortedPlayers.filter(p => (p.rank || 999) <= thresholds.elite);
      const starter = sortedPlayers.filter(p => (p.rank || 999) > thresholds.elite && (p.rank || 999) <= thresholds.starter);
      const backup = sortedPlayers.filter(p => (p.rank || 999) > thresholds.starter && (p.rank || 999) <= thresholds.backup);
      const depth = sortedPlayers.filter(p => (p.rank || 999) > thresholds.backup);
      
      return {
        position,
        tiers: {
          elite,
          starter,
          backup,
          depth
        },
        counts: {
          elite: elite.length,
          starter: starter.length,
          backup: backup.length,
          depth: depth.length,
          total: sortedPlayers.length
        }
      };
    });
    
    // Sort by position with most elite players first
    const sortedTiers = [...tiers].sort((a, b) => b.counts.elite - a.counts.elite);
    
    setPositionTiers(sortedTiers);
  }, [availablePlayers]);
  
  // Toggle expanded position
  const toggleExpand = (position: string) => {
    setExpandedPosition(expandedPosition === position ? null : position);
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
  
  // Get tier color class
  const getTierColorClass = (tier: 'elite' | 'starter' | 'backup' | 'depth'): string => {
    switch (tier) {
      case 'elite':
        return 'bg-primary-100 text-primary-800 border-primary-200';
      case 'starter':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'backup':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'depth':
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-800">Position Tier Tracker</h3>
        <p className="text-sm text-gray-500 mt-1">
          Click on a position to see available players by tier
        </p>
      </div>
      
      <div className="divide-y divide-gray-200">
        {positionTiers.map((posTier) => (
          <div key={posTier.position}>
            <button
              className="w-full p-4 text-left hover:bg-gray-50 focus:outline-none"
              onClick={() => toggleExpand(posTier.position)}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium ${
                    getPositionColorClass(posTier.position)
                  }`}>
                    {posTier.position}
                  </span>
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    {posTier.counts.total} Players
                  </span>
                </div>
                
                <div className="flex items-center">
                  <div className="flex space-x-2 mr-4">
                    <div className="flex items-center">
                      <span className="w-3 h-3 rounded-full bg-primary-500 mr-1"></span>
                      <span className="text-xs text-gray-600">{posTier.counts.elite}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-3 h-3 rounded-full bg-green-500 mr-1"></span>
                      <span className="text-xs text-gray-600">{posTier.counts.starter}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></span>
                      <span className="text-xs text-gray-600">{posTier.counts.backup}</span>
                    </div>
                  </div>
                  
                  {expandedPosition === posTier.position ? (
                    <ChevronUp size={20} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-400" />
                  )}
                </div>
              </div>
              
              {/* Tier bars */}
              <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden flex">
                <div 
                  className="h-full bg-primary-500" 
                  style={{ width: `${(posTier.counts.elite / posTier.counts.total) * 100}%` }}
                ></div>
                <div 
                  className="h-full bg-green-500" 
                  style={{ width: `${(posTier.counts.starter / posTier.counts.total) * 100}%` }}
                ></div>
                <div 
                  className="h-full bg-yellow-500" 
                  style={{ width: `${(posTier.counts.backup / posTier.counts.total) * 100}%` }}
                ></div>
                <div 
                  className="h-full bg-gray-400" 
                  style={{ width: `${(posTier.counts.depth / posTier.counts.total) * 100}%` }}
                ></div>
              </div>
            </button>
            
            {/* Expanded tier details */}
            {expandedPosition === posTier.position && (
              <div className="px-4 pb-4 bg-gray-50">
                {/* Elite tier */}
                {posTier.tiers.elite.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <span className="w-3 h-3 rounded-full bg-primary-500 mr-2"></span>
                      Elite Tier ({posTier.counts.elite})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {posTier.tiers.elite.slice(0, 6).map((player) => (
                        <div key={player.player_id} className="flex items-center bg-white rounded-lg p-2 border border-primary-100">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-50 text-primary-700">
                            <span className="text-xs font-medium">{player.rank || '-'}</span>
                          </div>
                          <div className="ml-2 overflow-hidden">
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {player.first_name} {player.last_name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {player.team}
                            </p>
                          </div>
                        </div>
                      ))}
                      
                      {posTier.tiers.elite.length > 6 && (
                        <div className="flex items-center justify-center bg-white rounded-lg p-2 border border-primary-100">
                          <span className="text-sm text-gray-500">+{posTier.tiers.elite.length - 6} more</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Starter tier */}
                {posTier.tiers.starter.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                      Starter Tier ({posTier.counts.starter})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {posTier.tiers.starter.slice(0, 3).map((player) => (
                        <div key={player.player_id} className="flex items-center bg-white rounded-lg p-2 border border-green-100">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-50 text-green-700">
                            <span className="text-xs font-medium">{player.rank || '-'}</span>
                          </div>
                          <div className="ml-2 overflow-hidden">
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {player.first_name} {player.last_name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {player.team}
                            </p>
                          </div>
                        </div>
                      ))}
                      
                      {posTier.tiers.starter.length > 3 && (
                        <div className="flex items-center justify-center bg-white rounded-lg p-2 border border-green-100">
                          <span className="text-sm text-gray-500">+{posTier.tiers.starter.length - 3} more</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Show counts for backup and depth tiers */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white rounded-lg p-3 border border-yellow-100">
                    <h4 className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <span className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
                      Backup Tier
                    </h4>
                    <p className="text-lg font-semibold text-gray-800">{posTier.counts.backup}</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <span className="w-3 h-3 rounded-full bg-gray-400 mr-2"></span>
                      Depth Tier
                    </h4>
                    <p className="text-lg font-semibold text-gray-800">{posTier.counts.depth}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {positionTiers.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            No player data available
          </div>
        )}
      </div>
      
      <div className="p-3 bg-gray-50 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          Tiers based on player rankings: Elite (1-50), Starter (51-100), Backup (101-150), Depth (151+)
        </div>
      </div>
    </div>
  );
};