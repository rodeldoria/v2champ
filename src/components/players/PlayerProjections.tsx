import React, { useState, useEffect } from 'react';
import { Player } from '../../types/sleeper';
import { fetchPlayerStats } from '../../api/sleeperApi';
import { TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react';
import Plot from 'react-plotly.js';

interface PlayerProjectionsProps {
  player: Player;
  season?: string;
  week?: number;
  projections?: Record<string, number>;
}

export const PlayerProjections: React.FC<PlayerProjectionsProps> = ({ 
  player,
  season = '2024',
  week = 1,
  projections: propProjections
}) => {
  const [projections, setProjections] = useState<Record<string, number>>(propProjections || {});
  const [actualStats, setActualStats] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(!propProjections);
  const [error, setError] = useState<string | null>(null);
  const [selectedWeek, setSelectedWeek] = useState(week);
  const [weeklyProjections, setWeeklyProjections] = useState<Record<number, Record<string, number>>>({});
  const [isLoadingWeekly, setIsLoadingWeekly] = useState(false);
  const [selectedStat, setSelectedStat] = useState<string>('pts_ppr');
  const [showChart, setShowChart] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!player?.player_id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // If projections were passed as props, use them
        if (propProjections && Object.keys(propProjections).length > 0) {
          setProjections(propProjections);
        } else {
          // Otherwise fetch projections
          const response = await fetch(
            `https://api.sleeper.app/v1/projections/nfl/regular/${season}/${selectedWeek}?player_id=${player.player_id}`
          );
          
          if (!response.ok) {
            throw new Error('Failed to fetch projections');
          }
          
          const data = await response.json();
          setProjections(data[player.player_id] || {});
        }
        
        // Fetch actual stats
        const stats = await fetchPlayerStats(player.player_id, season, selectedWeek);
        setActualStats(stats);
      } catch (error) {
        console.error('Error fetching projections:', error);
        setError('Failed to load projections');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [player?.player_id, season, selectedWeek, propProjections]);

  // Fetch weekly projections for the season
  useEffect(() => {
    const fetchWeeklyProjections = async () => {
      if (!player?.player_id) return;
      
      setIsLoadingWeekly(true);
      
      try {
        const weeklyData: Record<number, Record<string, number>> = {};
        
        // Fetch projections for weeks 1-17
        for (let week = 1; week <= 17; week++) {
          const response = await fetch(
            `https://api.sleeper.app/v1/projections/nfl/regular/${season}/${week}?player_id=${player.player_id}`
          );
          
          if (response.ok) {
            const data = await response.json();
            const weekProjections = data[player.player_id];
            
            if (weekProjections && Object.keys(weekProjections).length > 0) {
              weeklyData[week] = weekProjections;
            }
          }
          
          // Add a small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        setWeeklyProjections(weeklyData);
      } catch (error) {
        console.error('Error fetching weekly projections:', error);
      } finally {
        setIsLoadingWeekly(false);
      }
    };
    
    fetchWeeklyProjections();
  }, [player?.player_id, season]);

  // Get relevant stats based on position
  const getRelevantStats = () => {
    switch (player?.position) {
      case 'QB':
        return [
          { key: 'pass_yd', label: 'Pass Yards' },
          { key: 'pass_td', label: 'Pass TD' },
          { key: 'pass_int', label: 'Interceptions' },
          { key: 'rush_yd', label: 'Rush Yards' },
          { key: 'rush_td', label: 'Rush TD' },
          { key: 'pts_ppr', label: 'Fantasy Points' }
        ];
      case 'RB':
        return [
          { key: 'rush_yd', label: 'Rush Yards' },
          { key: 'rush_td', label: 'Rush TD' },
          { key: 'rec', label: 'Receptions' },
          { key: 'rec_yd', label: 'Rec Yards' },
          { key: 'rec_td', label: 'Rec TD' },
          { key: 'pts_ppr', label: 'Fantasy Points' }
        ];
      case 'WR':
      case 'TE':
        return [
          { key: 'rec', label: 'Receptions' },
          { key: 'rec_yd', label: 'Rec Yards' },
          { key: 'rec_td', label: 'Rec TD' },
          { key: 'targets', label: 'Targets' },
          { key: 'pts_ppr', label: 'Fantasy Points' }
        ];
      case 'K':
        return [
          { key: 'fg_made', label: 'FG Made' },
          { key: 'fg_att', label: 'FG Attempts' },
          { key: 'xp_made', label: 'XP Made' },
          { key: 'pts_ppr', label: 'Fantasy Points' }
        ];
      case 'DEF':
        return [
          { key: 'sack', label: 'Sacks' },
          { key: 'int', label: 'Interceptions' },
          { key: 'fum_rec', label: 'Fumble Rec' },
          { key: 'def_td', label: 'Def TD' },
          { key: 'pts_ppr', label: 'Fantasy Points' }
        ];
      default:
        return [{ key: 'pts_ppr', label: 'Fantasy Points' }];
    }
  };

  // Calculate difference percentage
  const calculateDifference = (projected: number, actual: number) => {
    if (!projected) return { value: 0, direction: 'neutral' as const };
    
    const diff = actual - projected;
    const percentage = projected ? (diff / projected) * 100 : 0;
    
    return {
      value: Math.abs(percentage),
      direction: diff > 0 ? 'up' as const : diff < 0 ? 'down' as const : 'neutral' as const
    };
  };

  // Prepare data for season projections chart
  const prepareChartData = () => {
    const weeks = Object.keys(weeklyProjections).map(Number).sort((a, b) => a - b);
    
    // Get the selected stat for each week
    const projValues = weeks.map(week => weeklyProjections[week][selectedStat] || 0);
    
    // Get actual values where available
    const actualValues = weeks.map(week => {
      // This would need actual stats for each week
      // For now, we'll just use the current week's actual stats if available
      return week === selectedWeek ? actualStats[selectedStat] || 0 : 0;
    });
    
    return {
      weeks,
      projValues,
      actualValues
    };
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center text-gray-500">
        {error}
      </div>
    );
  }

  const relevantStats = getRelevantStats();
  const weeks = Array.from({ length: 18 }, (_, i) => i + 1);
  const chartData = prepareChartData();

  return (
    <div className="space-y-6">
      {/* Current Week Projections */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">Projections vs Actual</h3>
          
          <div className="flex items-center">
            <label htmlFor="week-select" className="mr-2 text-sm text-gray-600">Week:</label>
            <select 
              id="week-select"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(Number(e.target.value))}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 p-2"
            >
              {weeks.map(week => (
                <option key={week} value={week}>Week {week}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stat
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Projected
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actual
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Diff
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {relevantStats.map(({ key, label }) => {
                const projected = projections[key] || 0;
                const actual = actualStats[key] || 0;
                const diff = calculateDifference(projected, actual);
                
                return (
                  <tr key={key} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {label}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {projected.toFixed(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {actual.toFixed(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {diff.direction === 'up' ? (
                          <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                        ) : diff.direction === 'down' ? (
                          <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                        ) : (
                          <Minus className="w-4 h-4 text-gray-400 mr-1" />
                        )}
                        <span className={`text-sm font-medium ${
                          diff.direction === 'up' ? 'text-green-600' :
                          diff.direction === 'down' ? 'text-red-600' :
                          'text-gray-500'
                        }`}>
                          {diff.value.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Season Projections */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">Season Projections</h3>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowChart(!showChart)}
              className="px-3 py-1.5 bg-primary-50 text-primary-600 rounded-lg text-sm font-medium hover:bg-primary-100 transition-colors"
            >
              {showChart ? 'Hide Chart' : 'Show Chart'}
            </button>
            
            <select
              value={selectedStat}
              onChange={(e) => setSelectedStat(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 p-2"
            >
              {relevantStats.map(({ key, label }) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>
        
        {isLoadingWeekly ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            <span className="ml-3 text-gray-600">Loading weekly projections...</span>
          </div>
        ) : Object.keys(weeklyProjections).length > 0 ? (
          <>
            {showChart && (
              <div className="p-4 border-b border-gray-200">
                <div className="h-80">
                  <Plot
                    data={[
                      {
                        x: chartData.weeks.map(w => `Week ${w}`),
                        y: chartData.projValues,
                        type: 'scatter',
                        mode: 'lines+markers',
                        name: 'Projected',
                        line: { color: 'rgba(99, 102, 241, 0.8)', width: 2 },
                        marker: { color: 'rgba(99, 102, 241, 1)', size: 8 }
                      },
                      {
                        x: [selectedWeek].map(w => `Week ${w}`),
                        y: [actualStats[selectedStat] || 0],
                        type: 'scatter',
                        mode: 'markers',
                        name: 'Actual',
                        marker: { color: 'rgba(16, 185, 129, 1)', size: 10, symbol: 'star' }
                      }
                    ]}
                    layout={{
                      title: `${relevantStats.find(s => s.key === selectedStat)?.label || selectedStat} Projections`,
                      xaxis: { title: 'Week' },
                      yaxis: { title: relevantStats.find(s => s.key === selectedStat)?.label || selectedStat },
                      margin: { l: 50, r: 20, t: 50, b: 50 },
                      legend: { orientation: 'h', y: -0.2 },
                      hovermode: 'closest',
                      autosize: true,
                      font: {
                        family: 'Inter, system-ui, sans-serif'
                      }
                    }}
                    config={{
                      responsive: true,
                      displayModeBar: false
                    }}
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>
              </div>
            )}
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Week
                    </th>
                    {relevantStats.map(({ key, label }) => (
                      <th key={key} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(weeklyProjections)
                    .sort(([weekA], [weekB]) => Number(weekA) - Number(weekB))
                    .map(([week, weekProjections]) => (
                      <tr key={week} className={Number(week) === selectedWeek ? 'bg-primary-50' : 'hover:bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Calendar size={16} className="text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900">Week {week}</span>
                          </div>
                        </td>
                        {relevantStats.map(({ key }) => (
                          <td key={key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {(weekProjections[key] || 0).toFixed(1)}
                          </td>
                        ))}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No weekly projections available
          </div>
        )}
      </div>
      
      <div className="p-4 bg-gray-50 text-xs text-gray-500 text-center rounded-lg">
        Projections data from Sleeper API
      </div>
    </div>
  );
};