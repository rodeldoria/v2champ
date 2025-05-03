/*
  # Fix RLS policies for cache tables

  1. Changes
    - Drop all existing policies to avoid conflicts
    - Enable RLS on both tables
    - Create comprehensive policies for both tables:
      - Public read access
      - Authenticated users write access
      - Service role full access
    
  2. Security
    - Maintains data integrity while allowing caching operations
    - Ensures proper access control
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
  DROP POLICY IF EXISTS "Enable update for authenticated users" ON cached_players;
  DROP POLICY IF EXISTS "Enable delete for authenticated users" ON cached_players;

  -- Drop cached_player_stats policies
  DROP POLICY IF EXISTS "Enable read access for all users" ON cached_player_stats;
  DROP POLICY IF EXISTS "Enable write access for authenticated users" ON cached_player_stats;
  DROP POLICY IF EXISTS "Enable service role full access" ON cached_player_stats;
  DROP POLICY IF EXISTS "Enable update for authenticated users" ON cached_player_stats;
  DROP POLICY IF EXISTS "Enable delete for authenticated users" ON cached_player_stats;
END $$;

-- Create policies for cached_players
CREATE POLICY "Allow public read access"
ON cached_players
FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow authenticated users write access"
ON cached_players
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow service role full access"
ON cached_players
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create policies for cached_player_stats
CREATE POLICY "Allow public read access"
ON cached_player_stats
FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow authenticated users write access"
ON cached_player_stats
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow service role full access"
ON cached_player_stats
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);