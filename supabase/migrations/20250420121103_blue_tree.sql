/*
  # Update RLS policies for cached_players table

  1. Security Changes
    - Enable RLS on cached_players table (if not already enabled)
    - Add policy for public read access
    - Add policy for authenticated users to insert/update
    - Add policy for service role to manage all operations
    
  2. Notes
    - Public users can read cached player data
    - Authenticated users can update the cache
    - Service role has full access
*/

-- Enable RLS
ALTER TABLE cached_players ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Enable read access for all users" ON cached_players;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON cached_players;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON cached_players;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON cached_players;
DROP POLICY IF EXISTS "Enable all operations for service role" ON cached_players;

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