import React, { useState, useEffect } from 'react';
import { useSleeperStore } from '../../store/sleeperStore';
import { User, Trophy, Calendar, BarChart2, Users } from 'lucide-react';

interface OwnerCardProps {
  ownerId: string;
}

export const OwnerCard: React.FC<OwnerCardProps> = ({ ownerId }) => {
  const { users, teams, matchups } = useSleeperStore();
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Get owner information
  const owner = users[ownerId] || { display_name: 'Unknown Owner', username: 'unknown' };
  const ownerName = owner.display_name || owner.username || 'Unknown Owner';
  
  // Get owner's teams
  const ownerTeams = teams.filter(team => team.owner_id === ownerId);
  
  // Get owner's current matchups
  const ownerMatchups = matchups.filter(matchup => {
    const team = teams.find(t => t.roster_id === matchup.roster_id);
    return team?.owner_id === ownerId;
  });
  
  // Get avatar URL
  const getAvatarUrl = (avatarId: string | undefined) => {
    if (!avatarId) return null;
    return `https://sleepercdn.com/avatars/${avatarId}`;
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Owner Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
            {owner.avatar ? (
              <img 
                src={getAvatarUrl(owner.avatar)}
                alt={ownerName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${ownerName}&background=6366f1&color=fff`;
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-600">
                <User size={24} />
              </div>
            )}
          </div>
          <div className="ml-3">
            <h3 className="font-semibold text-gray-800">{ownerName}</h3>
            <p className="text-sm text-gray-500">{owner.username}</p>
          </div>
        </div>
      </div>
      
      {/* Owner Stats */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center text-sm text-gray-500 mb-1">
              <Trophy size={14} className="mr-1" />
              <span>Teams</span>
            </div>
            <p className="font-semibold text-gray-800">{ownerTeams.length}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center text-sm text-gray-500 mb-1">
              <BarChart2 size={14} className="mr-1" />
              <span>Win Rate</span>
            </div>
            <p className="font-semibold text-gray-800">
              {ownerTeams.length > 0 
                ? `${Math.round((ownerTeams.reduce((sum, team) => sum + (team.wins || 0), 0) / 
                   ownerTeams.reduce((sum, team) => sum + ((team.wins || 0) + (team.losses || 0) + (team.ties || 0)), 0)) * 100)}%`
                : 'N/A'}
            </p>
          </div>
        </div>
        
        {/* Teams List */}
        {ownerTeams.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Teams</h4>
            <div className="space-y-2">
              {ownerTeams.map(team => (
                <div key={team.roster_id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-gray-800">{team.settings?.team_name || `Team ${team.roster_id}`}</p>
                    <p className="text-sm text-gray-600">{team.wins}-{team.losses}{team.ties ? `-${team.ties}` : ''}</p>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-500">Points: {team.points_for?.toFixed(1) || '0.0'}</p>
                    <div className="flex items-center">
                      <Calendar size={12} className="text-gray-400 mr-1" />
                      <p className="text-xs text-gray-500">Week {ownerMatchups[0]?.week || '?'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Current Matchups */}
        {ownerMatchups.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Current Matchups</h4>
            <div className="space-y-2">
              {ownerMatchups.map(matchup => {
                const team = teams.find(t => t.roster_id === matchup.roster_id);
                const opponent = matchups.find(m => 
                  m.matchup_id === matchup.matchup_id && m.roster_id !== matchup.roster_id
                );
                const opponentTeam = teams.find(t => t.roster_id === opponent?.roster_id);
                const opponentOwner = users[opponentTeam?.owner_id || ''] || { display_name: 'Unknown Owner' };
                
                return (
                  <div key={matchup.roster_id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Users size={14} className="text-gray-400 mr-1" />
                        <p className="text-sm font-medium text-gray-800">
                          {team?.settings?.team_name || `Team ${matchup.roster_id}`} vs {opponentTeam?.settings?.team_name || `Team ${opponent?.roster_id}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-gray-500">{matchup.points.toFixed(2)} pts</p>
                      <p className="text-xs text-gray-500">{opponent?.points.toFixed(2) || '0.00'} pts</p>
                    </div>
                    <div className="mt-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${matchup.points > (opponent?.points || 0) ? 'bg-success-500' : 'bg-error-500'}`}
                        style={{ width: `${(matchup.points / (matchup.points + (opponent?.points || 0))) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mt-4 text-sm text-primary-500 hover:text-primary-600 font-medium"
        >
          {isExpanded ? 'Show Less' : 'Show More'}
        </button>
      </div>
    </div>
  );
};