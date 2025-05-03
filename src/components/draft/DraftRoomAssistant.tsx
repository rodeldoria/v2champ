import React, { useState, useEffect, useRef } from 'react';
import { useDraftStore, initializeDraftStore } from '../../store/draftStore';
import { useSleeperStore } from '../../store/sleeperStore';
import { DraftBoard } from './DraftBoard';
import { DraftRecommendations } from './DraftRecommendations';
import { DraftPlayerPool } from './DraftPlayerPool';
import { DraftPick } from '../../types/draft';
import { DraftPositionTracker } from './DraftPositionTracker';
import { DraftPickHistory } from './DraftPickHistory';
import { Brain, Users, List, Settings, X, BarChart2, History, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DraftRoomAssistantProps {
  draftId: string;
  leagueId: string;
}

export const DraftRoomAssistant: React.FC<DraftRoomAssistantProps> = ({ 
  draftId,
  leagueId
}) => {
  const { players, users } = useSleeperStore();
  const { draft, myDraftPosition, setDraftPosition, draftPlayer } = useDraftStore();
  const [activeTab, setActiveTab] = useState<'recommendations' | 'players' | 'board' | 'tracker' | 'history'>('recommendations');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedPick, setSelectedPick] = useState<DraftPick | null>(null);
  
  // Initialize draft store
  useEffect(() => {
    if (draftId && Object.keys(players).length > 0) {
      // Default to position 1 initially
      initializeDraftStore(draftId, myDraftPosition || 1, players);
    }
  }, [draftId, players, myDraftPosition]);
  
  const handleDraftPlayer = (playerId: string) => {
    draftPlayer(playerId);
  };
  
  const handleSelectPick = (pick: DraftPick) => {
    setSelectedPick(pick);
  };
  
  // Get user display name from user ID
  const getUserDisplayName = (userId: string) => {
    const user = users[userId];
    if (user) {
      return user.display_name || user.username || userId;
    }
    return userId;
  };
  
  return (
    <div className="bg-gray-50 rounded-lg shadow-sm overflow-hidden">
      <div className="bg-white p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">AI Draft Assistant</h2>
          
          <div className="flex items-center gap-2">
            <Link
              to={`/draft/${draftId}/tiers`}
              className="px-4 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors flex items-center gap-2"
            >
              <Layers size={16} />
              <span className="font-medium">Tier View</span>
            </Link>
            <Link
              to={`/draft/${draftId}/assistant`}
              className="px-4 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors flex items-center gap-2"
            >
              <Brain size={16} />
              <span className="font-medium">AI Assistant</span>
            </Link>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
        
        {draft && (
          <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-600">
            <span className="px-2 py-1 bg-gray-100 rounded-lg">
              {draft.type.charAt(0).toUpperCase() + draft.type.slice(1)} Draft
            </span>
            <span className="px-2 py-1 bg-gray-100 rounded-lg">
              {draft.settings.teams} Teams
            </span>
            <span className="px-2 py-1 bg-gray-100 rounded-lg">
              {draft.settings.rounds} Rounds
            </span>
            <span className="px-2 py-1 bg-gray-100 rounded-lg">
              {draft.metadata.scoring_type.toUpperCase()} Scoring
            </span>
            {myDraftPosition && (
              <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-lg font-medium">
                Your Pick: #{myDraftPosition}
              </span>
            )}
          </div>
        )}
      </div>
      
      {/* Mobile tabs */}
      <div className="md:hidden border-b border-gray-200 bg-white">
        <div className="flex">
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`flex-1 py-3 text-sm font-medium text-center ${
              activeTab === 'recommendations'
                ? 'text-primary-600 border-b-2 border-primary-500'
                : 'text-gray-500'
            }`}
          >
            <Brain size={18} className="mx-auto mb-1" />
            AI Picks
          </button>
          <button
            onClick={() => setActiveTab('players')}
            className={`flex-1 py-3 text-sm font-medium text-center ${
              activeTab === 'players'
                ? 'text-primary-600 border-b-2 border-primary-500'
                : 'text-gray-500'
            }`}
          >
            <List size={18} className="mx-auto mb-1" />
            Players
          </button>
          <button
            onClick={() => setActiveTab('board')}
            className={`flex-1 py-3 text-sm font-medium text-center ${
              activeTab === 'board'
                ? 'text-primary-600 border-b-2 border-primary-500'
                : 'text-gray-500'
            }`}
          >
            <Users size={18} className="mx-auto mb-1" />
            Board
          </button>
          <button
            onClick={() => setActiveTab('tracker')}
            className={`flex-1 py-3 text-sm font-medium text-center ${
              activeTab === 'tracker'
                ? 'text-primary-600 border-b-2 border-primary-500'
                : 'text-gray-500'
            }`}
          >
            <BarChart2 size={18} className="mx-auto mb-1" />
            Tracker
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 text-sm font-medium text-center ${
              activeTab === 'history'
                ? 'text-primary-600 border-b-2 border-primary-500'
                : 'text-gray-500'
            }`}
          >
            <History size={18} className="mx-auto mb-1" />
            History
          </button>
        </div>
      </div>
      
      {/* Desktop and mobile content */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* AI Recommendations - Left column on desktop, conditionally shown on mobile */}
          {(activeTab === 'recommendations' || window.innerWidth >= 768) && (
            <div className="md:col-span-3">
              <DraftRecommendations onDraftPlayer={handleDraftPlayer} />
            </div>
          )}
          
          {/* Draft Board - Center column on desktop, conditionally shown on mobile */}
          {(activeTab === 'board' || window.innerWidth >= 768) && (
            <div className="md:col-span-6">
              <DraftBoard draftId={draftId} onSelectPick={handleSelectPick} />
            </div>
          )}
          
          {/* Position Tracker - Shown on tracker tab or on desktop */}
          {(activeTab === 'tracker' || window.innerWidth >= 768) && (
            <div className="md:col-span-6 md:row-start-2">
              <DraftPositionTracker />
            </div>
          )}
          
          {/* Pick History - Shown on history tab or on desktop */}
          {(activeTab === 'history' || window.innerWidth >= 768) && (
            <div className="md:col-span-6 md:row-start-3">
              <DraftPickHistory />
            </div>
          )}
          
          {/* Player Pool - Right column on desktop, conditionally shown on mobile */}
          {(activeTab === 'players' || window.innerWidth >= 768) && (
            <div className="md:col-span-3 md:row-span-3">
              <DraftPlayerPool onDraftPlayer={handleDraftPlayer} />
            </div>
          )}
        </div>
      </div>
      
      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Draft Settings</h3>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4">
              <div className="mb-4">
                <label htmlFor="draftPosition" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Draft Position
                </label>
                <select
                  id="draftPosition"
                  value={myDraftPosition || ''}
                  onChange={(e) => setDraftPosition(Number(e.target.value))}
                  className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
                >
                  <option value="">Select Position</option>
                  {draft && Array.from({ length: draft.settings.teams }, (_, i) => i + 1).map(pos => (
                    <option key={pos} value={pos}>Position {pos}</option>
                  ))}
                </select>
              </div>
              
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="w-full px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Selected Pick Modal */}
      {selectedPick && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Pick Details</h3>
              <button
                onClick={() => setSelectedPick(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4">
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Round {selectedPick.round}, Pick {selectedPick.pick_no}</span>
                  <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full ${
                    selectedPick.metadata.position === 'QB' ? 'bg-red-100 text-red-800' :
                    selectedPick.metadata.position === 'RB' ? 'bg-blue-100 text-blue-800' :
                    selectedPick.metadata.position === 'WR' ? 'bg-green-100 text-green-800' :
                    selectedPick.metadata.position === 'TE' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedPick.metadata.position}
                  </span>
                </div>
                
                <h4 className="text-lg font-semibold text-gray-800 mt-2">
                  {selectedPick.metadata.first_name} {selectedPick.metadata.last_name}
                </h4>
                
                <div className="flex items-center mt-1">
                  <span className="text-sm text-gray-600">{selectedPick.metadata.team}</span>
                  {selectedPick.metadata.injury_status && (
                    <span className="ml-2 text-sm text-red-600">
                      {selectedPick.metadata.injury_status}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <span className="text-xs text-gray-500">Experience</span>
                  <p className="font-medium text-gray-800">
                    {selectedPick.metadata.years_exp === '0' ? 'Rookie' : `${selectedPick.metadata.years_exp} Years`}
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <span className="text-xs text-gray-500">Drafted By</span>
                  <p className="font-medium text-gray-800">
                    {getUserDisplayName(selectedPick.picked_by)}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setSelectedPick(null)}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};