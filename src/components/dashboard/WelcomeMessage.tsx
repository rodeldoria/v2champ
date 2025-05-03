import React, { useState, useEffect } from 'react';
import { useSleeperStore } from '../../store/sleeperStore';
import { supabase } from '../../lib/supabase';
import { Brain, X } from 'lucide-react';

export const WelcomeMessage: React.FC = () => {
  const { currentUser } = useSleeperStore();
  const [userPreferences, setUserPreferences] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const fetchUserPreferences = async () => {
      if (!currentUser) return;
      
      // Skip for guest users
      if (currentUser.user_id.startsWith('guest-')) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', currentUser.user_id)
          .single();
        
        if (error) throw error;
        setUserPreferences(data);
      } catch (error) {
        console.error('Error fetching user preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserPreferences();
  }, [currentUser]);

  if (isLoading || dismissed || !userPreferences) {
    return null;
  }

  const displayName = userPreferences.username || currentUser?.display_name || currentUser?.username || 'there';
  const favoriteTeam = Array.isArray(userPreferences.favorite_teams) && userPreferences.favorite_teams.length > 0 
    ? userPreferences.favorite_teams[0] 
    : null;
  const favoritePosition = userPreferences.favorite_position;
  const experienceLevel = userPreferences.experience_level;

  return (
    <div className="bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-500 rounded-lg p-4 mb-6 relative">
      <button 
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400"
      >
        <X size={16} />
      </button>
      
      <div className="flex items-start">
        <div className="bg-primary-100 dark:bg-primary-800 rounded-full p-2 mr-4">
          <Brain className="text-primary-600 dark:text-primary-400 w-6 h-6" />
        </div>
        
        <div>
          <h3 className="font-medium text-primary-800 dark:text-primary-300 mb-1">Welcome back, {displayName}!</h3>
          <p className="text-primary-700 dark:text-primary-400">
            {getWelcomeMessage(favoriteTeam, favoritePosition, experienceLevel)}
          </p>
        </div>
      </div>
    </div>
  );
};

const getWelcomeMessage = (team: string | null, position: string | null, experience: string | null): string => {
  let message = "Thanks for completing the onboarding! ";
  
  if (team) {
    message += `We've highlighted ${team} players for you. `;
  }
  
  if (position) {
    message += `You'll see enhanced ${position} analytics throughout the app. `;
  }
  
  if (experience === 'beginner') {
    message += "We've included helpful tips to get you started.";
  } else if (experience === 'intermediate') {
    message += "You'll find balanced insights tailored to your experience level.";
  } else if (experience === 'advanced' || experience === 'expert') {
    message += "You'll see advanced metrics and in-depth analysis.";
  } else {
    message += "Explore the dashboard to see your personalized insights.";
  }
  
  return message;
};