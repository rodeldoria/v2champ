import React, { useState, useEffect } from 'react';
import { useDraftStore } from '../../store/draftStore';
import { useSleeperStore } from '../../store/sleeperStore';
import { DraftPick } from '../../types/draft';
import { Clock, User, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface RecentPicksCardsProps {
  onSelectPlayer?: (playerId: string) => void;
  maxDisplay?: number;
}

export const RecentPicksCards: React.FC<RecentPicksCardsProps> = ({ 
  onSelectPlayer,
  maxDisplay = 6
}) => {
  const { picks } = useDraftStore();
  const { users, players } = useSleeperStore();
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [loadedTeamLogos, setLoadedTeamLogos] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState(0);
  
  // Get the most recent picks
  const recentPicks = [...picks].reverse();
  
  // Calculate total pages
  const totalPages = Math.ceil(recentPicks.length / maxDisplay);
  
  // Get current page of picks
  const currentPicks = recentPicks.slice(
    currentPage * maxDisplay, 
    (currentPage + 1) * maxDisplay
  );
  
  // Get user display name from user ID
  const getUserDisplayName = (userId: string) => {
    const user = users[userId];
    if (user) {
      return user.display_name || user.username || userId;
    }
    return userId;
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
  const handleSelectPlayer = (pick: DraftPick) => {
    if (onSelectPlayer) {
      onSelectPlayer(pick.player_id);
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
  
  if (recentPicks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="font-semibold text-gray-800 mb-4">Available Players</h3>
        <p className="text-center text-gray-500 py-4">
          No picks made yet. Players will appear here as they are drafted.
        </p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">Recent Picks</h3>
        
        {totalPages > 1 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 0}
              className={`p-1 rounded-full ${
                currentPage === 0 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-xs text-gray-500">
              {currentPage + 1} / {totalPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={currentPage >= totalPages - 1}
              className={`p-1 rounded-full ${
                currentPage >= totalPages - 1 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
      
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {currentPicks.map((pick) => {
          const playerData = players[pick.player_id];
          
          return (
            <div 
              key={pick.pick_no} 
              className="bg-gray-50 rounded-lg p-3 border border-gray-100 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer"
              onClick={() => handleSelectPlayer(pick)}
            >
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                  <img
                    src={getPlayerImageUrl(pick.player_id)}
                    alt={`${pick.metadata.first_name} ${pick.metadata.last_name}`}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${loadedImages[pick.player_id] ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => handleImageLoad(pick.player_id)}
                    onError={() => handleImageError(pick.player_id)}
                  />
                  {!loadedImages[pick.player_id] && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                      <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  <div className={`absolute bottom-0 right-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    getPositionColorClass(pick.metadata.position)
                  }`}>
                    {pick.metadata.position.charAt(0)}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">
                    {pick.metadata.first_name} {pick.metadata.last_name}
                  </p>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <div className="flex items-center">
                      {pick.metadata.team && (
                        <img 
                          src={getTeamLogoUrl(pick.metadata.team)} 
                          alt={pick.metadata.team} 
                          className={`w-4 h-4 mr-1 transition-opacity duration-300 ${loadedTeamLogos[pick.metadata.team] ? 'opacity-100' : 'opacity-0'}`}
                          onLoad={() => handleTeamLogoLoad(pick.metadata.team)}
                          onError={() => handleTeamLogoError(pick.metadata.team)}
                        />
                      )}
                      {!loadedTeamLogos[pick.metadata.team] && pick.metadata.team && (
                        <div className="w-4 h-4 mr-1 bg-gray-200 rounded-full"></div>
                      )}
                      <span>{pick.metadata.team}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between items-center">
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar size={12} className="mr-1" />
                  <span>Round {pick.round}, Pick {pick.pick_no}</span>
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <User size={12} className="mr-1" />
                  <span>{getUserDisplayName(pick.picked_by)}</span>
                </div>
              </div>
              
              {playerData && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Rank</p>
                      <p className="text-sm font-medium text-gray-800">{playerData.rank || 'N/A'}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">ADP</p>
                      <p className="text-sm font-medium text-gray-800">{playerData.adp?.toFixed(1) || 'N/A'}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Tier</p>
                      <p className="text-sm font-medium text-gray-800">{playerData.tier || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
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