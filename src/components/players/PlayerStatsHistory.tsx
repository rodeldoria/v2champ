import React, { useState, useEffect } from 'react';
import { Player } from '../../types/sleeper';
import Plot from 'react-plotly.js';
import { fetchPlayerStats } from '../api/sleeperApi';
import { Brain, Search, UserPlus, X, Calendar, BarChart2 } from 'lucide-react';
import { useSleeperStore } from '../../store/sleeperStore';

interface PlayerStatsHistoryProps {
  player: Player;
  stats?: Record<string, Record<string, number>>;
  selectedStat?: string;
  onStatChange?: (stat: string) => void;
  showWeeklyView?: boolean;
}

export const PlayerStatsHistory: React.FC<PlayerStatsHistoryProps> = ({ 
  player,
  stats = {},
  selectedStat = 'pts_ppr',
  onStatChange,
  showWeeklyView = false
}) => {
  const { players } = useSleeperStore();
  const [timeframe, setTimeframe] = useState<'season' | 'last4' | 'last8'>(showWeeklyView ? 'last4' : 'season');
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [seasons, setSeasons] = useState<string[]>(['2024', '2023', '2022', '2021', '2020']);
  const [selectedSeason, setSelectedSeason] = useState<string>('2024');
  const [comparisonPlayers, setComparisonPlayers] = useState<Player[]>([]);
  const [comparisonData, setComparisonData] = useState<Record<string, any[]>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

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
        return { main: 'rgba(239, 68, 68, 0.8)', light: 'rgba(239, 68, 68, 0.2)' }; // Red
      case 'RB':
        return { main: 'rgba(59, 130, 246, 0.8)', light: 'rgba(59, 130, 246, 0.2)' }; // Blue
      case 'WR':
        return { main: 'rgba(34, 197, 94, 0.8)', light: 'rgba(34, 197, 94, 0.2)' }; // Green
      case 'TE':
        return { main: 'rgba(168, 85, 247, 0.8)', light: 'rgba(168, 85, 247, 0.2)' }; // Purple
      default:
        return { main: 'rgba(99, 102, 241, 0.8)', light: 'rgba(99, 102, 241, 0.2)' }; // Primary
    }
  };

  const colors = getPositionColors();

  // Extract available seasons from stats
  useEffect(() => {
    if (Object.keys(stats).length > 0) {
      const availableSeasons = Object.keys(stats)
        .filter(key => !key.includes('_week_'))
        .sort((a, b) => Number(b) - Number(a));
      
      if (availableSeasons.length > 0) {
        setSeasons(availableSeasons);
        setSelectedSeason(availableSeasons[0]);
      }
    }
  }, [stats]);

  // Prepare weekly data for visualization
  useEffect(() => {
    const prepareWeeklyData = async () => {
      if (!player?.player_id) return;
      
      setIsLoading(true);
      
      try {
        const weeklyStats: any[] = [];
        
        // Check if we already have this data in the stats prop
        for (let week = 1; week <= 17; week++) {
          const existingData = stats[`${selectedSeason}_week_${week}`];
          
          if (existingData) {
            weeklyStats.push({
              season: selectedSeason,
              week,
              ...existingData
            });
          } else {
            // Fetch from API if not available
            try {
              const weekData = await fetchPlayerStats(player.player_id, selectedSeason, week);
              
              if (Object.keys(weekData).length > 0) {
                weeklyStats.push({
                  season: selectedSeason,
                  week,
                  ...weekData
                });
              }
            } catch (error) {
              console.warn(`Error fetching week ${week} data:`, error);
            }
          }
        }
        
        setWeeklyData(weeklyStats);
        
        // Generate AI analysis
        generateAnalysis(weeklyStats, selectedStat);
      } catch (error) {
        console.error('Error preparing weekly data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    prepareWeeklyData();
  }, [player?.player_id, selectedSeason, stats, selectedStat]);

  // Fetch comparison player data
  useEffect(() => {
    const fetchComparisonData = async () => {
      if (comparisonPlayers.length === 0) return;
      
      const newComparisonData: Record<string, any[]> = {};
      
      for (const compPlayer of comparisonPlayers) {
        try {
          const playerWeeklyStats: any[] = [];
          
          for (let week = 1; week <= 17; week++) {
            try {
              const weekData = await fetchPlayerStats(compPlayer.player_id, selectedSeason, week);
              
              if (Object.keys(weekData).length > 0) {
                playerWeeklyStats.push({
                  season: selectedSeason,
                  week,
                  ...weekData
                });
              }
            } catch (error) {
              console.warn(`Error fetching week ${week} data for comparison player:`, error);
            }
          }
          
          newComparisonData[compPlayer.player_id] = playerWeeklyStats;
        } catch (error) {
          console.error(`Error fetching data for comparison player ${compPlayer.player_id}:`, error);
        }
      }
      
      setComparisonData(newComparisonData);
      
      // Update AI analysis with comparison data
      if (Object.keys(newComparisonData).length > 0 && weeklyData.length > 0) {
        generateAnalysis(weeklyData, selectedStat, newComparisonData);
      }
    };
    
    fetchComparisonData();
  }, [comparisonPlayers, selectedSeason]);

  // Filter data based on timeframe
  const getFilteredData = () => {
    let filtered = [...weeklyData];
    
    // Sort by week (ascending)
    filtered.sort((a, b) => a.week - b.week);
    
    // Apply timeframe filter
    if (timeframe === 'last4') {
      filtered = filtered.slice(-4);
    } else if (timeframe === 'last8') {
      filtered = filtered.slice(-8);
    }
    
    return filtered;
  };

  // Get filtered comparison data
  const getFilteredComparisonData = (playerId: string) => {
    if (!comparisonData[playerId]) return [];
    
    let filtered = [...comparisonData[playerId]];
    
    // Sort by week (ascending)
    filtered.sort((a, b) => a.week - b.week);
    
    // Apply timeframe filter
    if (timeframe === 'last4') {
      filtered = filtered.slice(-4);
    } else if (timeframe === 'last8') {
      filtered = filtered.slice(-8);
    }
    
    return filtered;
  };

  // Generate AI analysis
  const generateAnalysis = (
    playerData: any[], 
    statKey: string,
    compData: Record<string, any[]> = {}
  ) => {
    // Get stat values
    const statValues = playerData.map(d => d[statKey] || 0);
    
    // Calculate basic stats
    const avg = statValues.length > 0 ? statValues.reduce((sum, val) => sum + val, 0) / statValues.length : 0;
    const max = statValues.length > 0 ? Math.max(...statValues) : 0;
    const min = statValues.length > 0 ? Math.min(...statValues.filter(v => v > 0)) : 0;
    
    // Calculate trend (simple linear regression)
    const weeks = playerData.map((_, i) => i + 1);
    const n = weeks.length;
    
    if (n < 2) {
      setAiAnalysis(`Not enough data to analyze ${player.first_name} ${player.last_name}'s performance.`);
      return;
    }
    
    const sumX = weeks.reduce((a, b) => a + b, 0);
    const sumY = statValues.reduce((a, b) => a + b, 0);
    const sumXY = weeks.reduce((sum, x, i) => sum + x * statValues[i], 0);
    const sumXX = weeks.reduce((sum, x) => sum + x * x, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    
    // Comparison analysis
    let comparisonText = '';
    if (Object.keys(compData).length > 0) {
      const comparisonResults = [];
      
      for (const compPlayerId of Object.keys(compData)) {
        const compPlayer = comparisonPlayers.find(p => p.player_id === compPlayerId);
        if (!compPlayer) continue;
        
        const compStatValues = compData[compPlayerId].map(d => d[statKey] || 0);
        const compAvg = compStatValues.length > 0 ? compStatValues.reduce((sum, val) => sum + val, 0) / compStatValues.length : 0;
        
        const diff = avg - compAvg;
        const diffPct = compAvg !== 0 ? (diff / compAvg) * 100 : 0;
        
        comparisonResults.push({
          name: `${compPlayer.first_name} ${compPlayer.last_name}`,
          diff,
          diffPct
        });
      }
      
      if (comparisonResults.length > 0) {
        comparisonText = '\n\nComparison Analysis:\n';
        comparisonResults.forEach(result => {
          const diffText = result.diff > 0 
            ? `${result.diff.toFixed(1)} more (${result.diffPct.toFixed(1)}% higher)` 
            : `${Math.abs(result.diff).toFixed(1)} less (${Math.abs(result.diffPct).toFixed(1)}% lower)`;
          
          comparisonText += `- Compared to ${result.name}, ${player.first_name} ${player.last_name} averages ${diffText} ${getAvailableStats().find(s => s.value === statKey)?.label || statKey} per game.\n`;
        });
      }
    }
    
    // Generate analysis text
    const statName = getAvailableStats().find(s => s.value === statKey)?.label || statKey;
    let analysisText = `${player.first_name} ${player.last_name}'s ${statName} Analysis (${selectedSeason} Season):\n\n`;
    
    analysisText += `Average: ${avg.toFixed(1)} per game\n`;
    analysisText += `Peak Performance: ${max.toFixed(1)}\n`;
    
    if (min > 0) {
      analysisText += `Lowest Performance: ${min.toFixed(1)}\n`;
    }
    
    analysisText += `\nPerformance Trend: `;
    if (slope > 0.5) {
      analysisText += `Strongly improving over the season (${slope.toFixed(2)} per week)`;
    } else if (slope > 0.1) {
      analysisText += `Gradually improving over the season (${slope.toFixed(2)} per week)`;
    } else if (slope < -0.5) {
      analysisText += `Significantly declining over the season (${slope.toFixed(2)} per week)`;
    } else if (slope < -0.1) {
      analysisText += `Slightly declining over the season (${slope.toFixed(2)} per week)`;
    } else {
      analysisText += `Relatively consistent performance throughout the season`;
    }
    
    // Add comparison analysis
    analysisText += comparisonText;
    
    setAiAnalysis(analysisText);
  };

  // Check if we have any stats
  const hasStats = weeklyData.length > 0;

  // Search for players to compare
  const searchPlayers = () => {
    if (!searchTerm) return [];
    
    return Object.values(players)
      .filter(p => 
        p.player_id !== player.player_id && 
        p.position === player.position &&
        `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, 5);
  };

  // Add player to comparison
  const addComparisonPlayer = (playerToAdd: Player) => {
    if (comparisonPlayers.some(p => p.player_id === playerToAdd.player_id)) return;
    setComparisonPlayers([...comparisonPlayers, playerToAdd]);
    setSearchTerm('');
    setShowSearch(false);
  };

  // Remove player from comparison
  const removeComparisonPlayer = (playerId: string) => {
    setComparisonPlayers(comparisonPlayers.filter(p => p.player_id !== playerId));
    
    // Also remove from comparison data
    const newComparisonData = { ...comparisonData };
    delete newComparisonData[playerId];
    setComparisonData(newComparisonData);
  };

  // Get position-specific color for comparison players
  const getComparisonColor = (index: number) => {
    const colors = [
      'rgba(234, 179, 8, 0.8)',    // Yellow
      'rgba(236, 72, 153, 0.8)',   // Pink
      'rgba(14, 165, 233, 0.8)',   // Sky
      'rgba(249, 115, 22, 0.8)',   // Orange
      'rgba(139, 92, 246, 0.8)'    // Violet
    ];
    
    return colors[index % colors.length];
  };

  const filteredData = getFilteredData();
  const searchResults = searchPlayers();

  // Calculate trend line data
  const calculateTrendLine = (data: any[]) => {
    const xValues = data.map((_, i) => i);
    const yValues = data.map(d => d[selectedStat] || 0);
    
    // Simple linear regression
    const n = xValues.length;
    if (n < 2) return { x: xValues, y: yValues }; // Not enough points for regression
    
    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
    const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    const trendY = xValues.map(x => slope * x + intercept);
    
    return { x: xValues, y: trendY };
  };

  const trendLine = calculateTrendLine(filteredData);

  // Prepare plot data
  const plotData = [
    // Main player data
    {
      x: filteredData.map(d => `Week ${d.week}`),
      y: filteredData.map(d => d[selectedStat] || 0),
      type: 'scatter',
      mode: 'lines+markers',
      name: `${player.first_name} ${player.last_name}`,
      marker: { color: colors.main, size: 8 },
      line: { color: colors.main, width: 2 }
    },
    // Main player trend line
    {
      x: filteredData.map(d => `Week ${d.week}`),
      y: trendLine.y,
      type: 'scatter',
      mode: 'lines',
      name: 'Trend',
      line: { color: colors.main, width: 1, dash: 'dash' },
      showlegend: false
    },
    // Main player average line
    {
      x: filteredData.map(d => `Week ${d.week}`),
      y: filteredData.map(() => {
        const values = filteredData.map(d => d[selectedStat] || 0);
        return values.reduce((sum, val) => sum + val, 0) / values.length;
      }),
      type: 'scatter',
      mode: 'lines',
      name: 'Average',
      line: { color: 'rgba(107, 114, 128, 0.5)', width: 1, dash: 'dot' },
      fill: 'tonexty',
      fillcolor: colors.light
    }
  ];

  // Add comparison player data
  comparisonPlayers.forEach((compPlayer, index) => {
    const compFilteredData = getFilteredComparisonData(compPlayer.player_id);
    const compColor = getComparisonColor(index);
    
    if (compFilteredData.length > 0) {
      // Comparison player data
      plotData.push({
        x: compFilteredData.map(d => `Week ${d.week}`),
        y: compFilteredData.map(d => d[selectedStat] || 0),
        type: 'scatter',
        mode: 'lines+markers',
        name: `${compPlayer.first_name} ${compPlayer.last_name}`,
        marker: { color: compColor, size: 8 },
        line: { color: compColor, width: 2 }
      });
      
      // Comparison player trend line
      const compTrendLine = calculateTrendLine(compFilteredData);
      plotData.push({
        x: compFilteredData.map(d => `Week ${d.week}`),
        y: compTrendLine.y,
        type: 'scatter',
        mode: 'lines',
        name: `${compPlayer.first_name} Trend`,
        line: { color: compColor, width: 1, dash: 'dash' },
        showlegend: false
      });
    }
  });

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Weekly Performance</h3>
        
        <div className="flex flex-wrap gap-2">
          {getAvailableStats().map(stat => (
            <button
              key={stat.value}
              onClick={() => onStatChange && onStatChange(stat.value)}
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

      <div className="flex flex-wrap justify-between mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setTimeframe('season')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              timeframe === 'season'
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Season
          </button>
          <button
            onClick={() => setTimeframe('last8')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              timeframe === 'last8'
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Last 8
          </button>
          <button
            onClick={() => setTimeframe('last4')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              timeframe === 'last4'
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Last 4
          </button>
        </div>
        
        <div className="flex gap-2">
          {seasons.map(season => (
            <button
              key={season}
              onClick={() => setSelectedSeason(season)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedSeason === season
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {season}
            </button>
          ))}
        </div>
      </div>
      
      {/* Player comparison section */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-700">Player Comparison</h4>
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
          >
            <UserPlus size={16} />
            <span>Add Player</span>
          </button>
        </div>
        
        {showSearch && (
          <div className="mt-2 p-3 bg-gray-50 rounded-lg">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Search ${player.position} players to compare...`}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm"
              />
            </div>
            
            {searchTerm && searchResults.length > 0 && (
              <div className="mt-2 max-h-40 overflow-y-auto">
                {searchResults.map(p => (
                  <div 
                    key={p.player_id}
                    className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                    onClick={() => addComparisonPlayer(p)}
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                        {p.first_name.charAt(0)}{p.last_name.charAt(0)}
                      </div>
                      <span className="ml-2 text-sm">{p.first_name} {p.last_name}</span>
                    </div>
                    <span className="text-xs text-gray-500">{p.team}</span>
                  </div>
                ))}
              </div>
            )}
            
            {searchTerm && searchResults.length === 0 && (
              <div className="mt-2 text-center text-sm text-gray-500 py-2">
                No matching players found
              </div>
            )}
          </div>
        )}
        
        {comparisonPlayers.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {comparisonPlayers.map((p, index) => (
              <div 
                key={p.player_id}
                className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-lg text-sm"
                style={{ borderLeft: `3px solid ${getComparisonColor(index)}` }}
              >
                <span>{p.first_name} {p.last_name}</span>
                <button
                  onClick={() => removeComparisonPlayer(p.player_id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="h-80">
        <Plot
          data={plotData}
          layout={{
            title: {
              text: `${getAvailableStats().find(s => s.value === selectedStat)?.label || selectedStat} Trend - ${selectedSeason}`,
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
              tickangle: -45,
              tickfont: {
                family: 'Inter, system-ui, sans-serif',
                size: 10
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
              tickfont: {
                family: 'Inter, system-ui, sans-serif',
                size: 12
              }
            },
            margin: { l: 60, r: 20, t: 50, b: 100 },
            hovermode: 'closest',
            autosize: true,
            font: {
              family: 'Inter, system-ui, sans-serif'
            },
            legend: {
              orientation: 'h',
              y: -0.2,
              font: {
                family: 'Inter, system-ui, sans-serif',
                size: 12
              }
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
      </div>

      {/* AI Analysis */}
      {aiAnalysis && (
        <div className="mt-6 p-4 bg-primary-50 rounded-lg border border-primary-100">
          <div className="flex items-center mb-2">
            <Brain size={18} className="text-primary-600 mr-2" />
            <h4 className="text-sm font-medium text-primary-700">AI Performance Analysis</h4>
          </div>
          <div className="text-sm text-primary-700 whitespace-pre-line">
            {aiAnalysis}
          </div>
        </div>
      )}

      {/* Weekly Stats Table */}
      {showWeeklyView && (
        <div className="mt-8 overflow-x-auto">
          <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
            <BarChart2 size={18} className="mr-2 text-primary-500" />
            Weekly Stats - {selectedSeason}
          </h4>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Week
                </th>
                {getAvailableStats().map(stat => (
                  <th key={stat.value} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {stat.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((data) => (
                <tr key={data.week} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Week {data.week}
                  </td>
                  {getAvailableStats().map(stat => (
                    <td key={stat.value} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(data[stat.value] || 0).toFixed(1)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};