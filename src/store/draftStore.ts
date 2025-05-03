import { create } from 'zustand';
import { fetchDraft, fetchDraftPicks, enhancePlayerData } from '../services/draftService';
import { Draft, DraftPick, DraftPlayer, DraftRecommendation } from '../types/draft';
import { Player } from '../types/sleeper';
import { calculatePlayerAttributes, calculateFantasyPoints, calculatePlayerScores } from '../services/playerAttributesService';

interface DraftState {
  draft: Draft | null;
  picks: DraftPick[];
  availablePlayers: DraftPlayer[];
  myNextPick: number | null;
  myDraftPosition: number | null;
  currentPick: number;
  recommendations: Record<string, DraftRecommendation>;
  isLoading: boolean;
  error: string | null;
}

interface DraftStore extends DraftState {
  loadDraft: (draftId: string) => Promise<void>;
  loadDraftPicks: (draftId: string) => Promise<void>;
  setDraftPosition: (position: number) => void;
  draftPlayer: (player_id: string) => void;
  reset: () => void;
}

// Initial state
const initialState: DraftState = {
  draft: null,
  picks: [],
  availablePlayers: [],
  myNextPick: null,
  myDraftPosition: null,
  currentPick: 1,
  recommendations: {},
  isLoading: false,
  error: null
};

export const useDraftStore = create<DraftStore>((set, get) => ({
  ...initialState,

  loadDraft: async (draftId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // Handle empty or invalid draftId
      if (!draftId) {
        throw new Error('Invalid draft ID provided');
      }

      console.log(`Attempting to load draft with ID: ${draftId}`);
      const draft = await fetchDraft(draftId);
      
      if (!draft) {
        throw new Error('Draft not found');
      }
      
      set({ draft, isLoading: false });
      
      // Load draft picks after loading draft
      await get().loadDraftPicks(draftId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load draft';
      console.error('Error loading draft:', error);
      set({ 
        isLoading: false, 
        error: errorMessage,
        draft: null
      });
    }
  },

  loadDraftPicks: async (draftId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // Handle empty or invalid draftId
      if (!draftId) {
        throw new Error('Invalid draft ID provided');
      }

      console.log(`Attempting to load draft picks for draft ID: ${draftId}`);
      const picks = await fetchDraftPicks(draftId);
      set({ picks, isLoading: false });
      
      // Update current pick
      if (picks.length > 0) {
        set({ currentPick: picks.length + 1 });
      }
      
      // Calculate my next pick if draft position is set
      const { myDraftPosition, draft } = get();
      if (myDraftPosition && draft) {
        const myNextPick = calculateNextPick(myDraftPosition, picks.length + 1, draft);
        set({ myNextPick });
      }
      
      // Generate mock available players and recommendations
      const availablePlayers = generateMockAvailablePlayers(picks);
      const recommendations = generateMockRecommendations(availablePlayers);
      
      set({ availablePlayers, recommendations });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load draft picks';
      console.error('Error loading draft picks:', error);
      set({ 
        isLoading: false, 
        error: errorMessage,
        picks: []
      });
    }
  },

  setDraftPosition: (position: number) => {
    set({ myDraftPosition: position });
    
    // Recalculate next pick
    const { draft, picks } = get();
    if (draft && position) {
      const myNextPick = calculateNextPick(position, picks.length + 1, draft);
      set({ myNextPick });
    }
  },

  draftPlayer: (player_id: string) => {
    const { availablePlayers, recommendations } = get();
    
    // Remove player from available players
    const updatedPlayers = availablePlayers.filter(p => p.player_id !== player_id);
    
    // Update recommendations
    const updatedRecommendations = { ...recommendations };
    Object.keys(updatedRecommendations).forEach(key => {
      updatedRecommendations[key as keyof typeof updatedRecommendations].players = 
        updatedRecommendations[key as keyof typeof updatedRecommendations].players.filter(p => p.player_id !== player_id);
    });
    
    set({ availablePlayers: updatedPlayers, recommendations: updatedRecommendations });
  },

  reset: () => {
    set(initialState);
  }
}));

