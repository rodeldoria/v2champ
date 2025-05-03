/*
  # Create sync metadata table

  1. New Tables
    - `sync_meta`
      - `key` (text, primary key)
      - `value` (text) - ISO timestamp
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for authenticated users and service role
    - Add default sync timestamp
*/

-- Create sync_meta table
CREATE TABLE IF NOT EXISTS sync_meta (
  key text PRIMARY KEY,
  value text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE sync_meta ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users"
ON sync_meta
FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable write access for authenticated users"
ON sync_meta
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable service role full access"
ON sync_meta
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Insert initial sync timestamp
INSERT INTO sync_meta (key, value)
VALUES ('players_last_sync', '2000-01-01T00:00:00Z')
ON CONFLICT (key) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_sync_meta_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_sync_meta_updated_at
  BEFORE UPDATE ON sync_meta
  FOR EACH ROW
  EXECUTE FUNCTION update_sync_meta_updated_at();