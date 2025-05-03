{/* Moving content from AIScoutNotes.tsx to PlayerAnalysis.tsx */}
import React from 'react';
import { Player } from '../../types/sleeper';

interface PlayerAnalysisProps {
  player: Player;
  careerStats: Record<string, Record<string, number>>;
}

export const PlayerAnalysis: React.FC<PlayerAnalysisProps> = ({ player, careerStats }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">AI Scout Analysis</h2>
      {/* Content from AIScoutNotes component */}
      <div className="space-y-4">
        <div className="text-gray-700">
          {/* Placeholder for AI analysis content */}
          <p>Loading player analysis...</p>
        </div>
      </div>
    </div>
  );
};