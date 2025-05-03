import React, { useState, useEffect } from 'react';
import { useDraftStore } from '../../store/draftStore';
import { DraftPlayer } from '../../types/draft';
import { Search, Filter, ChevronLeft, ChevronRight, Star, TrendingUp, AlertTriangle } from 'lucide-react';

interface AvailablePlayersCardsProps {
  onSelectPlayer?: (player: DraftPlayer) => void;
  maxDisplay?: number;
  hideDrafted?: boolean;
}

export const AvailablePlayersCards: React.FC<AvailablePlayersCardsProps> = ({
  onSelectPlayer,
  maxDisplay = 6,
  hideDrafted = false
}) => {
  const { availablePlayers, picks } = useDraftStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [loadedTeamLogos, setLoadedTeamLogos] = useState<Record<string, boolean>>({});
  
  // Get drafted player IDs
  const draftedPlayerIds = picks.map(pick => pick.player_id);
  
  // Filter players based on search, position, and drafted status
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
    });
  
  // Calculate total pages
  const totalPages = Math.ceil(filteredPlayers.length / maxDisplay);
  
  // Get current page of players
  const currentPlayers = filteredPlayers.slice(
    currentPage * maxDisplay, 
    (currentPage + 1) * maxDisplay
  );
  
  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, positionFilter, hideDrafted]);
  
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
  const getPlayerImageUrl = (player_id: string) => {
    return `https://sleepercdn.com/content/nfl/players/thumb/${player_id}.jpg`;
  };

  // Get team logo URL
  const getTeamLogoUrl = (team: string) => {
    if (!team) return null;
    return `https://sleepercdn.com/images/team_logos/nfl/${team.toLowerCase()}.png`;
  };

  // Handle image load
  const handleImageLoad = (player_id: string) => {
    setLoadedImages(prev => ({
      ...prev,
      [player_id]: true
    }));
  };

  // Handle image error
  const handleImageError = (player_id: string) => {
    setLoadedImages(prev => ({
      ...prev,
      [player_id]: true
    }));
  };

  // Handle team logo load
  const handleTeamLogoLoad = (team: string) => {
    setLoadedTeamLogos(prev => ({
      ...prev,
      [team]: true
    }));
  };

  // Handle team logo error
  const handleTeamLogoError = (team: string) => {
    setLoadedTeamLogos(prev => ({
      ...prev,
      [team]: true
    }));
  };
  
  // Handle player selection
  const handleSelectPlayer = (player: DraftPlayer) => {
    if (onSelectPlayer) {
      onSelectPlayer(player);
    }
  };
  
  // Navigation functions
  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  // Calculate draft value
  const calculateDraftValue = (adp: number | undefined, rank: number | undefined): { value: number; className: string } => {
    if (!adp || !rank) return { value: 0, className: 'text-gray-500' };
    
    const value = adp - rank;
    
    if (value > 20) return { value, className: 'text-green-600 font-semibold' }; // Great value
    if (value > 10) return { value, className: 'text-green-500' }; // Good value
    if (value < -20) return { value, className: 'text-red-600 font-semibold' }; // Bad value
    if (value < -10) return { value, className: 'text-red-500' }; // Poor value
    
    return { value, className: 'text-gray-600' }; // Neutral value
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
            
            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm"
            >
              <option value="ALL">All Positions</option>
              <option value="QB">QB</option>
              <option value="RB">RB</option>
              <option value="WR">WR</option>
              <option value="TE">TE</option>
              <option value="FLEX">FLEX</option>
              <option value="K">K</option>
              <option value="DEF">DEF</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {currentPlayers.map((player) => {
          const isDrafted = draftedPlayerIds.includes(player.player_id);
          const draftValue = calculateDraftValue(player.adp, player.rank);
          
          return (
            <div 
              key={player.player_id} 
              className={`bg-white rounded-lg p-3 border border-gray-100 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer ${
                isDrafted ? 'opacity-50' : ''
              }`}
              onClick={() => !isDrafted && handleSelectPlayer(player)}
            >
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                  <img
                    src={getPlayerImageUrl(player.player_id)}
                    alt={`${player.first_name} ${player.last_name}`}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${loadedImages[player.player_id] ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => handleImageLoad(player.player_id)}
                    onError={() => handleImageError(player.player_id)}
                  />
                  {!loadedImages[player.player_id] && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                      <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-800 truncate">
                      {player.first_name} {player.last_name}
                    </p>
                    <span className={`ml-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                      getPositionColorClass(player.position)
                    }`}>
                      {player.position}
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <div className="flex items-center">
                      {player.team && (
                        <img 
                          src={getTeamLogoUrl(player.team)} 
                          alt={player.team} 
                          className={`w-4 h-4 mr-1 transition-opacity duration-300 ${loadedTeamLogos[player.team] ? 'opacity-100' : 'opacity-0'}`}
                          onLoad={() => handleTeamLogoLoad(player.team)}
                          onError={() => handleTeamLogoError(player.team)}
                        />
                      )}
                      {!loadedTeamLogos[player.team] && player.team && (
                        <div className="w-4 h-4 mr-1 bg-gray-200 rounded-full"></div>
                      )}
                      <span>{player.team}</span>
                    </div>
                    {isDrafted && <span className="ml-2 text-red-500">Drafted</span>}
                  </div>
                </div>
              </div>
              
              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Rank</p>
                    <p className="text-sm font-medium text-gray-800">{player.rank || 'N/A'}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">ADP</p>
                    <p className="text-sm font-medium text-gray-800">{player.adp?.toFixed(1) || 'N/A'}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Value</p>
                    <p className={`text-sm font-medium ${draftValue.className}`}>
                      {draftValue.value > 0 ? '+' : ''}{draftValue.value.toFixed(1)}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Player metrics */}
              <div className="mt-2 space-y-1.5">
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
              </div>
              
              {!isDrafted && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectPlayer(player);
                  }}
                  className="w-full mt-2 px-3 py-1.5 bg-primary-500 text-white rounded-lg text-xs font-medium hover:bg-primary-600 transition-colors"
                >
                  Draft Player
                </button>
              )}
            </div>
          );
        })}
        
        {currentPlayers.length === 0 && (
          <div className="col-span-full text-center py-8 text-gray-500">
            No players found matching your criteria
          </div>
        )}
      </div>
      
      {totalPages > 1 && (
        <div className="p-3 border-t border-gray-200 bg-gray-50 flex justify-center">
          <div className="flex items-center space-x-2">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 0}
              className={`p-1 rounded-lg ${
                currentPage === 0 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <ChevronLeft size={18} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
              // Show pages around current page
              let pageToShow = currentPage - 2 + idx;
              if (currentPage < 2) {
                pageToShow = idx;
              } else if (currentPage > totalPages - 3) {
                pageToShow = totalPages - 5 + idx;
              }
              
              // Ensure page is in valid range
              if (pageToShow >= 0 && pageToShow < totalPages) {
                return (
                  <button
                    key={pageToShow}
                    onClick={() => setCurrentPage(pageToShow)}
                    className={`w-6 h-6 flex items-center justify-center rounded-md text-xs ${
                      currentPage === pageToShow
                        ? 'bg-primary-100 text-primary-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {pageToShow + 1}
                  </button>
                );
              }
              return null;
            })}
            <button
              onClick={goToNextPage}
              disabled={currentPage >= totalPages - 1}
              className={`p-1 rounded-lg ${
                currentPage >= totalPages - 1 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};