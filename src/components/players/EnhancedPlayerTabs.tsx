import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import { Player } from '../../types/sleeper';
import { AIScoutNotes } from './AIScoutNotes';
import { PlayerStatsHistory } from './PlayerStatsHistory';
import { PlayerProjections } from './PlayerProjections';
import { PlayerProjectionsPlot } from './PlayerProjectionsPlot';
import { Brain, TrendingUp, ChevronRight, Loader2, BarChart2 } from 'lucide-react';

interface EnhancedPlayerTabsProps {
  player: Player;
  weeklyStats: Record<string, number> | null;
  projections: Record<string, number> | null;
  scoringType: string;
  careerStats?: Record<string, Record<string, number>>;
  isLoadingCareer?: boolean;
  isLoadingProjections?: boolean;
}

export const EnhancedPlayerTabs: React.FC<EnhancedPlayerTabsProps> = ({
  player,
  weeklyStats,
  projections,
  scoringType,
  careerStats = {},
  isLoadingCareer = false,
  isLoadingProjections = false
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
            Weekly Stats
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
              {isLoadingCareer ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={24} className="animate-spin text-primary-500 mr-2" />
                  <span className="text-gray-600">Loading historical data...</span>
                </div>
              ) : (
                <PlayerStatsHistory 
                  player={player}
                  stats={careerStats}
                  selectedStat={selectedStat}
                  onStatChange={setSelectedStat}
                />
              )}
            </div>
          </Tab.Panel>

          <Tab.Panel>
            {isLoadingProjections ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin text-primary-500 mr-2" />
                <span className="text-gray-600">Loading projections...</span>
              </div>
            ) : (
              <div className="space-y-6">
                <PlayerProjectionsPlot 
                  player={player}
                  season="2024"
                  weeks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]}
                />
                <PlayerProjections 
                  player={player}
                  season="2024"
                  week={1}
                  projections={projections || {}}
                />
              </div>
            )}
          </Tab.Panel>

          <Tab.Panel>
            {isLoadingCareer ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin text-primary-500 mr-2" />
                <span className="text-gray-600">Loading weekly stats...</span>
              </div>
            ) : (
              <div className="space-y-6">
                <PlayerStatsHistory 
                  player={player}
                  stats={careerStats}
                  selectedStat={selectedStat}
                  onStatChange={setSelectedStat}
                  showWeeklyView={true}
                />
              </div>
            )}
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};