// Helper function to calculate next pick for a draft position
const calculateNextPick = (draftPosition: number, currentPick: number, draft: Draft): number | null => {
  const { rounds, teams } = draft.settings;
  const totalPicks = rounds * teams;
  
  if (currentPick > totalPicks) return null;
  
  // Find the next pick for this draft position
  for (let pick = currentPick; pick <= totalPicks; pick++) {
    const round = Math.ceil(pick / teams);
    const pickInRound = ((pick - 1) % teams) + 1;
    
    // For snake drafts, reverse even rounds
    const isSnake = draft.type === 'snake';
    const isReverseRound = isSnake && round % 2 === 0;
    
    const effectivePosition = isReverseRound ? teams - pickInRound + 1 : pickInRound;
    
    if (effectivePosition === draftPosition) {
      return pick;
    }
  }
  
  return null;
};

// Helper function to generate mock available players
const generateMockAvailablePlayers = (picks: DraftPick[]): DraftPlayer[] => {
  // Create a set of already picked player IDs
  const pickedPlayerIds = new Set(picks.map(pick => pick.player_id));
  
  // Generate mock players that haven't been picked
  const mockPlayers: DraftPlayer[] = [];
  
  // QB
  for (let i = 1; i <= 32; i++) {
    const player_id = `QB${i}`;
    if (!pickedPlayerIds.has(player_id)) {
      const player = {
        player_id: player_id,
        first_name: `Quarterback`,
        last_name: `${i}`,
        position: 'QB',
        team: `Team ${i % 32 + 1}`,
        rank: i * 5,
        adp: i * 5.5,
        tier: Math.ceil(i / 8),
        years_exp: Math.floor(Math.random() * 10)
      };
      
      // Add boom/bust/breakout scores
      const scores = calculatePlayerScores(player as unknown as Player);
      
      mockPlayers.push({
        ...player,
        ...scores
      });
    }
  }
  
  // RB
  for (let i = 1; i <= 50; i++) {
    const player_id = `RB${i}`;
    if (!pickedPlayerIds.has(player_id)) {
      const player = {
        player_id: player_id,
        first_name: `Running`,
        last_name: `Back ${i}`,
        position: 'RB',
        team: `Team ${i % 32 + 1}`,
        rank: i * 2,
        adp: i * 2.2,
        tier: Math.ceil(i / 10),
        years_exp: Math.floor(Math.random() * 8)
      };
      
      // Add boom/bust/breakout scores
      const scores = calculatePlayerScores(player as unknown as Player);
      
      mockPlayers.push({
        ...player,
        ...scores
      });
    }
  }
  
  // WR
  for (let i = 1; i <= 60; i++) {
    const player_id = `WR${i}`;
    if (!pickedPlayerIds.has(player_id)) {
      const player = {
        player_id: player_id,
        first_name: `Wide`,
        last_name: `Receiver ${i}`,
        position: 'WR',
        team: `Team ${i % 32 + 1}`,
        rank: i * 2 + 1,
        adp: i * 2.3,
        tier: Math.ceil(i / 12),
        years_exp: Math.floor(Math.random() * 10)
      };
      
      // Add boom/bust/breakout scores
      const scores = calculatePlayerScores(player as unknown as Player);
      
      mockPlayers.push({
        ...player,
        ...scores
      });
    }
  }
  
  // TE
  for (let i = 1; i <= 30; i++) {
    const player_id = `TE${i}`;
    if (!pickedPlayerIds.has(player_id)) {
      const player = {
        player_id: player_id,
        first_name: `Tight`,
        last_name: `End ${i}`,
        position: 'TE',
        team: `Team ${i % 32 + 1}`,
        rank: i * 5 + 20,
        adp: i * 5.5 + 20,
        tier: Math.ceil(i / 6),
        years_exp: Math.floor(Math.random() * 10)
      };
      
      // Add boom/bust/breakout scores
      const scores = calculatePlayerScores(player as unknown as Player);
      
      mockPlayers.push({
        ...player,
        ...scores
      });
    }
  }
  
  // K and DEF
  for (let i = 1; i <= 32; i++) {
    const kPlayer_id = `K${i}`;
    const defPlayer_id = `DEF${i}`;
    
    if (!pickedPlayerIds.has(kPlayer_id)) {
      const player = {
        player_id: kPlayer_id,
        first_name: `Kicker`,
        last_name: `${i}`,
        position: 'K',
        team: `Team ${i % 32 + 1}`,
        rank: i * 5 + 150,
        adp: i * 5.5 + 150,
        tier: Math.ceil(i / 8),
        years_exp: Math.floor(Math.random() * 15)
      };
      
      // Add boom/bust/breakout scores
      const scores = calculatePlayerScores(player as unknown as Player);
      
      mockPlayers.push({
        ...player,
        ...scores
      });
    }
    
    if (!pickedPlayerIds.has(defPlayer_id)) {
      const player = {
        player_id: defPlayer_id,
        first_name: `Defense`,
        last_name: `${i}`,
        position: 'DEF',
        team: `Team ${i % 32 + 1}`,
        rank: i * 5 + 180,
        adp: i * 5.5 + 180,
        tier: Math.ceil(i / 8)
      };
      
      // Add boom/bust/breakout scores with default values
      mockPlayers.push({
        ...player,
        boom_probability: 50,
        bust_risk: 50,
        breakout_score: 50
      });
    }
  }
  
  return mockPlayers;
};

