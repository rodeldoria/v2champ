import React, { useState } from 'react';
import { Brain, Loader2 } from 'lucide-react';
import { Player } from '../../types/sleeper';
import { getPlayerInsights } from '../../services/playerInsightsService';

interface AIScoutButtonProps {
  player: Player;
  stats?: Record<string, number>;
  onAnalysis: (analysis: any) => void;
}

export const AIScoutButton: React.FC<AIScoutButtonProps> = ({ player, stats, onAnalysis }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isOllamaAvailable, setIsOllamaAvailable] = useState(true);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      const analysis = await getPlayerInsights(player, stats || {});
      onAnalysis(analysis);
    } catch (error) {
      console.error('Error getting AI analysis:', error);
      if (error instanceof Error && error.message.includes('Ollama')) {
        setIsOllamaAvailable(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOllamaAvailable) {
    return (
      <button
        className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed"
        disabled={true}
      >
        <Brain className="w-5 h-5" />
        <span className="font-medium">Ollama Unavailable</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        isLoading 
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
      }`}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <Brain className="w-5 h-5" />
      )}
      <span className="font-medium">AI Scout</span>
    </button>
  );
};