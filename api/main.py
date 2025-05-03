from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import asyncio
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import json

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory cache
cache = {}
CACHE_TTL = 300  # 5 minutes

class PlayerStats(BaseModel):
    player_id: str
    stats: Dict
    projections: Optional[Dict]
    last_updated: datetime

# Check if required packages are installed
try:
    import pandas as pd
    import numpy as np
except ImportError:
    print("WARNING: Required Python packages are missing. Please install them using:")
    print("pip install pandas numpy")
    print("For NFL data functionality, also install:")
    print("pip install matplotlib seaborn scikit-learn")

async def fetch_with_retry(url: str, retries: int = 3) -> Dict:
    async with httpx.AsyncClient() as client:
        for attempt in range(retries):
            try:
                response = await client.get(url, timeout=10.0)
                response.raise_for_status()
                return response.json()
            except Exception as e:
                if attempt == retries - 1:
                    raise HTTPException(status_code=500, detail=str(e))
                await asyncio.sleep(1 * (attempt + 1))

@app.get("/api/players/{player_id}")
async def get_player_details(player_id: str, season: str = "2024", week: int = 1):
    cache_key = f"{player_id}:{season}:{week}"
    
    # Check cache
    if cache_key in cache:
        cached_data = cache[cache_key]
        if datetime.now() - cached_data.last_updated < timedelta(seconds=CACHE_TTL):
            return cached_data.dict()
    
    # Fetch data concurrently
    tasks = [
        fetch_with_retry(f"https://api.sleeper.app/v1/stats/nfl/regular/{season}/{week}?player_id={player_id}"),
        fetch_with_retry(f"https://api.sleeper.app/v1/projections/nfl/regular/{season}/{week}?player_id={player_id}")
    ]
    
    stats_data, projections_data = await asyncio.gather(*tasks, return_exceptions=True)
    
    # Handle errors gracefully
    stats = stats_data.get(player_id, {}) if isinstance(stats_data, dict) else {}
    projections = projections_data.get(player_id, {}) if isinstance(projections_data, dict) else {}
    
    # Update cache
    player_stats = PlayerStats(
        player_id=player_id,
        stats=stats,
        projections=projections,
        last_updated=datetime.now()
    )
    cache[cache_key] = player_stats
    
    return player_stats.dict()

@app.get("/api/players/batch")
async def get_players_batch(player_ids: str, season: str = "2024", week: int = 1):
    player_list = player_ids.split(",")
    
    # Process in batches of 5
    batch_size = 5
    results = {}
    
    for i in range(0, len(player_list), batch_size):
        batch = player_list[i:i + batch_size]
        tasks = [get_player_details(player_id, season, week) for player_id in batch]
        batch_results = await asyncio.gather(*tasks, return_exceptions=True)
        
        for player_id, result in zip(batch, batch_results):
            if not isinstance(result, Exception):
                results[player_id] = result
        
        if i + batch_size < len(player_list):
            await asyncio.sleep(0.5)  # Small delay between batches
    
    return results

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)