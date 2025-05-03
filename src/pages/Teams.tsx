import React, { useState, useMemo } from 'react';
import { TeamDepthChart } from '../components/teams/TeamDepthChart';
import { TeamOverview } from '../components/teams/TeamOverview';
import { TeamMetrics } from '../components/teams/TeamMetrics';
import { TeamSchedule } from '../components/teams/TeamSchedule';
import { useSleeperStore } from '../store/sleeperStore';

const Teams: React.FC = () => {
  const { players } = useSleeperStore();
  const [selectedPosition, setSelectedPosition] = useState('QB');
  const [selectedTeam, setSelectedTeam] = useState('LV');
  const [selectedDivision, setSelectedDivision] = useState('AFC North');

  // Memoize filtered players to prevent unnecessary recalculations
  const teamPlayers = useMemo(() => 
    Object.values(players).filter(player => player.team === selectedTeam),
    [players, selectedTeam]
  );

  // Team data
  const nflTeams = [
    ['AFC North', ['BAL', 'CIN', 'CLE', 'PIT']],
    ['AFC South', ['HOU', 'IND', 'JAX', 'TEN']],
    ['AFC East', ['BUF', 'MIA', 'NE', 'NYJ']],
    ['AFC West', ['DEN', 'KC', 'LV', 'LAC']],
    ['NFC North', ['CHI', 'DET', 'GB', 'MIN']],
    ['NFC South', ['ATL', 'CAR', 'NO', 'TB']],
    ['NFC East', ['DAL', 'NYG', 'PHI', 'WAS']],
    ['NFC West', ['ARI', 'LAR', 'SF', 'SEA']]
  ] as const;

  const teamNames: Record<string, string> = {
    ARI: 'Arizona Cardinals', ATL: 'Atlanta Falcons', BAL: 'Baltimore Ravens',
    BUF: 'Buffalo Bills', CAR: 'Carolina Panthers', CHI: 'Chicago Bears',
    CIN: 'Cincinnati Bengals', CLE: 'Cleveland Browns', DAL: 'Dallas Cowboys',
    DEN: 'Denver Broncos', DET: 'Detroit Lions', GB: 'Green Bay Packers',
    HOU: 'Houston Texans', IND: 'Indianapolis Colts', JAX: 'Jacksonville Jaguars',
    KC: 'Kansas City Chiefs', LAC: 'Los Angeles Chargers', LAR: 'Los Angeles Rams',
    LV: 'Las Vegas Raiders', MIA: 'Miami Dolphins', MIN: 'Minnesota Vikings',
    NE: 'New England Patriots', NO: 'New Orleans Saints', NYG: 'New York Giants',
    NYJ: 'New York Jets', PHI: 'Philadelphia Eagles', PIT: 'Pittsburgh Steelers',
    SEA: 'Seattle Seahawks', SF: 'San Francisco 49ers', TB: 'Tampa Bay Buccaneers',
    TEN: 'Tennessee Titans', WAS: 'Washington Commanders'
  };

  // Team metadata
  const teamLocations: Record<string, string> = {
    ARI: 'Glendale, AZ', ATL: 'Atlanta, GA', BAL: 'Baltimore, MD',
    BUF: 'Orchard Park, NY', CAR: 'Charlotte, NC', CHI: 'Chicago, IL',
    CIN: 'Cincinnati, OH', CLE: 'Cleveland, OH', DAL: 'Arlington, TX',
    DEN: 'Denver, CO', DET: 'Detroit, MI', GB: 'Green Bay, WI',
    HOU: 'Houston, TX', IND: 'Indianapolis, IN', JAX: 'Jacksonville, FL',
    KC: 'Kansas City, MO', LAC: 'Inglewood, CA', LAR: 'Inglewood, CA',
    LV: 'Las Vegas, NV', MIA: 'Miami Gardens, FL', MIN: 'Minneapolis, MN',
    NE: 'Foxborough, MA', NO: 'New Orleans, LA', NYG: 'East Rutherford, NJ',
    NYJ: 'East Rutherford, NJ', PHI: 'Philadelphia, PA', PIT: 'Pittsburgh, PA',
    SEA: 'Seattle, WA', SF: 'Santa Clara, CA', TB: 'Tampa, FL',
    TEN: 'Nashville, TN', WAS: 'Landover, MD'
  };

  const teamEstablished: Record<string, number> = {
    ARI: 1898, ATL: 1966, BAL: 1996, BUF: 1960, CAR: 1995, CHI: 1920,
    CIN: 1968, CLE: 1946, DAL: 1960, DEN: 1960, DET: 1930, GB: 1919,
    HOU: 2002, IND: 1953, JAX: 1995, KC: 1960, LAC: 1960, LAR: 1936,
    LV: 1960, MIA: 1966, MIN: 1961, NE: 1960, NO: 1967, NYG: 1925,
    NYJ: 1960, PHI: 1933, PIT: 1933, SEA: 1976, SF: 1946, TB: 1976,
    TEN: 1960, WAS: 1932
  };

  const teamChampionships: Record<string, number> = {
    ARI: 2, ATL: 0, BAL: 2, BUF: 0, CAR: 0, CHI: 9, CIN: 0, CLE: 4,
    DAL: 5, DEN: 3, DET: 4, GB: 13, HOU: 0, IND: 2, JAX: 0, KC: 3,
    LAC: 1, LAR: 2, LV: 3, MIA: 2, MIN: 0, NE: 6, NO: 1, NYG: 4,
    NYJ: 1, PHI: 1, PIT: 6, SEA: 1, SF: 5, TB: 2, TEN: 0, WAS: 3
  };

  // Team play style data
  const teamPlayStyles: Record<string, { passing: number; rushing: number }> = {
    ARI: { passing: 35.2, rushing: 23.1 }, ATL: { passing: 32.1, rushing: 28.4 },
    BAL: { passing: 30.5, rushing: 29.8 }, BUF: { passing: 36.8, rushing: 24.2 },
    CAR: { passing: 31.2, rushing: 26.7 }, CHI: { passing: 29.8, rushing: 28.9 },
    CIN: { passing: 37.4, rushing: 22.6 }, CLE: { passing: 31.9, rushing: 27.1 },
    DAL: { passing: 35.7, rushing: 25.3 }, DEN: { passing: 33.2, rushing: 25.8 },
    DET: { passing: 34.9, rushing: 26.1 }, GB: { passing: 33.8, rushing: 25.2 },
    HOU: { passing: 32.7, rushing: 26.3 }, IND: { passing: 31.5, rushing: 27.5 },
    JAX: { passing: 34.6, rushing: 24.4 }, KC: { passing: 38.2, rushing: 23.8 },
    LAC: { passing: 36.4, rushing: 23.6 }, LAR: { passing: 34.1, rushing: 25.9 },
    LV: { passing: 37.8, rushing: 22.4 }, MIA: { passing: 35.9, rushing: 24.1 },
    MIN: { passing: 35.3, rushing: 24.7 }, NE: { passing: 32.8, rushing: 26.2 },
    NO: { passing: 33.7, rushing: 25.3 }, NYG: { passing: 32.4, rushing: 26.6 },
    NYJ: { passing: 31.6, rushing: 27.4 }, PHI: { passing: 34.2, rushing: 25.8 },
    PIT: { passing: 33.9, rushing: 25.1 }, SEA: { passing: 34.8, rushing: 24.2 },
    SF: { passing: 32.6, rushing: 27.4 }, TB: { passing: 36.1, rushing: 23.9 },
    TEN: { passing: 31.8, rushing: 27.2 }, WAS: { passing: 32.9, rushing: 26.1 }
  };

  const getTeamConference = (teamId: string): string => {
    const afcTeams = ['LV', 'KC', 'LAC', 'DEN', 'BUF', 'MIA', 'NE', 'NYJ', 'BAL', 'CIN', 'CLE', 'PIT', 'HOU', 'IND', 'JAX', 'TEN'];
    return afcTeams.includes(teamId) ? 'AFC' : 'NFC';
  };

  const getTeamDivision = (teamId: string): string => {
    for (const [division, teams] of nflTeams) {
      if (teams.includes(teamId as any)) {
        return division;
      }
    }
    return 'Unknown Division';
  };

  // Memoize team info based on selected team
  const teamInfo = useMemo(() => ({
    name: teamNames[selectedTeam],
    location: teamLocations[selectedTeam],
    conference: getTeamConference(selectedTeam),
    division: getTeamDivision(selectedTeam),
    established: teamEstablished[selectedTeam],
    championships: teamChampionships[selectedTeam],
    website: `www.${selectedTeam.toLowerCase()}.com`,
    weather: {
      temp: 75,
      condition: 'Clear'
    }
  }), [selectedTeam]);

  // Memoize metrics based on selected team
  const metrics = useMemo(() => {
    const playStyle = teamPlayStyles[selectedTeam];
    return {
      playVolume: {
        passing: playStyle.passing,
        rushing: playStyle.rushing
      },
      playBalance: {
        passing: Math.round((playStyle.passing / (playStyle.passing + playStyle.rushing)) * 100),
        rushing: Math.round((playStyle.rushing / (playStyle.passing + playStyle.rushing)) * 100)
      },
      drives: {
        average: 11.4,
        leagueAvg: 10.8
      },
      firstDowns: {
        average: 18.4,
        leagueAvg: 19.7
      }
    };
  }, [selectedTeam]);

  // Team schedules
  const teamSchedules: Record<string, any[]> = {
    LV: [
      { week: 1, opponent: 'Los Angeles Chargers', date: 'September 7, 2024', location: 'Away' },
      { week: 2, opponent: 'Baltimore Ravens', date: 'September 14, 2024', location: 'Away' },
      { week: 3, opponent: 'Carolina Panthers', date: 'September 21, 2024', location: 'Home' },
      { week: 4, opponent: 'Cleveland Browns', date: 'September 28, 2024', location: 'Home' },
      { week: 5, opponent: 'Denver Broncos', date: 'October 5, 2024', location: 'Away' }
    ],
    // Add schedules for other teams...
  };

  const schedule = useMemo(() => 
    teamSchedules[selectedTeam] || [], 
    [selectedTeam]
  );

  const positions = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'];

  return (
    <div className="space-y-6">
      {/* Division Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            {nflTeams.map(([division]) => (
              <button
                key={division}
                onClick={() => setSelectedDivision(division)}
                className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                  selectedDivision === division
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {division}
              </button>
            ))}
          </nav>
        </div>

        {/* Team Buttons */}
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {nflTeams
            .find(([division]) => division === selectedDivision)?.[1]
            .map((team) => (
              <button
                key={team}
                onClick={() => setSelectedTeam(team)}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  selectedTeam === team
                    ? 'bg-primary-50 text-primary-700'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <img
                  src={`https://sleepercdn.com/images/team_logos/nfl/${team.toLowerCase()}.png`}
                  alt={teamNames[team]}
                  className="w-8 h-8 mr-3"
                />
                <div className="text-left">
                  <div className="font-medium">{team}</div>
                  <div className="text-xs text-gray-500">{teamNames[team]}</div>
                </div>
              </button>
            ))}
        </div>
      </div>

      {/* Team Overview */}
      <TeamOverview {...teamInfo} />
      
      {/* Team Metrics */}
      <TeamMetrics metrics={metrics} />

      {/* Position selector */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex space-x-2">
          {positions.map((pos) => (
            <button
              key={pos}
              onClick={() => setSelectedPosition(pos)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedPosition === pos
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {pos}
            </button>
          ))}
        </div>
      </div>

      {/* Depth Chart */}
      <TeamDepthChart 
        players={teamPlayers}
        position={selectedPosition}
        teamId={selectedTeam}
      />
      
      {/* Team Schedule */}
      <TeamSchedule 
        schedule={schedule}
        currentWeek={1}
      />
    </div>
  );
};

export default Teams;