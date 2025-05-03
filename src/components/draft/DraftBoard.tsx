import React, { useState, useEffect } from 'react';
import { useDraftStore } from '../../store/draftStore';
import { DraftPick } from '../../types/draft';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSleeperStore } from '../../store/sleeperStore';

interface DraftBoardProps {
  draftId: string;
  onSelectPick?: (pick: DraftPick) => void;
}

export const DraftBoard: React.FC<DraftBoardProps> = ({ draftId, onSelectPick }) => {
  const { draft, picks, isLoading, loadDraft } = useDraftStore();
  const { users } = useSleeperStore();
  const [visibleRounds, setVisibleRounds] = useState<number[]>([1, 2, 3, 4, 5]);
  const [loadingPlayerImages, setLoadingPlayerImages] = useState<Record<string, boolean>>({});
  const [loadedTeamLogos, setLoadedTeamLogos] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    if (draftId) {
      loadDraft(draftId);
    }
  }, [draftId, loadDraft]);

  // Get user display name from user ID
  const getUserDisplayName = (userId: string) => {
    const user = users[userId];
    if (user) {
      return user.display_name || user.username || userId;
    }
    return userId;
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
    setLoadingPlayerImages(prev => ({
      ...prev,
      [player_id]: false
    }));
  };

  // Handle image error
  const handleImageError = (player_id: string) => {
    setLoadingPlayerImages(prev => ({
      ...prev,
      [player_id]: false
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
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-primary-500 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!draft) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No draft data available</p>
      </div>
    );
  }
  
  const { rounds, teams } = draft.settings;
  
  // Organize picks by round and draft slot
  const picksByPosition: Record<number, Record<number, DraftPick>> = {};
  
  picks.forEach(pick => {
    const round = pick.round;
    const draftSlot = pick.draft_slot;
    
    if (!picksByPosition[round]) {
      picksByPosition[round] = {};
    }
    
    picksByPosition[round][draftSlot] = pick;
  });
  
  // Navigate rounds
  const showPreviousRounds = () => {
    const firstRound = visibleRounds[0];
    if (firstRound > 1) {
      const newFirstRound = Math.max(1, firstRound - 5);
      setVisibleRounds(Array.from({ length: 5 }, (_, i) => newFirstRound + i));
    }
  };
  
  const showNextRounds = () => {
    const lastRound = visibleRounds[visibleRounds.length - 1];
    if (lastRound < rounds) {
      const newFirstRound = Math.min(rounds - 4, lastRound + 1);
      setVisibleRounds(Array.from({ length: 5 }, (_, i) => newFirstRound + i).filter(r => r <= rounds));
    }
  };
  
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
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">Draft Board</h3>
        
        <div className="flex items-center gap-2">
          <button
            onClick={showPreviousRounds}
            disabled={visibleRounds[0] <= 1}
            className={`p-1 rounded-lg ${
              visibleRounds[0] <= 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ChevronLeft size={20} />
          </button>
          
          <span className="text-sm text-gray-600">
            Rounds {visibleRounds[0]}-{visibleRounds[visibleRounds.length - 1]}
          </span>
          
          <button
            onClick={showNextRounds}
            disabled={visibleRounds[visibleRounds.length - 1] >= rounds}
            className={`p-1 rounded-lg ${
              visibleRounds[visibleRounds.length - 1] >= rounds ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50">
                Round
              </th>
              {Array.from({ length: teams }, (_, i) => i + 1).map(slot => (
                <th key={slot} scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {slot}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {visibleRounds.map(round => {
              // For snake drafts, reverse even rounds
              const isReverseRound = draft.type === 'snake' && round % 2 === 0;
              
              return (
                <tr key={round} className={round % 2 === 0 ? 'bg-gray-50' : ''}>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-inherit">
                    {round}
                  </td>
                  
                  {Array.from({ length: teams }, (_, i) => i + 1).map(slot => {
                    // Adjust slot for snake drafts
                    const effectiveSlot = isReverseRound ? teams - slot + 1 : slot;
                    const pick = picksByPosition[round]?.[effectiveSlot];
                    
                    return (
                      <td key={slot} className="px-1 py-1 text-center">
                        {pick ? (
                          <button
                            onClick={() => onSelectPick?.(pick)}
                            className="w-full block text-left p-2 rounded hover:bg-gray-50 transition-colors border border-gray-200"
                            title={`Drafted by: ${getUserDisplayName(pick.picked_by)}`}
                          >
                            <div className="flex items-center">
                              <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                                {!loadingPlayerImages[pick.player_id] && (
                                  <img
                                    src={getPlayerImageUrl(pick.player_id)}
                                    alt={`${pick.metadata.first_name} ${pick.metadata.last_name}`}
                                    className="w-full h-full object-cover"
                                    onLoad={() => handleImageLoad(pick.player_id)}
                                    onError={() => handleImageError(pick.player_id)}
                                  />
                                )}
                              </div>
                              <div className="ml-2 flex-1 min-w-0">
                                <div className="flex items-center">
                                  <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full ${
                                    getPositionColorClass(pick.metadata.position)
                                  }`}>
                                    {pick.metadata.position}
                                  </span>
                                  <span className="ml-1 text-xs font-medium text-gray-900 truncate max-w-[60px]">
                                    {pick.metadata.first_name.charAt(0)}. {pick.metadata.last_name}
                                  </span>
                                </div>
                                <div className="flex items-center mt-1">
                                  {pick.metadata.team && (
                                    <img
                                      src={getTeamLogoUrl(pick.metadata.team)}
                                      alt={pick.metadata.team}
                                      className={`w-4 h-4 mr-1 ${loadedTeamLogos[pick.metadata.team] ? 'opacity-100' : 'opacity-0'}`}
                                      onLoad={() => handleTeamLogoLoad(pick.metadata.team)}
                                      onError={() => handleTeamLogoError(pick.metadata.team)}
                                    />
                                  )}
                                  <span className="text-xs text-gray-500 truncate max-w-[60px]">
                                    {getUserDisplayName(pick.picked_by).split(' ')[0]}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </button>
                        ) : (
                          <div className="h-16 border border-dashed border-gray-200 rounded"></div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};