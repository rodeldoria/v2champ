import React, { useState, useEffect } from 'react';
import { useDraftStore } from '../../../store/draftStore';
import { useSleeperStore } from '../../../store/sleeperStore';
import { DraftPlayer } from '../../../types/draft';
import { Play, Pause, SkipForward, RefreshCw, Settings, X } from 'lucide-react';

interface DraftMockSimulatorProps {
  onDraftPlayer?: (player: DraftPlayer) => void;
}

export const DraftMockSimulator: React.FC<DraftMockSimulatorProps> = ({ onDraftPlayer }) => {
  const { availablePlayers, picks, myDraftPosition, draft, myNextPick } = useDraftStore();
  const { players } = useSleeperStore();
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState<'slow' | 'medium' | 'fast'>('medium');
  const [showSettings, setShowSettings] = useState(false);
  const [draftInProgress, setDraftInProgress] = useState(false);
  const [currentPick, setCurrentPick] = useState(1);
  const [simulatedPicks, setSimulatedPicks] = useState<any[]>([]);
  const [draftComplete, setDraftComplete] = useState(false);
  
  // Speed settings in milliseconds
  const speedSettings = {
    slow: 3000,
    medium: 1500,
    fast: 500
  };
  
  // Reset simulation
  const resetSimulation = () => {
    setIsRunning(false);
    setDraftInProgress(false);
    setCurrentPick(1);
    setSimulatedPicks([]);
    setDraftComplete(false);
  };
  
  // Start/pause simulation
  const toggleSimulation = () => {
    if (!draftInProgress) {
      // Start a new simulation
      setDraftInProgress(true);
      setIsRunning(true);
    } else {
      // Toggle pause/resume
      setIsRunning(!isRunning);
    }
  };
  
  // Skip to next user pick
  const skipToNextUserPick = () => {
    if (!myNextPick || !myDraftPosition) return;
    
    setIsRunning(false);
    
    // Simulate picks until we reach the user's next pick
    const picksToSimulate = myNextPick - currentPick;
    
    if (picksToSimulate <= 0) return;
    
    // Simulate all picks at once
    const newSimulatedPicks = [...simulatedPicks];
    
    for (let i = 0; i < picksToSimulate; i++) {
      const pickNumber = currentPick + i;
      const draftPosition = calculateDraftPosition(pickNumber);
      
      // Skip if it's the user's position
      if (draftPosition === myDraftPosition) continue;
      
      // Simulate AI pick
      const aiPick = simulateAIPick(draftPosition, newSimulatedPicks);
      
      if (aiPick) {
        newSimulatedPicks.push({
          ...aiPick,
          pick_no: pickNumber,
          round: Math.ceil(pickNumber / (draft?.settings?.teams || 12))
        });
      }
    }
    
    setSimulatedPicks(newSimulatedPicks);
    setCurrentPick(myNextPick);
  };
  
  // Calculate draft position for a given pick number
  const calculateDraftPosition = (pickNumber: number): number => {
    if (!draft) return 1;
    
    const { teams } = draft.settings;
    const round = Math.ceil(pickNumber / teams);
    const pickInRound = ((pickNumber - 1) % teams) + 1;
    
    // For snake drafts, reverse even rounds
    const isSnake = draft.type === 'snake';
    const isReverseRound = isSnake && round % 2 === 0;
    
    return isReverseRound ? teams - pickInRound + 1 : pickInRound;
  };
  
  // Simulate AI pick
  const simulateAIPick = (draftPosition: number, currentSimulatedPicks: any[]): DraftPlayer | null => {
    // Get all drafted player IDs
    const draftedPlayerIds = [
      ...picks.map(pick => pick.player_id),
      ...currentSimulatedPicks.map(pick => pick.player_id)
    ];
    
    // Filter available players
    const availablePlayersFiltered = availablePlayers.filter(
      player => !draftedPlayerIds.includes(player.player_id)
    );
    
    if (availablePlayersFiltered.length === 0) return null;
    
    // Simple AI logic - pick best available player with some randomness
    // In a real app, you'd want more sophisticated logic based on team needs, etc.
    const sortedPlayers = [...availablePlayersFiltered].sort((a, b) => {
      // Add some randomness to the ranking
      const aRank = (a.rank || 999) + (Math.random() * 10 - 5);
      const bRank = (b.rank || 999) + (Math.random() * 10 - 5);
      return aRank - bRank;
    });
    
    // Take the top player
    return sortedPlayers[0];
  };
  
  // Run simulation
  useEffect(() => {
    if (!isRunning || !draftInProgress) return;
    
    // Check if draft is complete
    if (currentPick > (draft?.settings?.rounds || 15) * (draft?.settings?.teams || 12)) {
      setIsRunning(false);
      setDraftComplete(true);
      return;
    }
    
    // Check if current pick is user's pick
    const currentDraftPosition = calculateDraftPosition(currentPick);
    
    if (currentDraftPosition === myDraftPosition) {
      // Pause simulation for user to make a pick
      setIsRunning(false);
      return;
    }
    
    // Simulate AI pick
    const timer = setTimeout(() => {
      const aiPick = simulateAIPick(currentDraftPosition, simulatedPicks);
      
      if (aiPick) {
        setSimulatedPicks(prev => [
          ...prev,
          {
            ...aiPick,
            pick_no: currentPick,
            round: Math.ceil(currentPick / (draft?.settings?.teams || 12))
          }
        ]);
      }
      
      setCurrentPick(prev => prev + 1);
    }, speedSettings[speed]);
    
    return () => clearTimeout(timer);
  }, [isRunning, draftInProgress, currentPick, myDraftPosition, draft, simulatedPicks, speed]);
  
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
  
  // Get player image URL
  const getPlayerImageUrl = (playerId: string) => {
    return `https://sleepercdn.com/content/nfl/players/thumb/${playerId}.jpg`;
  };
  
  // Get team logo URL
  const getTeamLogoUrl = (team: string) => {
    return `https://sleepercdn.com/images/team_logos/nfl/${team?.toLowerCase()}.png`;
  };
  
  // Handle user draft
  const handleUserDraft = (player: DraftPlayer) => {
    if (onDraftPlayer) {
      onDraftPlayer(player);
    }
    setCurrentPick(prev => prev + 1);
    setIsRunning(true);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-semibold text-gray-800">Mock Draft Simulator</h3>
        
        <div className="flex items-center gap-2">
          <button
            onClick={resetSimulation}
            className="p-2 rounded-lg hover:bg-gray-100"
            title="Reset Simulation"
          >
            <RefreshCw size={16} className="text-gray-500" />
          </button>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg hover:bg-gray-100"
            title="Settings"
          >
            <Settings size={16} className="text-gray-500" />
          </button>
        </div>
      </div>
      
      {/* Settings panel */}
      {showSettings && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-gray-800">Simulation Settings</h4>
            <button
              onClick={() => setShowSettings(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <X size={16} />
            </button>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Simulation Speed
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSpeed('slow')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    speed === 'slow'
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Slow
                </button>
                <button
                  onClick={() => setSpeed('medium')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    speed === 'medium'
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Medium
                </button>
                <button
                  onClick={() => setSpeed('fast')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    speed === 'fast'
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Fast
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Simulation controls */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-700">
              {draftInProgress 
                ? `Pick ${currentPick}${myDraftPosition === calculateDraftPosition(currentPick) ? ' (Your Turn)' : ''}`
                : 'Start mock draft simulation'}
            </div>
            <div className="text-xs text-gray-500">
              {draftInProgress 
                ? `Round ${Math.ceil(currentPick / (draft?.settings?.teams || 12))}`
                : 'AI will simulate other teams\' picks'}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSimulation}
              disabled={draftComplete}
              className="px-3 py-1.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
            >
              {isRunning ? <Pause size={16} className="mr-1" /> : <Play size={16} className="mr-1" />}
              {isRunning ? 'Pause' : draftInProgress ? 'Resume' : 'Start'}
            </button>
            
            <button
              onClick={skipToNextUserPick}
              disabled={!myNextPick || draftComplete || currentPick >= myNextPick}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center"
            >
              <SkipForward size={16} className="mr-1" />
              Skip to Your Pick
            </button>
          </div>
        </div>
        
        {/* Progress bar */}
        {draftInProgress && (
          <div className="mt-3">
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary-500 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(currentPick / ((draft?.settings?.rounds || 15) * (draft?.settings?.teams || 12))) * 100}%` 
                }}
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Draft board */}
      <div className="p-4">
        {draftInProgress && myDraftPosition === calculateDraftPosition(currentPick) && (
          <div className="mb-4 bg-yellow-50 border border-yellow-100 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">Your Turn to Pick</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {availablePlayers
                .filter(player => !picks.map(p => p.player_id).includes(player.player_id) && 
                                 !simulatedPicks.map(p => p.player_id).includes(player.player_id))
                .slice(0, 3)
                .map(player => (
                  <div 
                    key={player.player_id}
                    className="bg-white rounded-lg p-3 border border-gray-200 cursor-pointer hover:shadow-md transition-all duration-200"
                    onClick={() => handleUserDraft(player)}
                  >
                    <div className="flex items-center">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
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
                    
                    <div className="grid grid-cols-3 gap-2 mt-2">
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
                    
                    <button className="w-full mt-2 px-3 py-1.5 bg-primary-500 text-white rounded-lg text-xs font-medium hover:bg-primary-600 transition-colors">
                      Draft Player
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}
        
        {/* Recent picks */}
        <h4 className="font-medium text-gray-800 mb-3">Recent Picks</h4>
        
        <div className="space-y-2">
          {[...picks, ...simulatedPicks]
            .sort((a, b) => b.pick_no - a.pick_no)
            .slice(0, 5)
            .map((pick, index) => {
              const isRealPick = 'metadata' in pick;
              const playerData = isRealPick 
                ? pick.metadata 
                : {
                    first_name: pick.first_name,
                    last_name: pick.last_name,
                    position: pick.position,
                    team: pick.team
                  };
              
              return (
                <div key={index} className="flex items-center p-2 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full text-sm font-medium text-gray-700">
                    {pick.pick_no}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-800">
                        {playerData.first_name} {playerData.last_name}
                      </span>
                      <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                        getPositionColorClass(playerData.position)
                      }`}>
                        {playerData.position}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {playerData.team} - Round {pick.round}, Pick {pick.pick_no}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {calculateDraftPosition(pick.pick_no) === myDraftPosition ? 'You' : `Team ${calculateDraftPosition(pick.pick_no)}`}
                  </div>
                </div>
              );
            })}
          
          {picks.length === 0 && simulatedPicks.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No picks yet. Start the simulation to see picks here.
            </div>
          )}
        </div>
      </div>
      
      {draftComplete && (
        <div className="p-4 border-t border-gray-200 bg-green-50">
          <div className="text-center text-green-700 font-medium">
            Draft Complete! 🎉
          </div>
        </div>
      )}
    </div>
  );
};