import React, { useState, useEffect } from 'react';
import { useSleeperStore } from '../../store/sleeperStore';
import { Trophy, TrendingUp, TrendingDown } from 'lucide-react';

export const TeamSummary: React.FC = () => {
  const { currentUser, selectedLeague, teams, users } = useSleeperStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [teamWeight, setTeamWeight] = useState(0);
  
  // Get owner information
  const owner = users[currentUser?.user_id || ''] || { display_name: 'Unknown Owner', username: 'unknown' };
  const ownerName = owner.display_name || owner.username || 'Unknown Owner';
  
  // Get owner's teams
  const userTeams = teams.filter(team => team.owner_id === currentUser?.user_id);
  
  // Calculate team weight
  useEffect(() => {
    if (userTeams.length > 0) {
      // In a real implementation, this would calculate based on player weights
      // For now, we'll use a simple formula based on points_for
      const weight = userTeams.reduce((sum, team) => {
        return sum + (team.points_for || 0);
      }, 0);
      
      setTeamWeight(weight);
    }
  }, [userTeams]);
  
  if (userTeams.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="text-center py-8">
          <p className="text-primary-500 font-semibold mb-2">No Teams Found</p>
          <p className="text-gray-500 text-sm">
            You don't have any teams in this league or you're not logged in
          </p>
        </div>
      </div>
    );
  }
  
  // Assuming the first team is the primary one to display
  const userTeam = userTeams[0];
  
  // Calculate league position
  const sortedTeams = [...teams].sort((a, b) => {
    if (a.wins !== b.wins) return b.wins - a.wins;
    return (b.points_for ?? 0) - (a.points_for ?? 0);
  });
  
  const position = sortedTeams.findIndex(team => team.roster_id === userTeam.roster_id) + 1;
  const totalTeams = teams.length;
  const positionPercentile = Math.round((position / totalTeams) * 100);
  
  // Calculate if in playoff position
  const inPlayoffPosition = position <= (totalTeams / 3);
  const onBubble = position > (totalTeams / 3) && position <= (totalTeams / 2);
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Your Team</h3>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        {/* Team Header */}
        <div className="flex-1">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xl">
              {(userTeam.settings?.team_name || 'Team').substring(0, 1)}
            </div>
            <div className="ml-3">
              <h2 className="font-bold text-lg text-gray-800">
                {userTeam.settings?.team_name || `Team ${userTeam.roster_id}`}
              </h2>
              <p className="text-sm text-gray-500">
                {ownerName}
              </p>
            </div>
          </div>
          
          {/* Team Stats */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Record</p>
              <p className="font-semibold text-gray-800">
                {userTeam.wins ?? 0}-{userTeam.losses ?? 0}{userTeam.ties > 0 ? `-${userTeam.ties}` : ''}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Points For</p>
              <p className="font-semibold text-gray-800">
                {userTeam.points_for?.toFixed(1) ?? '0.0'}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Points Against</p>
              <p className="font-semibold text-gray-800">
                {userTeam.points_against?.toFixed(1) ?? '0.0'}
              </p>
            </div>
          </div>
        </div>
        
        {/* League Position */}
        <div className="flex-1 flex flex-col justify-center">
          <p className="text-sm text-gray-500 mb-1">League Position</p>
          
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-semibold text-lg
              ${position <= 3 ? 'bg-yellow-100 text-yellow-700' : 
                position <= 6 ? 'bg-green-100 text-green-700' : 
                'bg-red-100 text-red-700'}`}
            >
              {position}
            </div>
            <p className="ml-2 font-medium text-gray-700">of {totalTeams} teams</p>
          </div>
          
          <div className="mt-3 flex items-center">
            {inPlayoffPosition ? (
              <>
                <Trophy size={16} className="text-primary-500 mr-2" />
                <span className="text-sm font-medium text-primary-500">
                  Playoff Position
                </span>
              </>
            ) : onBubble ? (
              <>
                <TrendingUp size={16} className="text-success-500 mr-2" />
                <span className="text-sm font-medium text-success-500">
                  Playoff Bubble
                </span>
              </>
            ) : (
              <>
                <TrendingDown size={16} className="text-error-500 mr-2" />
                <span className="text-sm font-medium text-error-500">
                  Outside Playoffs
                </span>
              </>
            )}
          </div>
          
          {/* Progress bar */}
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                position <= 3 ? 'bg-primary-500' : 
                position <= 6 ? 'bg-success-500' : 
                'bg-error-500'
              }`}
              style={{ width: `${100 - positionPercentile}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* Team Weight */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm text-gray-500">Team Weight</p>
          <p className="font-semibold text-gray-800">{teamWeight.toFixed(1)}</p>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${
              teamWeight > 200 ? 'bg-green-500' :
              teamWeight > 100 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${Math.min(teamWeight / 3, 100)}%` }}
          ></div>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Team weight affects gameplay and real-time moments. Higher weight provides more stability against injuries and matchup fluctuations.
        </p>
      </div>
    </div>
  );
};