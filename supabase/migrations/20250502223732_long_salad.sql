/*
  # Add NFL data tables

  1. New Tables
    - `nfl_player_stats`
      - `id` (uuid, primary key)
      - `player_id` (text)
      - `season` (text)
      - `week` (integer)
      - `stats` (jsonb)
      - `last_sync` (timestamptz)
      - `created_at` (timestamptz)

    - `nfl_team_stats`
      - `id` (uuid, primary key)
      - `team` (text)
      - `season` (text)
      - `week` (integer)
      - `stats` (jsonb)
      - `last_sync` (timestamptz)
      - `created_at` (timestamptz)

    - `nfl_schedule`
      - `id` (uuid, primary key)
      - `game_id` (text)
      - `season` (text)
      - `week` (integer)
      - `home_team` (text)
      - `away_team` (text)
      - `game_time` (timestamptz)
      - `stadium` (text)
      - `weather` (jsonb)
      - `created_at` (timestamptz)

    - `nfl_player_advanced_metrics`
      - `id` (uuid, primary key)
      - `player_id` (text)
      - `season` (text)
      - `metrics` (jsonb)
      - `last_sync` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for public read access
    - Add policies for authenticated users to write
    - Add policies for service role to manage all
*/

-- Create nfl_player_stats table
CREATE TABLE IF NOT EXISTS nfl_player_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id text NOT NULL,
  season text NOT NULL,
  week integer NOT NULL,
  stats jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_sync timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE (player_id, season, week)
);

-- Create nfl_team_stats table
CREATE TABLE IF NOT EXISTS nfl_team_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team text NOT NULL,
  season text NOT NULL,
  week integer NOT NULL,
  stats jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_sync timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE (team, season, week)
);

-- Create nfl_schedule table
CREATE TABLE IF NOT EXISTS nfl_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id text NOT NULL,
  season text NOT NULL,
  week integer NOT NULL,
  home_team text NOT NULL,
  away_team text NOT NULL,
  game_time timestamptz,
  stadium text,
  weather jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE (game_id)
);

-- Create nfl_player_advanced_metrics table
CREATE TABLE IF NOT EXISTS nfl_player_advanced_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id text NOT NULL,
  season text NOT NULL,
  metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_sync timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE (player_id, season)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_nfl_player_stats_player_id ON nfl_player_stats(player_id);
CREATE INDEX IF NOT EXISTS idx_nfl_player_stats_season_week ON nfl_player_stats(season, week);
CREATE INDEX IF NOT EXISTS idx_nfl_team_stats_team ON nfl_team_stats(team);
CREATE INDEX IF NOT EXISTS idx_nfl_team_stats_season_week ON nfl_team_stats(season, week);
CREATE INDEX IF NOT EXISTS idx_nfl_schedule_season_week ON nfl_schedule(season, week);
CREATE INDEX IF NOT EXISTS idx_nfl_player_advanced_metrics_player_id ON nfl_player_advanced_metrics(player_id);

-- Enable RLS
ALTER TABLE nfl_player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfl_team_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfl_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfl_player_advanced_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies for nfl_player_stats
CREATE POLICY "Allow public read access to nfl_player_stats"
  ON nfl_player_stats
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to write nfl_player_stats"
  ON nfl_player_stats
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role to manage nfl_player_stats"
  ON nfl_player_stats
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create policies for nfl_team_stats
CREATE POLICY "Allow public read access to nfl_team_stats"
  ON nfl_team_stats
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to write nfl_team_stats"
  ON nfl_team_stats
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role to manage nfl_team_stats"
  ON nfl_team_stats
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create policies for nfl_schedule
CREATE POLICY "Allow public read access to nfl_schedule"
  ON nfl_schedule
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to write nfl_schedule"
  ON nfl_schedule
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role to manage nfl_schedule"
  ON nfl_schedule
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create policies for nfl_player_advanced_metrics
CREATE POLICY "Allow public read access to nfl_player_advanced_metrics"
  ON nfl_player_advanced_metrics
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to write nfl_player_advanced_metrics"
  ON nfl_player_advanced_metrics
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role to manage nfl_player_advanced_metrics"
  ON nfl_player_advanced_metrics
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create function to create nfl_player_stats table if it doesn't exist
CREATE OR REPLACE FUNCTION create_nfl_player_stats_table_if_not_exists()
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'nfl_player_stats'
  ) THEN
    CREATE TABLE nfl_player_stats (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      player_id text NOT NULL,
      season text NOT NULL,
      week integer NOT NULL,
      stats jsonb NOT NULL DEFAULT '{}'::jsonb,
      last_sync timestamptz DEFAULT now(),
      created_at timestamptz DEFAULT now(),
      UNIQUE (player_id, season, week)
    );
    
    -- Enable RLS
    ALTER TABLE nfl_player_stats ENABLE ROW LEVEL SECURITY;
    
    -- Create policies
    CREATE POLICY "Allow public read access to nfl_player_stats"
      ON nfl_player_stats
      FOR SELECT
      TO public
      USING (true);
    
    CREATE POLICY "Allow authenticated users to write nfl_player_stats"
      ON nfl_player_stats
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
    
    CREATE POLICY "Allow service role to manage nfl_player_stats"
      ON nfl_player_stats
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END;
$$ LANGUAGE plpgsql;