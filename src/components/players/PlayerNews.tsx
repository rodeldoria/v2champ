import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { Clock, ExternalLink, CheckCircle, Shield, User, RefreshCw } from 'lucide-react';
import { Player } from '../../types/sleeper';
import { getPlayerNews } from '../../services/perplexityService';

interface PlayerNewsProps {
  player: Player;
}

export const PlayerNews: React.FC<PlayerNewsProps> = ({ player }) => {
  const [timeframe, setTimeframe] = useState<'current' | 'lastWeek' | 'lastMonth' | 'lastSeason'>('current');
  const [displayText, setDisplayText] = useState('');
  const [currentArticleIndex, setCurrentArticleIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);

  const { data: news, isLoading, error, refetch } = useQuery(
    ['playerNews', player.player_id, timeframe],
    () => getPlayerNews(player),
    {
      refetchInterval: 300000, // 5 minutes
      staleTime: 60000, // 1 minute
      retry: 2
    }
  );

  useEffect(() => {
    if (!news || news.length === 0) return;

    const article = news[currentArticleIndex];
    if (!article) return;

    const text = article.summary;
    
    if (currentCharIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentCharIndex]);
        setCurrentCharIndex(prev => prev + 1);
      }, 30); // Adjust speed here

      return () => clearTimeout(timer);
    } else if (currentArticleIndex < news.length - 1) {
      const timer = setTimeout(() => {
        setCurrentArticleIndex(prev => prev + 1);
        setCurrentCharIndex(0);
        setDisplayText('');
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [news, currentArticleIndex, currentCharIndex]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-4 h-4 rounded-full bg-primary-500 animate-pulse"></div>
          <p className="text-gray-500">Loading news updates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg p-6">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Unable to load news updates</p>
          <button 
            onClick={() => refetch()}
            className="inline-flex items-center px-4 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100"
          >
            <RefreshCw size={16} className="mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-4">
        <h2 className="text-xl font-semibold text-white">Latest News & Updates</h2>
      </div>

      <div className="border-b border-gray-200">
        <div className="flex items-center justify-end p-4">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-gray-400" />
            <select
              value={timeframe}
              onChange={(e) => {
                setTimeframe(e.target.value as any);
                setCurrentArticleIndex(0);
                setCurrentCharIndex(0);
                setDisplayText('');
              }}
              className="bg-gray-50 text-sm text-gray-700 rounded-lg px-3 py-1.5 border border-gray-200"
            >
              <option value="current">Last Month</option>
              <option value="lastWeek">Last Week</option>
              <option value="lastMonth">Last Month</option>
              <option value="lastSeason">All Time</option>
            </select>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {news?.length > 0 ? (
          <div className="p-4">
            {/* Current article with typewriter effect */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                {news[currentArticleIndex].type === 'team' ? (
                  <Shield size={16} className="text-blue-500" />
                ) : (
                  <User size={16} className="text-green-500" />
                )}
                <span className="text-sm text-gray-500">
                  {news[currentArticleIndex].type === 'team' ? 'Team News' : 'Player Update'}
                </span>
                {news[currentArticleIndex].verified && (
                  <CheckCircle size={14} className="text-primary-500" />
                )}
              </div>

              <div className="min-h-[100px]">
                <p className="text-gray-800 font-mono">
                  {displayText}
                  <span className="animate-pulse">|</span>
                </p>
              </div>

              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                <span>{new Date(news[currentArticleIndex].date).toLocaleDateString()}</span>
                <span>•</span>
                <span>{news[currentArticleIndex].source}</span>
              </div>
            </div>

            {/* Progress indicator */}
            <div className="flex justify-center gap-2 mt-4">
              {news.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentArticleIndex ? 'bg-primary-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            No {timeframe === 'current' ? 'recent' : timeframe.replace('last', 'last ')} news available
          </div>
        )}
      </div>
    </div>
  );
};