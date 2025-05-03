import { useState, useEffect } from 'react';
import { DraftPlayer } from '../types/draft';
import { calculateBoomProbability, calculateBustRisk, calculateBreakoutScore } from '../services/draftService';

interface UseDraftAssistantResult {
  recommendations: DraftPlayer[];
  isLoading: boolean;
  error: string | null;
  generateRecommendations: (
    availablePlayers: DraftPlayer[],
    draftedPlayers: DraftPlayer[],
    draftPosition: number,
    currentPick: number,
    strategy?: string
  ) => void;
}

export const useDraftAssistant = (): UseDraftAssistantResult => {
  const [recommendations, setRecommendations] = useState<DraftPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateRecommendations = (
    availablePlayers: DraftPlayer[],
    draftedPlayers: DraftPlayer[],
    draftPosition: number,
    currentPick: number,
    strategy: string = 'balanced'
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // Get current round
      const round = Math.ceil(currentPick / 12); // Assuming 12-team league
      
      // Get team needs based on drafted players
      const myDraftedPlayers = draftedPlayers.filter(p => p.draft_slot === draftPosition);
      const positionCounts: Record<string, number> = {
        QB: 0,
        RB: 0,
        WR: 0,
        TE: 0,
        K: 0,
        DEF: 0
      };
      
      myDraftedPlayers.forEach(p => {
        if (p.position && positionCounts[p.position] !== undefined) {
          positionCounts[p.position]++;
        }
      });
      
      // Apply strategy-specific logic
      let filteredPlayers = [...availablePlayers];
      
      switch (strategy) {
        case 'zero-rb':
          // Prioritize WRs and TEs early, avoid RBs until round 5+
          if (round < 5) {
            filteredPlayers = filteredPlayers.filter(p => p.position !== 'RB');
            // Sort by WR/TE value
            filteredPlayers.sort((a, b) => {
              if (a.position === 'WR' && b.position !== 'WR') return -1;
              if (a.position !== 'WR' && b.position === 'WR') return 1;
              return (a.rank || 999) - (b.rank || 999);
            });
          } else {
            // After round 5, prioritize high-upside RBs
            filteredPlayers.sort((a, b) => {
              if (a.position === 'RB' && b.position !== 'RB') return -1;
              if (a.position !== 'RB' && b.position === 'RB') return 1;
              return ((b.breakout_score || 0) - (b.bust_risk || 0)) - 
                     ((a.breakout_score || 0) - (a.bust_risk || 0));
            });
          }
          break;
          
        case 'hero-rb':
          // Get one elite RB early, then focus on WRs
          if (round === 1 && positionCounts.RB === 0) {
            filteredPlayers = filteredPlayers.filter(p => p.position === 'RB');
          } else if (round < 5) {
            // Prioritize WRs in rounds 2-4
            filteredPlayers.sort((a, b) => {
              if (a.position === 'WR' && b.position !== 'WR') return -1;
              if (a.position !== 'WR' && b.position === 'WR') return 1;
              return (a.rank || 999) - (b.rank || 999);
            });
          }
          break;
          
        case 'robust-rb':
          // Load up on RBs early
          if (round < 4 && positionCounts.RB < 3) {
            filteredPlayers = filteredPlayers.filter(p => p.position === 'RB');
          } else if (round < 6) {
            // Then get WRs
            filteredPlayers.sort((a, b) => {
              if (a.position === 'WR' && b.position !== 'WR') return -1;
              if (a.position !== 'WR' && b.position === 'WR') return 1;
              return (a.rank || 999) - (b.rank || 999);
            });
          }
          break;
          
        case 'value':
          // Sort by value (difference between ADP and rank)
          filteredPlayers.sort((a, b) => {
            const aValue = (a.adp || 0) - (a.rank || 0);
            const bValue = (b.adp || 0) - (b.rank || 0);
            return bValue - aValue;
          });
          break;
          
        case 'balanced':
        default:
          // Default balanced approach - best player available with position needs
          // Prioritize positions with fewer players
          const positionPriority: Record<string, number> = {
            QB: positionCounts.QB === 0 ? 1 : 0,
            RB: Math.max(0, 3 - positionCounts.RB),
            WR: Math.max(0, 4 - positionCounts.WR),
            TE: positionCounts.TE === 0 ? 1 : 0,
            K: positionCounts.K === 0 && round > 12 ? 1 : 0,
            DEF: positionCounts.DEF === 0 && round > 13 ? 1 : 0
          };
          
          filteredPlayers.sort((a, b) => {
            const aPos = a.position || '';
            const bPos = b.position || '';
            const aPriority = positionPriority[aPos] || 0;
            const bPriority = positionPriority[bPos] || 0;
            
            if (aPriority !== bPriority) return bPriority - aPriority;
            return (a.rank || 999) - (b.rank || 999);
          });
          break;
      }
      
      // Take top 10 recommendations
      setRecommendations(filteredPlayers.slice(0, 10));
    } catch (err) {
      console.error('Error generating recommendations:', err);
      setError('Failed to generate recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    recommendations,
    isLoading,
    error,
    generateRecommendations
  };
};