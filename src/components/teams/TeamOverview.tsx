import React from 'react';
import { Trophy, Users, Calendar, MapPin, Award, Globe, Brain } from 'lucide-react';

interface TeamOverviewProps {
  name: string;
  location: string;
  conference: string;
  division: string;
  established: number;
  championships: number;
  website: string;
  weather?: {
    temp: number;
    condition: string;
  };
}

// 2024 NFL Coaching Staff Data
const COACHING_STAFF: Record<string, {
  headCoach: { name: string; background: string };
  offensiveCoordinator?: { name: string; background: string };
  defensiveCoordinator?: { name: string; background: string };
  specialTeamsCoordinator?: { name: string; background: string };
}> = {
  'LV': {
    headCoach: {
      name: 'Antonio Pierce',
      background: 'Former NFL linebacker and Raiders interim head coach, Pierce brings intensity and defensive expertise. His player-first approach and deep understanding of the modern game has energized the Raiders organization.'
    },
    offensiveCoordinator: {
      name: 'Luke Getsy',
      background: 'Former Bears offensive coordinator brings a dynamic scheme that blends West Coast principles with modern spread concepts. Known for developing quarterbacks and creating explosive plays.'
    },
    defensiveCoordinator: {
      name: 'Patrick Graham',
      background: 'Returning defensive coordinator known for his aggressive, multiple-front defense. His scheme emphasizes pressure packages and versatile coverage concepts.'
    }
  },
  // Add other teams' coaching staffs here
};

export const TeamOverview: React.FC<TeamOverviewProps> = ({
  name,
  location,
  conference,
  division,
  established,
  championships,
  website,
  weather
}) => {
  // Extract team code from name (e.g., "Las Vegas Raiders" -> "LV")
  const teamCode = name.split(' ').pop()?.substring(0, 2).toUpperCase() || '';
  const coachingStaff = COACHING_STAFF[teamCode];

  return (
    <div className="space-y-6">
      {/* Team Info Card */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="relative h-48 bg-gradient-to-br from-gray-800 to-gray-900 p-6">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold text-white mb-2">{name}</h1>
            <div className="flex items-center text-gray-200">
              <MapPin size={16} className="mr-2" />
              <span>{location}</span>
              {weather && (
                <div className="ml-4 px-3 py-1 bg-black/30 backdrop-blur-sm rounded-full text-sm">
                  {weather.temp}° • {weather.condition}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Team stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-6">
          <div className="space-y-1">
            <div className="flex items-center text-gray-500">
              <Trophy size={16} className="mr-2" />
              <span className="text-sm">Championships</span>
            </div>
            <p className="text-xl font-semibold text-gray-800">{championships}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center text-gray-500">
              <Users size={16} className="mr-2" />
              <span className="text-sm">Conference</span>
            </div>
            <p className="text-xl font-semibold text-gray-800">{conference}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center text-gray-500">
              <Award size={16} className="mr-2" />
              <span className="text-sm">Division</span>
            </div>
            <p className="text-xl font-semibold text-gray-800">{division}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center text-gray-500">
              <Calendar size={16} className="mr-2" />
              <span className="text-sm">Established</span>
            </div>
            <p className="text-xl font-semibold text-gray-800">{established}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center text-gray-500">
              <Globe size={16} className="mr-2" />
              <span className="text-sm">Website</span>
            </div>
            <a 
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Visit Site
            </a>
          </div>
        </div>
      </div>

      {/* Coaching Staff Card */}
      {coachingStaff && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-6">
            <Brain size={20} className="text-primary-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">Coaching Staff</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Head Coach */}
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-800">Head Coach</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium text-gray-800 mb-1">{coachingStaff.headCoach.name}</p>
                <p className="text-sm text-gray-600">{coachingStaff.headCoach.background}</p>
              </div>
            </div>

            {/* Offensive Coordinator */}
            {coachingStaff.offensiveCoordinator && (
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-800">Offensive Coordinator</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium text-gray-800 mb-1">{coachingStaff.offensiveCoordinator.name}</p>
                  <p className="text-sm text-gray-600">{coachingStaff.offensiveCoordinator.background}</p>
                </div>
              </div>
            )}

            {/* Defensive Coordinator */}
            {coachingStaff.defensiveCoordinator && (
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-800">Defensive Coordinator</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium text-gray-800 mb-1">{coachingStaff.defensiveCoordinator.name}</p>
                  <p className="text-sm text-gray-600">{coachingStaff.defensiveCoordinator.background}</p>
                </div>
              </div>
            )}

            {/* Special Teams Coordinator */}
            {coachingStaff.specialTeamsCoordinator && (
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-800">Special Teams Coordinator</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium text-gray-800 mb-1">{coachingStaff.specialTeamsCoordinator.name}</p>
                  <p className="text-sm text-gray-600">{coachingStaff.specialTeamsCoordinator.background}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};