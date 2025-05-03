import React, { useState, useEffect } from 'react';
import { Player } from '../../types/sleeper';
import { getNFLPlayerStats, getNFLPlayerAdvancedMetrics } from '../../services/nflDataService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Activity, TrendingUp, Target, Zap, RefreshCw } from 'lucide-react';

interface NFLAdvancedStatsProps {
  player: Player;
  season?: string;
}

export const NFLAdvancedStats: React.FC<NFLAdvancedStatsProps> = ({ 
  player,
  season = '2023'
}) => {
  const [stats, setStats] = useState<Record<string, any> | null>(null);
  const [advancedMetrics, setAdvancedMetrics] = useState<Record<string, any> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<string>('epa');

  useEffect(() => {
    const fetchData = async () => {
      if (!player?.player_id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch basic stats
        const playerStats = await getNFLPlayerStats(player.player_id, season);
        setStats(playerStats);
        
        // Fetch advanced metrics
        const metrics = await getNFLPlayerAdvancedMetrics(player.player_id, season);
        setAdvancedMetrics(metrics);
      } catch (error) {
        console.error('Error fetching NFL data:', error);
        setError('Failed to load NFL advanced statistics');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [player?.player_id, season]);

  // Get position-specific metrics
  const getPositionMetrics = () => {
    switch (player?.position) {
      case 'QB':
        return [
          { id: 'epa', name: 'EPA per Play', icon: <Activity /> },
          { id: 'cpoe', name: 'CPOE', icon: <Target /> },
          { id: 'air_yards', name: 'Air Yards', icon: <Zap /> },
          { id: 'adot', name: 'aDOT', icon: <TrendingUp /> }
        ];
      case 'RB':
        return [
          { id: 'ryoe', name: 'RYOE', icon: <Activity /> },
          { id: 'broken_tackles', name: 'Broken Tackles', icon: <Zap /> },
          { id: 'yac', name: 'YAC', icon: <TrendingUp /> },
          { id: 'success_rate', name: 'Success Rate', icon: <Target /> }
        ];
      case 'WR':
      case 'TE':
        return [
          { id: 'yprr', name: 'YPRR', icon: <Activity /> },
          { id: 'separation', name: 'Separation', icon: <Target /> },
          { id: 'contested_catch', name: 'Contested Catch %', icon: <Zap /> },
          { id: 'target_share', name: 'Target Share', icon: <TrendingUp /> }
        ];
      default:
        return [
          { id: 'epa', name: 'EPA', icon: <Activity /> },
          { id: 'fantasy_points', name: 'Fantasy Points', icon: <TrendingUp /> }
        ];
    }
  };

  // Prepare chart data
  const prepareChartData = () => {
    if (!advancedMetrics) return [];
    
    // Get weekly data for the selected metric
    const weeklyData = [];
    for (let week = 1; week <= 17; week++) {
      const weekKey = `week_${week}`;
      if (advancedMetrics[weekKey] && advancedMetrics[weekKey][selectedMetric] !== undefined) {
        weeklyData.push({
          week: `Week ${week}`,
          value: advancedMetrics[weekKey][selectedMetric],
          avg: advancedMetrics[`${selectedMetric}_avg`] || 0
        });
      }
    }
    
    return weeklyData;
  };

  // Get position-specific colors
  const getPositionColor = () => {
    switch (player?.position) {
      case 'QB':
        return '#ef4444'; // Red
      case 'RB':
        return '#3b82f6'; // Blue
      case 'WR':
        return '#22c55e'; // Green
      case 'TE':
        return '#a855f7'; // Purple
      default:
        return '#6366f1'; // Primary
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-primary-500 mr-3" />
        <span className="text-gray-600">Loading NFL advanced statistics...</span>
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

  if (!stats && !advancedMetrics) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center text-gray-500">
        No NFL advanced statistics available for this player
      </div>
    );
  }

  const chartData = prepareChartData();
  const positionColor = getPositionColor();
  const metrics = getPositionMetrics();

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-800">NFL Advanced Statistics</h3>
        <p className="text-sm text-gray-500 mt-1">
          Powered by nflfastR data
        </p>
      </div>
      
      <div className="p-4">
        {/* Metric selector */}
        <div className="flex flex-wrap gap-2 mb-6">
          {metrics.map(metric => (
            <button
              key={metric.id}
              onClick={() => setSelectedMetric(metric.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedMetric === metric.id
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {metric.icon}
              <span>{metric.name}</span>
            </button>
          ))}
        </div>
        
        {/* Chart */}
        {chartData.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="value" 
                  name={metrics.find(m => m.id === selectedMetric)?.name || selectedMetric} 
                  fill={positionColor} 
                />
                <Bar 
                  dataKey="avg" 
                  name="League Average" 
                  fill="#9ca3af" 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No data available for the selected metric
          </div>
        )}
        
        {/* Summary stats */}
        {advancedMetrics && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {metrics.map(metric => {
              const value = advancedMetrics[metric.id];
              const avg = advancedMetrics[`${metric.id}_avg`];
              const percentile = advancedMetrics[`${metric.id}_percentile`];
              
              return (
                <div key={metric.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-primary-500">{metric.icon}</div>
                    <h4 className="font-medium text-gray-700">{metric.name}</h4>
                  </div>
                  
                  <div className="text-2xl font-bold text-gray-800">
                    {value !== undefined ? value.toFixed(2) : 'N/A'}
                  </div>
                  
                  {avg !== undefined && (
                    <div className="text-sm text-gray-500 mt-1">
                      League Avg: {avg.toFixed(2)}
                    </div>
                  )}
                  
                  {percentile !== undefined && (
                    <div className="mt-2">
                      <div className="text-xs text-gray-500 mb-1">Percentile: {percentile}%</div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary-500 rounded-full"
                          style={{ width: `${percentile}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 text-center">
          Data provided by nflfastR. Last updated: {advancedMetrics?.last_updated ? new Date(advancedMetrics.last_updated).toLocaleDateString() : 'Unknown'}
        </div>
      </div>
    </div>
  );
};