import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Star, TrendingUp, TrendingDown } from 'lucide-react';
import { Player } from '../../types/sleeper';
import { getTeamColors } from '../../utils/teamColors';
import { validatePlayer } from '../../services/playerRealityValidator';

interface TeamDepthChartProps {
  players: Player[];
  position: string;
  teamId: string;
}

export const TeamDepthChart: React.FC<TeamDepthChartProps> = ({ players, position, teamId }) => {
  const { primary, secondary } = getTeamColors(teamId);
  
  // Filter players by position and sort by depth chart order, excluding retired players
  const positionPlayers = players
    .filter(p => {
      const validation = validatePlayer(p, {});
      return p.position === position && validation.isActive;
    })
    .sort((a, b) => {
      const aOrder = a.depth_chart_order || 99;
      const bOrder = b.depth_chart_order || 99;
      return aOrder - bOrder;
    });

  // Determine player role based on depth chart position
  const getPlayerRole = (player: Player, index: number) => {
    if (index === 0) return { role: 'Starter', snapShare: 80 };
    if (index === 1) return { role: 'Backup', snapShare: 40 };
    return { role: 'Reserve', snapShare: 20 };
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="text-lg font-semibold text-gray-800">{position} Depth Chart</h3>
      
      <div className="space-y-3 mt-4">
        {positionPlayers.map((player, index) => {
          const { role, snapShare } = getPlayerRole(player, index);
          const isStarter = index === 0;
          
          // Get meta status for injury/status display
          const getMetaStatus = () => {
            if (player.injury_status) {
              switch (player.injury_status.toLowerCase()) {
                case 'ir':
                  return { color: 'text-red-600', text: 'IR' };
                case 'out':
                  return { color: 'text-red-600', text: 'Out' };
                case 'doubtful':
                  return { color: 'text-orange-600', text: 'Doubtful' };
                case 'questionable':
                  return { color: 'text-yellow-600', text: 'Questionable' };
                default:
                  return { color: 'text-gray-600', text: player.injury_status };
              }
            }
            return null;
          };

          const metaStatus = getMetaStatus();
          
          return (
            <Link 
              key={player.player_id}
              to={`/players/${player.player_id}`}
              className={`block p-3 rounded-lg border transition-all duration-200 hover:shadow-md ${
                isStarter 
                  ? `border-${primary}/20 bg-${primary}/5 hover:bg-${primary}/10` 
                  : 'border-gray-100 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Depth Chart Position */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-semibold ${
                    index === 0 ? `bg-${primary}/20 text-${primary}` : 'bg-gray-100 text-gray-600'
                  }`}>
                    {player.depth_chart_order || '-'}
                  </div>

                  {/* Player Info */}
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className={`font-medium ${isStarter ? `text-${primary}` : 'text-gray-900'}`}>
                        {player.first_name} {player.last_name}
                      </span>
                      {isStarter && (
                        <Star size={14} className={`text-${secondary} ml-1 fill-current`} />
                      )}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-0.5 space-x-2">
                      <span>{role}</span>
                      {metaStatus && (
                        <span className={`${metaStatus.color}`}>• {metaStatus.text}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Snap Share */}
                <div className="flex flex-col items-end">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700">{snapShare}% snaps</span>
                    {snapShare > 75 ? (
                      <TrendingUp size={14} className="text-success-500 ml-1" />
                    ) : snapShare < 25 ? (
                      <TrendingDown size={14} className="text-error-500 ml-1" />
                    ) : null}
                  </div>
                  {/* Snap Share Bar */}
                  <div className="w-20 h-1 bg-gray-200 rounded-full mt-1">
                    <div 
                      className={`h-full rounded-full ${
                        snapShare > 75 ? 'bg-success-500' :
                        snapShare > 50 ? 'bg-primary-500' :
                        snapShare > 25 ? 'bg-warning-500' :
                        'bg-error-500'
                      }`}
                      style={{ width: `${snapShare}%` }}
                    />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
        
        {positionPlayers.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            No active players found for this position
          </div>
        )}
      </div>
    </div>
  );
};