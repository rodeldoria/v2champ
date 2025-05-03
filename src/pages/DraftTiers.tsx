import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useSleeperStore } from '../store/sleeperStore';
import { useDraftStore, initializeDraftStore } from '../store/draftStore';
import { DraftTiersView } from '../components/draft/DraftTiersView';

const DraftTiers: React.FC = () => {
  const { draftId } = useParams<{ draftId: string }>();
  const navigate = useNavigate();
  const { selectedLeague, players, fetchAllNflPlayers } = useSleeperStore();
  const { isLoading, error, reset } = useDraftStore();
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
            <h1 className="text-2xl font-bold text-gray-800">Draft Tiers</h1>
            {selectedLeague && (
              <p className="text-gray-500">{selectedLeague.name}</p>
            )}
          </div>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-lg bg-white shadow-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
        </button>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-primary-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <DraftTiersView />
      )}
    </div>
  );
};

export default DraftTiers;