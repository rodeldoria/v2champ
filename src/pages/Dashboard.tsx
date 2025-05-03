import React, { useEffect } from 'react';
import { useSleeperStore } from '../store/sleeperStore';
import { TeamSummary } from '../components/dashboard/TeamSummary';
import { LeagueStandings } from '../components/dashboard/LeagueStandings';
import { EnhancedMatchups } from '../components/dashboard/EnhancedMatchups';
import { RecentTransactions } from '../components/dashboard/RecentTransactions';
import { WelcomeMessage } from '../components/dashboard/WelcomeMessage';
import { CoinEconomyPreview } from '../components/premium/CoinEconomyPreview';
import { PlayerBuffsPreview } from '../components/premium/PlayerBuffsPreview';
import { WeatherEffectsPreview } from '../components/premium/WeatherEffectsPreview';
import { InjuryImpactPreview } from '../components/premium/InjuryImpactPreview';
import { Brain, Trophy, TrendingUp, Users, Sparkles } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { 
    currentUser,
    selectedLeague,
    teams,
    isLoadingTeams,
    teamError,
    fetchAllNflPlayers,
    fetchLeagueData,
    fetchTeams,
    fetchMatchups,
    fetchTransactions
  } = useSleeperStore();
  
  useEffect(() => {
    // Load initial data when dashboard mounts
    const loadData = async () => {
      if (currentUser?.user_id && selectedLeague?.league_id) {
        await Promise.all([
          fetchAllNflPlayers(),
          fetchLeagueData(currentUser.user_id, '2024'),
          fetchTeams(selectedLeague.league_id),
          fetchMatchups(selectedLeague.league_id, 1),
          fetchTransactions(selectedLeague.league_id, 1)
        ]);
      }
    };

    loadData();
  }, [currentUser?.user_id, selectedLeague?.league_id]);
  
  if (isLoadingTeams) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-primary-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading league data...</p>
      </div>
    );
  }
  
  if (teamError) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
        <p className="font-medium">Error loading data</p>
        <p className="text-sm mt-1">{teamError}</p>
      </div>
    );
  }
  
  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Welcome to Fantasy Champs AI</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Sign in with your Sleeper username to access your leagues and get AI-powered insights.
        </p>
      </div>
    );
  }

  if (!selectedLeague) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Select a League</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Choose a league from the sidebar to view your dashboard
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <WelcomeMessage />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back, {currentUser.display_name || currentUser.username}</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
            <Brain className="text-primary-500 dark:text-primary-400" size={20} />
            <span className="text-primary-700 dark:text-primary-300 font-medium">AI Insights Active</span>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
              <Trophy className="text-primary-500 dark:text-primary-400" size={24} />
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">League Position</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {teams.findIndex(t => t.owner_id === currentUser.user_id) + 1}/{teams.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <TrendingUp className="text-green-500 dark:text-green-400" size={24} />
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Points For</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {teams.find(t => t.owner_id === currentUser.user_id)?.points_for?.toFixed(1) || '0.0'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Users className="text-blue-500 dark:text-blue-400" size={24} />
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">League</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{selectedLeague.name}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <Sparkles className="text-yellow-500 dark:text-yellow-400" size={24} />
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Premium Features</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">Coming Soon</p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Summary */}
      <TeamSummary />
      
      {/* Premium Features Preview */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
          <Sparkles className="mr-2 text-yellow-500" size={20} />
          Premium Features Coming Soon
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CoinEconomyPreview />
          <PlayerBuffsPreview />
          <WeatherEffectsPreview />
          <InjuryImpactPreview />
        </div>
      </div>
      
      {/* Grid layout for dashboard components */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EnhancedMatchups />
        <div className="grid grid-cols-1 gap-6">
          <LeagueStandings />
          <RecentTransactions />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;