import React, { useState, useEffect } from 'react';
import { useDraftStore } from '../../store/draftStore';
import { DraftPlayer } from '../../types/draft';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface PositionCount {
  position: string;
  count: number;
  topTier: number;
  midTier: number;
  lowTier: number;
}

export const DraftAvailablePlayerCount: React.FC = () => {
  const { availablePlayers } = useDraftStore();
  const [positionCounts, setPositionCounts] = useState<PositionCount[]>([]);
  const [sortBy, setSortBy] = useState<'position' | 'count' | 'topTier'>('topTier');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Calculate position counts whenever available players change
  useEffect(() => {
    if (!availablePlayers.length) return;
    
    const counts: Record<string, PositionCount> = {};
    
    // Initialize counts for all positions
    ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'].forEach(pos => {
      counts[pos] = {
        position: pos,
        count: 0,
        topTier: 0,
        midTier: 0,
        lowTier: 0
      };
    });
    
    // Count players by position and tier
    availablePlayers.forEach(player => {
      if (!player.position || !counts[player.position]) return;
      
      counts[player.position].count++;
      
      // Categorize by tier based on rank
      const rank = player.rank || 999;
      if (rank <= 50) {
        counts[player.position].topTier++;
      } else if (rank <= 100) {
        counts[player.position].midTier++;
      } else {
        counts[player.position].lowTier++;
      }
    });
    
    // Convert to array and sort
    const countsArray = Object.values(counts);
    const sortedCounts = sortPositionCounts(countsArray, sortBy, sortOrder);
    
    setPositionCounts(sortedCounts);
  }, [availablePlayers, sortBy, sortOrder]);
  
  // Sort position counts
  const sortPositionCounts = (
    counts: PositionCount[],
    sortCriteria: 'position' | 'count' | 'topTier',
    order: 'asc' | 'desc'
  ): PositionCount[] => {
    return [...counts].sort((a, b) => {
      let comparison = 0;
      
      switch (sortCriteria) {
        case 'position':
          comparison = a.position.localeCompare(b.position);
          break;
        case 'count':
          comparison = a.count - b.count;
          break;
        case 'topTier':
          comparison = a.topTier - b.topTier;
          break;
      }
      
      return order === 'asc' ? comparison : -comparison;
    });
  };
  
  // Toggle sort order
  const toggleSort = (criteria: 'position' | 'count' | 'topTier') => {
    if (sortBy === criteria) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(criteria);
      setSortOrder('desc');
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
  
  // Get tier color class
  const getTierColorClass = (count: number, isTopTier: boolean): string => {
    if (isTopTier) {
      if (count === 0) return 'text-red-500';
      if (count <= 2) return 'text-orange-500';
      if (count <= 5) return 'text-yellow-500';
      return 'text-green-500';
    } else {
      return 'text-gray-600';
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-800">Available Players by Position</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                scope="col" 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => toggleSort('position')}
              >
                <div className="flex items-center">
                  <span>Position</span>
                  {sortBy === 'position' && (
                    sortOrder === 'asc' ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => toggleSort('topTier')}
              >
                <div className="flex items-center">
                  <span>Top Tier</span>
                  {sortBy === 'topTier' && (
                    sortOrder === 'asc' ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => toggleSort('count')}
              >
                <div className="flex items-center">
                  <span>Total</span>
                  {sortBy === 'count' && (
                    sortOrder === 'asc' ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />
                  )}
                </div>
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Market Value
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {positionCounts.map((posCount) => (
              <tr key={posCount.position} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium ${
                    getPositionColorClass(posCount.position)
                  }`}>
                    {posCount.position}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`font-medium ${getTierColorClass(posCount.topTier, true)}`}>
                    {posCount.topTier}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {posCount.count}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-500 h-2 rounded-full" 
                        style={{ width: `${Math.min((posCount.topTier / Math.max(posCount.count, 1)) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {Math.round((posCount.topTier / Math.max(posCount.count, 1)) * 100)}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-red-500 mr-1"></span>
            <span>Critical</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-orange-500 mr-1"></span>
            <span>Limited</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></span>
            <span>Moderate</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-green-500 mr-1"></span>
            <span>Abundant</span>
          </div>
        </div>
      </div>
    </div>
  );
};