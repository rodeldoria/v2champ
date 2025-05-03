import React, { useState } from 'react';
import { Twitter, Instagram, MessageCircle, CheckCircle, ExternalLink, Clock, Shield, User } from 'lucide-react';
import { Player } from '../../types/sleeper';

interface SocialMediaFeedProps {
  player: Player;
}

interface SocialPost {
  content: string;
  platform: 'twitter' | 'instagram' | 'reddit';
  author: string;
  timestamp: string;
  url: string;
  verified: boolean;
  type: 'team' | 'player';
}

export const SocialMediaFeed: React.FC<SocialMediaFeedProps> = ({ player }) => {
  const [timeframe, setTimeframe] = useState<'current' | 'lastWeek' | 'lastMonth' | 'lastSeason'>('current');

  // Mock data - in a real app, this would come from an API
  const mockPosts: SocialPost[] = [
    {
      content: `${player?.first_name} ${player?.last_name} looking explosive in offseason workouts. Fantasy managers should take notice. 📈`,
      platform: 'twitter',
      author: 'FantasyPros',
      timestamp: new Date().toISOString(),
      url: 'https://twitter.com/FantasyPros',
      verified: false,
      type: 'player'
    },
    {
      content: `Film study: Breaking down ${player?.first_name} ${player?.last_name}'s performance from last week. Impressive vision and decision-making on display.`,
      platform: 'reddit',
      author: 'NFLAnalyst',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      url: 'https://reddit.com/r/fantasyfootball',
      verified: false,
      type: 'player'
    },
    {
      content: `${player?.team} offensive coordinator discusses plans for ${player?.first_name} ${player?.last_name}'s role in the offense. Expecting increased usage in the red zone.`,
      platform: 'twitter',
      author: 'NFL',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      url: 'https://twitter.com/NFL',
      verified: true,
      type: 'team'
    }
  ];

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return <Twitter size={16} className="text-[#1DA1F2]" />;
      case 'instagram':
        return <Instagram size={16} className="text-[#E4405F]" />;
      case 'reddit':
        return <MessageCircle size={16} className="text-[#FF4500]" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-[#1A1B1E] rounded-lg text-white">
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <MessageCircle size={20} className="text-blue-400" />
          <h2 className="text-lg font-medium">Latest Social Updates</h2>
        </div>

        <div className="flex items-center gap-2">
          <Clock size={16} className="text-gray-400" />
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="bg-[#25262B] text-sm text-gray-300 rounded-lg px-3 py-1.5 border border-gray-700"
          >
            <option value="current">Last Month</option>
            <option value="lastWeek">Last Week</option>
            <option value="lastMonth">Last Month</option>
            <option value="lastSeason">All Time</option>
          </select>
        </div>
      </div>

      <div className="p-4">
        {mockPosts.length > 0 ? (
          <div className="space-y-6">
            {mockPosts.map((post, index) => (
              <div key={index} className="group border border-gray-800 rounded-lg p-4 hover:bg-gray-900/50 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  {getPlatformIcon(post.platform)}
                  <span className="text-sm text-gray-300">{post.author}</span>
                  {post.verified && (
                    <CheckCircle size={14} className="text-blue-400" />
                  )}
                  {post.type === 'team' ? (
                    <Shield size={16} className="text-blue-400" />
                  ) : (
                    <User size={16} className="text-green-400" />
                  )}
                </div>
                
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <p className="text-gray-100 group-hover:text-blue-400 transition-colors">
                    {post.content}
                  </p>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-500">
                      {new Date(post.timestamp).toLocaleDateString()}
                    </span>
                    <ExternalLink size={12} className="text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-8">
            No {timeframe === 'current' ? 'recent' : timeframe.replace('last', 'last ')} social media updates available for {player?.first_name} {player?.last_name}
          </div>
        )}
      </div>

      <div className="px-4 py-3 border-t border-gray-800">
        <p className="text-xs text-gray-500 text-center">
          Note: Social media content may not be verified. Use information at your own discretion.
        </p>
      </div>
    </div>
  );
};