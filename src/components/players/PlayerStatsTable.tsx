import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Calendar, Filter } from 'lucide-react';
import Plot from 'react-plotly.js';

interface PlayerStatsTableProps {
  stats: Record<string, Record<string, number>>;
  position?: string;
  scoringType: string;
  showComparison?: boolean;
  selectedWeek?: number;
}

export const PlayerStatsTable: React.FC<PlayerStatsTableProps> = ({
  stats,
  position,
  scoringType,
  showComparison = true,
  selectedWeek
}) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('Summary');
  const [expandedSeason, setExpandedSeason] = useState<string | null>(null);
  const [showPlot, setShowPlot] = useState(false);
  const [plotStat, setPlotStat] = useState<string>('pts_ppr');
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);
  const [selectedSeasonWeeks, setSelectedSeasonWeeks] = useState<Record<string, number>>({});
  
  // Get all available seasons
  const seasons = Object.keys(stats).filter(key => !key.includes('_week_')).sort((a, b) => Number(b) - Number(a));

  // Memoize filtered players to prevent unnecessary recalculations
  const seasonTotals = seasons.reduce((totals, season) => {
    const seasonStats = stats[season];
    Object.entries(seasonStats).forEach(([key, value]) => {
      if (typeof value === 'number' && !key.includes('week_')) {
        totals[key] = (totals[key] || 0) + value;
      }
    });
    return totals;
  }, {} as Record<string, number>);

  // Filter out irrelevant stats based on position
  const getRelevantStats = (stats: Record<string, number>) => {
    const relevantStats: Record<string, number> = {};
    
    // Define position-specific relevant stats
    const relevantKeys: Record<string, string[]> = {
      QB: ['pass_att', 'pass_cmp', 'pass_yd', 'pass_td', 'pass_int', 'rush_att', 'rush_yd', 'rush_td', 'pts_ppr', 'weight'],
      RB: ['rush_att', 'rush_yd', 'rush_td', 'rec', 'rec_yd', 'rec_td', 'ypc', 'fumbles', 'pts_ppr', 'weight'],
      WR: ['rec', 'targets', 'rec_yd', 'rec_td', 'ypr', 'rush_att', 'rush_yd', 'rush_td', 'pts_ppr', 'weight'],
      TE: ['rec', 'targets', 'rec_yd', 'rec_td', 'ypr', 'block_grade', 'pts_ppr', 'weight'],
      K: ['fg_att', 'fg_made', 'fg_long', 'xp_att', 'xp_made', 'pts_ppr', 'weight'],
      DEF: ['sack', 'int', 'fumbles', 'safety', 'td', 'pts_allowed', 'pts_ppr', 'weight']
    };

    // If position is defined, use position-specific keys, otherwise use all keys
    const keys = position && position in relevantKeys 
      ? relevantKeys[position as keyof typeof relevantKeys] 
      : Object.keys(stats);
    
    keys.forEach(key => {
      if (stats[key] !== undefined) {
        relevantStats[key] = stats[key];
      }
    });

    // Add weight if not present
    if (!relevantStats.weight && stats.pts_ppr) {
      relevantStats.weight = calculateWeight(stats, position);
    }

    return relevantStats;
  };

  // Format stat names for display
  const formatStatName = (key: string): string => {
    return key
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Categories for grouping stats
  const categories = {
    Summary: ['pts_ppr', 'pts_half_ppr', 'pts_std', 'snap_pct', 'weight'],
    Passing: ['pass_att', 'pass_cmp', 'pass_yd', 'pass_td', 'pass_int', 'pass_rating', 'pass_first_down', 'pass_20_plus', 'pass_air_yd'],
    Rushing: ['rush_att', 'rush_yd', 'rush_td', 'ypc', 'rush_first_down', 'rush_20_plus', 'rush_yac'],
    Receiving: ['rec', 'targets', 'rec_yd', 'rec_td', 'ypr', 'rec_first_down', 'rec_20_plus', 'rec_yac', 'catch_pct'],
    Kicking: ['fg_att', 'fg_made', 'fg_long', 'xp_att', 'xp_made', 'fg_pct', 'fg_made_0_19', 'fg_made_20_29', 'fg_made_30_39', 'fg_made_40_49', 'fg_made_50_plus'],
    Defense: ['sack', 'int', 'fumbles', 'safety', 'td', 'pts_allowed', 'def_td', 'def_st_td', 'def_st_ff', 'def_st_fr']
  };

  // Prepare data for the plot
  const preparePlotData = () => {
    const traces = [];
    
    // Add a trace for each season
    for (const season of seasons) {
      const seasonData = stats[season];
      if (!seasonData) continue;
      
      // Get weekly data
      const weeklyData: Record<number, number> = {};
      
      // Extract weekly stats
      Object.entries(stats).forEach(([key, value]) => {
        if (key.startsWith(`${season}_week_`) && typeof value === 'object') {
          const weekNumber = parseInt(key.replace(`${season}_week_`, ''));
          if (value[plotStat] !== undefined) {
            weeklyData[weekNumber] = value[plotStat];
          }
        }
      });
      
      // If no weekly data, use season total
      if (Object.keys(weeklyData).length === 0 && seasonData[plotStat]) {
        weeklyData[0] = seasonData[plotStat];
      }
      
      // Sort weeks
      const sortedWeeks = Object.keys(weeklyData).map(Number).sort((a, b) => a - b);
      
      // Create trace
      traces.push({
        x: sortedWeeks.map(w => w === 0 ? 'Season' : `Week ${w}`),
        y: sortedWeeks.map(w => weeklyData[w]),
        type: 'scatter',
        mode: 'lines+markers',
        name: `${season}`,
        line: { width: 2 }
      });
    }
    
    return traces;
  };

  // Get all weeks for a season
  const getSeasonWeeks = (season: string): number[] => {
    const weekKeys = Object.keys(stats)
      .filter(key => key.startsWith(`${season}_week_`))
      .map(key => parseInt(key.replace(`${season}_week_`, '')))
      .sort((a, b) => a - b);
    
    return weekKeys;
  };

  // Handle season selection
  const handleSeasonChange = (season: string) => {
    setSelectedSeason(season);
    setExpandedSeason(season);
    
    // Get weeks for this season
    const weeks = getSeasonWeeks(season);
    if (weeks.length > 0) {
      setSelectedSeasonWeeks({
        ...selectedSeasonWeeks,
        [season]: weeks[0]
      });
    }
  };

  // Handle week selection for a season
  const handleWeekChange = (season: string, week: number) => {
    setSelectedSeasonWeeks({
      ...selectedSeasonWeeks,
      [season]: week
    });
  };

  // Get position-specific colors for the chart
  const getPositionColors = () => {
    switch (position) {
      case 'QB':
        return ['#ef4444', '#f87171', '#fca5a5']; // Red
      case 'RB':
        return ['#3b82f6', '#60a5fa', '#93c5fd']; // Blue
      case 'WR':
        return ['#22c55e', '#4ade80', '#86efac']; // Green
      case 'TE':
        return ['#a855f7', '#c084fc', '#d8b4fe']; // Purple
      default:
        return ['#6366f1', '#818cf8', '#a5b4fc']; // Primary
    }
  };

  // Calculate player weight
  function calculateWeight(stats: Record<string, number>, position?: string): number {
    // Base weight calculation
    let points = 0;
    
    // Passing
    points += (stats.pass_yd || 0) * 0.04;
    points += (stats.pass_td || 0) * 4;
    points += (stats.pass_int || 0) * -1;
    
    // Rushing
    points += (stats.rush_yd || 0) * 0.1;
    points += (stats.rush_td || 0) * 6;
    
    // Receiving
    points += (stats.rec || 0) * 1;
    points += (stats.rec_yd || 0) * 0.1;
    points += (stats.rec_td || 0) * 6;
    
    // Snap percentage affects weight
    const snapPct = stats.snap_pct || 0.75; // Default to 75% if not available
    
    // Weight is a function of points and snap percentage
    return points * snapPct;
  }

  if (seasons.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center text-gray-500">
        No stats available for this player
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Chart */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 md:px-6 py-4 bg-gray-50 border-l-4 border-primary-500 flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">Stats Visualization</h3>
          <button 
            onClick={() => setShowPlot(!showPlot)}
            className="px-3 py-1 bg-primary-50 text-primary-600 rounded-lg text-sm hover:bg-primary-100 transition-colors"
          >
            {showPlot ? 'Hide Chart' : 'Show Chart'}
          </button>
        </div>

        {showPlot && (
          <div className="p-4 border-b border-gray-200">
            <div className="mb-4 flex flex-wrap gap-2">
              {Object.keys(getRelevantStats(seasonTotals)).map(stat => (
                <button
                  key={stat}
                  onClick={() => setPlotStat(stat)}
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    plotStat === stat
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {formatStatName(stat)}
                </button>
              ))}
            </div>
            <div className="h-80">
              <Plot
                data={preparePlotData()}
                layout={{
                  title: `${formatStatName(plotStat)} by Week`,
                  xaxis: { title: 'Week' },
                  yaxis: { title: formatStatName(plotStat) },
                  margin: { l: 50, r: 20, t: 50, b: 50 },
                  legend: { orientation: 'h', y: -0.2 },
                  hovermode: 'closest',
                  autosize: true,
                  font: {
                    family: 'Inter, system-ui, sans-serif'
                  },
                  colorway: getPositionColors()
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
                  Stat
                </th>
                {seasons.map(season => (
                  <th key={season} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {season}
                  </th>
                ))}
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Career
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(getRelevantStats(seasonTotals)).map(([key, careerValue]) => (
                <tr key={key} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatStatName(key)}
                    </div>
                  </td>
                  {seasons.map(season => {
                    const seasonValue = stats[season][key];
                    return (
                      <td key={season} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {typeof seasonValue === 'number' ? seasonValue.toFixed(1) : '-'}
                      </td>
                    );
                  })}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {typeof careerValue === 'number' ? careerValue.toFixed(1) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Weekly Stats Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 md:px-6 py-4 bg-gray-50 border-l-4 border-primary-500">
          <h3 className="font-semibold text-gray-800">Weekly Stats</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Week
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Season
                </th>
                {Object.keys(getRelevantStats(seasonTotals)).map(key => (
                  <th key={key} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {formatStatName(key)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {seasons.flatMap(season => {
                // Get weekly stats for this season
                const weeklyStats = [];
                
                // Add season totals row
                weeklyStats.push(
                  <tr key={`${season}-total`} className="bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Season Total
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {season}
                    </td>
                    {Object.keys(getRelevantStats(seasonTotals)).map(key => (
                      <td key={key} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {typeof stats[season][key] === 'number' ? stats[season][key].toFixed(1) : '-'}
                      </td>
                    ))}
                  </tr>
                );
                
                // Add weekly stats rows
                for (let week = 1; week <= 17; week++) {
                  const weekKey = `${season}_week_${week}`;
                  const weekStats = stats[weekKey];
                  
                  // Skip weeks with no stats
                  if (!weekStats) continue;
                  
                  weeklyStats.push(
                    <tr key={weekKey} className={selectedSeasonWeeks[season] === week ? 'bg-primary-50' : 'hover:bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Week {week}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {season}
                      </td>
                      {Object.keys(getRelevantStats(seasonTotals)).map(key => {
                        // Calculate weight for this week if not present
                        let value = weekStats[key];
                        if (key === 'weight' && value === undefined) {
                          value = calculateWeight(weekStats, position);
                        }
                        
                        return (
                          <td key={key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {typeof value === 'number' ? value.toFixed(1) : '-'}
                          </td>
                        );
                      })}
                    </tr>
                  );
                }
                
                return weeklyStats;
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};