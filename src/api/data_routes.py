@router.get("/players/{player_id}/stats")
async def get_player_stats(player_id: str):
    """Get player stats for comparison"""
    try:
        # Get player stats from database
        stats = await db.fetch_player_stats(player_id)
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))