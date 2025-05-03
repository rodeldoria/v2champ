import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { supabase } from '../src/lib/supabase';

// Configuration
const DATA_DIR = path.join(process.cwd(), 'data');
const SEASONS = [2020, 2021, 2022, 2023, 2024];
const WEEKS = Array.from({ length: 18 }, (_, i) => i + 1);

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// nflfastR API endpoints
const ENDPOINTS = {
  PLAY_BY_PLAY: 'https://github.com/nflverse/nflfastR-data/raw/master/data/',
  PLAYER_STATS: 'https://github.com/nflverse/nflverse-data/raw/master/data/player_stats/',
  ROSTER: 'https://github.com/nflverse/nflverse-data/raw/master/data/rosters/',
  TEAM_STATS: 'https://github.com/nflverse/nflverse-data/raw/master/data/nfl_team_stats/'
};

/**
 * Fetch play-by-play data for a specific season
 * @param season The NFL season year
 */
async function fetchPlayByPlayData(season: number) {
  console.log(`Fetching play-by-play data for ${season} season...`);
  try {
    const url = `${ENDPOINTS.PLAY_BY_PLAY}play_by_play_${season}.parquet.gz`;
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    
    // Save the raw data for now - we'll need to parse it later
    const outputPath = path.join(DATA_DIR, `play_by_play_${season}.parquet.gz`);
    fs.writeFileSync(outputPath, response.data);
    
    console.log(`Successfully saved play-by-play data for ${season} to ${outputPath}`);
    return true;
  } catch (error) {
    console.error(`Error fetching play-by-play data for ${season}:`, error);
    return false;
  }
}

/**
 * Fetch player stats for a specific season
 * @param season The NFL season year
 */
async function fetchPlayerStats(season: number) {
  console.log(`Fetching player stats for ${season} season...`);
  try {
    const url = `${ENDPOINTS.PLAYER_STATS}player_stats_${season}.csv`;
    const response = await axios.get(url);
    
    // Save the CSV data
    const outputPath = path.join(DATA_DIR, `player_stats_${season}.csv`);
    fs.writeFileSync(outputPath, response.data);
    
    console.log(`Successfully saved player stats for ${season} to ${outputPath}`);
    
    // Store in Supabase
    await storePlayerStats(response.data, season);
    
    return true;
  } catch (error) {
    console.error(`Error fetching player stats for ${season}:`, error);
    return false;
  }
}

/**
 * Fetch roster data for a specific season
 * @param season The NFL season year
 */
async function fetchRosterData(season: number) {
  console.log(`Fetching roster data for ${season} season...`);
  try {
    const url = `${ENDPOINTS.ROSTER}roster_${season}.csv`;
    const response = await axios.get(url);
    
    // Save the CSV data
    const outputPath = path.join(DATA_DIR, `roster_${season}.csv`);
    fs.writeFileSync(outputPath, response.data);
    
    console.log(`Successfully saved roster data for ${season} to ${outputPath}`);
    return true;
  } catch (error) {
    console.error(`Error fetching roster data for ${season}:`, error);
    return false;
  }
}

/**
 * Fetch team stats for a specific season
 * @param season The NFL season year
 */
async function fetchTeamStats(season: number) {
  console.log(`Fetching team stats for ${season} season...`);
  try {
    const url = `${ENDPOINTS.TEAM_STATS}team_stats_${season}.csv`;
    const response = await axios.get(url);
    
    // Save the CSV data
    const outputPath = path.join(DATA_DIR, `team_stats_${season}.csv`);
    fs.writeFileSync(outputPath, response.data);
    
    console.log(`Successfully saved team stats for ${season} to ${outputPath}`);
    return true;
  } catch (error) {
    console.error(`Error fetching team stats for ${season}:`, error);
    return false;
  }
}

/**
 * Parse CSV data and store in Supabase
 * @param csvData The CSV data as a string
 * @param season The NFL season year
 */
async function storePlayerStats(csvData: string, season: number) {
  console.log(`Storing player stats for ${season} in Supabase...`);
  
  try {
    // Parse CSV data
    const lines = csvData.split('\n');
    const headers = lines[0].split(',');
    
    // Process each line (skipping header)
    for (let i = 1; i < Math.min(lines.length, 100); i++) { // Limit to 100 players for testing
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(',');
      const player: Record<string, any> = {};
      
      // Map CSV columns to object properties
      headers.forEach((header, index) => {
        player[header] = values[index];
      });
      
      // Extract player ID and name
      const playerId = player.player_id;
      if (!playerId) continue;
      
      // Convert stats to numeric values
      const stats: Record<string, number> = {};
      Object.entries(player).forEach(([key, value]) => {
        if (key !== 'player_id' && key !== 'player_name' && key !== 'position' && key !== 'team') {
          const numValue = parseFloat(value as string);
          if (!isNaN(numValue)) {
            stats[key] = numValue;
          }
        }
      });
      
      // Store in Supabase
      const { error } = await supabase
        .from('nfl_player_stats')
        .upsert({
          player_id: playerId,
          season: season.toString(),
          week: 0, // 0 means season total
          stats: stats,
          last_sync: new Date().toISOString()
        }, {
          onConflict: 'player_id, season, week'
        });
      
      if (error) {
        console.error(`Error storing stats for player ${playerId}:`, error);
      }
    }
    
    console.log(`Successfully stored player stats for ${season} in Supabase`);
    return true;
  } catch (error) {
    console.error(`Error storing player stats for ${season}:`, error);
    return false;
  }
}

/**
 * Main function to fetch all data
 */
async function fetchAllData() {
  console.log('Starting NFL data fetch...');
  
  // Create nfl_player_stats table if it doesn't exist
  try {
    const { error } = await supabase.rpc('create_nfl_player_stats_table_if_not_exists');
    if (error) {
      console.error('Error creating nfl_player_stats table:', error);
      
      // Try direct table creation
      const { error: createError } = await supabase.query(`
        CREATE TABLE IF NOT EXISTS nfl_player_stats (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          player_id text NOT NULL,
          season text NOT NULL,
          week integer NOT NULL,
          stats jsonb NOT NULL DEFAULT '{}'::jsonb,
          last_sync timestamptz DEFAULT now(),
          created_at timestamptz DEFAULT now(),
          UNIQUE (player_id, season, week)
        );
        
        -- Enable RLS
        ALTER TABLE nfl_player_stats ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY "Allow public read access to nfl_player_stats"
          ON nfl_player_stats
          FOR SELECT
          TO public
          USING (true);
        
        CREATE POLICY "Allow authenticated users to write nfl_player_stats"
          ON nfl_player_stats
          FOR ALL
          TO authenticated
          USING (true)
          WITH CHECK (true);
        
        CREATE POLICY "Allow service role to manage nfl_player_stats"
          ON nfl_player_stats
          FOR ALL
          TO service_role
          USING (true)
          WITH CHECK (true);
      `);
      
      if (createError) {
        console.error('Error creating table directly:', createError);
      }
    }
  } catch (error) {
    console.error('Error setting up database:', error);
  }
  
  // Fetch data for each season
  for (const season of SEASONS) {
    await Promise.all([
      fetchPlayerStats(season),
      fetchRosterData(season),
      fetchTeamStats(season)
    ]);
    
    // Add a delay between seasons to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('NFL data fetch complete!');
}

// Run the main function
fetchAllData().catch(console.error);