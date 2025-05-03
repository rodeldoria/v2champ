/*
  # Update RLS policies for cached_players table

  1. Changes
    - Remove existing RLS policies for cached_players table
    - Add new policies to allow:
      - Public read access
      - Write access for authenticated users
      - Full access for service role

  2. Security
    - Maintains read-only access for public users
    - Allows authenticated users to write to the table
    - Ensures service role has full access for system operations
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