/*
  # Fix RLS policies for cached_players table

  1. Changes
    - Drop existing RLS policies for cached_players table
    - Create new, properly configured RLS policies
      - Allow public read access
      - Allow authenticated users to insert/update
      - Allow service role full access
  
  2. Security
    - Maintains RLS enabled on cached_players table
    - Ensures proper access control while allowing necessary operations
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON cached_players;
DROP POLICY IF EXISTS "Enable service role full access" ON cached_players;
DROP POLICY IF EXISTS "Enable write access for authenticated users" ON cached_players;

-- Create new policies
CREATE POLICY "Enable read access for all users"
ON cached_players
FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable insert/update for authenticated users"
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