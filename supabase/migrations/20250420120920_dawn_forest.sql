/*
  # Update cached_players RLS policies

  1. Changes
    - Add policy to allow authenticated users to insert and update cached player data
    - Keep existing policies for public read access and service role management

  2. Security
    - Maintains read-only access for public users
    - Allows authenticated users to manage cached player data
    - Preserves service role full access
*/

-- Drop existing policies to recreate them with proper permissions
DROP POLICY IF EXISTS "Allow public read access to cached_players" ON cached_players;
DROP POLICY IF EXISTS "Allow service role to manage cached_players" ON cached_players;

-- Create comprehensive RLS policies
CREATE POLICY "Allow public read access to cached_players"
ON cached_players
FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow authenticated users to manage cached_players"
ON cached_players
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow service role to manage cached_players"
ON cached_players
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);