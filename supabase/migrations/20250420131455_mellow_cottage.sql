/*
  # Fix RLS policies for cached_players table

  1. Security Changes
    - Enable RLS on cached_players table
    - Add policies to allow:
      - Public read access to all cached player data
      - Authenticated users to write (insert/update) cached player data
      - Service role to have full access
    
  2. Notes
    - Caching is a shared resource, so all authenticated users should be able to contribute
    - Read access is public since player data is not sensitive
*/

-- Enable RLS
ALTER TABLE cached_players ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Enable read access for all users" ON cached_players;
DROP POLICY IF EXISTS "Enable write access for authenticated users" ON cached_players;
DROP POLICY IF EXISTS "Enable service role full access" ON cached_players;

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