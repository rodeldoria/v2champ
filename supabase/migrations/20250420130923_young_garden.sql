/*
  # Fix RLS policies for cached_players table

  1. Changes
    - Drop existing RLS policies
    - Add new comprehensive RLS policies that properly handle all operations
    - Enable RLS on cached_players and cached_player_stats tables
    - Add policies for public read access and authenticated write access

  2. Security
    - Public users can read cached data
    - Authenticated users can write to cache tables
    - Service role has full access
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON cached_players;
DROP POLICY IF EXISTS "Enable write access for authenticated users" ON cached_players;
DROP POLICY IF EXISTS "Enable service role full access" ON cached_players;

-- Enable RLS
ALTER TABLE cached_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE cached_player_stats ENABLE ROW LEVEL SECURITY;

-- Create new policies for cached_players
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