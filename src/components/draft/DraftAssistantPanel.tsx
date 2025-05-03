import React, { useState, useEffect } from 'react';
import { useDraftStore } from '../../store/draftStore';
import { useSleeperStore } from '../../store/sleeperStore';
import { useDraftAssistant } from '../../hooks/useDraftAssistant';
import { DraftPlayer } from '../../types/draft';
import { Brain, Star, Shield, Zap, TrendingUp, ChevronRight } from 'lucide-react';

interface DraftAssistantPanelProps {
  onDraftPlayer?: (player_id: string) => void;
}

export const DraftAssistantPanel: React.FC<DraftAssistantPanelProps> = ({ onDraftPlayer }) => {
  const { availablePlayers, picks, myDraftPosition, currentPick } = useDraftStore();
  const { recommendations, isLoading, generateRecommendations } = useDraftAssistant();
  const [selectedStrategy, setSelectedStrategy] = useState<string>('balanced');
  const [showStrategies, setShowStrategies] = useState(false);

  // Draft strategies
  const strategies = [
    { id: 'balanced', name: 'Balanced Approach', icon: <Star className="text-yellow-500" /> },
    { id: 'zero-rb', name: 'Zero RB', icon: <Zap className="text-green-500" /> },
    { id: 'hero-rb', name: 'Hero RB', icon: <Shield className="text-blue-500" /> },
    { id: 'robust-rb', name: 'Robust RB', icon: <TrendingUp className="text-purple-500" /> },
    { id: 'value', name: 'Value-Based', icon: <Brain className="text-primary-500" /> }
  ];

  // Generate recommendations when relevant data changes
  useEffect(() => {
    if (availablePlayers.length > 0 && myDraftPosition) {
      // Convert picks to drafted players
      const draftedPlayers = picks.map(pick => {
        const player = availablePlayers.find(p => p.player_id === pick.player_id);
        if (!player) {
          return {
            player_id: pick.player_id,
            first_name: pick.metadata.first_name,
            last_name: pick.metadata.last_name,
            position: pick.metadata.position,
            team: pick.metadata.team,
            draft_slot: pick.draft_slot
          } as DraftPlayer;
        }
        return { ...player, draft_slot: pick.draft_slot };
      });
      
      generateRecommendations(
        availablePlayers,
        draftedPlayers,
        myDraftPosition,
        currentPick,
        selectedStrategy
      );
    }
  }, [availablePlayers, picks, myDraftPosition, currentPick, selectedStrategy, generateRecommendations]);

  // Get position color class
  const getPositionColorClass = (position: string): string => {
    switch (position) {
      case 'QB': return 'bg-red-100 text-red-800';
      case 'RB': return 'bg-blue-100 text-blue-800';
      case 'WR': return 'bg-green-100 text-green-800';
      case 'TE': return 'bg-purple-100 text-purple-800';
      case 'K': return 'bg-yellow-100 text-yellow-800';
      case 'DEF': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get player image URL
  const getPlayerImageUrl = (player_id: string) => {
    return `https://sleepercdn.com/content/nfl/players/thumb/${player_id}.jpg`;
  };

  // Get team logo URL
  const getTeamLogoUrl = (team: string) => {
    return `https://sleepercdn.com/images/team_logos/nfl/${team?.toLowerCase()}.png`;
  };

  // Handle draft player
  const handleDraft = (player_id: string) => {
    if (onDraftPlayer) {
      onDraftPlayer(player_id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">AI Draft Recommendations</h3>
          <button
            onClick={() => setShowStrategies(!showStrategies)}
            className="px-3 py-1.5 bg-primary-50 text-primary-600 rounded-lg text-sm font-medium hover:bg-primary-100 transition-colors flex items-center gap-2"
          >
            <Brain size={16} />
            <span>Strategy: {strategies.find(s => s.id === selectedStrategy)?.name}</span>
            <ChevronRight size={16} className={`transition-transform ${showStrategies ? 'rotate-90' : ''}`} />
          </button>
        </div>
      </div>

      {/* Strategy selector */}
      {showStrategies && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 gap-2">
            {strategies.map(strategy => (
              <button
                key={strategy.id}
                onClick={() => {
                  setSelectedStrategy(strategy.id);
                  setShowStrategies(false);
                }}
                className={`p-3 rounded-lg border text-left hover:bg-gray-50 transition-colors ${
                  selectedStrategy === strategy.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-center">
                  <div className="mr-3">{strategy.icon}</div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-800">{strategy.name}</h5>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-primary-500 rounded-full animate-spin mr-3"></div>
            <span className="text-gray-600">Generating recommendations...</span>
          </div>
        ) : recommendations.length > 0 ? (
          <div className="space-y-3">
            {recommendations.map(player => (
              <div 
                key={player.player_id}
                className="bg-white rounded-lg p-3 border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => handleDraft(player.player_id)}
              >
                <div className="flex items-center">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                    <img
                      src={getPlayerImageUrl(player.player_id)}
                      alt={`${player.first_name} ${player.last_name}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${player.first_name}+${player.last_name}&background=6366f1&color=fff`;
                      }}
                    />
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-800 truncate">
                        {player.first_name} {player.last_name}
                      </h3>
                      <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                        getPositionColorClass(player.position)
                      }`}>
                        {player.position}
                      </span>
                    </div>
                    <div className="flex items-center mt-1">
                      {player.team && (
                        <div className="flex items-center">
                          <img 
                            src={getTeamLogoUrl(player.team)} 
                            alt={player.team} 
                            className="w-4 h-4 mr-1"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <span className="text-xs text-gray-500">{player.team}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div>
                    <div className="text-xs text-gray-500">Rank</div>
                    <div className="font-semibold text-gray-800">{player.rank || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">ADP</div>
                    <div className="font-semibold text-gray-800">{player.adp?.toFixed(1) || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Value</div>
                    <div className={`font-semibold ${
                      player.adp && player.rank && player.adp - player.rank > 10 ? 'text-green-600' :
                      player.adp && player.rank && player.adp - player.rank < -10 ? 'text-red-600' :
                      'text-gray-800'
                    }`}>
                      {player.adp && player.rank ? 
                        (player.adp - player.rank > 0 ? '+' : '') + (player.adp - player.rank).toFixed(1) : 
                        'N/A'}
                    </div>
                  </div>
                </div>
                
                <button className="w-full mt-3 px-3 py-1.5 bg-primary-500 text-white rounded-lg text-xs font-medium hover:bg-primary-600 transition-colors">
                  Draft Player
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No recommendations available. Please select a draft position.
          </div>
        )}
      </div>
    </div>
  );
};