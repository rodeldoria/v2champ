/*
  # Add player insights table

  1. New Tables
    - `player_insights`
      - `id` (uuid, primary key)
      - `player_id` (text, foreign key to cached_players)
      - `insights` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for public read access
    - Add policies for authenticated users to write
    - Add policies for service role to manage all
*/

-- Create player_insights table
CREATE TABLE IF NOT EXISTS player_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id text REFERENCES cached_players(id) ON DELETE CASCADE,
  insights jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (player_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_player_insights_player_id ON player_insights(player_id);
CREATE INDEX IF NOT EXISTS idx_player_insights_created_at ON player_insights(created_at);

-- Enable RLS
ALTER TABLE player_insights ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to player_insights"
  ON player_insights
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to write player_insights"
  ON player_insights
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role to manage player_insights"
  ON player_insights
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_player_insights_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_player_insights_updated_at
  BEFORE UPDATE ON player_insights
  FOR EACH ROW
  EXECUTE FUNCTION update_player_insights_updated_at();