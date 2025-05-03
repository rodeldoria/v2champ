/*
  # Update RLS policies for cached_players table

  1. Security Changes
    - Enable RLS on cached_players table (already enabled)
    - Add policy for authenticated users to manage cached players
    - Add policy for service role to manage cached players
    - Add policy for public read access to cached players

  2. Changes
    - Remove existing policies
    - Create new comprehensive policies for proper access control
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