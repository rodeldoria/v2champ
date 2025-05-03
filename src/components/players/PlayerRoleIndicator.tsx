import React from 'react';
import { Shield, Star, TrendingUp, Clock, Award, Users } from 'lucide-react';
import { PlayerRole } from '../../services/playerRoleService';

interface PlayerRoleIndicatorProps {
  role: PlayerRole;
}

export const PlayerRoleIndicator: React.FC<PlayerRoleIndicatorProps> = ({ role }) => {
  const getRoleColor = () => {
    switch (role.role) {
      case 'Feature Player':
        return 'text-primary-600 bg-primary-50';
      case 'Starter':
        return 'text-success-600 bg-success-50';
      case 'Key Contributor':
        return 'text-blue-600 bg-blue-50';
      case 'Rotational Player':
        return 'text-purple-600 bg-purple-50';
      case 'Backup':
        return 'text-warning-600 bg-warning-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTierColor = () => {
    switch (role.tier) {
      case 'Elite':
        return 'text-primary-600 bg-primary-50';
      case 'Veteran':
        return 'text-success-600 bg-success-50';
      case 'Starter':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getExperienceIcon = () => {
    switch (role.experience) {
      case 'Elite Veteran':
        return <Award className="w-4 h-4" />;
      case 'Veteran':
      case 'Journeyman':
        return <Shield className="w-4 h-4" />;
      case 'Rising Star':
      case 'Impact Rookie':
        return <TrendingUp className="w-4 h-4" />;
      case 'Rookie':
      case 'Developing':
        return <Clock className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      {/* Role Badge */}
      <div className={`inline-flex items-center px-3 py-1 rounded-full ${getRoleColor()}`}>
        <Shield className="w-4 h-4 mr-1" />
        <span className="text-sm font-medium">{role.role}</span>
      </div>

      {/* Experience Badge */}
      <div className={`inline-flex items-center px-3 py-1 rounded-full ${getTierColor()}`}>
        {getExperienceIcon()}
        <span className="text-sm font-medium ml-1">{role.experience}</span>
      </div>

      {/* Tier Badge */}
      <div className={`inline-flex items-center px-3 py-1 rounded-full bg-gray-50 text-gray-700`}>
        <Star className="w-4 h-4 mr-1" />
        <span className="text-sm font-medium">{role.tier}</span>
      </div>

      {/* Snap Share Indicator */}
      <div className="mt-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500">Snap Share</span>
          <span className="text-xs font-medium text-gray-700">{role.snapShare}%</span>
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full ${
              role.snapShare > 75 ? 'bg-primary-500' :
              role.snapShare > 50 ? 'bg-success-500' :
              role.snapShare > 25 ? 'bg-warning-500' :
              'bg-gray-500'
            }`}
            style={{ width: `${role.snapShare}%` }}
          />
        </div>
      </div>

      {/* Confidence Indicator */}
      <div className="text-xs text-gray-500 text-center mt-1">
        Confidence: {role.confidence}%
      </div>
    </div>
  );
};