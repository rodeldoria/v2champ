import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ChevronDown } from 'lucide-react';
import { useSleeperStore } from '../store/sleeperStore';
import { EnhancedPlayerCard } from '../components/players/EnhancedPlayerCard';
import { PositionFilters } from '../components/players/PositionFilters';
import { validatePlayer } from '../services/playerRealityValidator';

const PLAYERS_PER_PAGE = 24;

const PlayersV2: React.FC = () => {
  const { 
    players, 
    isLoadingPlayers,
    teamError,
    fetchAllNflPlayers 
  } = useSleeperStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [position, setPosition] = useState('ALL');
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [page, setPage] = useState(1);
  const [showProjections, setShowProjections] = useState(false);
  const [sortBy, setSortBy] = useState<'rank' | 'name' | 'team'>('rank');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Define defensive positions to filter out
  const defensivePositions = ['DL', 'LB', 'DB', 'IDP', 'IDP_FLEX'];

  useEffect(() => {
    if (Object.keys(players).length === 0) {
      fetchAllNflPlayers();
    }
  }, [fetchAllNflPlayers, players]);

  // Filter and sort players
  const filteredPlayers = Object.values(players)
    .filter(player => {
      // Validate player is active and has a team
      const validation = validatePlayer(player, {});
      if (!validation.isActive) return false;

      // Filter out defensive players except for team defense (DEF)
      if (defensivePositions.includes(player.position || '')) {
        return false;
      }

      const matchesSearch = searchTerm === '' || 
        `${player.first_name} ${player.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.team?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.position?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPosition = position === 'ALL' || 
        position === player.position ||
        (position === 'FLEX' && ['RB', 'WR', 'TE'].includes(player.position || ''));

      return matchesSearch && matchesPosition;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'rank') {
        const rankA = a.rank ?? 999;
        const rankB = b.rank ?? 999;
        comparison = rankA - rankB;
      } else if (sortBy === 'name') {
        comparison = `${a.last_name} ${a.first_name}`.localeCompare(`${b.last_name} ${b.first_name}`);
      } else if (sortBy === 'team') {
        comparison = (a.team || 'ZZZ').localeCompare(b.team || 'ZZZ');
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Paginate players
  const paginatedPlayers = filteredPlayers.slice(
    (page - 1) * PLAYERS_PER_PAGE,
    page * PLAYERS_PER_PAGE
  );

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleSortChange = (newSortBy: 'rank' | 'name' | 'team') => {
    if (sortBy === newSortBy) {
      toggleSortOrder();
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
    setShowSortDropdown(false);
  };

  if (isLoadingPlayers) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-primary-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (teamError) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
        <p className="font-medium">Error loading players</p>
        <p className="text-sm mt-1">{teamError}</p>
      </div>
    );
  }

  const totalPages = Math.ceil(filteredPlayers.length / PLAYERS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Players</h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {filteredPlayers.length} Players Found
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <PositionFilters
          selectedPosition={position}
          onPositionChange={setPosition}
          players={players}
        />

        <div className="flex items-center gap-2 ml-auto">
          <div className="relative">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <span>Sort by: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}</span>
              <ChevronDown size={16} className={sortOrder === 'desc' ? 'transform rotate-180' : ''} />
            </button>
            {showSortDropdown && (
              <div className="absolute z-10 mt-1 w-48 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  <button
                    onClick={() => handleSortChange('rank')}
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                  >
                    Rank
                  </button>
                  <button
                    onClick={() => handleSortChange('name')}
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                  >
                    Name
                  </button>
                  <button
                    onClick={() => handleSortChange('team')}
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                  >
                    Team
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowProjections(!showProjections)}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                showProjections 
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' 
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {showProjections ? 'Hide Projections' : 'Show Projections'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1); // Reset to first page on search
            }}
            placeholder="Search players by name, team, or position..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {paginatedPlayers.map((player) => (
          <Link key={player.player_id} to={`/players/${player.player_id}`}>
            <EnhancedPlayerCard
              player={player}
              showProjections={showProjections}
            />
          </Link>
        ))}
        
        {paginatedPlayers.length === 0 && (
          <div className="col-span-full bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">No players found matching your criteria.</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Try adjusting your filters or search term.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`px-4 py-2 rounded-lg ${
              page === 1 
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed' 
                : 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-800/30'
            }`}
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-600 dark:text-gray-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className={`px-4 py-2 rounded-lg ${
              page === totalPages
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                : 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-800/30'
            }`}
          >
            Next
          </button>
        </div>
      )}

      {isLoadingStats && (
        <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-gray-200 dark:border-gray-700 border-t-primary-500 rounded-full animate-spin"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Loading player stats...</span>
        </div>
      )}
    </div>
  );
};

export default PlayersV2;