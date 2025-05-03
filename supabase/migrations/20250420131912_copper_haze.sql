/*
  # Fix Cache Tables and RLS Policies

  1. Changes
    - Drop all existing policies to avoid conflicts
    - Enable RLS on both cache tables
    - Create simplified policies that allow:
      - Public read access
      - Authenticated write access
      - Service role full access
    - Add indexes for better performance
    
  2. Security
    - Maintains data integrity
    - Ensures proper access control
    - Optimizes query performance
*/

-- Enable RLS
ALTER TABLE cached_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE cached_player_stats ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DO $$ 
BEGIN
  -- Drop cached_players policies
  DROP POLICY IF EXISTS "Allow public read access" ON cached_players;
  DROP POLICY IF EXISTS "Allow authenticated users write access" ON cached_players;
  DROP POLICY IF EXISTS "Allow service role full access" ON cached_players;
  DROP POLICY IF EXISTS "Enable read access for all users" ON cached_players;
  DROP POLICY IF EXISTS "Enable write access for authenticated users" ON cached_players;
  DROP POLICY IF EXISTS "Enable service role full access" ON cached_players;
  DROP POLICY IF EXISTS "Enable insert/update for authenticated users" ON cached_players;
  DROP POLICY IF EXISTS "Enable update for authenticated users" ON cached_players;
  DROP POLICY IF EXISTS "Enable delete for authenticated users" ON cached_players;

  -- Drop cached_player_stats policies
  DROP POLICY IF EXISTS "Allow public read access" ON cached_player_stats;
  DROP POLICY IF EXISTS "Allow authenticated users write access" ON cached_player_stats;
  DROP POLICY IF EXISTS "Allow service role full access" ON cached_player_stats;
  DROP POLICY IF EXISTS "Enable read access for all users" ON cached_player_stats;
  DROP POLICY IF EXISTS "Enable write access for authenticated users" ON cached_player_stats;
  DROP POLICY IF EXISTS "Enable service role full access" ON cached_player_stats;
  DROP POLICY IF EXISTS "Enable update for authenticated users" ON cached_player_stats;
  DROP POLICY IF EXISTS "Enable delete for authenticated users" ON cached_player_stats;
END $$;

-- Create policies for cached_players
CREATE POLICY "public_read_cached_players"
ON cached_players
FOR SELECT
USING (true);

CREATE POLICY "authenticated_write_cached_players"
ON cached_players
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "service_role_access_cached_players"
ON cached_players
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create policies for cached_player_stats
CREATE POLICY "public_read_cached_player_stats"
ON cached_player_stats
FOR SELECT
USING (true);

CREATE POLICY "authenticated_write_cached_player_stats"
ON cached_player_stats
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "service_role_access_cached_player_stats"
ON cached_player_stats
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cached_players_last_sync ON cached_players(last_sync);
CREATE INDEX IF NOT EXISTS idx_cached_player_stats_last_sync ON cached_player_stats(last_sync);
CREATE INDEX IF NOT EXISTS idx_cached_player_stats_lookup ON cached_player_stats(player_id, season, week);

-- Add function to clean old cache entries
CREATE OR REPLACE FUNCTION clean_old_cache() RETURNS void AS $$
BEGIN
  -- Delete cached players older than 24 hours
  DELETE FROM cached_players 
  WHERE last_sync < NOW() - INTERVAL '24 hours';
  
  -- Delete cached stats older than 24 hours
  DELETE FROM cached_player_stats 
  WHERE last_sync < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;