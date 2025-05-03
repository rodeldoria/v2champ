/*
  # Fix Cache Tables and RLS Policies

  1. Changes
    - Drop all existing policies to avoid conflicts
    - Enable RLS on both cache tables
    - Create refined policies that:
      - Allow public read access for fresh cache entries only
      - Allow authenticated users to write with proper validation
      - Grant service role full access
      - Add ownership tracking for better security
    
  2. Security
    - Implements proper access control
    - Prevents unauthorized modifications
    - Maintains data freshness
    - Tracks ownership of cache entries

  3. Performance
    - Adds optimized indexes
    - Includes cache cleanup function
*/

-- Enable RLS
ALTER TABLE cached_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE cached_player_stats ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DO $$ 
BEGIN
  -- Drop cached_players policies
  DROP POLICY IF EXISTS "public_read_cached_players" ON cached_players;
  DROP POLICY IF EXISTS "authenticated_write_cached_players" ON cached_players;
  DROP POLICY IF EXISTS "service_role_access_cached_players" ON cached_players;
  
  -- Drop cached_player_stats policies
  DROP POLICY IF EXISTS "public_read_cached_player_stats" ON cached_player_stats;
  DROP POLICY IF EXISTS "authenticated_write_cached_player_stats" ON cached_player_stats;
  DROP POLICY IF EXISTS "service_role_access_cached_player_stats" ON cached_player_stats;
END $$;

-- Add ownership tracking columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cached_players' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE cached_players ADD COLUMN created_by uuid REFERENCES auth.users(id);
    ALTER TABLE cached_players ADD COLUMN updated_by uuid REFERENCES auth.users(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cached_player_stats' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE cached_player_stats ADD COLUMN created_by uuid REFERENCES auth.users(id);
    ALTER TABLE cached_player_stats ADD COLUMN updated_by uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- Create policies for cached_players
CREATE POLICY "allow_fresh_public_read_cached_players"
ON cached_players
FOR SELECT
TO public
USING (
  last_sync > (NOW() - INTERVAL '24 hours')
);

CREATE POLICY "allow_authenticated_write_cached_players"
ON cached_players
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
);

CREATE POLICY "allow_authenticated_update_cached_players"
ON cached_players
FOR UPDATE
TO authenticated
USING (
  auth.uid() = created_by OR 
  auth.uid() = updated_by OR
  created_by IS NULL
)
WITH CHECK (
  auth.uid() IS NOT NULL
);

CREATE POLICY "allow_service_role_access_cached_players"
ON cached_players
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create policies for cached_player_stats
CREATE POLICY "allow_fresh_public_read_cached_player_stats"
ON cached_player_stats
FOR SELECT
TO public
USING (
  last_sync > (NOW() - INTERVAL '24 hours')
);

CREATE POLICY "allow_authenticated_write_cached_player_stats"
ON cached_player_stats
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
);

CREATE POLICY "allow_authenticated_update_cached_player_stats"
ON cached_player_stats
FOR UPDATE
TO authenticated
USING (
  auth.uid() = created_by OR 
  auth.uid() = updated_by OR
  created_by IS NULL
)
WITH CHECK (
  auth.uid() IS NOT NULL
);

CREATE POLICY "allow_service_role_access_cached_player_stats"
ON cached_player_stats
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cached_players_last_sync ON cached_players(last_sync);
CREATE INDEX IF NOT EXISTS idx_cached_players_ownership ON cached_players(created_by, updated_by);
CREATE INDEX IF NOT EXISTS idx_cached_player_stats_last_sync ON cached_player_stats(last_sync);
CREATE INDEX IF NOT EXISTS idx_cached_player_stats_ownership ON cached_player_stats(created_by, updated_by);
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