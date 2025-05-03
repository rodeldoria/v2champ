import { Player } from './sleeper';

export interface Draft {
  draft_id: string;
  league_id: string;
  status: string;
  type: string;
  season: string;
  settings: {
    rounds: number;
    slots_qb: number;
    slots_rb: number;
    slots_wr: number;
    slots_te: number;
    slots_flex: number;
    slots_def: number;
    slots_k: number;
    teams: number;
    pick_timer: number;
    reversal_round: number | null;
  };
  metadata: {
    scoring_type: string;
    name: string;
    description: string;
  };
  draft_order: Record<string, number> | null;
  slot_to_roster_id: Record<string, number> | null;
  last_picked: number;
  start_time: number;
  created: number;
}

export interface DraftPick {
  round: number;
  roster_id: number;
  player_id: string;
  picked_by: string;
  pick_no: number;
  draft_slot: number;
  draft_id: string;
  is_keeper: boolean | null;
  metadata: {
    years_exp: string;
    team: string;
    status: string;
    position: string;
    player_id: string;
    number: string;
    news_updated: string | null;
    last_name: string;
    injury_status: string | null;
    first_name: string;
  };
}

export interface DraftPlayer {
  player_id: string;
  first_name: string;
  last_name: string;
  position: string;
  team: string;
  injury_status?: string | null;
  years_exp?: number;
  adp?: number;
  rank?: number;
  tier?: number;
  boom_probability?: number;
  bust_risk?: number;
  breakout_score?: number;
  survival_odds?: number;
  tags?: string[];
  bye_week?: number;
  fantasy_points?: number;
  projected_points?: number;
  espn_rank?: number;
  yahoo_rank?: number;
  sleeper_rank?: number;
  cbs_rank?: number;
  nfl_rank?: number;
  ecr?: number; // Expert Consensus Rank
}

export interface DraftRecommendation {
  type: 'safe' | 'value' | 'boom' | 'breakout' | 'fade';
  players: DraftPlayer[];
}

export interface DraftState {
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