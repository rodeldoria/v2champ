import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSleeperStore } from '../store/sleeperStore';
import EnhancedPlayerDetails from '../components/players/EnhancedPlayerDetails';
import { PlayerFeedbackWizard } from '../components/players/PlayerFeedbackWizard';
import { supabase } from '../lib/supabase';

const PlayerDetailsV2: React.FC = () => {
  const { playerId } = useParams();
  const { players, currentUser } = useSleeperStore();
  const [showFeedbackWizard, setShowFeedbackWizard] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get player data
  const player = playerId ? players[playerId] : null;

  // Check if user has completed the feedback wizard for this player
  useEffect(() => {
    const checkFeedbackStatus = async () => {
      if (!currentUser || !player) {
        setIsLoading(false);
        return;
      }
      
      try {
        // Skip the check for guest users
        if (currentUser.user_id.startsWith('guest-')) {
          setIsLoading(false);
          return;
        }
        
        // Check if user has completed onboarding
        const { data: preferences } = await supabase
          .from('user_preferences')
          .select('onboarding_completed')
          .eq('user_id', currentUser.user_id)
          .single();
        
        // If onboarding is not completed or we're in a special feedback mode, show the wizard
        const forceWizard = new URLSearchParams(window.location.search).get('feedback') === 'true';
        
        if (forceWizard || !preferences?.onboarding_completed) {
          setShowFeedbackWizard(true);
        }
      } catch (error) {
        console.error('Error checking feedback status:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkFeedbackStatus();
  }, [currentUser, player]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-primary-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Player Not Found</h2>
          <p className="text-gray-600">The player you're looking for doesn't exist or hasn't been loaded yet.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {showFeedbackWizard && (
        <PlayerFeedbackWizard 
          player={player} 
          onComplete={() => setShowFeedbackWizard(false)} 
        />
      )}
      <EnhancedPlayerDetails />
    </>
  );
};

export default PlayerDetailsV2;