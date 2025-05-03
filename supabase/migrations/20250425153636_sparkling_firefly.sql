/*
  # Fix RLS policies for cached_players table

  1. Changes
    - Drop existing policies
    - Create new simplified policies that allow:
      - Public read access without authentication
      - Write access for authenticated users
      - Service role full access
    
  2. Security
    - Ensures public read access works without auth
    - Maintains proper write access control
*/

-- Drop existing policies
DO $$ 
BEGIN
  -- Drop cached_players policies
  DROP POLICY IF EXISTS "public_read_cached_players" ON cached_players;
  DROP POLICY IF EXISTS "authenticated_write_cached_players" ON cached_players;
  DROP POLICY IF EXISTS "service_role_access_cached_players" ON cached_players;
  DROP POLICY IF EXISTS "Enable read access for all users" ON cached_players;
  DROP POLICY IF EXISTS "Enable write access for authenticated users" ON cached_players;
  DROP POLICY IF EXISTS "Enable service role full access" ON cached_players;
END $$;

-- Create new policies
CREATE POLICY "allow_public_read"
ON cached_players
FOR SELECT
USING (true);

CREATE POLICY "allow_authenticated_write"
ON cached_players
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "allow_service_role_all"
ON cached_players
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE cached_players ENABLE ROW LEVEL SECURITY;