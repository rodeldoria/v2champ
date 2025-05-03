import React, { useState, useEffect } from 'react';
import { Player } from '../../types/sleeper';
import { supabase } from '../../lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Shield, Star, TrendingUp, TrendingDown, Zap, Brain, Target, Activity } from 'lucide-react';

interface PlayerStatsProps {
  player: Player;
  season?: string;
  week?: number;
}

export const PlayerStats: React.FC<PlayerStatsProps> = ({ 
  player, 
  season = '2024', 
  week = 1 
}) => {
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<any[]>([]);
  const [comparisonStats, setComparisonStats] = useState<any[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<string>('fantasy_points');

  useEffect(() => {
    const fetchStats = async () => {
      if (!player?.player_id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch from nfl_player_stats table
        const { data, error } = await supabase
          .from('nfl_player_stats')
          .select('stats')
          .eq('player_id', player.player_id)
          .eq('season', season)
          .eq('week', week)
          .single();
        
        if (error) {
          // If not found in our database, try to fetch from Sleeper API
          const response = await fetch(
            `https://api.sleeper.app/v1/stats/nfl/regular/${season}/${week}?player_id=${player.player_id}`
          );
          
          if (response.ok) {
            const apiData = await response.json();
            if (apiData[player.player_id]) {
              setStats(apiData[player.player_id]);
              
              // Store in our database for future use
              await supabase
                .from('nfl_player_stats')
                .upsert({
                  player_id: player.player_id,
                  season,
                  week,
                  stats: apiData[player.player_id],
                  last_sync: new Date().toISOString()
                });
            } else {
              setStats({});
            }
          } else {
            throw new Error('Failed to fetch stats from API');
          }
        } else if (data) {
          setStats(data.stats);
        }
        
        // Fetch weekly stats for the season
        await fetchWeeklyStats(player.player_id, season);
        
        // Fetch comparison stats (players in same position)
        await fetchComparisonStats(player.position, season);
        
      } catch (err) {
        console.error('Error fetching player stats:', err);
        setError('Failed to load player statistics');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [player?.player_id, season, week]);
  
  const fetchWeeklyStats = async (playerId: string, season: string) => {
    try {
      const { data, error } = await supabase
        .from('nfl_player_stats')
        .select('week, stats')
        .eq('player_id', playerId)
        .eq('season', season)
        .order('week');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const weeklyData = data.map(item => ({
          week: `Week ${item.week}`,
          fantasy_points: calculateFantasyPoints(item.stats),
          ...item.stats
        }));
        
        setWeeklyStats(weeklyData);
      } else {
        // If no data in our database, try to fetch from API for a few weeks
        const weeklyData = [];
        for (let w = 1; w <= 4; w++) {
          try {
            const response = await fetch(
              `https://api.sleeper.app/v1/stats/nfl/regular/${season}/${w}?player_id=${playerId}`
            );
            
            if (response.ok) {
              const apiData = await response.json();
              if (apiData[playerId]) {
                weeklyData.push({
                  week: `Week ${w}`,
                  fantasy_points: calculateFantasyPoints(apiData[playerId]),
                  ...apiData[playerId]
                });
                
                // Store in our database for future use
                await supabase
                  .from('nfl_player_stats')
                  .upsert({
                    player_id: playerId,
                    season,
                    week: w,
                    stats: apiData[playerId],
                    last_sync: new Date().toISOString()
                  });
              }
            }
          } catch (err) {
            console.error(`Error fetching week ${w} stats:`, err);
          }
        }
        
        setWeeklyStats(weeklyData);
      }
    } catch (err) {
      console.error('Error fetching weekly stats:', err);
    }
  };
  
  const fetchComparisonStats = async (position: string | undefined, season: string) => {
    if (!position) return;
    
    try {
      // Get top 5 players in the same position
      const { data, error } = await supabase
        .from('cached_players')
        .select('id, first_name, last_name')
        .eq('position', position)
        .limit(5);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const comparisonData = [];
        
        for (const player of data) {
          // Get average stats for the season
          const { data: statsData } = await supabase
            .from('nfl_player_stats')
            .select('stats')
            .eq('player_id', player.id)
            .eq('season', season);
          
          if (statsData && statsData.length > 0) {
            // Calculate average fantasy points
            const totalPoints = statsData.reduce((sum, item) => sum + calculateFantasyPoints(item.stats), 0);
            const avgPoints = totalPoints / statsData.length;
            
            comparisonData.push({
              name: `${player.first_name} ${player.last_name}`,
              fantasy_points: avgPoints
            });
          }
        }
        
        setComparisonStats(comparisonData);
      }
    } catch (err) {
      console.error('Error fetching comparison stats:', err);
    }
  };
  
  const calculateFantasyPoints = (stats: Record<string, number>): number => {
    if (!stats) return 0;
    
    let points = 0;
    
    // Passing
    points += (stats.pass_yd || 0) * 0.04;
    points += (stats.pass_td || 0) * 4;
    points += (stats.pass_int || 0) * -1;
    
    // Rushing
    points += (stats.rush_yd || 0) * 0.1;
    points += (stats.rush_td || 0) * 6;
    
    // Receiving (PPR)
    points += (stats.rec || 0) * 1;
    points += (stats.rec_yd || 0) * 0.1;
    points += (stats.rec_td || 0) * 6;
    
    return points;
  };
  
  const getRelevantMetrics = () => {
    switch (player.position) {
      case 'QB':
        return [
          { id: 'fantasy_points', name: 'Fantasy Points' },
          { id: 'pass_yd', name: 'Passing Yards' },
          { id: 'pass_td', name: 'Passing TDs' },
          { id: 'pass_int', name: 'Interceptions' },
          { id: 'rush_yd', name: 'Rushing Yards' }
        ];
      case 'RB':
        return [
          { id: 'fantasy_points', name: 'Fantasy Points' },
          { id: 'rush_yd', name: 'Rushing Yards' },
          { id: 'rush_td', name: 'Rushing TDs' },
          { id: 'rec', name: 'Receptions' },
          { id: 'rec_yd', name: 'Receiving Yards' }
        ];
      case 'WR':
      case 'TE':
        return [
          { id: 'fantasy_points', name: 'Fantasy Points' },
          { id: 'rec', name: 'Receptions' },
          { id: 'targets', name: 'Targets' },
          { id: 'rec_yd', name: 'Receiving Yards' },
          { id: 'rec_td', name: 'Receiving TDs' }
        ];
      default:
        return [
          { id: 'fantasy_points', name: 'Fantasy Points' }
        ];
    }
  };

  if (loading) {
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

  const fantasyPoints = calculateFantasyPoints(stats);

  return (
    <div className="space-y-6">
      {/* Fantasy Points Summary */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Fantasy Performance</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-primary-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Star className="text-primary-500 mr-2" size={20} />
                <span className="font-medium text-gray-700">Fantasy Points</span>
              </div>
              <span className="text-2xl font-bold text-primary-700">{fantasyPoints.toFixed(1)}</span>
            </div>
            <p className="text-sm text-gray-500">
              {fantasyPoints > 20 ? 'Excellent performance' : 
               fantasyPoints > 15 ? 'Good performance' : 
               fantasyPoints > 10 ? 'Average performance' : 
               'Below average performance'}
            </p>
          </div>
          
          {player.position === 'QB' && (
            <>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Target className="text-blue-500 mr-2" size={20} />
                    <span className="font-medium text-gray-700">Passing</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-700">
                    {stats.pass_yd ? stats.pass_yd.toFixed(0) : '0'}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {stats.pass_td || 0} TD, {stats.pass_int || 0} INT
                </p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Zap className="text-green-500 mr-2" size={20} />
                    <span className="font-medium text-gray-700">Rushing</span>
                  </div>
                  <span className="text-2xl font-bold text-green-700">
                    {stats.rush_yd ? stats.rush_yd.toFixed(0) : '0'}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {stats.rush_att || 0} att, {stats.rush_td || 0} TD
                </p>
              </div>
            </>
          )}
          
          {player.position === 'RB' && (
            <>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Zap className="text-blue-500 mr-2" size={20} />
                    <span className="font-medium text-gray-700">Rushing</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-700">
                    {stats.rush_yd ? stats.rush_yd.toFixed(0) : '0'}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {stats.rush_att || 0} att, {stats.rush_td || 0} TD
                </p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Target className="text-green-500 mr-2" size={20} />
                    <span className="font-medium text-gray-700">Receiving</span>
                  </div>
                  <span className="text-2xl font-bold text-green-700">
                    {stats.rec_yd ? stats.rec_yd.toFixed(0) : '0'}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {stats.rec || 0} rec, {stats.rec_td || 0} TD
                </p>
              </div>
            </>
          )}
          
          {(player.position === 'WR' || player.position === 'TE') && (
            <>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Target className="text-green-500 mr-2" size={20} />
                    <span className="font-medium text-gray-700">Receiving</span>
                  </div>
                  <span className="text-2xl font-bold text-green-700">
                    {stats.rec_yd ? stats.rec_yd.toFixed(0) : '0'}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {stats.rec || 0} rec, {stats.rec_td || 0} TD
                </p>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Activity className="text-purple-500 mr-2" size={20} />
                    <span className="font-medium text-gray-700">Efficiency</span>
                  </div>
                  <span className="text-2xl font-bold text-purple-700">
                    {stats.targets ? ((stats.rec || 0) / stats.targets * 100).toFixed(1) + '%' : 'N/A'}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {stats.targets || 0} targets
                </p>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Weekly Performance Chart */}
      {weeklyStats.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Weekly Performance</h3>
            
            <div className="flex gap-2">
              {getRelevantMetrics().map(metric => (
                <button
                  key={metric.id}
                  onClick={() => setSelectedMetric(metric.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium ${
                    selectedMetric === metric.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {metric.name}
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={weeklyStats}
                margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="week" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  formatter={(value) => [`${value}`, selectedMetric === 'fantasy_points' ? 'Fantasy Points' : getRelevantMetrics().find(m => m.id === selectedMetric)?.name || '']}
                  labelFormatter={(label) => `${label}`}
                />
                <Bar 
                  dataKey={selectedMetric} 
                  fill={
                    player.position === 'QB' ? '#ef4444' :
                    player.position === 'RB' ? '#3b82f6' :
                    player.position === 'WR' ? '#22c55e' :
                    player.position === 'TE' ? '#a855f7' :
                    '#6366f1'
                  }
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      
      {/* Position Comparison */}
      {comparisonStats.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Position Comparison</h3>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={comparisonStats}
                margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" />
                <YAxis 
                  dataKey="name" 
                  type="category"
                  tick={{ fontSize: 12 }}
                  width={120}
                />
                <Tooltip 
                  formatter={(value) => [`${value.toFixed(1)}`, 'Fantasy Points']}
                />
                <Legend />
                <Bar 
                  dataKey="fantasy_points" 
                  name="Avg. Fantasy Points"
                  fill={
                    player.position === 'QB' ? '#ef4444' :
                    player.position === 'RB' ? '#3b82f6' :
                    player.position === 'WR' ? '#22c55e' :
                    player.position === 'TE' ? '#a855f7' :
                    '#6366f1'
                  }
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      
      {/* Detailed Stats Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 md:px-6 py-4 bg-gray-50 border-l-4 border-primary-500">
          <h3 className="font-semibold text-gray-800">Detailed Statistics</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statistic
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(stats).map(([key, value]) => (
                <tr key={key} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatStatName(key)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {typeof value === 'number' ? value.toFixed(1) : value.toString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

function formatStatName(key: string): string {
  return key
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}