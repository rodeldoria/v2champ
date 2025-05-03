import { create } from 'zustand';
import { Player, User, League, Team, Matchup, Transaction } from '../types/sleeper';
import { getUserByUsername, fetchLeagues, fetchTeams, fetchMatchups, fetchTransactions } from '../services/sleeperService';
import { fetchAllPlayers } from '../services/sleeperService';
import { fetchPlayerStats } from '../api/sleeperApi';
import { processPlayerStats } from '../services/stats';

interface SleeperState {
  currentUser: User | null;
  teams: Team[];
  transactions: Transaction[];
  players: Record<string, Player>;
  playerStats: Record<string, Record<string, Record<string, number>>>;
  isLoadingPlayers: boolean;
  isLoadingStats: boolean;
  teamError: string | null;
  userError: string | null;
  currentWeek: number;
  selectedLeague: League | null;
  leagues: League[];
  userTeams: Team[];
  matchups: Matchup[];
  dataSource: 'API' | 'DB';
  loadedRows: number;
  users: Record<string, User>;
  fetchUserByUsername: (username: string) => Promise<void>;
  fetchLeagueData: (userId: string, season: string) => Promise<void>;
  fetchTeams: (leagueId: string) => Promise<void>;
  fetchMatchups: (leagueId: string, week: number) => Promise<void>;
  fetchTransactions: (leagueId: string, week: number) => Promise<void>;
  fetchAllNflPlayers: () => Promise<void>;
  fetchPlayerStats: (playerId: string, season: string, week: number) => Promise<void>;
  fetchLeagueUsers: (leagueId: string) => Promise<void>;
  setCurrentWeek: (week: number) => void;
  setSelectedLeague: (league: League) => void;
  setDataSource: (source: 'API' | 'DB') => void;
  setLoadedRows: (count: number) => void;
  setMatchups: (matchups: Matchup[]) => void;
  setCurrentUser: (user: User | null) => void;
}

export const useSleeperStore = create<SleeperState>((set, get) => ({
  currentUser: null,
  teams: [],
  transactions: [],
  players: {},
  playerStats: {},
  isLoadingPlayers: false,
  isLoadingStats: false,
  teamError: null,
  userError: null,
  currentWeek: 1,
  selectedLeague: null,
  leagues: [],
  userTeams: [],
  matchups: [],
  dataSource: 'API',
  loadedRows: 0,
  users: {},

  setCurrentWeek: (week: number) => set({ currentWeek: week }),
  setSelectedLeague: (league: League) => set({ selectedLeague: league }),
  setDataSource: (source: 'API' | 'DB') => set({ dataSource: source }),
  setLoadedRows: (count: number) => set({ loadedRows: count }),
  setMatchups: (matchups: Matchup[]) => set({ matchups }),
  setCurrentUser: (user: User | null) => set({ currentUser: user }),

  fetchUserByUsername: async (username: string) => {
    try {
      set({ userError: null });
      const user = await getUserByUsername(username);
      if (!user) {
        throw new Error('User not found');
      }
      set({ currentUser: user, userError: null });

      // After fetching user, get their leagues
      if (user.user_id) {
        await get().fetchLeagueData(user.user_id, '2024');
      }
    } catch (error) {
      set({ userError: 'Invalid username. Please check your Sleeper username and try again.' });
      throw error;
    }
  },

  fetchLeagueData: async (userId: string, season: string) => {
    try {
      // Validate inputs
      if (!userId) {
        console.error('fetchLeagueData: userId is required but was not provided');
        set({ teamError: 'User ID is required to fetch league data' });
        return;
      }

      console.log(`Fetching league data for user ${userId} and season ${season}`);
      const leagues = await fetchLeagues(userId, season);
      set({ leagues });

      // If leagues exist, select the first one and fetch its data
      if (leagues.length > 0) {
        const firstLeague = leagues[0];
        set({ selectedLeague: firstLeague });
        await get().fetchTeams(firstLeague.league_id);
        await get().fetchLeagueUsers(firstLeague.league_id);
        await get().fetchMatchups(firstLeague.league_id, get().currentWeek);
        await get().fetchTransactions(firstLeague.league_id, get().currentWeek);
      } else {
        console.log('No leagues found for user');
      }

      // Also fetch all NFL players
      await get().fetchAllNflPlayers();
    } catch (error) {
      console.error('Error fetching league data:', error);
      set({ teamError: 'Failed to fetch league data' });
    }
  },

  fetchAllNflPlayers: async () => {
    try {
      set({ isLoadingPlayers: true, teamError: null });
      const players = await fetchAllPlayers();
      set({ 
        players, 
        isLoadingPlayers: false,
        loadedRows: Object.keys(players).length 
      });
    } catch (error) {
      console.error('Error fetching NFL players:', error);
      set({ 
        teamError: 'Failed to fetch NFL players',
        isLoadingPlayers: false 
      });
    }
  },

  fetchTeams: async (leagueId: string) => {
    try {
      set({ teamError: null });
      const teams = await fetchTeams(leagueId);
      
      // Update teams state
      set({ teams });

      // Filter user's teams
      const userTeams = teams.filter(team => team.owner_id === get().currentUser?.user_id);
      set({ userTeams });
    } catch (error) {
      console.error('Error fetching teams:', error);
      set({ teamError: 'Failed to fetch teams' });
    }
  },

  fetchLeagueUsers: async (leagueId: string) => {
    try {
      const response = await fetch(`${BASE_URL}/league/${leagueId}/users`);
      if (!response.ok) throw new Error('Failed to fetch league users');
      
      const leagueUsers = await response.json();
      
      // Convert array to record for easier lookup
      const usersRecord: Record<string, User> = {};
      leagueUsers.forEach((user: User) => {
        if (user.user_id) {
          usersRecord[user.user_id] = user;
        }
      });
      
      set({ users: usersRecord });
    } catch (error) {
      console.error('Error fetching league users:', error);
    }
  },

  fetchMatchups: async (leagueId: string, week: number) => {
    try {
      const matchups = await fetchMatchups(leagueId, week);
      set({ matchups });
    } catch (error) {
      console.error('Error fetching matchups:', error);
    }
  },

  fetchTransactions: async (leagueId: string, week: number) => {
    try {
      const transactions = await fetchTransactions(leagueId, week);
      set({ transactions });
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  },

  fetchPlayerStats: async (playerId: string, season: string, week: number) => {
    try {
      set({ isLoadingStats: true });
      
      // Check if stats already exist in store
      const existingStats = get().playerStats[playerId]?.[season]?.[week];
      if (existingStats) {
        set({ isLoadingStats: false });
        return;
      }

      const stats = await fetchPlayerStats(playerId, season, week);
      
      set(state => ({
        playerStats: {
          ...state.playerStats,
          [playerId]: {
            ...state.playerStats[playerId],
            [season]: {
              ...state.playerStats[playerId]?.[season],
              [week]: stats
            }
          }
        },
        isLoadingStats: false
      }));
    } catch (error) {
      console.error('Error fetching player stats:', error);
      set({ isLoadingStats: false });
    }
  }
}));