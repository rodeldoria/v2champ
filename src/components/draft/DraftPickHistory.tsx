import React, { useState } from 'react';
import { useDraftStore } from '../../store/draftStore';
import { useSleeperStore } from '../../store/sleeperStore';
import { Clock, User } from 'lucide-react';

export const DraftPickHistory: React.FC = () => {
  const { picks } = useDraftStore();
  const { users } = useSleeperStore();
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [loadedTeamLogos, setLoadedTeamLogos] = useState<Record<string, boolean>>({});
  
  // Get the most recent picks (last 10)
  const recentPicks = [...picks].reverse().slice(0, 10);
  
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
  
  if (recentPicks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="font-semibold text-gray-800 mb-4">Recent Picks</h3>
        <p className="text-center text-gray-500 py-4">
          No picks made yet
        </p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-800">Recent Picks</h3>
      </div>
      
      <div className="divide-y divide-gray-100">
        {recentPicks.map((pick) => (
          <div key={pick.pick_no} className="p-3 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
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
                <div className="ml-3">
                  <p className="font-medium text-gray-800">
                    {pick.metadata.first_name} {pick.metadata.last_name}
                  </p>
                  <div className="flex items-center text-xs text-gray-500">
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
                    <span className="mx-1">•</span>
                    <span>Round {pick.round}, Pick {pick.pick_no}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center text-xs text-gray-500">
                  <User size={12} className="mr-1" />
                  <span>{getUserDisplayName(pick.picked_by)}</span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  <Clock size={12} className="inline mr-1" />
                  <span>{new Date(Date.now() - (pick.pick_no * 60000)).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};