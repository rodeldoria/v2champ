import React from 'react';
import { Trophy, TrendingUp, TrendingDown } from 'lucide-react';
import { useSleeperStore } from '../../store/sleeperStore';
import { calculateStandings } from '../../services/sleeperService';

export const LeagueStandings: React.FC = () => {
  const { teams, users } = useSleeperStore();
  const standings = calculateStandings(teams);
  
  // Take only top 5 for display
  const topTeams = standings.slice(0, 5);
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">League Standings</h3>
        <span className="text-xs text-primary-500 font-medium">View All</span>
      </div>
      
      <div className="space-y-3">
        {topTeams.map((team, index) => {
          const rank = index + 1;
          
          // Get owner information
          const owner = users[team.owner_id || ''] || { display_name: 'Unknown Owner', username: 'unknown' };
          const ownerName = owner.display_name || owner.username || 'Unknown Owner';
          
          // Determine the styling for the ranking
          const rankStyles = {
            1: "bg-yellow-100 text-yellow-700",
            2: "bg-gray-100 text-gray-700",
            3: "bg-amber-100 text-amber-700",
          };
          
          const rankStyle = rankStyles[rank as keyof typeof rankStyles] || "bg-gray-50 text-gray-600";
          
          return (
            <div 
              key={team.roster_id} 
              className="flex items-center p-2 rounded-lg hover:bg-gray-50 transition-colors duration-150"
            >
              {/* Rank */}
              <div className={`w-8 h-8 rounded-lg ${rankStyle} flex items-center justify-center font-semibold text-sm`}>
                {rank}
              </div>
              
              {/* Team info */}
              <div className="ml-3 flex-1">
                <p className="font-medium text-gray-800">
                  {team.settings?.team_name || `Team ${team.roster_id}`}
                </p>
                <p className="text-xs text-gray-500">
                  {ownerName}
                </p>
              </div>
              
              {/* Record */}
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">{team.wins}-{team.losses}{team.ties > 0 ? `-${team.ties}` : ''}</p>
                <div className="flex items-center justify-end text-xs">
                  {rank <= 3 ? (
                    <Trophy size={12} className="text-primary-500 mr-1" />
                  ) : rank <= 6 ? (
                    <TrendingUp size={12} className="text-success-500 mr-1" />
                  ) : (
                    <TrendingDown size={12} className="text-error-500 mr-1" />
                  )}
                  <span 
                    className={
                      rank <= 3 
                        ? "text-primary-500" 
                        : rank <= 6 
                          ? "text-success-500" 
                          : "text-error-500"
                    }
                  >
                    {rank <= 3 ? "Playoff" : rank <= 6 ? "Bubble" : "Out"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};