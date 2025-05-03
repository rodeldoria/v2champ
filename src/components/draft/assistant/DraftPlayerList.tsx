import React, { useState, useEffect } from 'react';
import { useDraftStore } from '../../../store/draftStore';
import { DraftPlayer } from '../../../types/draft';
import { PlayerCard } from '../PlayerCard';
import { Search, Filter, ChevronDown, ChevronUp, ArrowUpDown } from 'lucide-react';

interface DraftPlayerListProps {
  onDraftPlayer?: (player_id: string) => void;
  hideDrafted?: boolean;
}

export const DraftPlayerList: React.FC<DraftPlayerListProps> = ({ 
  onDraftPlayer,
  hideDrafted = false
}) => {
  const { availablePlayers, picks } = useDraftStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'rank' | 'name' | 'adp' | 'value'>('rank');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  
  // Get drafted player IDs
  const draftedPlayerIds = picks.map(pick => pick.player_id);
  
  // Filter and sort players
  const filteredPlayers = availablePlayers
    .filter(player => {
      // Filter by position
      const matchesPosition = positionFilter === 'ALL' || 
        player.position === positionFilter ||
        (positionFilter === 'FLEX' && ['RB', 'WR', 'TE'].includes(player.position));
      
      // Filter by search term
      const matchesSearch = searchTerm === '' || 
        `${player.first_name} ${player.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.team?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.position?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter out drafted players if hideDrafted is true
      const isAvailable = !hideDrafted || !draftedPlayerIds.includes(player.player_id);
      
      return matchesPosition && matchesSearch && isAvailable;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
          break;
        case 'rank':
          comparison = (a.rank || 999) - (b.rank || 999);
          break;
        case 'adp':
          comparison = (a.adp || 999) - (b.adp || 999);
          break;
        case 'value':
          const aValue = (a.adp || 0) - (a.rank || 0);
          const bValue = (b.adp || 0) - (b.rank || 0);
          comparison = bValue - aValue; // Higher value is better
          break;
        default:
          comparison = (a.rank || 999) - (b.rank || 999);
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  
  const handleDraft = (player_id: string) => {
    if (onDraftPlayer) {
      onDraftPlayer(player_id);
    }
  };
  
  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h3 className="font-semibold text-gray-800">Available Players</h3>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search players..."
                className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              <Filter size={16} className="text-gray-500" />
            </button>
          </div>
        </div>
        
        {/* Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex flex-wrap gap-2">
              <div className="font-medium text-sm text-gray-700 mr-2">Position:</div>
              {['ALL', 'QB', 'RB', 'WR', 'TE', 'FLEX', 'K', 'DEF'].map(pos => (
                <button
                  key={pos}
                  onClick={() => setPositionFilter(pos)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    positionFilter === pos
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
            
            <div className="mt-4">
              <div className="font-medium text-sm text-gray-700 mb-2">Sort By:</div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    if (sortBy === 'rank') toggleSortOrder();
                    else {
                      setSortBy('rank');
                      setSortOrder('asc');
                    }
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center ${
                    sortBy === 'rank'
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Rank
                  {sortBy === 'rank' && (
                    sortOrder === 'asc' ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />
                  )}
                </button>
                
                <button
                  onClick={() => {
                    if (sortBy === 'name') toggleSortOrder();
                    else {
                      setSortBy('name');
                      setSortOrder('asc');
                    }
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center ${
                    sortBy === 'name'
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Name
                  {sortBy === 'name' && (
                    sortOrder === 'asc' ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />
                  )}
                </button>
                
                <button
                  onClick={() => {
                    if (sortBy === 'adp') toggleSortOrder();
                    else {
                      setSortBy('adp');
                      setSortOrder('asc');
                    }
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center ${
                    sortBy === 'adp'
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  ADP
                  {sortBy === 'adp' && (
                    sortOrder === 'asc' ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />
                  )}
                </button>
                
                <button
                  onClick={() => {
                    if (sortBy === 'value') toggleSortOrder();
                    else {
                      setSortBy('value');
                      setSortOrder('desc');
                    }
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center ${
                    sortBy === 'value'
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Value
                  {sortBy === 'value' && (
                    sortOrder === 'asc' ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 max-h-[600px] overflow-y-auto">
        <div className="space-y-3">
          {filteredPlayers.map(player => (
            <PlayerCard 
              key={player.player_id} 
              player={player} 
              onDraft={handleDraft}
              isDrafted={draftedPlayerIds.includes(player.player_id)}
            />
          ))}
          
          {filteredPlayers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No players match your filters
            </div>
          )}
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-sm text-gray-500">
          {filteredPlayers.length} players available
        </div>
      </div>
    </div>
  );
};