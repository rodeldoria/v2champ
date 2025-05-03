import React, { useState } from 'react';
import { useDraftStore } from '../../../store/draftStore';
import { DraftPlayer } from '../../../types/draft';
import { ChevronDown, ChevronUp, ArrowUpDown, Star, TrendingUp, AlertTriangle } from 'lucide-react';
import { PlayerCardModal } from '../PlayerCardModal';

interface PlatformData {
  name: string;
  scoringTypes: string[];
  color: string;
}

interface ValuePlayer {
  player: DraftPlayer;
  value: number;
}

export const DraftValueComparison: React.FC = () => {
  const { availablePlayers, picks } = useDraftStore();
  const [selectedPlatform, setSelectedPlatform] = useState<string>('All');
  const [selectedScoring, setSelectedScoring] = useState<string>('PPR');
  const [showBest, setShowBest] = useState<boolean>(true);
  const [selectedPlayer, setSelectedPlayer] = useState<DraftPlayer | null>(null);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [loadedTeamLogos, setLoadedTeamLogos] = useState<Record<string, boolean>>({});
  
  // Define platforms
  const platforms: PlatformData[] = [
    { name: 'All', scoringTypes: ['Standard', 'Half PPR', 'PPR'], color: 'bg-gray-100 text-gray-800' },
    { name: 'ESPN', scoringTypes: ['Standard', 'Half PPR', 'PPR'], color: 'bg-red-100 text-red-800' },
    { name: 'Yahoo', scoringTypes: ['Standard', 'Half PPR', 'PPR'], color: 'bg-purple-100 text-purple-800' },
    { name: 'Sleeper', scoringTypes: ['Standard', 'Half PPR', 'PPR'], color: 'bg-blue-100 text-blue-800' },
    { name: 'NFL', scoringTypes: ['Standard', 'Half PPR', 'PPR'], color: 'bg-green-100 text-green-800' },
    { name: 'CBS', scoringTypes: ['Standard', 'Half PPR', 'PPR'], color: 'bg-yellow-100 text-yellow-800' },
    { name: 'Fleaflicker', scoringTypes: ['Standard', 'Half PPR', 'PPR'], color: 'bg-orange-100 text-orange-800' }
  ];

  // Get drafted player IDs
  const draftedPlayerIds = picks.map(pick => pick.player_id);
  
  // Filter out drafted players
  const availablePlayersFiltered = availablePlayers.filter(
    player => !draftedPlayerIds.includes(player.player_id)
  );
  
  // Calculate value for each player
  const calculateValue = (player: DraftPlayer): number => {
    if (!player.adp || !player.rank) return 0;
    return player.adp - player.rank;
  };
  
  // Get best value players
  const getBestValuePlayers = (count: number = 10): ValuePlayer[] => {
    return availablePlayersFiltered
      .filter(player => player.adp && player.rank)
      .map(player => ({
        player,
        value: calculateValue(player)
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, count);
  };
  
  // Get worst value players
  const getWorstValuePlayers = (count: number = 10): ValuePlayer[] => {
    return availablePlayersFiltered
      .filter(player => player.adp && player.rank)
      .map(player => ({
        player,
        value: calculateValue(player)
      }))
      .sort((a, b) => a.value - b.value)
      .slice(0, count);
  };
  
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
  
  // Get value color class
  const getValueColorClass = (value: number): string => {
    if (value > 20) return 'text-green-600 font-semibold';
    if (value > 10) return 'text-green-500';
    if (value < -20) return 'text-red-600 font-semibold';
    if (value < -10) return 'text-red-500';
    return 'text-gray-600';
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
  
  const bestValuePlayers = getBestValuePlayers();
  const worstValuePlayers = getWorstValuePlayers();
  
  return (
    <>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h3 className="font-semibold text-gray-800">Value Comparison</h3>
            
            <div className="flex flex-wrap gap-2">
              {/* Platform selector */}
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              >
                {platforms.map(platform => (
                  <option key={platform.name} value={platform.name}>
                    {platform.name}
                  </option>
                ))}
              </select>
              
              {/* Scoring type selector */}
              <select
                value={selectedScoring}
                onChange={(e) => setSelectedScoring(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              >
                {platforms.find(p => p.name === selectedPlatform)?.scoringTypes.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              
              {/* Toggle between best and worst */}
              <button
                onClick={() => setShowBest(!showBest)}
                className="px-3 py-1.5 bg-primary-50 text-primary-600 rounded-lg text-sm font-medium hover:bg-primary-100 transition-colors flex items-center"
              >
                {showBest ? 'Show Worst Value' : 'Show Best Value'}
                {showBest ? <ChevronDown size={16} className="ml-1" /> : <ChevronUp size={16} className="ml-1" />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Value Players Grid */}
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(showBest ? bestValuePlayers : worstValuePlayers).map((valuePlayer, index) => (
              <div 
                key={valuePlayer.player.player_id}
                className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => handlePlayerClick(valuePlayer.player)}
              >
                <div className="flex items-center p-3 border-b border-gray-100">
                  <div className="flex items-center">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                      <img
                        src={getPlayerImageUrl(valuePlayer.player.player_id)}
                        alt={`${valuePlayer.player.first_name} ${valuePlayer.player.last_name}`}
                        className={`w-full h-full object-cover transition-opacity duration-300 ${loadedImages[valuePlayer.player.player_id] ? 'opacity-100' : 'opacity-0'}`}
                        onLoad={() => handleImageLoad(valuePlayer.player.player_id)}
                        onError={() => handleImageError(valuePlayer.player.player_id)}
                      />
                      {!loadedImages[valuePlayer.player.player_id] && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                          <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                    <div className="ml-3 min-w-0">
                      <div className="flex items-center">
                        <h3 className="text-sm font-semibold text-gray-800 truncate">
                          {valuePlayer.player.first_name} {valuePlayer.player.last_name}
                        </h3>
                        <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                          getPositionColorClass(valuePlayer.player.position)
                        }`}>
                          {valuePlayer.player.position}
                        </span>
                      </div>
                      <div className="flex items-center mt-1">
                        {valuePlayer.player.team && (
                          <div className="flex items-center">
                            <img 
                              src={getTeamLogoUrl(valuePlayer.player.team)} 
                              alt={valuePlayer.player.team} 
                              className={`w-4 h-4 mr-1 transition-opacity duration-300 ${loadedTeamLogos[valuePlayer.player.team] ? 'opacity-100' : 'opacity-0'}`}
                              onLoad={() => handleTeamLogoLoad(valuePlayer.player.team)}
                              onError={() => handleTeamLogoError(valuePlayer.player.team)}
                            />
                            {!loadedTeamLogos[valuePlayer.player.team] && (
                              <div className="w-4 h-4 mr-1 bg-gray-200 rounded-full"></div>
                            )}
                            <span className="text-xs text-gray-500">{valuePlayer.player.team}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="ml-auto">
                    <div className={`text-lg font-bold ${getValueColorClass(valuePlayer.value)}`}>
                      {valuePlayer.value > 0 ? '+' : ''}{valuePlayer.value.toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-500 text-right">Value</div>
                  </div>
                </div>
                
                <div className="p-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <div className="text-xs text-gray-500">ADP</div>
                      <div className="font-semibold text-gray-800">{valuePlayer.player.adp?.toFixed(1) || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Rank</div>
                      <div className="font-semibold text-gray-800">{valuePlayer.player.rank || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Tier</div>
                      <div className="font-semibold text-gray-800">{valuePlayer.player.tier || 'N/A'}</div>
                    </div>
                  </div>
                  
                  {/* Player metrics */}
                  <div className="mt-3 space-y-2">
                    {valuePlayer.player.boom_probability !== undefined && (
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="flex items-center text-gray-500">
                            <Star size={12} className="mr-1 text-primary-500" />
                            Boom
                          </span>
                          <span>{valuePlayer.player.boom_probability}%</span>
                        </div>
                        <div className="h-1 bg-gray-200 rounded-full">
                          <div 
                            className="h-full bg-primary-500 rounded-full"
                            style={{ width: `${valuePlayer.player.boom_probability}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    {valuePlayer.player.breakout_score !== undefined && (
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="flex items-center text-gray-500">
                            <TrendingUp size={12} className="mr-1 text-green-500" />
                            Breakout
                          </span>
                          <span>{valuePlayer.player.breakout_score}%</span>
                        </div>
                        <div className="h-1 bg-gray-200 rounded-full">
                          <div 
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${valuePlayer.player.breakout_score}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    {valuePlayer.player.bust_risk !== undefined && (
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="flex items-center text-gray-500">
                            <AlertTriangle size={12} className="mr-1 text-red-500" />
                            Bust
                          </span>
                          <span>{valuePlayer.player.bust_risk}%</span>
                        </div>
                        <div className="h-1 bg-gray-200 rounded-full">
                          <div 
                            className="h-full bg-red-500 rounded-full"
                            style={{ width: `${valuePlayer.player.bust_risk}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {(showBest ? bestValuePlayers : worstValuePlayers).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No value players found
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            Value = ADP - Rank. Higher values indicate better draft value.
          </div>
        </div>
      </div>

      {/* Player Card Modal */}
      {selectedPlayer && (
        <PlayerCardModal 
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
          isDrafted={draftedPlayerIds.includes(selectedPlayer.player_id)}
        />
      )}
    </>
  );
};