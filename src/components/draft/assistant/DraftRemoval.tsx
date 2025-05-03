import React, { useState, useEffect } from 'react';
import { useDraftStore } from '../../../store/draftStore';
import { DraftPick } from '../../../types/draft';
import { Trash2, Eye, EyeOff } from 'lucide-react';

interface DraftRemovalProps {
  hideDrafted: boolean;
  onToggleHideDrafted: () => void;
}

export const DraftRemoval: React.FC<DraftRemovalProps> = ({ 
  hideDrafted,
  onToggleHideDrafted
}) => {
  const { picks } = useDraftStore();
  const [recentPicks, setRecentPicks] = useState<DraftPick[]>([]);
  
  // Update recent picks when picks change
  useEffect(() => {
    setRecentPicks(picks.slice(-5).reverse());
  }, [picks]);
  
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
  const getPlayerImageUrl = (playerId: string) => {
    return `https://sleepercdn.com/content/nfl/players/thumb/${playerId}.jpg`;
  };

  // Get team logo URL
  const getTeamLogoUrl = (team: string) => {
    return `https://sleepercdn.com/images/team_logos/nfl/${team?.toLowerCase()}.png`;
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-semibold text-gray-800">Draft Settings</h3>
        
        <button
          onClick={onToggleHideDrafted}
          className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
        >
          {hideDrafted ? (
            <>
              <Eye size={16} className="mr-2" />
              Show Drafted
            </>
          ) : (
            <>
              <EyeOff size={16} className="mr-2" />
              Hide Drafted
            </>
          )}
        </button>
      </div>
      
      <div className="p-4">
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">Draft Progress</h4>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total Drafted:</span>
              <span className="font-medium text-gray-800">{picks.length} players</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary-500 rounded-full"
                style={{ width: `${Math.min((picks.length / 180) * 100, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0</span>
              <span>60</span>
              <span>120</span>
              <span>180</span>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">Position Breakdown</h4>
            <div className="space-y-2">
              {['QB', 'RB', 'WR', 'TE', 'K', 'DEF'].map(position => {
                const count = picks.filter(p => p.metadata.position === position).length;
                const percentage = picks.length > 0 ? (count / picks.length) * 100 : 0;
                
                return (
                  <div key={position}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPositionColorClass(position)}`}>
                        {position}
                      </span>
                      <span className="text-gray-700">{count} drafted</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          position === 'QB' ? 'bg-red-500' :
                          position === 'RB' ? 'bg-blue-500' :
                          position === 'WR' ? 'bg-green-500' :
                          position === 'TE' ? 'bg-purple-500' :
                          position === 'K' ? 'bg-yellow-500' :
                          'bg-gray-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};