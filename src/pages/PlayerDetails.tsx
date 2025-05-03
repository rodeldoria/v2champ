import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSleeperStore } from '../store/sleeperStore';

const PlayerDetails: React.FC = () => {
  const { playerId } = useParams();
  const navigate = useNavigate();
  const { isLoadingPlayers } = useSleeperStore();
  
  // Redirect to PlayerDetailsV2 page
  useEffect(() => {
    if (!isLoadingPlayers && playerId) {
      navigate(`/players/v2/${playerId}`);
    }
  }, [navigate, playerId, isLoadingPlayers]);
  
  if (isLoadingPlayers) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-primary-500 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="text-center py-12">
      <p className="text-gray-500">Redirecting to enhanced player details...</p>
    </div>
  );
};

export default PlayerDetails;