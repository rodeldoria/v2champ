import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Layers, Grid, BarChart2, Brain, Users } from 'lucide-react';
import { useSleeperStore } from '../store/sleeperStore';
import { useDraftStore, initializeDraftStore } from '../store/draftStore';
import { DraftPlayer } from '../types/draft';
import { DraftBoardTable, DraftValueComparison, DraftRecommendationsAI, DraftRemoval, DraftTiersSort } from '../components/draft/assistant';
import { RecentPicksCards } from '../components/draft/RecentPicksCards';
import { AvailablePlayersCards } from '../components/draft/AvailablePlayersCards';
import { DraftBoard } from '../components/draft/DraftBoard';
import { DraftChatbot } from '../components/draft/assistant/DraftChatbot';
import { DraftAssistantPanel } from '../components/draft/DraftAssistantPanel';

const DraftAssistant: React.FC = () => {
  const { draftId } = useParams<{ draftId: string }>();
  const navigate = useNavigate();
  const { selectedLeague, players, fetchAllNflPlayers } = useSleeperStore();
  const { isLoading, error, reset, draftPlayer } = useDraftStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'recommendations' | 'players' | 'board' | 'tracker' | 'history'>('recommendations');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hideDrafted, setHideDrafted] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<DraftPlayer | null>(null);
  const [draftStoreInitialized, setDraftStoreInitialized] = useState(false);
  
  // First, ensure we have players loaded
  useEffect(() => {
    if (Object.keys(players).length === 0) {
      fetchAllNflPlayers();
    }
  }, [players, fetchAllNflPlayers]);
  
  // Then initialize draft store once players are loaded
  useEffect(() => {
    if (draftId && Object.keys(players).length > 0 && !draftStoreInitialized) {
      // Default to position 1 initially
      initializeDraftStore(draftId, 1, players);
      setDraftStoreInitialized(true);
    }
  }, [draftId, players, draftStoreInitialized]);
  
  // Reset draft store on unmount
  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    reset();
    setDraftStoreInitialized(false);
    
    // Allow time for reset to complete
    setTimeout(() => {
      if (draftId && Object.keys(players).length > 0) {
        initializeDraftStore(draftId, 1, players);
        setDraftStoreInitialized(true);
      }
      setIsRefreshing(false);
    }, 1000);
  };
  
  const handleSelectPlayer = (player: DraftPlayer) => {
    // Special case for toggle drafted button
    if (player.player_id === 'toggle-drafted') {
      setHideDrafted(!hideDrafted);
      return;
    }
    
    setSelectedPlayer(player);
  };
  
  const handleDraftPlayer = (player_id: string) => {
    draftPlayer(player_id);
  };
  
  if (!draftId) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Draft Not Found</h2>
        <p className="text-gray-600">
          No draft ID was provided. Please select a draft from your league.
        </p>
        <button 
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Draft</h2>
        <p className="text-gray-600">{error}</p>
        <button 
          onClick={handleRefresh}
          className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg flex items-center justify-center"
        >
          <RefreshCw size={18} className="mr-2" />
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 rounded-full bg-white shadow-sm text-gray-600 hover:bg-gray-50 transition-colors mr-3"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-800">AI Draft Assistant</h1>
            {selectedLeague && (
              <p className="text-gray-500">{selectedLeague.name}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg bg-white shadow-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap flex items-center ${
                activeTab === 'recommendations'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Brain size={16} className="mr-2" />
              AI Recommendations
            </button>
            <button
              onClick={() => setActiveTab('players')}
              className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap flex items-center ${
                activeTab === 'players'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Grid size={16} className="mr-2" />
              Draft Board
            </button>
            <button
              onClick={() => setActiveTab('board')}
              className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap flex items-center ${
                activeTab === 'board'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Layers size={16} className="mr-2" />
              Tier View
            </button>
            <button
              onClick={() => setActiveTab('tracker')}
              className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap flex items-center ${
                activeTab === 'tracker'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart2 size={16} className="mr-2" />
              Value Comparison
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap flex items-center ${
                activeTab === 'history'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users size={16} className="mr-2" />
              Draft History
            </button>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-primary-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main content area */}
          <div className="lg:col-span-2">
            {activeTab === 'recommendations' && (
              <DraftAssistantPanel onDraftPlayer={handleDraftPlayer} />
            )}
            
            {activeTab === 'players' && (
              <AvailablePlayersCards 
                onSelectPlayer={handleSelectPlayer} 
                hideDrafted={hideDrafted}
                maxDisplay={9}
              />
            )}
            
            {activeTab === 'board' && (
              <DraftTiersSort />
            )}
            
            {activeTab === 'tracker' && (
              <DraftValueComparison />
            )}
            
            {activeTab === 'history' && (
              <DraftBoard draftId={draftId} />
            )}
          </div>
          
          {/* Sidebar */}
          <div className="space-y-4">
            <DraftRemoval 
              hideDrafted={hideDrafted}
              onToggleHideDrafted={() => setHideDrafted(!hideDrafted)}
            />
            
            <RecentPicksCards 
              onSelectPlayer={handleDraftPlayer}
              maxDisplay={4}
            />
          </div>
        </div>
      )}
      
      {/* Floating AI Coach */}
      <DraftChatbot />
    </div>
  );
};

export default DraftAssistant;