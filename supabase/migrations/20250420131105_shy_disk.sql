/*
  # Update RLS policies for cached_players table

  1. Changes
    - Enable RLS on cached_players table
    - Add policy for authenticated users to read/write cached players
    - Add policy for service role to have full access
    - Add policy for public read access

  2. Security
    - Enables RLS on cached_players table
    - Adds appropriate policies for different user roles
    - Ensures data can be properly cached and accessed
*/

-- Enable RLS
ALTER TABLE cached_players ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable insert/update for authenticated users" ON cached_players;
DROP POLICY IF EXISTS "Enable read access for all users" ON cached_players;
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