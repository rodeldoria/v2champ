import React, { useState, useEffect } from 'react';
import { Menu, Search, Bell, User, X, Database, Globe, ChevronDown, LogOut } from 'lucide-react';
import { useSleeperStore } from '../../store/sleeperStore';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, signOut } from '../../lib/supabase';
import { ThemeToggle } from './ThemeToggle';

export const Navbar: React.FC = () => {
  const { currentUser, selectedLeague, leagues, setSelectedLeague, dataSource, loadedRows } = useSleeperStore();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLeagueDropdownOpen, setIsLeagueDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Get avatar URL
  const getAvatarUrl = (avatarId: string | null | undefined) => {
    if (!avatarId) return null;
    return `https://sleepercdn.com/avatars/${avatarId}`;
  };

  const handleLeagueChange = (league: any) => {
    setSelectedLeague(league);
    setIsLeagueDropdownOpen(false);
  };

  // Check for Supabase user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setSupabaseUser(user);
    };
    
    getUser();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSupabaseUser(session?.user || null);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/players?search=${encodeURIComponent(searchTerm)}`);
      setIsSearchOpen(false);
      setSearchTerm('');
    }
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm z-10">
      <div className="flex justify-between items-center px-4 py-3">
        {/* League title - desktop */}
        <div className="hidden md:block relative">
          <div 
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 px-3 py-2 rounded-lg"
            onClick={() => setIsLeagueDropdownOpen(!isLeagueDropdownOpen)}
          >
            <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              {selectedLeague?.name || 'Fantasy Champs AI'}
            </h1>
            <ChevronDown size={18} className={`text-gray-500 dark:text-gray-400 transition-transform ${isLeagueDropdownOpen ? 'transform rotate-180' : ''}`} />
          </div>
          
          {isLeagueDropdownOpen && leagues.length > 0 && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
              <div className="py-1">
                {leagues.map(league => (
                  <button
                    key={league.league_id}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      selectedLeague?.league_id === league.league_id ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300'
                    }`}
                    onClick={() => handleLeagueChange(league)}
                  >
                    <div className="font-medium">{league.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Season {league.season}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {selectedLeague && (
            <p className="text-sm text-gray-500 dark:text-gray-400">Season {selectedLeague.season}</p>
          )}
        </div>
        
        {/* League title - mobile */}
        <div className="md:hidden">
          <div 
            className="flex items-center gap-1 cursor-pointer"
            onClick={() => setIsLeagueDropdownOpen(!isLeagueDropdownOpen)}
          >
            <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[200px]">
              {selectedLeague?.name || 'Fantasy Champs'}
            </h1>
            <ChevronDown size={16} className={`text-gray-500 dark:text-gray-400 transition-transform ${isLeagueDropdownOpen ? 'transform rotate-180' : ''}`} />
          </div>
          
          {isLeagueDropdownOpen && leagues.length > 0 && (
            <div className="absolute top-16 left-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
              <div className="py-1">
                {leagues.map(league => (
                  <button
                    key={league.league_id}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      selectedLeague?.league_id === league.league_id ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300'
                    }`}
                    onClick={() => handleLeagueChange(league)}
                  >
                    <div className="font-medium">{league.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Season {league.season}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Right side items */}
        <div className="flex items-center space-x-3">
          {/* Data source indicator */}
          <div className="hidden md:flex items-center space-x-4 px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-2">
              {dataSource === 'DB' ? (
                <Database size={16} className="text-primary-500 dark:text-primary-400" />
              ) : (
                <Globe size={16} className="text-primary-500 dark:text-primary-400" />
              )}
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Source: <span className="text-primary-600 dark:text-primary-400">{dataSource}</span>
              </span>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Players: <span className="font-medium">{loadedRows}</span>
            </div>
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Search toggle */}
          <button 
            className="text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 focus:outline-none"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            aria-label={isSearchOpen ? 'Close search' : 'Open search'}
          >
            {isSearchOpen ? <X size={20} /> : <Search size={20} />}
          </button>
          
          {/* Notifications */}
          <button 
            className="text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 focus:outline-none relative"
            aria-label="Notifications"
          >
            <Bell size={20} />
            <span className="absolute top-0 right-0 inline-block w-2 h-2 bg-accent-400 rounded-full"></span>
          </button>
          
          {/* User profile */}
          <div className="relative">
            <button 
              className="flex items-center space-x-2 focus:outline-none"
              aria-label="User menu"
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            >
              <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 overflow-hidden flex items-center justify-center">
                {currentUser?.avatar ? (
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
                  <User size={16} className="text-primary-500 dark:text-primary-400" />
                )}
              </div>
              <span className="hidden md:inline-block text-sm font-medium text-gray-700 dark:text-gray-300">
                {supabaseUser?.user_metadata?.username || 
                 currentUser?.display_name || 
                 currentUser?.username || 
                 supabaseUser?.email || 
                 'Guest'}
              </span>
            </button>
            
            {isUserDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                <div className="py-1">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                    <p className="font-medium text-gray-800 dark:text-gray-200">
                      {supabaseUser?.user_metadata?.username || 
                       currentUser?.display_name || 
                       currentUser?.username || 
                       supabaseUser?.email || 
                       'Guest'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {supabaseUser?.email || currentUser?.username || 'Guest User'}
                    </p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setIsUserDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setIsUserDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  >
                    <LogOut size={14} className="mr-2" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Search bar */}
      {isSearchOpen && (
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-t border-b border-gray-200 dark:border-gray-700 animate-fade-in">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input 
                type="text" 
                placeholder="Search for players, teams, leagues..." 
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </form>
        </div>
      )}

      {/* Enhanced Navigation Links */}
      <div className="hidden md:flex px-4 py-2 border-t border-gray-200 dark:border-gray-700">
        <div className="flex space-x-4">
          <Link 
            to="/players" 
            className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-2 py-1"
          >
            Players
          </Link>
          <Link 
            to="/trending" 
            className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-2 py-1"
          >
            Trending
          </Link>
          <Link 
            to="/teams" 
            className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-2 py-1"
          >
            Teams
          </Link>
        </div>
      </div>
    </header>
  );
};