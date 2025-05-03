-- PostgreSQL Schema for Sleeper Fantasy Football App

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  avatar VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Leagues table
CREATE TABLE IF NOT EXISTS leagues (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  season VARCHAR(10) NOT NULL,
  total_rosters INTEGER NOT NULL,
  roster_positions JSONB NOT NULL,
  scoring_settings JSONB NOT NULL,
  status VARCHAR(50) NOT NULL,
  settings JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Leagues (many-to-many relationship)
CREATE TABLE IF NOT EXISTS user_leagues (
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  league_id VARCHAR(255) REFERENCES leagues(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, league_id)
);

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  roster_id INTEGER NOT NULL,
  owner_id VARCHAR(255) REFERENCES users(id),
  league_id VARCHAR(255) REFERENCES leagues(id) ON DELETE CASCADE,
  team_name VARCHAR(255),
  avatar VARCHAR(255),
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  ties INTEGER DEFAULT 0,
  points_for DECIMAL(10, 2) DEFAULT 0,
  points_against DECIMAL(10, 2) DEFAULT 0,
  settings JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (roster_id, league_id)
);

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id VARCHAR(255) PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  team VARCHAR(10),
  position VARCHAR(10),
  age INTEGER,
  injury_status VARCHAR(50),
  fantasy_positions JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Rosters table (weekly snapshot of team players)
CREATE TABLE IF NOT EXISTS rosters (
  id SERIAL PRIMARY KEY,
  team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
  league_id VARCHAR(255) REFERENCES leagues(id) ON DELETE CASCADE,
  players JSONB NOT NULL,
  starters JSONB NOT NULL,
  week INTEGER NOT NULL,
  season VARCHAR(10) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (team_id, league_id, week, season)
);

-- Matchups table
CREATE TABLE IF NOT EXISTS matchups (
  id SERIAL PRIMARY KEY,
  league_id VARCHAR(255) REFERENCES leagues(id) ON DELETE CASCADE,
  week INTEGER NOT NULL,
  team1_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
  team1_points DECIMAL(10, 2) DEFAULT 0,
  team2_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
  team2_points DECIMAL(10, 2) DEFAULT 0,
  winner_id INTEGER REFERENCES teams(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (league_id, week, team1_id, team2_id)
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id VARCHAR(255) PRIMARY KEY,
  league_id VARCHAR(255) REFERENCES leagues(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  roster_ids JSONB NOT NULL,
  adds JSONB,
  drops JSONB,
  draft_picks JSONB,
  waiver_budget JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Player Stats table
CREATE TABLE IF NOT EXISTS player_stats (
  id SERIAL PRIMARY KEY,
  player_id VARCHAR(255) REFERENCES players(id) ON DELETE CASCADE,
  week INTEGER NOT NULL,
  season VARCHAR(10) NOT NULL,
  stats JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (player_id, week, season)
);

-- Player Projections table
CREATE TABLE IF NOT EXISTS player_projections (
  id SERIAL PRIMARY KEY,
  player_id VARCHAR(255) REFERENCES players(id) ON DELETE CASCADE,
  week INTEGER NOT NULL,
  season VARCHAR(10) NOT NULL,
  projections JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (player_id, week, season)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_league_id ON transactions(league_id);
CREATE INDEX IF NOT EXISTS idx_player_stats_player_id ON player_stats(player_id);
CREATE INDEX IF NOT EXISTS idx_player_projections_player_id ON player_projections(player_id);
CREATE INDEX IF NOT EXISTS idx_teams_league_id ON teams(league_id);
CREATE INDEX IF NOT EXISTS idx_rosters_team_id ON rosters(team_id);
CREATE INDEX IF NOT EXISTS idx_matchups_league_id_week ON matchups(league_id, week);