import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import League from './pages/League';
import Teams from './pages/Teams';
import Matchups from './pages/Matchups';
import Players from './pages/Players';
import PlayersV2 from './pages/PlayersV2';
import PlayerDetails from './pages/PlayerDetails';
import PlayerDetailsV2 from './pages/PlayerDetailsV2';
import MatchupDetails from './pages/MatchupDetails';
import TrendingPlayers from './pages/TrendingPlayers';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import Schedule from './pages/Schedule';
import History from './pages/History';
import DraftRoom from './pages/DraftRoom';
import DraftTiers from './pages/DraftTiers';
import DraftAssistant from './pages/DraftAssistant';
import OllamaAdmin from './pages/OllamaAdmin';
import { useSleeperStore } from './store/sleeperStore';
import { supabase } from './lib/supabase';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
import { useThemeStore } from './store/themeStore';
import { FeedbackBot } from './components/FeedbackBot';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function App() {
  const { currentUser, setCurrentUser } = useSleeperStore();
  const { theme } = useThemeStore();
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showFeedbackBot, setShowFeedbackBot] = useState(false);
  
  // Check for authenticated user on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        // Create a guest user if no user is found
        if (!currentUser) {
          const guestUser = {
            user_id: 'guest-' + Math.random().toString(36).substring(2, 9),
            username: 'guest',
            display_name: 'Guest User',
            avatar: null
          };
          
          setCurrentUser(guestUser);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setCurrentUser({
          user_id: session.user.id,
          username: session.user.user_metadata?.username || session.user.email || 'user',
          display_name: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'User',
          avatar: null
        });
        
        // Only check onboarding for authenticated users
        const checkOnboarding = async () => {
          try {
            const { data } = await supabase
              .from('user_preferences')
              .select('onboarding_completed')
              .eq('user_id', session.user.id)
              .single();
            
            // If no preferences found or onboarding not completed, show onboarding
            if (!data || !data.onboarding_completed) {
              setShowOnboarding(true);
            }
          } catch (error) {
            console.error('Onboarding check error:', error);
          }
        };
        
        checkOnboarding();
        
        // Show feedback bot after a delay
        setTimeout(() => {
          setShowFeedbackBot(true);
        }, 10000);
      } else if (event === 'SIGNED_OUT') {
        // Create a guest user on sign out
        const guestUser = {
          user_id: 'guest-' + Math.random().toString(36).substring(2, 9),
          username: 'guest',
          display_name: 'Guest User',
          avatar: null
        };
        
        setCurrentUser(guestUser);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [currentUser, setCurrentUser]);

  // Apply theme class to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-primary-500 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        {showOnboarding && currentUser && <OnboardingWizard />}
        {showFeedbackBot && <FeedbackBot onClose={() => setShowFeedbackBot(false)} />}
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Protected routes - now accessible without login */}
          <Route element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="league" element={<League />} />
            <Route path="teams" element={<Teams />} />
            <Route path="matchups" element={<Matchups />} />
            <Route path="matchups/:matchupId" element={<MatchupDetails />} />
            <Route path="players" element={<PlayersV2 />} />
            <Route path="players/v2" element={<PlayersV2 />} />
            <Route path="players/:playerId" element={<PlayerDetailsV2 />} />
            <Route path="players/v2/:playerId" element={<PlayerDetailsV2 />} />
            <Route path="trending" element={<TrendingPlayers />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="history" element={<History />} />
            <Route path="draft/:draftId" element={<DraftRoom />} />
            <Route path="draft/:draftId/tiers" element={<DraftTiers />} />
            <Route path="draft/:draftId/assistant" element={<DraftAssistant />} />
            <Route path="admin/ollama" element={<OllamaAdmin />} />
          </Route>
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;