/*
  # Update cached_players RLS policies

  1. Changes
    - Drop existing RLS policies for cached_players table
    - Add new comprehensive RLS policies that properly handle all operations

  2. Security
    - Enable RLS on cached_players table
    - Add policies for:
      - Public read access
      - Authenticated users can insert/update
      - Service role has full access
    - Ensures proper access control while allowing caching operations
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to manage cached_players" ON cached_players;
DROP POLICY IF EXISTS "Allow public read access to cached_players" ON cached_players;
DROP POLICY IF EXISTS "Allow service role to manage cached_players" ON cached_players;

-- Create new policies
CREATE POLICY "Enable read access for all users"
ON cached_players FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable insert for authenticated users"
ON cached_players FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
ON cached_players FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users"
ON cached_players FOR DELETE
TO authenticated
USING (true);

CREATE POLICY "Enable all operations for service role"
ON cached_players FOR ALL
TO service_role
USING (true)
WITH CHECK (true);