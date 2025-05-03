/*
  # Update RLS policies for caching tables

  1. Changes
    - Enable RLS on both caching tables
    - Add comprehensive policies for public read access
    - Add policies for authenticated users to manage cache data
    - Add policies for service role access
    - Ensure proper access for both tables

  2. Security
    - Maintains data access control while allowing caching to work
    - Enables proper read/write operations for all necessary roles
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
TO public
USING (true);

CREATE POLICY "Enable write access for authenticated users"
ON cached_players
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

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
TO public
USING (true);

CREATE POLICY "Enable write access for authenticated users"
ON cached_player_stats
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable service role full access"
ON cached_player_stats
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);