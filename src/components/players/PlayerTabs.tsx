import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import { Player } from '../../types/sleeper';
import { PlayerStatsHistory } from './PlayerStatsHistory';
import { PlayerProjections } from './PlayerProjections';
import { AIScoutNotes } from './AIScoutNotes';
import { NFLAdvancedStats } from './NFLAdvancedStats';
import { NFLPlayerComparison } from './NFLPlayerComparison';
import { Brain, TrendingUp, ChevronRight, BarChart2, Users } from 'lucide-react';

interface PlayerTabsProps {
  player: Player;
  weeklyStats: Record<string, number> | null;
  projections: Record<string, number> | null;
  careerStats: Record<string, Record<string, number>>;
  scoringType: string;
}

export const PlayerTabs: React.FC<PlayerTabsProps> = ({
  player,
  weeklyStats,
  projections,
  careerStats,
  scoringType
}) => {
  const [selectedStat, setSelectedStat] = useState('pts_ppr');

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <Tab.Group>
        <Tab.List className="flex space-x-1 border-b border-gray-200 overflow-x-auto snap-x scrollbar-thin">
          <Tab
            className={({ selected }) =>
              `py-3 px-4 md:py-4 md:px-6 font-medium text-sm border-b-2 transition-colors duration-200 flex items-center whitespace-nowrap snap-start ${
                selected
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`
            }
          >
            <Brain size={16} className="mr-2 flex-shrink-0" />
            Analysis
          </Tab>
          <Tab
            className={({ selected }) =>
              `py-3 px-4 md:py-4 md:px-6 font-medium text-sm border-b-2 transition-colors duration-200 flex items-center whitespace-nowrap snap-start ${
                selected
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`
            }
          >
            <TrendingUp size={16} className="mr-2 flex-shrink-0" />
            Trends
          </Tab>
          <Tab
            className={({ selected }) =>
              `py-3 px-4 md:py-4 md:px-6 font-medium text-sm border-b-2 transition-colors duration-200 flex items-center whitespace-nowrap snap-start ${
                selected
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`
            }
          >
            <ChevronRight size={16} className="mr-2 flex-shrink-0" />
            Projections
          </Tab>
          <Tab
            className={({ selected }) =>
              `py-3 px-4 md:py-4 md:px-6 font-medium text-sm border-b-2 transition-colors duration-200 flex items-center whitespace-nowrap snap-start ${
                selected
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`
            }
          >
            <BarChart2 size={16} className="mr-2 flex-shrink-0" />
            NFL Stats
          </Tab>
          <Tab
            className={({ selected }) =>
              `py-3 px-4 md:py-4 md:px-6 font-medium text-sm border-b-2 transition-colors duration-200 flex items-center whitespace-nowrap snap-start ${
                selected
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`
            }
          >
            <Users size={16} className="mr-2 flex-shrink-0" />
            Compare
          </Tab>
        </Tab.List>

        <Tab.Panels className="p-4 md:p-6">
          <Tab.Panel>
            <AIScoutNotes 
              player={player}
              stats={weeklyStats || {}}
            />
          </Tab.Panel>

          <Tab.Panel>
            <div className="space-y-6">
              <PlayerStatsHistory 
                player={player}
                stats={careerStats}
                selectedStat={selectedStat}
                onStatChange={setSelectedStat}
              />
            </div>
          </Tab.Panel>

          <Tab.Panel>
            <div className="space-y-6">
              <PlayerProjections 
                player={player}
                season="2024"
                week={1}
                projections={projections || {}}
              />
            </div>
          </Tab.Panel>

          <Tab.Panel>
            <div className="space-y-6">
              <NFLAdvancedStats 
                player={player}
                season="2023"
              />
            </div>
          </Tab.Panel>

          <Tab.Panel>
            <div className="space-y-6">
              <NFLPlayerComparison 
                player={player}
                season="2023"
              />
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};