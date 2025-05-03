import React, { useState, useEffect } from 'react';
import { useDraftStore } from '../../store/draftStore';
import { DraftPlayer } from '../../types/draft';
import { PlayerCard } from './PlayerCard';
import { Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';

interface DraftPlayerPoolProps {
  onDraftPlayer?: (player_id: string) => void;
}

export const DraftPlayerPool: React.FC<DraftPlayerPoolProps> = ({ onDraftPlayer }) => {
  const { availablePlayers, picks } = useDraftStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'rank' | 'name' | 'adp'>('rank');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filteredPlayers, setFilteredPlayers] = useState<DraftPlayer[]>([]);
  
  // Get drafted player IDs
  const draftedPlayerIds = picks.map(pick => pick.player_id);
  
  // Filter and sort players
  useEffect(() => {
    let filtered = [...availablePlayers];
    
    // Apply position filter
    if (positionFilter !== 'ALL') {
      filtered = filtered.filter(player => 
        positionFilter === 'FLEX' 
          ? ['RB', 'WR', 'TE'].includes(player.position) 
          : player.position === positionFilter
      );
    }
    
    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(player => 
        `${player.first_name} ${player.last_name}`.toLowerCase().includes(search) ||
        player.team?.toLowerCase().includes(search)
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'rank':
          comparison = (a.rank || 999) - (b.rank || 999);
          break;
        case 'name':
          comparison = `${a.last_name} ${a.first_name}`.localeCompare(`${b.last_name} ${b.first_name}`);
          break;
        case 'adp':
          comparison = (a.adp || 999) - (b.adp || 999);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    setFilteredPlayers(filtered);
  }, [availablePlayers, positionFilter, searchTerm, sortBy, sortOrder, picks]);
  
  const handleDraft = (player_id: string) => {
    if (onDraftPlayer) {
      onDraftPlayer(player_id);
    }
  };
  
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-800">Available Players</h3>
        <p className="text-sm text-gray-500 mt-1">
          {filteredPlayers.length} players available
        </p>
      </div>
      
      {/* Search and filters */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search players..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm"
            />
          </div>
          
          {/* Position filter */}
          <div className="flex-shrink-0">
            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm"
            >
              <option value="ALL">All Positions</option>
              <option value="QB">QB</option>
              <option value="RB">RB</option>
              <option value="WR">WR</option>
              <option value="TE">TE</option>
              <option value="K">K</option>
              <option value="DEF">DEF</option>
            </select>
          </div>
          
          {/* Sort options */}
          <div className="flex-shrink-0">
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as 'rank' | 'name' | 'adp');
                }}
                className="pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm"
              >
                <option value="rank">Rank</option>
                <option value="adp">ADP</option>
                <option value="name">Name</option>
              </select>
              
              <button
                onClick={toggleSortOrder}
                className="p-2 border border-gray-300 rounded-lg"
              >
                {sortOrder === 'asc' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Player list */}
      <div className="p-4 max-h-[600px] overflow-y-auto">
        <div className="space-y-2">
          {filteredPlayers.map(player => (
            <PlayerCard 
              key={player.player_id} 
              player={player} 
              onDraft={handleDraft}
              showDetails={false}
              isDrafted={draftedPlayerIds.includes(player.player_id)}
            />
          ))}
          
          {filteredPlayers.length === 0 && (
            <p className="text-center text-gray-500 py-4">
              No players match your filters
            </p>
          )}
        </div>
      </div>
    </div>
  );
};