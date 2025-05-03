import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { TrendingUp, TrendingDown, Filter, Clock } from 'lucide-react';
import { fetchTrendingPlayers } from '../api/sleeperApi';
import { PlayerCard } from '../components/players/PlayerCard';
import { Link } from 'react-router-dom';
import { useSleeperStore } from '../store/sleeperStore';
import { validatePlayer } from '../services/playerRealityValidator';

const TrendingPlayers: React.FC = () => {
  const [timeframe, setTimeframe] = useState<number>(24);
  const [type, setType] = useState<'add' | 'drop'>('add');
  const { players: allPlayers } = useSleeperStore();
  
  const { data: trendingPlayerIds, isLoading } = useQuery(
    ['trending', type, timeframe],
    () => fetchTrendingPlayers('nfl', type, timeframe),
    {
      refetchInterval: 300000, // 5 minutes
      staleTime: 60000, // 1 minute
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-primary-500 rounded-full animate-spin"></div>
        <p className="ml-3 text-gray-600">Loading trending players...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Trending Players</h1>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Clock size={18} className="text-gray-500" />
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(parseInt(e.target.value))}
              className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
            >
              <option value="24">Last 24 Hours</option>
              <option value="48">Last 48 Hours</option>
              <option value="72">Last 72 Hours</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter size={18} className="text-gray-500" />
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'add' | 'drop')}
              className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
            >
              <option value="add">Most Added</option>
              <option value="drop">Most Dropped</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {trendingPlayerIds?.map((playerId) => {
          const player = allPlayers[playerId];
          if (!player) return null;
          
          const validation = validatePlayer(player, {});
          
          return (
            <Link to={`/players/${playerId}`} key={playerId}>
              <PlayerCard 
                player={player}
                isActive={validation.isActive}
              />
            </Link>
          );
        })}
        
        {(!trendingPlayerIds || trendingPlayerIds.length === 0) && (
          <div className="col-span-full bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500">No trending players found.</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendingPlayers;