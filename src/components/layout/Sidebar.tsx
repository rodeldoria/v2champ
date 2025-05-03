import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, Users, BarChart2, Calendar, Clock, Settings, ChevronDown, 
  ChevronUp, LineChart, Activity, TrendingUp, Shield, History, 
  RefreshCw, PenTool, Layers, Brain, Coins, Zap, Wind, 
  CloudRain, Droplet, Award, Gift, Sparkles, Flame, Target, Server
} from 'lucide-react';
import { useSleeperStore } from '../../store/sleeperStore';
import { fetchLeagueDrafts } from '../../services/draftService';
import { Draft } from '../../types/draft';
import { useThemeStore } from '../../store/themeStore';
import { NavMenu } from '../navigation/NavMenu';
import { NavItem } from '../navigation/NavItem';

interface SidebarProps {
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const { leagues, selectedLeague, setSelectedLeague, currentUser, fetchLeagueData, fetchTeams, fetchMatchups, fetchTransactions, fetchLeagueUsers } = useSleeperStore();
  const { theme } = useThemeStore();
  const [isLeaguesOpen, setIsLeaguesOpen] = useState(true);
  const [isDraftsOpen, setIsDraftsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingLeagueId, setLoadingLeagueId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [showPremiumFeatures, setShowPremiumFeatures] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Get avatar URL
  const getAvatarUrl = (avatarId: string | null | undefined) => {
    if (!avatarId) return `https://ui-avatars.com/api/?name=Unknown&background=6366f1&color=fff`;
    return `https://sleepercdn.com/avatars/${avatarId}`;
  };
  
  const mainNavItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Players', path: '/players', icon: Activity },
    { name: 'Trending', path: '/trending', icon: TrendingUp },
    { name: 'Teams', path: '/teams', icon: Shield },
    { name: 'Matchups', path: '/matchups', icon: Target },
  ];

  const analysisNavItems = [
    { name: 'Player Comparison', path: '/compare', icon: BarChart2, comingSoon: true },
    { name: 'Trade Analyzer', path: '/trades', icon: RefreshCw, comingSoon: true },
    { name: 'Waiver Wire', path: '/waivers', icon: LineChart, comingSoon: true },
    { name: 'Schedule', path: '/schedule', icon: Calendar },
    { name: 'History', path: '/history', icon: History },
  ];

  const adminNavItems = [
    { name: 'Ollama Admin', path: '/admin/ollama', icon: Server },
  ];

  const premiumNavItems = [
    { name: 'Coin Economy', path: '/coins', icon: Coins, comingSoon: true },
    { name: 'Player Buffs', path: '/buffs', icon: Zap, comingSoon: true },
    { name: 'Injury Impact', path: '/injuries', icon: Droplet, comingSoon: true },
    { name: 'Weather Effects', path: '/weather', icon: CloudRain, comingSoon: true },
    { name: 'Matchup Boosts', path: '/boosts', icon: Flame, comingSoon: true },
    { name: 'Achievements', path: '/achievements', icon: Award, comingSoon: true },
    { name: 'Rewards Shop', path: '/rewards', icon: Gift, comingSoon: true },
  ];

  const handleLeagueChange = async (league: any) => {
    try {
      setIsLoading(true);
      setLoadingLeagueId(league.league_id);
      
      // Set the selected league first
      setSelectedLeague(league);
      
      // Fetch league data
      if (league.league_id) {
        await Promise.all([
          fetchTeams(league.league_id),
          fetchMatchups(league.league_id, 1),
          fetchTransactions(league.league_id, 1),
          fetchLeagueUsers(league.league_id)
        ]);
        
        // Fetch drafts for this league
        const draftsData = await fetchLeagueDrafts(league.league_id);
        setDrafts(draftsData);
      }
      
      // Close mobile menu if needed
      onClose?.();
      
      // Navigate to dashboard to show the new league
      navigate('/');
    } catch (error) {
      console.error('Error changing league:', error);
    } finally {
      setIsLoading(false);
      setLoadingLeagueId(null);
    }
  };

  // Refresh leagues
  const refreshLeagues = async () => {
    if (!currentUser?.user_id) {
      console.error('Cannot refresh leagues: No current user');
      return;
    }
    
    try {
      setIsLoading(true);
      console.log(`Refreshing leagues for user ${currentUser.user_id}`);
      await fetchLeagueData(currentUser.user_id, '2024');
    } catch (error) {
      console.error('Error refreshing leagues:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load drafts when selected league changes
  useEffect(() => {
    const loadDrafts = async () => {
      if (selectedLeague?.league_id) {
        try {
          const draftsData = await fetchLeagueDrafts(selectedLeague.league_id);
          setDrafts(draftsData);
        } catch (error) {
          console.error('Error loading drafts:', error);
        }
      }
    };
    
    loadDrafts();
  }, [selectedLeague?.league_id]);
  
  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
      {/* Logo and User Profile */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="bg-primary-500 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold">
            FC
          </div>
          <h1 className="text-lg font-bold text-gray-800 dark:text-gray-200">Fantasy Champs</h1>
        </div>
        {currentUser && (
          <div className="w-8 h-8 rounded-full overflow-hidden">
            {currentUser.avatar ? (
              <img 
                src={getAvatarUrl(currentUser.avatar)}
                alt={currentUser.display_name || currentUser.username}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${
                    currentUser.display_name || currentUser.username
                  }&background=6366f1&color=fff`;
                }}
              />
            ) : (
              <div className="w-full h-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                <Users size={16} className="text-primary-500 dark:text-primary-400" />
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4" role="navigation">
        <div className="space-y-1 mb-6">
          {mainNavItems.map((item) => (
            <NavItem 
              key={item.name}
              to={item.path}
              icon={item.icon}
              label={item.name}
              onClick={onClose}
            />
          ))}
        </div>
        
        {/* Analysis Tools */}
        <NavMenu title="Analysis Tools" icon={Brain} defaultOpen={true}>
          {analysisNavItems.map((item) => (
            <div key={item.name} className="relative">
              <NavItem 
                to={item.comingSoon ? '#' : item.path}
                icon={item.icon}
                label={item.name}
                onClick={item.comingSoon ? (e) => e.preventDefault() : onClose}
              />
              {item.comingSoon && (
                <span className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs px-1.5 py-0.5 rounded-full">
                  Soon
                </span>
              )}
            </div>
          ))}
        </NavMenu>
        
        {/* Admin Tools */}
        <NavMenu title="Admin Tools" icon={Server}>
          {adminNavItems.map((item) => (
            <div key={item.name} className="relative">
              <NavItem 
                to={item.path}
                icon={item.icon}
                label={item.name}
                onClick={onClose}
              />
            </div>
          ))}
        </NavMenu>
        
        {/* Premium Features */}
        <NavMenu title="Premium Features" icon={Sparkles}>
          {premiumNavItems.map((item) => (
            <div key={item.name} className="relative">
              <NavItem 
                to={item.comingSoon ? '#' : item.path}
                icon={item.icon}
                label={item.name}
                onClick={item.comingSoon ? (e) => e.preventDefault() : onClose}
              />
              {item.comingSoon && (
                <span className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 text-xs px-1.5 py-0.5 rounded-full">
                  Coming Soon
                </span>
              )}
            </div>
          ))}
        </NavMenu>
        
        {/* Leagues section */}
        <div className="mt-8">
          <div className="flex items-center justify-between px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <button
              className="w-full flex items-center justify-between rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1"
              onClick={() => setIsLeaguesOpen(!isLeaguesOpen)}
              aria-expanded={isLeaguesOpen}
            >
              <span className="flex items-center">
                <Users size={16} className="mr-2" />
                My Leagues
              </span>
              {isLeaguesOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            
            <button 
              onClick={refreshLeagues}
              disabled={isLoading}
              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Refresh leagues"
            >
              <RefreshCw size={16} className={`text-gray-500 dark:text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          {isLeaguesOpen && leagues?.length > 0 && (
            <ul className="mt-1 pl-3 space-y-1" role="menu">
              {leagues.map((league) => (
                <li key={league.league_id} role="menuitem">
                  <button
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                      selectedLeague?.league_id === league.league_id
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-medium'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => handleLeagueChange(league)}
                    disabled={isLoading && loadingLeagueId === league.league_id}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{league.name}</span>
                      {isLoading && loadingLeagueId === league.league_id && (
                        <RefreshCw size={14} className="animate-spin ml-2 text-primary-500 dark:text-primary-400" />
                      )}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">Season {league.season}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}
          
          {isLeaguesOpen && (!leagues || leagues.length === 0) && (
            <p className="text-sm text-gray-500 dark:text-gray-400 px-3 py-2">No leagues found</p>
          )}
        </div>
        
        {/* Drafts section */}
        <div className="mt-4">
          <div className="flex items-center justify-between px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <button
              className="w-full flex items-center justify-between rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1"
              onClick={() => setIsDraftsOpen(!isDraftsOpen)}
              aria-expanded={isDraftsOpen}
            >
              <span className="flex items-center">
                <PenTool size={16} className="mr-2" />
                Drafts
              </span>
              {isDraftsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
          
          {isDraftsOpen && drafts?.length > 0 && (
            <ul className="mt-1 pl-3 space-y-1" role="menu">
              {drafts.map((draft) => (
                <li key={draft.draft_id} role="menuitem" className="space-y-1">
                  <NavLink
                    to={`/draft/${draft.draft_id}`}
                    onClick={onClose}
                    className={({ isActive }) => 
                      `block px-3 py-2 text-sm rounded-lg transition-colors ${
                        isActive 
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-medium'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`
                    }
                  >
                    <div className="truncate">
                      {draft.metadata.name || 'League Draft'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {draft.status.charAt(0).toUpperCase() + draft.status.slice(1)}
                    </div>
                  </NavLink>
                  
                  <NavLink
                    to={`/draft/${draft.draft_id}/tiers`}
                    onClick={onClose}
                    className={({ isActive }) => 
                      `block px-3 py-2 text-sm rounded-lg transition-colors flex items-center ${
                        isActive 
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-medium'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`
                    }
                  >
                    <Layers size={14} className="mr-2" />
                    <div className="truncate">
                      Tier View
                    </div>
                  </NavLink>
                  
                  <NavLink
                    to={`/draft/${draft.draft_id}/assistant`}
                    onClick={onClose}
                    className={({ isActive }) => 
                      `block px-3 py-2 text-sm rounded-lg transition-colors flex items-center ${
                        isActive 
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-medium'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`
                    }
                  >
                    <Brain size={14} className="mr-2" />
                    <div className="truncate">
                      AI Assistant
                    </div>
                  </NavLink>
                </li>
              ))}
            </ul>
          )}
          
          {isDraftsOpen && (!drafts || drafts.length === 0) && (
            <p className="text-sm text-gray-500 dark:text-gray-400 px-3 py-2">No drafts found</p>
          )}
        </div>
      </nav>
      
      {/* Bottom settings */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <NavLink
          to="/settings"
          onClick={onClose}
          className={({ isActive }) => 
            `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive 
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' 
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`
          }
        >
          <Settings size={18} className="mr-3" />
          Settings
        </NavLink>
      </div>
    </div>
  );
};