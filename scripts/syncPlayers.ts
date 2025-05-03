import { supabase } from '../src/lib/supabase';
import { httpPlayersSource } from '../src/services/httpPlayersSource';
import { getLastSync, updateLastSync } from '../src/services/syncService';
import { Player } from '../src/types/sleeper';

async function sync() {
  try {
    console.log('Starting player sync...');

    // 1. Get last sync timestamp
    const lastSync = await getLastSync('players_last_sync');
    console.log(`Last sync: ${lastSync}`);

    // 2. Fetch all players from Sleeper API
    console.log('Fetching players from Sleeper API...');
    const players = await httpPlayersSource.fetchAllPlayers();
    console.log(`Fetched ${Object.keys(players).length} players`);

    // 3. Filter players that need syncing
    const lastSyncDate = new Date(lastSync);
    const toSync = Object.values(players).filter(p => {
      if (!p.last_modified) return true;
      return new Date(p.last_modified) > lastSyncDate;
    });
    console.log(`Found ${toSync.length} players to sync`);

    // 4. Prepare player data for Supabase
    const rows = toSync.map(p => ({
      id: p.player_id,
      first_name: p.first_name,
      last_name: p.last_name,
      team: p.team,
      position: p.position,
      age: p.age,
      metadata: p,
      last_sync: new Date().toISOString()
    }));

    // 5. Upsert players in batches
    const BATCH_SIZE = 100;
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      console.log(`Syncing batch ${i / BATCH_SIZE + 1} of ${Math.ceil(rows.length / BATCH_SIZE)}`);
      
      const { error } = await supabase
        .from('cached_players')
        .upsert(batch, { onConflict: 'id' });

      if (error) throw error;
    }

    // 6. Update last sync timestamp
    await updateLastSync('players_last_sync');
    console.log('Sync completed successfully!');
    console.log(`Synced ${toSync.length} players`);

  } catch (error) {
    console.error('Error syncing players:', error);
    process.exit(1);
  }
}

// Run the sync
sync();