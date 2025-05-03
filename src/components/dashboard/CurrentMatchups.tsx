import React from 'react';
import { useSleeperStore } from '../../store/sleeperStore';
import { Trophy, TrendingUp, TrendingDown } from 'lucide-react';

export const CurrentMatchups: React.FC = () => {
  const { matchups, teams, currentWeek, users } = useSleeperStore();
  
  // Group matchups by matchup_id
  const matchupPairs: Record<number, any[]> = {};
  
  matchups.forEach(matchup => {
    const { matchup_id, roster_id, points } = matchup;
    
    if (!matchupPairs[matchup_id]) {
      matchupPairs[matchup_id] = [];
    }
    
    // Find the team for this roster
    const team = teams.find(t => t.roster_id === roster_id);
    
    // Find the owner of this team
    const owner = users[team?.owner_id || ''] || { display_name: 'Unknown Owner', username: 'unknown' };
    
    // Calculate win probability based on points and historical performance
    const winProbability = calculateWinProbability(points, team?.points_for || 0, team?.wins || 0, team?.losses || 0);
    
    matchupPairs[matchup_id].push({
      ...matchup,
      team,
      teamName: team?.settings?.team_name || `Team ${roster_id}`,
      ownerName: owner.display_name || owner.username || 'Unknown Owner',
      winProbability,
      projectedPoints: calculateProjectedPoints(points, team?.points_for || 0)
    });
  });
  
  // Helper function to calculate win probability
  function calculateWinProbability(currentPoints: number, avgPoints: number, wins: number, losses: number): number {
    const winRate = wins / (wins + losses) || 0.5;
    const pointsRatio = currentPoints / (avgPoints || 1);
    return Math.min(Math.max((winRate * 0.3 + pointsRatio * 0.7) * 100, 1), 99);
  }
  
  // Helper function to calculate projected points
  function calculateProjectedPoints(currentPoints: number, avgPoints: number): number {
    const projectionMultiplier = 1 + ((currentWeek || 1) / 18) * 0.2;
    return parseFloat((currentPoints * projectionMultiplier).toFixed(2));
  }
  
  // Convert to array for rendering
  const matchupArray = Object.values(matchupPairs);
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Week {currentWeek} Matchups</h3>
        <span className="text-xs text-primary-500 font-medium">View All</span>
      </div>
      
      <div className="space-y-4">
        {matchupArray.map((matchup, idx) => {
          if (matchup.length !== 2) return null;
          
          const [team1, team2] = matchup;
          const team1Winning = parseFloat(team1.points) > parseFloat(team2.points);
          const team2Winning = parseFloat(team2.points) > parseFloat(team1.points);
          const margin = Math.abs(team1.points - team2.points).toFixed(2);
          
          return (
            <div key={idx} className="p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <Trophy size={16} className="text-primary-500 mr-2" />
                  <p className="text-sm font-medium text-gray-500">Matchup {idx + 1}</p>
                </div>
                <div className="text-xs text-gray-500">
                  {team1Winning ? `${team1.teamName} leads by ${margin}` : 
                   team2Winning ? `${team2.teamName} leads by ${margin}` : 'Tied Game'}
                </div>
              </div>
              
              {/* Team 1 */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center flex-1">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-bold">
                    {team1.teamName.substring(0, 1)}
                  </div>
                  <div className="ml-2 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-800">{team1.teamName}</p>
                      <div className={`text-lg font-semibold ${team1Winning ? 'text-success-500' : ''}`}>
                        {parseFloat(team1.points).toFixed(2)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-500">{team1.ownerName}</p>
                      <p className="text-xs text-gray-500">
                        Proj: {team1.projectedPoints}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Win Probability Bar */}
              <div className="my-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary-500 transition-all duration-500"
                  style={{ width: `${team1.winProbability}%` }}
                ></div>
              </div>
              
              {/* Team 2 */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center flex-1">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-bold">
                    {team2.teamName.substring(0, 1)}
                  </div>
                  <div className="ml-2 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-800">{team2.teamName}</p>
                      <div className={`text-lg font-semibold ${team2Winning ? 'text-success-500' : ''}`}>
                        {parseFloat(team2.points).toFixed(2)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-500">{team2.ownerName}</p>
                      <p className="text-xs text-gray-500">
                        Proj: {team2.projectedPoints}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Win Probabilities */}
              <div className="mt-2 flex justify-between text-xs text-gray-500">
                <span>{team1.winProbability.toFixed(1)}% chance to win</span>
                <span>{team2.winProbability.toFixed(1)}% chance to win</span>
              </div>
            </div>
          );
        })}
        
        {matchupArray.length === 0 && (
          <p className="text-center text-gray-500 py-4">No matchups available for this week</p>
        )}
      </div>
    </div>
  );
};