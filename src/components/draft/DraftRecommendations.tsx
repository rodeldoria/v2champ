import React, { useState } from 'react';
import { useDraftStore } from '../../store/draftStore';
import { DraftPlayer } from '../../types/draft';
import { PlayerCard } from './PlayerCard';
import { Shield, Zap, TrendingUp, Star } from 'lucide-react';

interface DraftRecommendationsProps {
  onDraftPlayer?: (player_id: string) => void;
}

export const DraftRecommendations: React.FC<DraftRecommendationsProps> = ({ onDraftPlayer }) => {
  const { recommendations, myNextPick, picks } = useDraftStore();
  const [activeTab, setActiveTab] = useState<'safe' | 'value' | 'boom' | 'breakout' | 'fade'>('safe');
  
  // Get drafted player IDs
  const draftedPlayerIds = picks.map(pick => pick.player_id);
  
  const handleDraft = (player_id: string) => {
    if (onDraftPlayer) {
      onDraftPlayer(player_id);
    }
  };
  
  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'safe':
        return <Shield size={16} />;
      case 'value':
        return <Star size={16} />;
      case 'boom':
        return <Zap size={16} />;
      case 'breakout':
        return <TrendingUp size={16} />;
      case 'fade':
        return <TrendingUp size={16} className="transform rotate-180" />;
      default:
        return null;
    }
  };
  
  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'safe':
        return 'Best Safe Picks';
      case 'value':
        return 'Best Value Picks';
      case 'boom':
        return 'Biggest Boom Potential';
      case 'breakout':
        return 'Best Breakouts';
      case 'fade':
        return 'Fade Zone';
      default:
        return '';
    }
  };
  
  const getTabDescription = (tab: string) => {
    switch (tab) {
      case 'safe':
        return 'Reliable players with consistent production and low bust risk';
      case 'value':
        return 'Players ranked higher than their typical draft position';
      case 'boom':
        return 'High ceiling players who could significantly outperform expectations';
      case 'breakout':
        return 'Players poised for a significant leap in production this season';
      case 'fade':
        return 'Risky players with high bust potential relative to their draft position';
      default:
        return '';
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-800">AI Draft Recommendations</h3>
        {myNextPick && (
          <p className="text-sm text-gray-500 mt-1">
            For your next pick at position {myNextPick}
          </p>
        )}
      </div>
      
      {/* Tab navigation */}
      <div className="flex overflow-x-auto border-b border-gray-200">
        {Object.keys(recommendations).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex items-center px-4 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === tab
                ? 'text-primary-600 border-b-2 border-primary-500'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span className="mr-2">{getTabIcon(tab)}</span>
            <span>{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
          </button>
        ))}
      </div>
      
      {/* Tab content */}
      <div className="p-4">
        <div className="mb-4">
          <h4 className="font-medium text-gray-800">{getTabTitle(activeTab)}</h4>
          <p className="text-sm text-gray-500 mt-1">{getTabDescription(activeTab)}</p>
        </div>
        
        <div className="space-y-3">
          {recommendations[activeTab]?.players
            .filter(player => !draftedPlayerIds.includes(player.player_id))
            .map((player) => (
              <PlayerCard 
                key={player.player_id} 
                player={player} 
                onDraft={handleDraft}
                showDetails={true}
                isDrafted={draftedPlayerIds.includes(player.player_id)}
              />
            ))}
          
          {(!recommendations[activeTab] || 
            recommendations[activeTab].players.filter(player => !draftedPlayerIds.includes(player.player_id)).length === 0) && (
            <p className="text-center text-gray-500 py-4">
              No recommendations available
            </p>
          )}
        </div>
      </div>
    </div>
  );
};