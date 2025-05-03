import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

interface TeamMetricsProps {
  metrics: {
    playVolume: {
      passing: number;
      rushing: number;
    };
    playBalance: {
      passing: number;
      rushing: number;
    };
    drives: {
      average: number;
      leagueAvg: number;
    };
    firstDowns: {
      average: number;
      leagueAvg: number;
    };
  };
}

export const TeamMetrics: React.FC<TeamMetricsProps> = ({ metrics }) => {
  const playVolumeData = [
    { name: 'Team', passing: metrics.playVolume.passing, rushing: metrics.playVolume.rushing },
    { name: 'League Avg', passing: 32.8, rushing: 27 }
  ];

  const driveData = [
    { name: 'Avg Drives', team: metrics.drives.average, league: metrics.drives.leagueAvg },
    { name: 'Avg First Downs', team: metrics.firstDowns.average, league: metrics.firstDowns.leagueAvg }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Play Volume Chart */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Play Volume</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={playVolumeData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis hide />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-3 border border-gray-200 rounded shadow-sm">
                        <p className="text-sm font-medium text-gray-700">{payload[0].payload.name}</p>
                        <p className="text-sm text-primary-600">Passing: {payload[0].value}</p>
                        <p className="text-sm text-success-600">Rushing: {payload[1].value}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="passing" fill="#655DC6" />
              <Bar dataKey="rushing" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Play Balance Chart */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Play Balance</h3>
        <div className="flex flex-col space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Passing</span>
              <span className="font-medium text-gray-800">{metrics.playBalance.passing}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary-500"
                style={{ width: `${metrics.playBalance.passing}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Rushing</span>
              <span className="font-medium text-gray-800">{metrics.playBalance.rushing}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-success-500"
                style={{ width: `${metrics.playBalance.rushing}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Drive Metrics Chart */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:col-span-2">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Drive Metrics</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={driveData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis hide />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-3 border border-gray-200 rounded shadow-sm">
                        <p className="text-sm font-medium text-gray-700">{payload[0].payload.name}</p>
                        <p className="text-sm text-primary-600">Team: {payload[0].value}</p>
                        <p className="text-sm text-gray-600">League: {payload[1].value}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="team" fill="#655DC6" />
              <Bar dataKey="league" fill="#E5E7EB" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};