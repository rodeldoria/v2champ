import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useAIScout } from '../../hooks/useAIScout';
import { analyzePlayerWithOpenAI } from '../../services/openaiService';
import { getPlayerInsights } from '../../services/perplexityService';
import { isServiceAvailable, initializeAIServices } from '../../services/aiService';
import { Player } from '../../types/sleeper';

// Mock the services
vi.mock('../../services/openaiService');
vi.mock('../../services/perplexityService');
vi.mock('../../services/aiService');

describe('useAIScout', () => {
  const mockPlayer: Player = {
    player_id: '123',
    first_name: 'Test',
    last_name: 'Player',
    position: 'QB',
    team: 'TEST',
    age: 25,
    fantasy_positions: ['QB']
  };

  beforeEach(() => {
    vi.resetAllMocks();
    (initializeAIServices as any).mockResolvedValue(true);
  });

  it('should fetch analysis from OpenAI when available', async () => {
    const mockAnalysis = {
      performance: 'Great performance',
      outlook: 'Positive outlook',
      strengths: ['Accuracy', 'Decision making'],
      weaknesses: ['Deep ball'],
      trajectory: 'Improving',
      risks: ['Age'],
      attributes: { arm: 85 }
    };

    (isServiceAvailable as any).mockReturnValue(true);
    (analyzePlayerWithOpenAI as any).mockResolvedValue(mockAnalysis);

    const { result } = renderHook(() => useAIScout(mockPlayer));

    expect(result.current.loading).toBe(true);

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.analysis).toEqual({
      ...mockAnalysis,
      confidence: 'high'
    });
    expect(result.current.error).toBe(null);
  });

  it('should fallback to Perplexity when OpenAI fails', async () => {
    const mockInsights = [
      { text: 'Performance analysis' },
      { text: 'Future outlook' }
    ];

    (isServiceAvailable as any)
      .mockReturnValueOnce(true) // OpenAI available
      .mockReturnValueOnce(true); // Perplexity available
    (analyzePlayerWithOpenAI as any).mockRejectedValue(new Error('OpenAI error'));
    (getPlayerInsights as any).mockResolvedValue(mockInsights);

    const { result } = renderHook(() => useAIScout(mockPlayer));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.analysis).toEqual({
      performance: 'Performance analysis',
      outlook: 'Future outlook',
      strengths: [],
      weaknesses: [],
      trajectory: '',
      risks: [],
      attributes: {},
      confidence: 'medium'
    });
  });

  it('should handle no services available', async () => {
    (isServiceAvailable as any).mockReturnValue(false);

    const { result } = renderHook(() => useAIScout(mockPlayer));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Unable to generate analysis: No AI services available');
    expect(result.current.analysis).toBe(null);
  });

  it('should handle null player gracefully', () => {
    const { result } = renderHook(() => useAIScout(null));

    expect(result.current.loading).toBe(false);
    expect(result.current.analysis).toBe(null);
    expect(result.current.error).toBe(null);
  });
});