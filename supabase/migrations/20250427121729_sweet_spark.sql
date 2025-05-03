/*
  # Fix RLS policies and add sync metadata

  1. Changes
    - Drop existing policies
    - Create new simplified policies
    - Add sync metadata table
    - Enable RLS
    
  2. Security
    - Allow public read access
    - Allow authenticated write access
    - Allow service role full access
*/

-- Create sync_meta table if it doesn't exist
CREATE TABLE IF NOT EXISTS sync_meta (
  key text PRIMARY KEY,
  value text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE sync_meta ENABLE ROW LEVEL SECURITY;
ALTER TABLE cached_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE cached_player_stats ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "allow_public_read" ON cached_players;
  DROP POLICY IF EXISTS "allow_authenticated_write" ON cached_players;
  DROP POLICY IF EXISTS "allow_service_role_all" ON cached_players;
END $$;

-- Create new policies for cached_players
CREATE POLICY "enable_read_access"
ON cached_players
FOR SELECT
USING (true);

CREATE POLICY "enable_write_access"
ON cached_players
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "enable_service_role_access"
ON cached_players
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create policies for sync_meta
CREATE POLICY "enable_read_access"
ON sync_meta
FOR SELECT
USING (true);

CREATE POLICY "enable_write_access"
ON sync_meta
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "enable_service_role_access"
ON sync_meta
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Insert initial sync timestamp if not exists
INSERT INTO sync_meta (key, value)
VALUES ('players_last_sync', '2000-01-01T00:00:00Z')
ON CONFLICT (key) DO NOTHING;