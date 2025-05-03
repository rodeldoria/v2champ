import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Players from '../../pages/Players';
import { useSleeperStore } from '../../store/sleeperStore';

// Mock the store
vi.mock('../../store/sleeperStore', () => ({
  useSleeperStore: vi.fn(),
}));

describe('Players Page', () => {
  const mockPlayers = {
    '123': {
      player_id: '123',
      first_name: 'Test',
      last_name: 'Player',
      position: 'QB',
      team: 'TEST',
    },
  };

  beforeEach(() => {
    (useSleeperStore as any).mockReturnValue({
      players: mockPlayers,
      isLoadingPlayers: false,
    });
  });

  it('renders players grid', async () => {
    render(
      <BrowserRouter>
        <Players />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Player')).toBeInTheDocument();
    });
  });

  it('shows loading state', () => {
    (useSleeperStore as any).mockReturnValue({
      players: {},
      isLoadingPlayers: true,
    });

    render(
      <BrowserRouter>
        <Players />
      </BrowserRouter>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows empty state when no players match filters', async () => {
    render(
      <BrowserRouter>
        <Players />
      </BrowserRouter>
    );

    // Simulate search that returns no results
    const searchInput = screen.getByPlaceholderText(/search players/i);
    searchInput.value = 'nonexistent player';
    searchInput.dispatchEvent(new Event('change'));

    await waitFor(() => {
      expect(screen.getByText(/no players found/i)).toBeInTheDocument();
    });
  });
});