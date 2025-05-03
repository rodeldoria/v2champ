export interface Player {
  player_id: string;
  first_name: string;
  last_name: string;
  team?: string;
  position?: string;
  age?: number;
  injury_status?: string;
  fantasy_positions?: string[];
  stats?: Record<string, number>;
  fantasy_data?: PlayerFantasyData;
  status?: string;
  depth_chart_order?: number;
  active?: boolean;
  last_modified?: string;
  rank?: number;
  years_exp?: number;
}

export interface PlayerFantasyData {
  rank?: number;
  position_rank?: number;
  fantasy_points?: number;
  projected_points?: number;
}

export interface User {
  user_id: string;
  username: string;
  display_name?: string;
  avatar?: string;
  email?: string;
}

export interface League {
  league_id: string;
  name: string;
  season: string;
  total_rosters: number;
  settings: LeagueSettings;
  scoring_settings: Record<string, number>;
  status: string;
}

export interface LeagueSettings {
  league_type?: number;
  team_name?: string;
  [key: string]: any;
}

export interface Team {
  roster_id: number;
  owner_id?: string;
  league_id: string;
  settings?: TeamSettings;
  wins?: number;
  losses?: number;
  ties?: number;
  points_for?: number;
  points_against?: number;
}

export interface TeamSettings {
  team_name?: string;
  [key: string]: any;
}

export interface Matchup {
  matchup_id: number;
  roster_id: number;
  points: number;
  custom_points?: number;
  players?: string[];
  starters?: string[];
  [key: string]: any;
}

export interface Transaction {
  transaction_id: string;
  type: string;
  status: string;
  roster_ids: number[];
  adds?: Record<string, number>;
  drops?: Record<string, number>;
  draft_picks?: any[];
  waiver_budget?: any[];
  created: number;
}