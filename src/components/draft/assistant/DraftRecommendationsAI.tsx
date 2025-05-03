import React, { useState } from 'react';
import { useDraftStore } from '../../../store/draftStore';
import { DraftPlayer } from '../../../types/draft';
import { Brain, Zap, Shield, TrendingUp, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { PlayerCardModal } from '../PlayerCardModal';

interface DraftRecommendationsAIProps {
  onDraftPlayer?: (player_id: string) => void;
}

export const DraftRecommendationsAI: React.FC<DraftRecommendationsAIProps> = ({ onDraftPlayer }) => {
  const { availablePlayers, picks, myNextPick } = useDraftStore();
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<DraftPlayer | null>(null);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [loadedTeamLogos, setLoadedTeamLogos] = useState<Record<string, boolean>>({});
  
  // Get drafted player IDs
  const draftedPlayerIds = picks.map(pick => pick.player_id);
  
  // Filter out drafted players
  const availablePlayersFiltered = availablePlayers.filter(
    player => !draftedPlayerIds.includes(player.player_id)
  );
  
  // Get position color class
  const getPositionColorClass = (position: string): string => {
    switch (position) {
      case 'QB':
        return 'bg-red-100 text-red-800';
      case 'RB':
        return 'bg-blue-100 text-blue-800';
      case 'WR':
        return 'bg-green-100 text-green-800';
      case 'TE':
        return 'bg-purple-100 text-purple-800';
      case 'K':
        return 'bg-yellow-100 text-yellow-800';
      case 'DEF':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Calculate odds of player being available at next pick
  const calculateAvailabilityOdds = (player: DraftPlayer): number => {
    if (!myNextPick) return 0;
    
    const currentPick = picks.length + 1;
    const picksUntilNext = myNextPick - currentPick;
    
    if (picksUntilNext <= 0) return 100; // Already at your pick
    
    // Simple algorithm: the closer a player's ADP is to the current pick,
    // the less likely they'll be available at your next pick
    const adp = player.adp || player.rank || 999;
    const pickDiff = adp - currentPick;
    
    if (pickDiff <= 0) return Math.max(10, 100 - (Math.abs(pickDiff) * 5)); // Already past ADP
    if (pickDiff > picksUntilNext * 2) return 90; // Likely available
    
    // Scale from 20% to 80% based on how many picks until your next pick
    return Math.max(20, Math.min(80, (pickDiff / picksUntilNext) * 60));
  };

  // Get player image URL
  const getPlayerImageUrl = (player_id: string) => {
    return `https://sleepercdn.com/content/nfl/players/thumb/${player_id}.jpg`;
  };

  // Get team logo URL
  const getTeamLogoUrl = (team: string) => {
    return `https://sleepercdn.com/images/team_logos/nfl/${team?.toLowerCase()}.png`;
  };

  // Handle image load
  const handleImageLoad = (player_id: string) => {
    setLoadedImages(prev => ({
      ...prev,
      [player_id]: true
    }));
  };

  // Handle image error
  const handleImageError = (player_id: string) => {
    setLoadedImages(prev => ({
      ...prev,
      [player_id]: true
    }));
  };

  // Handle team logo load
  const handleTeamLogoLoad = (team: string) => {
    setLoadedTeamLogos(prev => ({
      ...prev,
      [team]: true
    }));
  };

  // Handle team logo error
  const handleTeamLogoError = (team: string) => {
    setLoadedTeamLogos(prev => ({
      ...prev,
      [team]: true
    }));
  };

  // Handle player click
  const handlePlayerClick = (player: DraftPlayer) => {
    setSelectedPlayer(player);
  };
  
  // Generate AI recommendations
  const generateRecommendations = () => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Get boom picks (high boom probability)
      const boomPicks = [...availablePlayersFiltered]
        .sort((a, b) => (b.boom_probability || 0) - (a.boom_probability || 0))
        .filter(p => (p.boom_probability || 0) > 60)
        .slice(0, 3);
      
      // Get safe picks (low bust risk, consistent)
      const safePicks = [...availablePlayersFiltered]
        .filter(p => (p.bust_risk || 100) < 40)
        .sort((a, b) => (a.rank || 999) - (b.rank || 999))
        .slice(0, 3);
      
      // Get breakout picks (high breakout score)
      const breakoutPicks = [...availablePlayersFiltered]
        .sort((a, b) => (b.breakout_score || 0) - (a.breakout_score || 0))
        .filter(p => (p.breakout_score || 0) > 60)
        .slice(0, 3);
      
      // Get best player available (by rank)
      const bpaPicks = [...availablePlayersFiltered]
        .sort((a, b) => (a.rank || 999) - (b.rank || 999))
        .slice(0, 3);
      
      // Create recommendation categories
      const recommendations = [
        {
          type: 'bpa',
          title: 'Best Player Available',
          description: 'Highest ranked players still on the board',
          icon: <Star className="text-yellow-500" />,
          players: bpaPicks
        },
        {
          type: 'safe',
          title: 'Safe Picks',
          description: 'Low risk, consistent producers',
          icon: <Shield className="text-blue-500" />,
          players: safePicks
        },
        {
          type: 'boom',
          title: 'Boom Potential',
          description: 'High ceiling players with game-changing upside',
          icon: <Zap className="text-primary-500" />,
          players: boomPicks
        },
        {
          type: 'breakout',
          title: 'Breakout Candidates',
          description: 'Players poised for a significant leap this season',
          icon: <TrendingUp className="text-green-500" />,
          players: breakoutPicks
        }
      ];
      
      setRecommendations(recommendations);
      setShowRecommendations(true);
      setIsLoading(false);
    }, 1500);
  };
  
  return (
    <>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800">AI Draft Recommendations</h3>
          {myNextPick && (
            <p className="text-sm text-gray-500 mt-1">
              For your next pick at position {myNextPick}
            </p>
          )}
        </div>
        
        {!showRecommendations ? (
          <div className="p-6 text-center">
            <div className="mb-4">
              <Brain size={48} className="mx-auto text-primary-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-800 mb-2">
              Get AI-Powered Draft Recommendations
            </h4>
            <p className="text-gray-600 mb-6">
              Our AI will analyze the draft board and recommend the best players for your next pick based on value, team needs, and player potential.
            </p>
            <button
              onClick={generateRecommendations}
              disabled={isLoading}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center justify-center mx-auto"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Analyzing Draft Board...
                </>
              ) : (
                <>
                  <Brain size={18} className="mr-2" />
                  Generate Recommendations
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="p-4">
            <div className="mb-4 flex justify-between items-center">
              <h4 className="font-medium text-gray-800">AI Recommendations</h4>
              <button
                onClick={() => setShowRecommendations(false)}
                className="text-sm text-primary-500 hover:text-primary-600"
              >
                Regenerate
              </button>
            </div>
            
            <div className="space-y-6">
              {recommendations.map((category) => (
                <div key={category.type} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <div className="mr-2">{category.icon}</div>
                    <div>
                      <h5 className="font-medium text-gray-800">{category.title}</h5>
                      <p className="text-xs text-gray-500">{category.description}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mt-3">
                    {category.players.map((player) => {
                      const availabilityOdds = calculateAvailabilityOdds(player);
                      
                      return (
                        <div 
                          key={player.player_id} 
                          className="bg-white rounded-lg p-3 border border-gray-200 cursor-pointer hover:shadow-md transition-all duration-200"
                          onClick={() => handlePlayerClick(player)}
                        >
                          <div className="flex items-center">
                            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                              <img
                                src={getPlayerImageUrl(player.player_id)}
                                alt={`${player.first_name} ${player.last_name}`}
                                className={`w-full h-full object-cover transition-opacity duration-300 ${loadedImages[player.player_id] ? 'opacity-100' : 'opacity-0'}`}
                                onLoad={() => handleImageLoad(player.player_id)}
                                onError={() => handleImageError(player.player_id)}
                              />
                              {!loadedImages[player.player_id] && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                                  <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                              )}
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
                              <div className="flex items-center justify-between mt-1">
                                <div className="flex items-center">
                                  {player.team && (
                                    <div className="flex items-center">
                                      <img 
                                        src={getTeamLogoUrl(player.team)} 
                                        alt={player.team} 
                                        className={`w-4 h-4 mr-1 transition-opacity duration-300 ${loadedTeamLogos[player.team] ? 'opacity-100' : 'opacity-0'}`}
                                        onLoad={() => handleTeamLogoLoad(player.team)}
                                        onError={() => handleTeamLogoError(player.team)}
                                      />
                                      {!loadedTeamLogos[player.team] && (
                                        <div className="w-4 h-4 mr-1 bg-gray-200 rounded-full"></div>
                                      )}
                                      <span className="text-xs text-gray-500">{player.team}</span>
                                    </div>
                                  )}
                                </div>
                                <div className={`text-xs ${
                                  availabilityOdds > 70 ? 'text-green-600' :
                                  availabilityOdds > 40 ? 'text-yellow-600' :
                                  'text-red-600'
                                }`}>
                                  {availabilityOdds}% available at next pick
                                </div>
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
                              <div className="text-xs text-gray-500">Tier</div>
                              <div className="font-semibold text-gray-800">{player.tier || 'N/A'}</div>
                            </div>
                          </div>
                          
                          {/* Player metrics */}
                          <div className="grid grid-cols-3 gap-2 mt-3">
                            {player.boom_probability !== undefined && (
                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-gray-500">Boom</span>
                                  <span className="font-medium">{player.boom_probability}%</span>
                                </div>
                                <div className="h-1 bg-gray-200 rounded-full">
                                  <div 
                                    className="h-full bg-primary-500 rounded-full"
                                    style={{ width: `${player.boom_probability}%` }}
                                  />
                                </div>
                              </div>
                            )}
                            
                            {player.bust_risk !== undefined && (
                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-gray-500">Bust</span>
                                  <span className="font-medium">{player.bust_risk}%</span>
                                </div>
                                <div className="h-1 bg-gray-200 rounded-full">
                                  <div 
                                    className="h-full bg-red-500 rounded-full"
                                    style={{ width: `${player.bust_risk}%` }}
                                  />
                                </div>
                              </div>
                            )}
                            
                            {player.breakout_score !== undefined && (
                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-gray-500">Breakout</span>
                                  <span className="font-medium">{player.breakout_score}%</span>
                                </div>
                                <div className="h-1 bg-gray-200 rounded-full">
                                  <div 
                                    className="h-full bg-green-500 rounded-full"
                                    style={{ width: `${player.breakout_score}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Player Card Modal */}
      {selectedPlayer && (
        <PlayerCardModal 
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
          isDrafted={draftedPlayerIds.includes(selectedPlayer.player_id)}
          onDraft={onDraftPlayer}
        />
      )}
    </>
  );
};