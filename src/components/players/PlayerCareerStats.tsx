import React, { useState, useEffect } from 'react';
import { Player } from '../../types/sleeper';
import { fetchPlayerStats } from '../../api/sleeperApi';
import { ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import Plot from 'react-plotly.js';

interface PlayerCareerStatsProps {
  player: Player;
  careerStats?: Record<string, Record<string, number>>;
}

export const PlayerCareerStats: React.FC<PlayerCareerStatsProps> = ({ 
  player,
  careerStats: propCareerStats = {}
}) => {
  const [careerStats, setCareerStats] = useState<Record<string, Record<string, number>>>(propCareerStats);
  const [isLoading, setIsLoading] = useState(Object.keys(propCareerStats).length === 0);
  const [error, setError] = useState<string | null>(null);
  const [expandedSeason, setExpandedSeason] = useState<string | null>(null);
  const [selectedStat, setSelectedStat] = useState<string>('pts_ppr');
  const [showHeatmap, setShowHeatmap] = useState(false);
  
  // Get relevant stats based on position
  const getRelevantStats = () => {
    switch (player?.position) {
      case 'QB':
        return ['pass_att', 'pass_cmp', 'pass_yd', 'pass_td', 'pass_int', 'rush_att', 'rush_yd', 'rush_td', 'pts_ppr'];
      case 'RB':
        return ['rush_att', 'rush_yd', 'rush_td', 'rec', 'rec_yd', 'rec_td', 'fumbles', 'pts_ppr'];
      case 'WR':
        return ['rec', 'targets', 'rec_yd', 'rec_td', 'rush_att', 'rush_yd', 'rush_td', 'pts_ppr'];
      case 'TE':
        return ['rec', 'targets', 'rec_yd', 'rec_td', 'pts_ppr'];
      case 'K':
        return ['fg_att', 'fg_made', 'fg_long', 'xp_att', 'xp_made', 'pts_ppr'];
      case 'DEF':
        return ['sack', 'int', 'fumbles', 'safety', 'td', 'pts_allowed', 'pts_ppr'];
      default:
        return ['pts_ppr'];
    }
  };

  // Format stat names for display
  const formatStatName = (key: string): string => {
    return key
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  useEffect(() => {
    if (Object.keys(propCareerStats).length > 0) {
      setCareerStats(propCareerStats);
      setIsLoading(false);
      return;
    }
    
    const fetchCareerData = async () => {
      if (!player?.player_id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const seasons = ['2024', '2023', '2022', '2021', '2020'];
        const stats: Record<string, Record<string, number>> = {};
        
        // Fetch stats for each season
        for (const season of seasons) {
          // Fetch season totals (week 0 is often used for season totals)
          const seasonStats = await fetchPlayerStats(player.player_id, season, 0);
          
          if (Object.keys(seasonStats).length > 0) {
            stats[season] = seasonStats;
            
            // Fetch weekly stats for the season
            for (let week = 1; week <= 17; week++) {
              const weekStats = await fetchPlayerStats(player.player_id, season, week);
              if (Object.keys(weekStats).length > 0) {
                stats[season][`week_${week}`] = week;
                stats[`${season}_week_${week}`] = weekStats;
              }
            }
          }
        }
        
        setCareerStats(stats);
      } catch (error) {
        console.error('Error fetching career stats:', error);
        setError('Failed to load career statistics');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCareerData();
  }, [player?.player_id, propCareerStats]);

  // Get all available seasons
  const seasons = Object.keys(careerStats)
    .filter(key => !key.includes('_week_'))
    .sort((a, b) => Number(b) - Number(a));

  // Calculate career totals
  const careerTotals = seasons.reduce((totals, season) => {
    const seasonStats = careerStats[season];
    Object.entries(seasonStats).forEach(([key, value]) => {
      if (typeof value === 'number' && !key.includes('week_')) {
        totals[key] = (totals[key] || 0) + value;
      }
    });
    return totals;
  }, {} as Record<string, number>);

  // Prepare data for heatmap
  const prepareHeatmapData = () => {
    const relevantStats = getRelevantStats();
    const heatmapData: { season: string; week: number; value: number }[] = [];
    
    seasons.forEach(season => {
      // Get weekly data for this season
      for (let week = 1; week <= 17; week++) {
        const weekKey = `${season}_week_${week}`;
        const weekStats = careerStats[weekKey];
        
        if (weekStats && weekStats[selectedStat] !== undefined) {
          heatmapData.push({
            season,
            week,
            value: weekStats[selectedStat]
          });
        }
      }
    });
    
    // Create z values (2D array)
    const uniqueSeasons = [...new Set(heatmapData.map(d => d.season))].sort((a, b) => Number(b) - Number(a));
    const weeks = Array.from({ length: 17 }, (_, i) => i + 1);
    
    const zValues = uniqueSeasons.map(season => {
      return weeks.map(week => {
        const dataPoint = heatmapData.find(d => d.season === season && d.week === week);
        return dataPoint ? dataPoint.value : null;
      });
    });
    
    return {
      z: zValues,
      x: weeks.map(w => `Week ${w}`),
      y: uniqueSeasons
    };
  };

  // Get position-specific colors
  const getPositionColors = () => {
    switch (player?.position) {
      case 'QB':
        return ['#ef4444', '#fca5a5', '#fee2e2']; // Red
      case 'RB':
        return ['#3b82f6', '#93c5fd', '#dbeafe']; // Blue
      case 'WR':
        return ['#22c55e', '#86efac', '#dcfce7']; // Green
      case 'TE':
        return ['#a855f7', '#d8b4fe', '#f3e8ff']; // Purple
      default:
        return ['#6366f1', '#a5b4fc', '#e0e7ff']; // Primary
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
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

  if (seasons.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center text-gray-500">
        No career statistics available for this player
      </div>
    );
  }

  const relevantStats = getRelevantStats();
  const heatmapData = prepareHeatmapData();
  const positionColors = getPositionColors();

  return (
    <div className="space-y-6">
      {/* Career Stats Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Career Statistics</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className="px-3 py-1.5 bg-primary-50 text-primary-600 rounded-lg text-sm font-medium hover:bg-primary-100 transition-colors"
            >
              {showHeatmap ? 'Show Bar Chart' : 'Show Heatmap'}
            </button>
            <div className="relative">
              <select
                value={selectedStat}
                onChange={(e) => setSelectedStat(e.target.value)}
                className="pl-3 pr-8 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm"
              >
                {relevantStats.map(stat => (
                  <option key={stat} value={stat}>
                    {formatStatName(stat)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <div className="h-80">
          {showHeatmap ? (
            <Plot
              data={[
                {
                  z: heatmapData.z,
                  x: heatmapData.x,
                  y: heatmapData.y,
                  type: 'heatmap',
                  colorscale: [
                    [0, positionColors[2]],
                    [0.5, positionColors[1]],
                    [1, positionColors[0]]
                  ],
                  showscale: true,
                  colorbar: {
                    title: formatStatName(selectedStat),
                    titleside: 'right',
                    titlefont: {
                      family: 'Inter, system-ui, sans-serif',
                      size: 12
                    },
                    tickfont: {
                      family: 'Inter, system-ui, sans-serif',
                      size: 10
                    }
                  }
                }
              ]}
              layout={{
                title: {
                  text: `${formatStatName(selectedStat)} by Week and Season`,
                  font: {
                    family: 'Inter, system-ui, sans-serif',
                    size: 16
                  }
                },
                margin: { l: 50, r: 50, t: 50, b: 50 },
                xaxis: {
                  title: {
                    text: 'Week',
                    font: {
                      family: 'Inter, system-ui, sans-serif',
                      size: 14
                    }
                  },
                  tickfont: {
                    family: 'Inter, system-ui, sans-serif',
                    size: 12
                  }
                },
                yaxis: {
                  title: {
                    text: 'Season',
                    font: {
                      family: 'Inter, system-ui, sans-serif',
                      size: 14
                    }
                  },
                  tickfont: {
                    family: 'Inter, system-ui, sans-serif',
                    size: 12
                  }
                },
                autosize: true,
                font: {
                  family: 'Inter, system-ui, sans-serif'
                },
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)'
              }}
              config={{
                responsive: true,
                displayModeBar: false
              }}
              style={{ width: '100%', height: '100%' }}
            />
          ) : (
            <Plot
              data={seasons.map((season, index) => {
                const seasonData = careerStats[season];
                return {
                  x: relevantStats,
                  y: relevantStats.map(stat => seasonData[stat] || 0),
                  type: 'bar',
                  name: season,
                  marker: {
                    color: positionColors[index % positionColors.length]
                  }
                };
              })}
              layout={{
                title: {
                  text: 'Season Comparison',
                  font: {
                    family: 'Inter, system-ui, sans-serif',
                    size: 16
                  }
                },
                barmode: 'group',
                xaxis: {
                  title: {
                    text: 'Statistic',
                    font: {
                      family: 'Inter, system-ui, sans-serif',
                      size: 14
                    }
                  },
                  tickvals: relevantStats,
                  ticktext: relevantStats.map(formatStatName),
                  tickangle: -45,
                  tickfont: {
                    family: 'Inter, system-ui, sans-serif',
                    size: 10
                  }
                },
                yaxis: {
                  title: {
                    text: 'Value',
                    font: {
                      family: 'Inter, system-ui, sans-serif',
                      size: 14
                    }
                  },
                  tickfont: {
                    family: 'Inter, system-ui, sans-serif',
                    size: 12
                  }
                },
                margin: { l: 60, r: 20, t: 50, b: 100 },
                legend: {
                  orientation: 'h',
                  y: -0.2,
                  font: {
                    family: 'Inter, system-ui, sans-serif',
                    size: 12
                  }
                },
                autosize: true,
                font: {
                  family: 'Inter, system-ui, sans-serif'
                },
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)'
              }}
              config={{
                responsive: true,
                displayModeBar: false
              }}
              style={{ width: '100%', height: '100%' }}
            />
          )}
        </div>
      </div>

      {/* Career Totals */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 md:px-6 py-4 bg-gray-50 border-l-4 border-primary-500">
          <h3 className="font-semibold text-gray-800">Career Totals</h3>
        </div>
        <div className="p-4 md:p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {relevantStats.map(stat => (
            <div key={stat} className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-500">{formatStatName(stat)}</div>
              <div className="text-lg font-semibold text-gray-800">
                {careerTotals[stat]?.toFixed(1) || '0.0'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Season Breakdown */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 md:px-6 py-4 bg-gray-50 border-l-4 border-primary-500">
          <h3 className="font-semibold text-gray-800">Season Breakdown</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {seasons.map(season => (
            <div key={season} className="overflow-hidden">
              <button 
                className="w-full px-4 md:px-6 py-4 text-left bg-white hover:bg-gray-50 flex items-center justify-between"
                onClick={() => setExpandedSeason(expandedSeason === season ? null : season)}
              >
                <span className="font-medium text-gray-800">Season {season}</span>
                {expandedSeason === season ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              
              {expandedSeason === season && (
                <div className="px-4 md:px-6 py-4 bg-gray-50">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {relevantStats.map(stat => (
                      <div key={stat} className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="text-sm text-gray-500">{formatStatName(stat)}</div>
                        <div className="text-lg font-semibold text-gray-800">
                          {careerStats[season][stat]?.toFixed(1) || '0.0'}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Weekly Breakdown */}
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                      <Calendar size={16} className="mr-2 text-primary-500" />
                      Weekly Breakdown - {season} Season
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-white">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Week
                            </th>
                            {relevantStats.map(stat => (
                              <th key={stat} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {formatStatName(stat)}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {Array.from({ length: 17 }, (_, i) => i + 1).map(week => {
                            const weekKey = `${season}_week_${week}`;
                            const weekStats = careerStats[weekKey];
                            
                            // Skip weeks with no stats
                            if (!weekStats) return null;
                            
                            return (
                              <tr key={week} className="hover:bg-gray-100">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  Week {week}
                                </td>
                                {relevantStats.map(stat => (
                                  <td key={stat} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {typeof weekStats?.[stat] === 'number' ? weekStats[stat].toFixed(1) : '-'}
                                  </td>
                                ))}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};