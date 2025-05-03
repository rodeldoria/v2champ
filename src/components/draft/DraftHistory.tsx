import React, { useState, useEffect } from 'react';
import { useSleeperStore } from '../../store/sleeperStore';
import { Shield, User, Clock, Calendar } from 'lucide-react';

interface Draft {
  draft_id: string;
  created: number;
  league_id: string;
  metadata: {
    description: string;
    name: string;
    scoring_type: string;
  };
  settings: {
    rounds: number;
    slots_qb: number;
    slots_rb: number;
    slots_wr: number;
    slots_te: number;
    slots_flex: number;
    slots_def: number;
    slots_k: number;
  };
  season: string;
  status: string;
  type: string;
}

interface DraftPick {
  round: number;
  roster_id: number;
  player_id: string;
  picked_by: string;
  pick_no: number;
  metadata: {
    years_exp: string;
    team: string;
    status: string;
    position: string;
    first_name: string;
    last_name: string;
  };
}

export const DraftHistory: React.FC = () => {
  const { selectedLeague, players, users } = useSleeperStore();
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);
  const [draftPicks, setDraftPicks] = useState<DraftPick[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [loadedTeamLogos, setLoadedTeamLogos] = useState<Record<string, boolean>>({});

  const loadDraftPicks = async (draftId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`https://api.sleeper.app/v1/draft/${draftId}/picks`);
      const data = await response.json();
      setDraftPicks(data);
    } catch (error) {
      console.error('Error loading draft picks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDrafts = async () => {
    if (!selectedLeague?.league_id) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`https://api.sleeper.app/v1/league/${selectedLeague.league_id}/drafts`);
      const drafts: Draft[] = await response.json();
      if (drafts.length > 0) {
        setSelectedDraft(drafts[0]);
        await loadDraftPicks(drafts[0].draft_id);
      }
    } catch (error) {
      console.error('Error loading drafts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDrafts();
  }, [selectedLeague?.league_id]);

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

  if (!selectedLeague) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">No League Selected</h2>
        <p className="text-gray-600">Please select a league to view draft history</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-primary-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!selectedDraft) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">No Draft History</h2>
        <p className="text-gray-600">No draft data available for this league</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Draft Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{selectedDraft.metadata.name || 'League Draft'}</h2>
            <p className="text-gray-500 mt-1">{selectedDraft.metadata.description || `Season ${selectedDraft.season}`}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="text-gray-400" size={20} />
              <span className="text-gray-600">
                {new Date(selectedDraft.created * 1000).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="text-gray-400" size={20} />
              <span className="text-gray-600">{selectedDraft.status}</span>
            </div>
          </div>
        </div>

        {/* Draft Settings */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Rounds</p>
            <p className="text-xl font-semibold text-gray-800">{selectedDraft.settings.rounds}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Scoring</p>
            <p className="text-xl font-semibold text-gray-800">{selectedDraft.metadata.scoring_type}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Type</p>
            <p className="text-xl font-semibold text-gray-800">{selectedDraft.type}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Status</p>
            <p className="text-xl font-semibold text-gray-800">{selectedDraft.status}</p>
          </div>
        </div>
      </div>

      {/* Draft Picks */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800">Draft Picks</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pick
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Player
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Team
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Drafted By
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {draftPicks.map((pick) => (
                <tr key={pick.pick_no} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">
                        {pick.round}.{(pick.pick_no % selectedDraft.settings.rounds) + 1}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 relative">
                        <img 
                          src={getPlayerImageUrl(pick.player_id)}
                          alt={`${pick.metadata.first_name} ${pick.metadata.last_name}`}
                          className={`h-10 w-10 rounded-full object-cover transition-opacity duration-300 ${loadedImages[pick.player_id] ? 'opacity-100' : 'opacity-0'}`}
                          onLoad={() => handleImageLoad(pick.player_id)}
                          onError={() => handleImageError(pick.player_id)}
                        />
                        {!loadedImages[pick.player_id] && (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-full">
                            <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {pick.metadata.first_name} {pick.metadata.last_name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      getPositionColorClass(pick.metadata.position)
                    }`}>
                      {pick.metadata.position}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {pick.metadata.team && (
                        <img 
                          src={getTeamLogoUrl(pick.metadata.team)}
                          alt={pick.metadata.team}
                          className={`h-6 w-6 mr-2 transition-opacity duration-300 ${loadedTeamLogos[pick.metadata.team] ? 'opacity-100' : 'opacity-0'}`}
                          onLoad={() => handleTeamLogoLoad(pick.metadata.team)}
                          onError={() => handleTeamLogoError(pick.metadata.team)}
                        />
                      )}
                      {!loadedTeamLogos[pick.metadata.team] && pick.metadata.team && (
                        <div className="w-6 h-6 mr-2 bg-gray-200 rounded-full"></div>
                      )}
                      <div className="text-sm text-gray-900">{pick.metadata.team}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User size={16} className="text-gray-400 mr-2" />
                      <div className="text-sm text-gray-900">{getUserDisplayName(pick.picked_by)}</div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};