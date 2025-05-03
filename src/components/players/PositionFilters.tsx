import React from 'react';
import { Player } from '../../types/sleeper';

interface PositionFiltersProps {
  selectedPosition: string;
  onPositionChange: (position: string) => void;
  players: Record<string, Player>;
}

export const PositionFilters: React.FC<PositionFiltersProps> = ({
  selectedPosition,
  onPositionChange,
  players
}) => {
  // Only include offensive positions
  const positions = [
    { id: 'ALL', label: 'All Positions' },
    { id: 'QB', label: 'Quarterbacks' },
    { id: 'RB', label: 'Running Backs' },
    { id: 'WR', label: 'Wide Receivers' },
    { id: 'TE', label: 'Tight Ends' },
    { id: 'K', label: 'Kickers' },
    { id: 'FLEX', label: 'FLEX (RB/WR/TE)' },
    { id: 'DEF', label: 'Team Defense' },
  ];

  // Define defensive positions to filter out
  const defensivePositions = ['DL', 'LB', 'DB', 'IDP', 'IDP_FLEX'];

  // Count players by position (excluding defensive players)
  const positionCounts = Object.values(players).reduce((acc, player) => {
    if (player.position && !defensivePositions.includes(player.position)) {
      acc[player.position] = (acc[player.position] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Count FLEX-eligible players
  const flexCount = Object.values(players).filter(player => 
    ['RB', 'WR', 'TE'].includes(player.position || '')
  ).length;

  // Get total count for ALL (excluding defensive players)
  const totalCount = Object.values(players).filter(player => 
    !defensivePositions.includes(player.position || '')
  ).length;

  return (
    <div className="flex flex-wrap gap-2">
      {positions.map(({ id, label }) => {
        let count = 0;
        if (id === 'ALL') {
          count = totalCount;
        } else if (id === 'FLEX') {
          count = flexCount;
        } else {
          count = positionCounts[id] || 0;
        }

        return (
          <button
            key={id}
            onClick={() => onPositionChange(id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              selectedPosition === id
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {label}
            <span className="ml-2 text-xs text-gray-500 dark:text-gray-500">({count})</span>
          </button>
        );
      })}
    </div>
  );
};