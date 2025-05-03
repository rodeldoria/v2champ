/*
  # Update RLS policies for cached_players table

  1. Changes
    - Update RLS policies for cached_players table to allow:
      - Public read access
      - Write access for authenticated users
      - Full access for service role

  2. Security
    - Maintains RLS but with more permissive policies
    - Ensures data can be synced while maintaining security
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
  -- Safely drop existing policies
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'cached_players'
  ) THEN
    DROP POLICY IF EXISTS "Enable all operations for service role" ON cached_players;
    DROP POLICY IF EXISTS "Enable delete for authenticated users" ON cached_players;
    DROP POLICY IF EXISTS "Enable insert for authenticated users" ON cached_players;
    DROP POLICY IF EXISTS "Enable read access for all users" ON cached_players;
    DROP POLICY IF EXISTS "Enable update for authenticated users" ON cached_players;
  END IF;
END $$;

-- Create new policies
CREATE POLICY "Enable read access for all users"
ON public.cached_players
FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable write access for authenticated users"
ON public.cached_players
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable service role full access"
ON public.cached_players
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);