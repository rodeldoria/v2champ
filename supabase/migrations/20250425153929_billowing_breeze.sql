/*
  # Security Hardening

  1. Changes
    - Lock down function search paths
    - Add explicit schema references
    - Update function definitions with proper security settings
    
  2. Security
    - Prevents search path injection attacks
    - Ensures functions only access intended schemas
*/

-- Drop existing functions
DROP FUNCTION IF EXISTS public.update_updated_at_column CASCADE;
DROP FUNCTION IF EXISTS public.clean_old_cache CASCADE;

-- Recreate functions with locked search paths
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.clean_old_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  -- Delete cached players older than 24 hours
  DELETE FROM public.cached_players 
  WHERE last_sync < NOW() - INTERVAL '24 hours';
  
  -- Delete cached stats older than 24 hours
  DELETE FROM public.cached_player_stats 
  WHERE last_sync < NOW() - INTERVAL '24 hours';
END;
$$;

-- Recreate trigger with explicit schema reference
DROP TRIGGER IF EXISTS update_cached_players_updated_at ON public.cached_players;

CREATE TRIGGER update_cached_players_updated_at
  BEFORE UPDATE ON public.cached_players
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();