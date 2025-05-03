async def fetch_player_stats(player_id: str) -> Dict:
    """Fetch player stats from database for comparison"""
    try:
        result = await supabase.from_('cached_player_stats') \
            .select('*') \
            .eq('player_id', player_id) \
            .execute()
        
        if result.error:
            raise result.error

        # Format stats by season and week
        stats = {}
        for row in result.data:
            season = row['season']
            week = row['week']
            if season not in stats:
                stats[season] = {}
            stats[season][f'week_{week}'] = row['stats']
            
        return stats
    except Exception as e:
        print(f"Error fetching player stats: {e}")
        return {}