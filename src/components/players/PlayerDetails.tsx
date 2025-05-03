import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Brain, Star, Activity } from 'lucide-react';
import { useSleeperStore } from '../../store/sleeperStore';
import { Player } from '../../types/sleeper';
import { PlayerTabs } from './PlayerTabs';
import { PlayerHeader } from './PlayerHeader';
import { PlayerSeasonSummary } from './PlayerSeasonSummary';
import { AIInsights } from './AIInsights';
import { PlayerAttributes } from './PlayerAttributes';
import { AIScoutNotes } from './AIScoutNotes';
import { PlayerNews } from './PlayerNews';
import { SocialMediaFeed } from './SocialMediaFeed';
import { usePlayerStats } from '../../hooks/usePlayerStats';
import { WideReceiverProcessor } from '../../services/stats/wideReceiverStats';

const PlayerDetails: React.FC = () => {
  const navigate = useNavigate();
  const { playerId } = useParams();
  const { players } = useSleeperStore();
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [scoringFormat] = useState('ppr');

  // Get player data
  const player = playerId ? players[playerId] : null;
  const { currentStats } = usePlayerStats(playerId);

  // Process WR stats if applicable
  const wrProcessor = new WideReceiverProcessor();
  const processedStats = player?.position === 'WR' ? 
    wrProcessor.processStats(currentStats || {}) : null;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="sticky top-0 z-50 bg-gray-100 px-4 py-2 md:px-0 md:py-0 md:static md:bg-transparent">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 rounded-full bg-white shadow-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Player Header */}
          <PlayerHeader player={player} stats={currentStats || {}} />

          {/* AI Insights Toggle */}
          <button
            onClick={() => setShowAIInsights(!showAIInsights)}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${
              showAIInsights ? 'bg-primary-50 text-primary-700' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Brain size={20} />
            <span className="font-medium">
              {showAIInsights ? 'Hide AI Insights' : 'Show AI Insights'}
            </span>
          </button>

          {/* AI Insights */}
          {showAIInsights && player && (
            <AIInsights 
              player={player} 
              stats={currentStats}
              onClose={() => setShowAIInsights(false)}
            />
          )}

          {/* Season Summary */}
          <PlayerSeasonSummary stats={currentStats || {}} />

          {/* Player Attributes */}
          <PlayerAttributes player={player} stats={currentStats} />

          {/* Stats and Analysis */}
          <PlayerTabs 
            player={player}
            weeklyStats={currentStats}
            projections={null}
            careerStats={{}}
            scoringType={scoringFormat}
          />
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4 hidden lg:block">
          <PlayerNews player={player} />
          <SocialMediaFeed player={player} />
          <AIScoutNotes player={player} stats={currentStats} />
        </div>
      </div>
    </div>
  );
};

export default PlayerDetails;