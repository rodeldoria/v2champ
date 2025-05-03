import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { Player } from '../../types/sleeper';
import { fetchPlayerStats } from '../../api/sleeperApi';

interface PlayerProjectionsPlotProps {
  player: Player;
  season?: string;
  weeks?: number[];
}

export const PlayerProjectionsPlot: React.FC<PlayerProjectionsPlotProps> = ({
  player,
  season = '2024',
  weeks = Array.from({ length: 17 }, (_, i) => i + 1)
}) => {
  const [projections, setProjections] = useState<Record<number, Record<string, number>>>({});
  const [actualStats, setActualStats] = useState<Record<number, Record<string, number>>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStat, setSelectedStat] = useState<string>('pts_ppr');

  useEffect(() => {
    const fetchData = async () => {
      if (!player?.player_id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const projData: Record<number, Record<string, number>> = {};
        const statsData: Record<number, Record<string, number>> = {};
        
        // Fetch projections and actual stats for each week
        for (const week of weeks) {
          // Fetch projections
          const projResponse = await fetch(
            `https://api.sleeper.app/v1/projections/nfl/regular/${season}/${week}?player_id=${player.player_id}`
          );
          
          if (projResponse.ok) {
            const data = await projResponse.json();
            if (data[player.player_id]) {
              projData[week] = data[player.player_id];
            }
          }
          
          // Fetch actual stats
          const weekStats = await fetchPlayerStats(player.player_id, season, week);
          if (Object.keys(weekStats).length > 0) {
            statsData[week] = weekStats;
          }
          
          // Add a small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        setProjections(projData);
        setActualStats(statsData);
      } catch (error) {
        console.error('Error fetching projections and stats:', error);
        setError('Failed to load projections and stats');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [player?.player_id, season, weeks]);

  // Get available stats based on position
  const getAvailableStats = () => {
    switch (player?.position) {
      case 'QB':
        return [
          { value: 'pts_ppr', label: 'Fantasy Points' },
          { value: 'pass_yd', label: 'Pass Yards' },
          { value: 'pass_td', label: 'Pass TD' },
          { value: 'pass_int', label: 'Interceptions' },
          { value: 'rush_yd', label: 'Rush Yards' }
        ];
      case 'RB':
        return [
          { value: 'pts_ppr', label: 'Fantasy Points' },
          { value: 'rush_yd', label: 'Rush Yards' },
          { value: 'rush_td', label: 'Rush TD' },
          { value: 'rec', label: 'Receptions' },
          { value: 'rec_yd', label: 'Rec Yards' }
        ];
      case 'WR':
      case 'TE':
        return [
          { value: 'pts_ppr', label: 'Fantasy Points' },
          { value: 'rec', label: 'Receptions' },
          { value: 'rec_yd', label: 'Rec Yards' },
          { value: 'rec_td', label: 'Rec TD' },
          { value: 'targets', label: 'Targets' }
        ];
      case 'K':
        return [
          { value: 'pts_ppr', label: 'Fantasy Points' },
          { value: 'fg_made', label: 'FG Made' },
          { value: 'xp_made', label: 'XP Made' }
        ];
      case 'DEF':
        return [
          { value: 'pts_ppr', label: 'Fantasy Points' },
          { value: 'sack', label: 'Sacks' },
          { value: 'int', label: 'Interceptions' },
          { value: 'def_td', label: 'Def TD' }
        ];
      default:
        return [
          { value: 'pts_ppr', label: 'Fantasy Points' }
        ];
    }
  };

  // Get position-specific colors
  const getPositionColors = () => {
    switch (player?.position) {
      case 'QB':
        return { 
          projected: 'rgba(239, 68, 68, 0.8)', // Red
          actual: 'rgba(16, 185, 129, 0.8)' // Green
        };
      case 'RB':
        return { 
          projected: 'rgba(59, 130, 246, 0.8)', // Blue
          actual: 'rgba(16, 185, 129, 0.8)' // Green
        };
      case 'WR':
        return { 
          projected: 'rgba(34, 197, 94, 0.8)', // Green
          actual: 'rgba(99, 102, 241, 0.8)' // Primary
        };
      case 'TE':
        return { 
          projected: 'rgba(168, 85, 247, 0.8)', // Purple
          actual: 'rgba(16, 185, 129, 0.8)' // Green
        };
      default:
        return { 
          projected: 'rgba(99, 102, 241, 0.8)', // Primary
          actual: 'rgba(16, 185, 129, 0.8)' // Green
        };
    }
  };

  const colors = getPositionColors();

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-primary-500 rounded-full animate-spin mr-3"></div>
        <span className="text-gray-600">Loading projections...</span>
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

  // Prepare data for Plotly
  const projWeeks = Object.keys(projections).map(Number).sort((a, b) => a - b);
  const actualWeeks = Object.keys(actualStats).map(Number).sort((a, b) => a - b);
  
  const projValues = projWeeks.map(week => projections[week][selectedStat] || 0);
  const actualValues = actualWeeks.map(week => actualStats[week][selectedStat] || 0);

  // Calculate season averages
  const projAvg = projValues.length > 0 ? projValues.reduce((sum, val) => sum + val, 0) / projValues.length : 0;
  const actualAvg = actualValues.length > 0 ? actualValues.reduce((sum, val) => sum + val, 0) / actualValues.length : 0;

  // Calculate min/max for y-axis
  const allValues = [...projValues, ...actualValues];
  const maxValue = allValues.length > 0 ? Math.max(...allValues) * 1.1 : 10;
  const minValue = 0;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Projections vs. Actual</h3>
        
        <div className="flex flex-wrap gap-2">
          {getAvailableStats().map(stat => (
            <button
              key={stat.value}
              onClick={() => setSelectedStat(stat.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedStat === stat.value
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {stat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-80">
        <Plot
          data={[
            {
              x: projWeeks,
              y: projValues,
              type: 'scatter',
              mode: 'lines+markers',
              name: 'Projected',
              line: { color: colors.projected, width: 2 },
              marker: { color: colors.projected, size: 8 }
            },
            {
              x: actualWeeks,
              y: actualValues,
              type: 'scatter',
              mode: 'lines+markers',
              name: 'Actual',
              line: { color: colors.actual, width: 2 },
              marker: { color: colors.actual, size: 8 }
            },
            {
              x: projWeeks,
              y: Array(projWeeks.length).fill(projAvg),
              type: 'scatter',
              mode: 'lines',
              name: 'Proj Avg',
              line: { color: colors.projected, width: 1, dash: 'dash' }
            },
            {
              x: actualWeeks,
              y: Array(actualWeeks.length).fill(actualAvg),
              type: 'scatter',
              mode: 'lines',
              name: 'Actual Avg',
              line: { color: colors.actual, width: 1, dash: 'dash' }
            }
          ]}
          layout={{
            title: {
              text: `${getAvailableStats().find(s => s.value === selectedStat)?.label || selectedStat} by Week`,
              font: {
                family: 'Inter, system-ui, sans-serif',
                size: 16
              }
            },
            xaxis: {
              title: {
                text: 'Week',
                font: {
                  family: 'Inter, system-ui, sans-serif',
                  size: 14
                }
              },
              tickmode: 'array',
              tickvals: weeks,
              ticktext: weeks.map(w => `Week ${w}`),
              tickfont: {
                family: 'Inter, system-ui, sans-serif',
                size: 12
              }
            },
            yaxis: { 
              title: {
                text: getAvailableStats().find(s => s.value === selectedStat)?.label || selectedStat,
                font: {
                  family: 'Inter, system-ui, sans-serif',
                  size: 14
                }
              },
              range: [minValue, maxValue],
              tickfont: {
                family: 'Inter, system-ui, sans-serif',
                size: 12
              }
            },
            margin: { l: 60, r: 20, t: 50, b: 60 },
            legend: { 
              orientation: 'h', 
              y: -0.2,
              font: {
                family: 'Inter, system-ui, sans-serif',
                size: 12
              }
            },
            hovermode: 'closest',
            autosize: true,
            font: {
              family: 'Inter, system-ui, sans-serif'
            },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            grid: {
              rows: 1,
              columns: 1,
              pattern: 'independent'
            }
          }}
          config={{
            responsive: true,
            displayModeBar: false
          }}
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="bg-primary-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-primary-700 mb-2">Projection Summary</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-primary-600">Average</p>
              <p className="text-lg font-semibold text-primary-800">{projAvg.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-xs text-primary-600">Max</p>
              <p className="text-lg font-semibold text-primary-800">
                {projValues.length > 0 ? Math.max(...projValues).toFixed(1) : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-green-700 mb-2">Actual Performance</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-green-600">Average</p>
              <p className="text-lg font-semibold text-green-800">{actualAvg.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-xs text-green-600">Max</p>
              <p className="text-lg font-semibold text-green-800">
                {actualValues.length > 0 ? Math.max(...actualValues).toFixed(1) : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};