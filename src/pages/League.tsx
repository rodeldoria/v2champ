import React from 'react';
import { useSleeperStore } from '../store/sleeperStore';
import { calculateStandings } from '../services/sleeperService';
import { Trophy, TrendingUp, BarChart } from 'lucide-react';

const League: React.FC = () => {
  const { teams, selectedLeague } = useSleeperStore();
  
  // Calculate standings
  const standings = calculateStandings(teams);
  
  if (!selectedLeague) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">No League Selected</h2>
        <p className="text-gray-600">
          Please select a league from the sidebar to view details
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">{selectedLeague.name}</h1>
      
      {/* League overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-5">
          <div className="flex items-center">
            <div className="rounded-full w-10 h-10 bg-primary-100 flex items-center justify-center">
              <Trophy size={20} className="text-primary-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-500">League Type</p>
              <p className="font-semibold text-gray-800">
                {selectedLeague.settings.league_type === 2 ? 'Dynasty' : 'Redraft'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-5">
          <div className="flex items-center">
            <div className="rounded-full w-10 h-10 bg-green-100 flex items-center justify-center">
              <TrendingUp size={20} className="text-green-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-500">Scoring</p>
              <p className="font-semibold text-gray-800">
                {selectedLeague.scoring_settings.rec ? (
                  selectedLeague.scoring_settings.rec === 0.5 ? 'Half PPR' : 'PPR'
                ) : 'Standard'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-5">
          <div className="flex items-center">
            <div className="rounded-full w-10 h-10 bg-amber-100 flex items-center justify-center">
              <BarChart size={20} className="text-amber-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-500">Teams</p>
              <p className="font-semibold text-gray-800">
                {selectedLeague.total_rosters} Teams
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* League Standings */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">League Standings</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Team
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Record
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PF
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PA
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Streak
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {standings.map((team, index) => {
                const rank = index + 1;
                
                const rankStyles = {
                  ranking: rank <= 6 ? (
                    rank <= 4 ? 'bg-primary-100 text-primary-700' : 'bg-green-100 text-green-700'
                  ) : 'bg-gray-100 text-gray-700',
                  text: rank <= 6 ? (
                    rank <= 4 ? 'text-primary-700' : 'text-green-700'
                  ) : 'text-gray-700'
                };
                
                return (
                  <tr key={team.roster_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${rankStyles.ranking}`}>
                        {rank}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {team.settings?.team_name || `Team ${team.roster_id}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">
                        {(team as any).owner_display_name || 'Unknown Owner'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {team.wins}-{team.losses}{team.ties > 0 ? `-${team.ties}` : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {team.points_for?.toFixed(1) || '0.0'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {team.points_against?.toFixed(1) || '0.0'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${Math.random() > 0.5 ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.random() > 0.5 ? 'W' : 'L'}{Math.floor(Math.random() * 5) + 1}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default League;