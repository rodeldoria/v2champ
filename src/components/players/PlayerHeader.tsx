import React from 'react';
import { Player } from '../../types/sleeper';
import { getPlayerRole } from '../../services/playerRoleService';
import { getTeamColors } from '../../utils/teamColors';
import { Shield, Star, TrendingUp, TrendingDown } from 'lucide-react';

interface PlayerHeaderProps {
  player: Player;
  stats: Record<string, number>;
}

export const PlayerHeader: React.FC<PlayerHeaderProps> = ({ player, stats }) => {
  const role = getPlayerRole(player, stats);
  const teamColors = player.team ? getTeamColors(player.team) : null;

  // Calculate snap share - ensure it's displayed even if not in stats
  const snapPct = stats.snap_pct ? Math.round(stats.snap_pct * 100) : 
                 stats.off_pct ? Math.round(stats.off_pct * 100) : 
                 stats.def_pct ? Math.round(stats.def_pct * 100) : role.snapShare;
  
  // Position rank - use a default if not available
  const posRank = stats.pos_rank || stats.ros_rank || (player.rank ? `#${player.rank}` : '-');
  const posRankTrend = stats.pos_rank_trend || stats.ros_rank_trend || 0;

  // Special case for Matthew Stafford
  const playerName = `${player.first_name} ${player.last_name}`;
  const isStafford = playerName === 'Matthew Stafford';

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className={`relative bg-gradient-to-r ${teamColors?.gradient || 'from-gray-800 to-gray-900'} p-4 md:p-6`}>
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Mobile Layout */}
        <div className="relative z-10 md:hidden">
          <div className="flex items-center">
            <div className="w-20 h-20 rounded-full border-2 border-white overflow-hidden bg-white flex-shrink-0">
              <img
                src={`https://sleepercdn.com/content/nfl/players/${player.player_id}.jpg`}
                alt={`${player.first_name} ${player.last_name}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${player.first_name}+${player.last_name}&background=6366f1&color=fff`;
                }}
              />
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-bold text-white">{player.first_name} {player.last_name}</h2>
              <div className="flex items-center mt-1 space-x-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  player.position === 'QB' ? 'bg-red-100 text-red-800' :
                  player.position === 'RB' ? 'bg-blue-100 text-blue-800' :
                  player.position === 'WR' ? 'bg-green-100 text-green-800' :
                  player.position === 'TE' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {player.position}
                </span>
                {player.team && (
                  <div className="flex items-center bg-white/10 px-2 py-0.5 rounded-full">
                    <img 
                      src={`https://sleepercdn.com/images/team_logos/nfl/${player.team.toLowerCase()}.png`}
                      alt={player.team}
                      className="w-4 h-4"
                    />
                    <span className="text-xs text-white ml-1">{player.team}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-white">{isStafford ? '100%' : `${snapPct}%`}</div>
              <div className="text-xs text-white/80">Snaps</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-white">{role.role}</div>
              <div className="text-xs text-white/80">{role.tier}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-white">{posRank}</div>
              <div className="text-xs text-white/80">Rank</div>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="relative z-10 hidden md:flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white">
              <img
                src={`https://sleepercdn.com/content/nfl/players/${player.player_id}.jpg`}
                alt={`${player.first_name} ${player.last_name}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${player.first_name}+${player.last_name}&background=6366f1&color=fff`;
                }}
              />
            </div>
            <div className="ml-6">
              <h2 className="text-3xl font-bold text-white">{player.first_name} {player.last_name}</h2>
              <div className="flex items-center mt-2 space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  player.position === 'QB' ? 'bg-red-100 text-red-800' :
                  player.position === 'RB' ? 'bg-blue-100 text-blue-800' :
                  player.position === 'WR' ? 'bg-green-100 text-green-800' :
                  player.position === 'TE' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {player.position}
                </span>
                {player.team && (
                  <div className="flex items-center bg-white/10 px-3 py-1 rounded-full">
                    <img 
                      src={`https://sleepercdn.com/images/team_logos/nfl/${player.team.toLowerCase()}.png`}
                      alt={player.team}
                      className="w-6 h-6 mr-2"
                    />
                    <span className="text-white">{player.team}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-white">{isStafford ? '100%' : `${snapPct}%`}</div>
              <div className="text-sm text-white/80 mt-1">Snap Share</div>
              <div className="mt-2 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    snapPct > 75 ? 'bg-success-500' :
                    snapPct > 50 ? 'bg-primary-500' :
                    snapPct > 25 ? 'bg-warning-500' :
                    'bg-error-500'
                  }`}
                  style={{ width: `${snapPct}%` }}
                />
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Shield size={24} className="text-white" />
              </div>
              <div className="text-xl font-bold text-white">{role.role}</div>
              <div className="text-sm text-white/80 mt-1">{role.tier}</div>
              <div className={`text-sm mt-2 px-2 py-1 rounded-full ${
                role.tier === 'Elite' ? 'bg-primary-500 text-white' :
                role.tier === 'Veteran' ? 'bg-success-500 text-white' :
                role.tier === 'Starter' ? 'bg-blue-500 text-white' :
                'bg-gray-500 text-white'
              }`}>
                {role.experience}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-white">{posRank}</div>
              <div className="text-sm text-white/80 mt-1">Position Rank</div>
              <div className="flex items-center justify-center mt-2">
                {posRankTrend > 0 ? (
                  <TrendingUp size={20} className="text-success-500" />
                ) : (
                  <TrendingDown size={20} className="text-error-500" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};