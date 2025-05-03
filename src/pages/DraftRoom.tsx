import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSleeperStore } from '../store/sleeperStore';
import { useDraftStore, initializeDraftStore } from '../store/draftStore';
import { DraftRoomAssistant } from '../components/draft/DraftRoomAssistant';
import { ArrowLeft, RefreshCw, Brain, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

const DraftRoom: React.FC = () => {
  const { draftId } = useParams<{ draftId: string }>();
  const navigate = useNavigate();
  const { selectedLeague, players, fetchAllNflPlayers } = useSleeperStore();
  const { isLoading, error, reset, draft } = useDraftStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
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
            <h1 className="text-2xl font-bold text-gray-800">Draft Room</h1>
            {selectedLeague && (
              <p className="text-gray-500">{selectedLeague.name}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Link
            to={`/draft/${draftId}/assistant`}
            className="px-4 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors flex items-center gap-2"
          >
            <Brain size={16} />
            <span className="font-medium">AI Assistant</span>
          </Link>
          
          <Link
            to={`/draft/${draftId}/tiers`}
            className="px-4 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors flex items-center gap-2"
          >
            <Layers size={16} />
            <span className="font-medium">Tier View</span>
          </Link>
          
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg bg-white shadow-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>
      
      {/* Draft info */}
      {draft && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex flex-wrap gap-2">
            <div className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm font-medium text-gray-700">
              {draft.type.charAt(0).toUpperCase() + draft.type.slice(1)} Draft
            </div>
            <div className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm font-medium text-gray-700">
              {draft.settings.teams} Teams
            </div>
            <div className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm font-medium text-gray-700">
              {draft.settings.rounds} Rounds
            </div>
            <div className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm font-medium text-gray-700">
              {draft.metadata.scoring_type.toUpperCase()} Scoring
            </div>
            <div className="px-3 py-1.5 bg-primary-100 rounded-lg text-sm font-medium text-primary-700">
              Status: {draft.status.charAt(0).toUpperCase() + draft.status.slice(1)}
            </div>
          </div>
        </div>
      )}
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-primary-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <DraftRoomAssistant 
          draftId={draftId} 
          leagueId={selectedLeague?.league_id || ''}
        />
      )}
    </div>
  );
};

export default DraftRoom;