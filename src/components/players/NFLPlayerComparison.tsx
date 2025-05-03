import React, { useState, useEffect } from 'react';
import { Player } from '../../types/sleeper';
import { getNFLPlayerStats, searchNFLPlayers } from '../../services/nflDataService';
import { Search, X, RefreshCw, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';

interface NFLPlayerComparisonProps {
  player: Player;
  season?: string;
}

export const NFLPlayerComparison: React.FC<NFLPlayerComparisonProps> = ({ 
  player,
  season = '2023'
}) => {
  const [comparisonPlayers, setComparisonPlayers] = useState<Player[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Player[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [playerStats, setPlayerStats] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);

  // Load player stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!player?.player_id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch stats for main player
        const mainPlayerStats = await getNFLPlayerStats(player.player_id, season);
        
        if (mainPlayerStats) {
          setPlayerStats({
            [player.player_id]: mainPlayerStats
          });
        }
        
        // Fetch stats for comparison players
        for (const compPlayer of comparisonPlayers) {
          const compStats = await getNFLPlayerStats(compPlayer.player_id, season);
          
          if (compStats) {
            setPlayerStats(prev => ({
              ...prev,
              [compPlayer.player_id]: compStats
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching player stats:', error);
        setError('Failed to load player statistics');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, [player?.player_id, comparisonPlayers, season]);

  // Handle search
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    
    try {
      const results = await searchNFLPlayers(searchTerm);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching players:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Add comparison player
  const addComparisonPlayer = (playerToAdd: Player) => {
    if (comparisonPlayers.some(p => p.player_id === playerToAdd.player_id)) return;
    if (comparisonPlayers.length >= 3) {
      // Remove the oldest player
      setComparisonPlayers(prev => [...prev.slice(1), playerToAdd]);
    } else {
      setComparisonPlayers(prev => [...prev, playerToAdd]);
    }
    setSearchTerm('');
    setSearchResults([]);
  };

  // Remove comparison player
  const removeComparisonPlayer = (playerId: string) => {
    setComparisonPlayers(prev => prev.filter(p => p.player_id !== playerId));
  };

  // Get position-specific metrics for radar chart
  const getPositionMetrics = () => {
    switch (player?.position) {
      case 'QB':
        return [
          { key: 'passing_yards', name: 'Pass Yards' },
          { key: 'passing_tds', name: 'Pass TDs' },
          { key: 'passing_ints', name: 'INTs', inverse: true },
          { key: 'rushing_yards', name: 'Rush Yards' },
          { key: 'fantasy_points', name: 'Fantasy Pts' }
        ];
      case 'RB':
        return [
          { key: 'rushing_yards', name: 'Rush Yards' },
          { key: 'rushing_tds', name: 'Rush TDs' },
          { key: 'receptions', name: 'Receptions' },
          { key: 'receiving_yards', name: 'Rec Yards' },
          { key: 'fantasy_points_ppr', name: 'PPR Pts' }
        ];
      case 'WR':
      case 'TE':
        return [
          { key: 'receptions', name: 'Receptions' },
          { key: 'targets', name: 'Targets' },
          { key: 'receiving_yards', name: 'Rec Yards' },
          { key: 'receiving_tds', name: 'Rec TDs' },
          { key: 'fantasy_points_ppr', name: 'PPR Pts' }
        ];
      default:
        return [
          { key: 'fantasy_points', name: 'Fantasy Pts' }
        ];
    }
  };

  // Prepare radar chart data
  const prepareRadarData = () => {
    const metrics = getPositionMetrics();
    const allPlayerIds = [player.player_id, ...comparisonPlayers.map(p => p.player_id)];
    
    // Find max values for each metric
    const maxValues: Record<string, number> = {};
    metrics.forEach(metric => {
      maxValues[metric.key] = Math.max(
        ...allPlayerIds.map(id => {
          const value = playerStats[id]?.[metric.key] || 0;
          return metric.inverse ? 1 / (value || 1) : value;
        })
      );
    });
    
    // Normalize data for radar chart
    return metrics.map(metric => {
      const data: Record<string, any> = {
        metric: metric.name
      };
      
      allPlayerIds.forEach(id => {
        const value = playerStats[id]?.[metric.key] || 0;
        const normalizedValue = maxValues[metric.key] === 0 ? 0 : 
          (metric.inverse ? 1 / (value || 1) : value) / maxValues[metric.key] * 100;
        
        // Use player_id as key
        data[id] = normalizedValue;
      });
      
      return data;
    });
  };

  // Get position-specific colors
  const getPlayerColor = (position?: string) => {
    switch (position) {
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

  // Get player name for display
  const getPlayerName = (playerId: string) => {
    if (playerId === player.player_id) {
      return `${player.first_name} ${player.last_name}`;
    }
    
    const compPlayer = comparisonPlayers.find(p => p.player_id === playerId);
    return compPlayer ? `${compPlayer.first_name} ${compPlayer.last_name}` : 'Unknown Player';
  };

  const radarData = prepareRadarData();
  const metrics = getPositionMetrics();

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">NFL Player Comparison</h3>
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="px-3 py-1.5 bg-primary-50 text-primary-600 rounded-lg text-sm font-medium hover:bg-primary-100 transition-colors flex items-center gap-2"
          >
            <Search size={16} />
            <span>{showSearch ? 'Hide Search' : 'Add Player'}</span>
          </button>
        </div>
      </div>
      
      {/* Search section */}
      {showSearch && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex gap-2">
            <div className="relative flex-grow">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search players to compare..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching || !searchTerm.trim()}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                isSearching || !searchTerm.trim()
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-primary-500 text-white hover:bg-primary-600'
              }`}
            >
              {isSearching ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                'Search'
              )}
            </button>
          </div>
          
          {/* Search results */}
          {searchResults.length > 0 && (
            <div className="mt-3 max-h-60 overflow-y-auto">
              <div className="space-y-2">
                {searchResults.map(result => (
                  <div
                    key={result.player_id}
                    className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
                    onClick={() => addComparisonPlayer(result)}
                  >
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                        result.position === 'QB' ? 'bg-red-100 text-red-800' :
                        result.position === 'RB' ? 'bg-blue-100 text-blue-800' :
                        result.position === 'WR' ? 'bg-green-100 text-green-800' :
                        result.position === 'TE' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {result.position}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-800">{result.first_name} {result.last_name}</p>
                        <p className="text-xs text-gray-500">{result.team}</p>
                      </div>
                    </div>
                    <button className="text-primary-500 hover:text-primary-600">
                      <TrendingUp size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {searchTerm && searchResults.length === 0 && !isSearching && (
            <div className="mt-3 text-center text-sm text-gray-500 py-2">
              No players found matching your search
            </div>
          )}
        </div>
      )}
      
      {/* Comparison players */}
      {comparisonPlayers.length > 0 && (
        <div className="p-4 border-b border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Comparing With</h4>
          <div className="flex flex-wrap gap-2">
            {comparisonPlayers.map(compPlayer => (
              <div
                key={compPlayer.player_id}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg"
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  compPlayer.position === 'QB' ? 'bg-red-100 text-red-800' :
                  compPlayer.position === 'RB' ? 'bg-blue-100 text-blue-800' :
                  compPlayer.position === 'WR' ? 'bg-green-100 text-green-800' :
                  compPlayer.position === 'TE' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {compPlayer.position}
                </div>
                <span className="text-sm font-medium text-gray-700">{compPlayer.first_name} {compPlayer.last_name}</span>
                <button
                  onClick={() => removeComparisonPlayer(compPlayer.player_id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Comparison chart */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-6 h-6 animate-spin text-primary-500 mr-3" />
            <span className="text-gray-600">Loading comparison data...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-gray-500">
            {error}
          </div>
        ) : Object.keys(playerStats).length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                
                {/* Main player */}
                <Radar
                  name={getPlayerName(player.player_id)}
                  dataKey={player.player_id}
                  stroke={getPlayerColor(player.position)}
                  fill={getPlayerColor(player.position)}
                  fillOpacity={0.6}
                />
                
                {/* Comparison players */}
                {comparisonPlayers.map((compPlayer, index) => (
                  <Radar
                    key={compPlayer.player_id}
                    name={getPlayerName(compPlayer.player_id)}
                    dataKey={compPlayer.player_id}
                    stroke={getPlayerColor(compPlayer.position)}
                    fill={getPlayerColor(compPlayer.position)}
                    fillOpacity={0.4}
                  />
                ))}
                
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No comparison data available
          </div>
        )}
        
        {/* Stats comparison table */}
        {Object.keys(playerStats).length > 0 && (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Player
                  </th>
                  {metrics.map(metric => (
                    <th key={metric.key} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {metric.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Main player */}
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                        player.position === 'QB' ? 'bg-red-100 text-red-800' :
                        player.position === 'RB' ? 'bg-blue-100 text-blue-800' :
                        player.position === 'WR' ? 'bg-green-100 text-green-800' :
                        player.position === 'TE' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {player.position}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-800">{player.first_name} {player.last_name}</p>
                        <p className="text-xs text-gray-500">{player.team}</p>
                      </div>
                    </div>
                  </td>
                  {metrics.map(metric => (
                    <td key={metric.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {playerStats[player.player_id]?.[metric.key]?.toFixed(1) || 'N/A'}
                    </td>
                  ))}
                </tr>
                
                {/* Comparison players */}
                {comparisonPlayers.map(compPlayer => (
                  <tr key={compPlayer.player_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                          compPlayer.position === 'QB' ? 'bg-red-100 text-red-800' :
                          compPlayer.position === 'RB' ? 'bg-blue-100 text-blue-800' :
                          compPlayer.position === 'WR' ? 'bg-green-100 text-green-800' :
                          compPlayer.position === 'TE' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {compPlayer.position}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-800">{compPlayer.first_name} {compPlayer.last_name}</p>
                          <p className="text-xs text-gray-500">{compPlayer.team}</p>
                        </div>
                      </div>
                    </td>
                    {metrics.map(metric => {
                      const mainValue = playerStats[player.player_id]?.[metric.key] || 0;
                      const compValue = playerStats[compPlayer.player_id]?.[metric.key] || 0;
                      const diff = compValue - mainValue;
                      const diffPercentage = mainValue ? (diff / mainValue) * 100 : 0;
                      
                      return (
                        <td key={metric.key} className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {compValue.toFixed(1) || 'N/A'}
                          </div>
                          {mainValue > 0 && compValue > 0 && (
                            <div className="flex items-center mt-1">
                              {diff > 0 ? (
                                <TrendingUp size={12} className="text-green-500 mr-1" />
                              ) : diff < 0 ? (
                                <TrendingDown size={12} className="text-red-500 mr-1" />
                              ) : (
                                <Minus size={12} className="text-gray-400 mr-1" />
                              )}
                              <span className={`text-xs ${
                                diff > 0 ? 'text-green-600' :
                                diff < 0 ? 'text-red-600' :
                                'text-gray-500'
                              }`}>
                                {diff > 0 ? '+' : ''}{diffPercentage.toFixed(1)}%
                              </span>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 text-center">
          Data provided by nflfastR. Comparison based on {season} season statistics.
        </div>
      </div>
    </div>
  );
};