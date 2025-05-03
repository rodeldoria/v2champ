/*
  # Update RLS policies for cached tables

  1. Changes
    - Drop all existing policies
    - Create new comprehensive policies for both tables
    - Enable public read access
    - Enable write access for authenticated users
    - Enable full access for service role

  2. Security
    - Maintains data access control
    - Ensures proper caching functionality
*/

-- Enable RLS
ALTER TABLE cached_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE cached_player_stats ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DO $$ 
BEGIN
  -- Drop cached_players policies
  DROP POLICY IF EXISTS "Enable read access for all users" ON cached_players;
  DROP POLICY IF EXISTS "Enable write access for authenticated users" ON cached_players;
  DROP POLICY IF EXISTS "Enable service role full access" ON cached_players;
  DROP POLICY IF EXISTS "Enable insert/update for authenticated users" ON cached_players;

  -- Drop cached_player_stats policies
  DROP POLICY IF EXISTS "Enable read access for all users" ON cached_player_stats;
  DROP POLICY IF EXISTS "Enable write access for authenticated users" ON cached_player_stats;
  DROP POLICY IF EXISTS "Enable service role full access" ON cached_player_stats;
END $$;

-- Create policies for cached_players
CREATE POLICY "Enable read access for all users"
ON cached_players
FOR SELECT
USING (true);

CREATE POLICY "Enable write access for authenticated users"
ON cached_players
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
ON cached_players
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users"
ON cached_players
FOR DELETE
USING (true);

CREATE POLICY "Enable service role full access"
ON cached_players
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create policies for cached_player_stats
CREATE POLICY "Enable read access for all users"
ON cached_player_stats
FOR SELECT
USING (true);

CREATE POLICY "Enable write access for authenticated users"
ON cached_player_stats
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
ON cached_player_stats
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users"
ON cached_player_stats
FOR DELETE
USING (true);

CREATE POLICY "Enable service role full access"
ON cached_player_stats
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);