// Helper function to generate mock recommendations
const generateMockRecommendations = (availablePlayers: DraftPlayer[]): Record<string, DraftRecommendation> => {
  // Sort players by rank
  const sortedPlayers = [...availablePlayers].sort((a, b) => (a.rank || 999) - (b.rank || 999));
  
  // Get top players by position
  const topQBs = sortedPlayers.filter(p => p.position === 'QB').slice(0, 3);
  const topRBs = sortedPlayers.filter(p => p.position === 'RB').slice(0, 5);
  const topWRs = sortedPlayers.filter(p => p.position === 'WR').slice(0, 5);
  const topTEs = sortedPlayers.filter(p => p.position === 'TE').slice(0, 3);
  
  // Get players with high boom potential
  const boomPlayers = [...availablePlayers]
    .sort((a, b) => (b.boom_probability || 0) - (a.boom_probability || 0))
    .slice(0, 5);
  
  // Get players with high breakout scores
  const breakoutPlayers = [...availablePlayers]
    .sort((a, b) => (b.breakout_score || 0) - (a.breakout_score || 0))
    .slice(0, 5);
  
  // Get players with high bust risk (to fade)
  const fadePlayers = [...availablePlayers]
    .sort((a, b) => (b.bust_risk || 0) - (a.bust_risk || 0))
    .slice(0, 5);
  
  // Get value players (rank much better than ADP)
  const valuePlayers = [...availablePlayers]
    .filter(p => (p.adp || 999) - (p.rank || 0) > 10)
    .sort((a, b) => ((b.adp || 0) - (b.rank || 0)) - ((a.adp || 0) - (a.rank || 0)))
    .slice(0, 5);
  
  return {
    safe: {
      type: 'safe',
      players: [...topQBs, ...topRBs, ...topWRs, ...topTEs].slice(0, 5)
    },
    value: {
      type: 'value',
      players: valuePlayers
    },
    boom: {
      type: 'boom',
      players: boomPlayers
    },
    breakout: {
      type: 'breakout',
      players: breakoutPlayers
    },
    fade: {
      type: 'fade',
      players: fadePlayers
    }
  };
};

// Function to initialize the draft store with player data
export const initializeDraftStore = async (
  draftId: string, 
  draftPosition: number,
  playerData: Record<string, Player>
) => {
  const { loadDraft, setDraftPosition } = useDraftStore.getState();
  
  // Set draft position
  setDraftPosition(draftPosition);
  
  // Load draft data
  await loadDraft(draftId);
};