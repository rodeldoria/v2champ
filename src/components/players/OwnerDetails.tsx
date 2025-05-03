import React, { useState, useEffect } from 'react';
import { useSleeperStore } from '../../store/sleeperStore';
import { User, Trophy, Calendar, BarChart2, Users, TrendingUp, TrendingDown, Star } from 'lucide-react';

interface OwnerDetailsProps {
  ownerId: string;
}

export const OwnerDetails: React.FC<OwnerDetailsProps> = ({ ownerId }) => {
  const { users, teams, matchups, players } = useSleeperStore();
  const [weeklyProjections, setWeeklyProjections] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  
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

  // Fetch projections for the owner's team
  useEffect(() => {
    const fetchProjections = async () => {
      if (ownerTeams.length === 0 || !ownerMatchups.length) return;
      
      setIsLoading(true);
      
      try {
        // Get the first team's matchup
        const matchup = ownerMatchups[0];
        
        // Get the team's players
        const team = ownerTeams.find(t => t.roster_id === matchup.roster_id);
        if (!team || !matchup.players) {
          setIsLoading(false);
          return;
        }
        
        // Get projections for each player
        const projections: Record<string, number> = {};
        
        // Only fetch for the first 5 players to avoid rate limiting
        const topPlayers = matchup.players.slice(0, 5);
        
        for (const playerId of topPlayers) {
          try {
            const response = await fetch(
              `https://api.sleeper.app/v1/projections/nfl/regular/2024/1?player_id=${playerId}`
            );
            
            if (response.ok) {
              const data = await response.json();
              const playerProjection = data[playerId];
              
              if (playerProjection && playerProjection.pts_ppr) {
                projections[playerId] = playerProjection.pts_ppr;
              }
            }
            
            // Add a small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error) {
            console.error(`Error fetching projections for player ${playerId}:`, error);
          }
        }
        
        setWeeklyProjections(projections);
      } catch (error) {
        console.error('Error fetching projections:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProjections();
  }, [ownerTeams, ownerMatchups]);
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Owner Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6">
        <div className="flex items-center">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-white border-2 border-white">
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
                <User size={32} />
              </div>
            )}
          </div>
          <div className="ml-4">
            <h2 className="text-xl font-bold text-white">{ownerName}</h2>
            <p className="text-white/80">{owner.username}</p>
          </div>
        </div>
      </div>
      
      {/* Owner Stats */}
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center text-sm text-gray-500 mb-1">
              <Trophy size={16} className="mr-2 text-primary-500" />
              <span>Teams</span>
            </div>
            <p className="text-xl font-semibold text-gray-800">{ownerTeams.length}</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center text-sm text-gray-500 mb-1">
              <BarChart2 size={16} className="mr-2 text-success-500" />
              <span>Win Rate</span>
            </div>
            <p className="text-xl font-semibold text-gray-800">
              {ownerTeams.length > 0 
                ? `${Math.round((ownerTeams.reduce((sum, team) => sum + (team.wins || 0), 0) / 
                   ownerTeams.reduce((sum, team) => sum + ((team.wins || 0) + (team.losses || 0) + (team.ties || 0)), 0)) * 100)}%`
                : 'N/A'}
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center text-sm text-gray-500 mb-1">
              <Star size={16} className="mr-2 text-warning-500" />
              <span>Total Points</span>
            </div>
            <p className="text-xl font-semibold text-gray-800">
              {ownerTeams.reduce((sum, team) => sum + (team.points_for || 0), 0).toFixed(1)}
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center text-sm text-gray-500 mb-1">
              <Users size={16} className="mr-2 text-blue-500" />
              <span>Leagues</span>
            </div>
            <p className="text-xl font-semibold text-gray-800">
              {new Set(ownerTeams.map(team => team.league_id)).size}
            </p>
          </div>
        </div>
        
        {/* Teams List */}
        {ownerTeams.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Teams</h3>
            <div className="space-y-4">
              {ownerTeams.map(team => (
                <div key={team.roster_id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800">{team.settings?.team_name || `Team ${team.roster_id}`}</p>
                      <div className="flex items-center mt-1">
                        <p className="text-sm text-gray-600">{team.wins}-{team.losses}{team.ties ? `-${team.ties}` : ''}</p>
                        <span className="mx-2 text-gray-300">•</span>
                        <p className="text-sm text-gray-600">Points: {team.points_for?.toFixed(1) || '0.0'}</p>
                      </div>
                    </div>
                    
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      (team.wins || 0) > (team.losses || 0) 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {(team.wins || 0) > (team.losses || 0) ? 'Winning' : 'Losing'}
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
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Matchups</h3>
            <div className="space-y-4">
              {ownerMatchups.map(matchup => {
                const team = teams.find(t => t.roster_id === matchup.roster_id);
                const opponent = matchups.find(m => 
                  m.matchup_id === matchup.matchup_id && m.roster_id !== matchup.roster_id
                );
                const opponentTeam = teams.find(t => t.roster_id === opponent?.roster_id);
                const opponentOwner = users[opponentTeam?.owner_id || ''] || { display_name: 'Unknown Owner' };
                
                // Calculate projected points for the team
                const teamProjectedPoints = matchup.players?.reduce((sum, playerId) => {
                  return sum + (weeklyProjections[playerId] || 0);
                }, 0) || 0;
                
                return (
                  <div key={matchup.roster_id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center">
                        <Calendar size={16} className="text-gray-400 mr-2" />
                        <p className="text-sm font-medium text-gray-800">Week {matchup.week || '?'}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        matchup.points > (opponent?.points || 0) 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {matchup.points > (opponent?.points || 0) ? 'Winning' : 'Losing'}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <p className="font-medium text-gray-800">{team?.settings?.team_name || `Team ${matchup.roster_id}`}</p>
                        <div className="flex items-center mt-1">
                          <p className="text-sm text-gray-600">{matchup.points.toFixed(2)} pts</p>
                          {!isLoading && teamProjectedPoints > 0 && (
                            <>
                              <span className="mx-2 text-gray-300">•</span>
                              <div className="flex items-center">
                                <p className="text-sm text-gray-600">Proj: {teamProjectedPoints.toFixed(1)}</p>
                                {teamProjectedPoints > matchup.points ? (
                                  <TrendingUp size={14} className="ml-1 text-green-500" />
                                ) : (
                                  <TrendingDown size={14} className="ml-1 text-red-500" />
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-medium text-gray-800">{opponentTeam?.settings?.team_name || `Team ${opponent?.roster_id}`}</p>
                        <p className="text-sm text-gray-600 mt-1">{opponent?.points.toFixed(2) || '0.00'} pts</p>
                      </div>
                    </div>
                    
                    <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${matchup.points > (opponent?.points || 0) ? 'bg-success-500' : 'bg-error-500'}`}
                        style={{ width: `${(matchup.points / (matchup.points + (opponent?.points || 0))) * 100}%` }}
                      />
                    </div>
                    
                    {/* Top Players */}
                    {matchup.players && matchup.players.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Top Players</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {matchup.players.slice(0, 4).map(playerId => {
                            const player = players[playerId];
                            if (!player) return null;
                            
                            return (
                              <div key={playerId} className="flex items-center bg-white rounded p-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                                  player.position === 'QB' ? 'bg-red-100 text-red-800' :
                                  player.position === 'RB' ? 'bg-blue-100 text-blue-800' :
                                  player.position === 'WR' ? 'bg-green-100 text-green-800' :
                                  player.position === 'TE' ? 'bg-purple-100 text-purple-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {player.position}
                                </div>
                                <div className="ml-2 overflow-hidden">
                                  <p className="text-xs font-medium text-gray-800 truncate">
                                    {player.first_name} {player.last_name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {weeklyProjections[playerId] ? `Proj: ${weeklyProjections[playerId].toFixed(1)}` : player.team}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};