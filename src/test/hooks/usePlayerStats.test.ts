import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { usePlayerStats } from '../../hooks/usePlayerStats';
import { getPlayerStats } from '../../services/sleeperService';
import { Player } from '../../types/sleeper';

// Mock the API calls
vi.mock('../../services/sleeperService', () => ({
  getPlayerStats: vi.fn(),
}));

describe('usePlayerStats', () => {
  const mockPlayer: Player = {
    player_id: '123',
    first_name: 'Test',
    last_name: 'Player',
    position: 'QB',
    team: 'TEST',
    age: 25,
    fantasy_positions: ['QB']
  };

  it('should load player stats successfully', async () => {
    const mockStats = {
      pass_yd: 300,
      pass_td: 3
    };

    (getPlayerStats as any).mockResolvedValue(mockStats);

    const { result } = renderHook(() => usePlayerStats(mockPlayer));

    // Initially loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBe(null);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.stats).toEqual(mockStats);
    expect(result.current.error).toBe(null);
  });

  it('should handle errors gracefully', async () => {
    (getPlayerStats as any).mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => usePlayerStats(mockPlayer));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to load player stats');
    expect(result.current.stats).toEqual({});
  });

  it('should handle null player gracefully', async () => {
    const { result } = renderHook(() => usePlayerStats(null as any));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.stats).toEqual({});
    expect(result.current.error).toBe(null);
  });
});