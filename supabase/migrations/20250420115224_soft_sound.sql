/*
  # Player Data Cache Schema

  1. New Tables
    - `cached_players`
      - `id` (text, primary key) - Sleeper player ID
      - `first_name` (text)
      - `last_name` (text)
      - `team` (text)
      - `position` (text)
      - `age` (integer)
      - `metadata` (jsonb) - Additional Sleeper data
      - `last_sync` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `cached_player_stats`
      - `id` (uuid, primary key)
      - `player_id` (text, foreign key)
      - `season` (text)
      - `week` (integer)
      - `stats` (jsonb)
      - `last_sync` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to read data
    - Add policies for service role to manage data

  3. Indexes
    - Index on player_id + season + week for stats lookups
    - Index on team and position for filtering
*/

-- Create cached_players table
CREATE TABLE IF NOT EXISTS cached_players (
  id text PRIMARY KEY,
  first_name text NOT NULL,
  last_name text NOT NULL,
  team text,
  position text,
  age integer,
  metadata jsonb DEFAULT '{}'::jsonb,
  last_sync timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create cached_player_stats table
CREATE TABLE IF NOT EXISTS cached_player_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id text REFERENCES cached_players(id) ON DELETE CASCADE,
  season text NOT NULL,
  week integer NOT NULL,
  stats jsonb DEFAULT '{}'::jsonb,
  last_sync timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE (player_id, season, week)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_cached_players_team ON cached_players(team);
CREATE INDEX IF NOT EXISTS idx_cached_players_position ON cached_players(position);
CREATE INDEX IF NOT EXISTS idx_cached_player_stats_lookup ON cached_player_stats(player_id, season, week);

-- Enable RLS
ALTER TABLE cached_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE cached_player_stats ENABLE ROW LEVEL SECURITY;

-- Create policies for cached_players
CREATE POLICY "Allow public read access to cached_players"
  ON cached_players
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow service role to manage cached_players"
  ON cached_players
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create policies for cached_player_stats
CREATE POLICY "Allow public read access to cached_player_stats"
  ON cached_player_stats
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow service role to manage cached_player_stats"
  ON cached_player_stats
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_cached_players_updated_at
  BEFORE UPDATE ON cached_players
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();