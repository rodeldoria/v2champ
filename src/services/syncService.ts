import { supabase } from '../lib/supabase';

export const getLastSync = async (key: string): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('sync_meta')
      .select('value')
      .eq('key', key)
      .single();

    if (error) throw error;
    return data.value;
  } catch (error) {
    console.error('Error getting last sync:', error);
    return '2000-01-01T00:00:00Z'; // Default fallback
  }
};

export const updateLastSync = async (key: string, value: string = new Date().toISOString()): Promise<void> => {
  try {
    const { error } = await supabase
      .from('sync_meta')
      .upsert({ key, value })
      .select();

    if (error) throw error;
  } catch (error) {
    console.error('Error updating last sync:', error);
    throw error;
  }
};