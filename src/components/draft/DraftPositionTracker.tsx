import React, { useState, useEffect } from 'react';
import { useDraftStore } from '../../store/draftStore';
import { DraftPlayer } from '../../types/draft';
import { DraftAvailablePlayerCount } from './DraftAvailablePlayerCount';
import { DraftTierTracker } from './DraftTierTracker';
import { DraftValueTracker } from './DraftValueTracker';
import { Layers, BarChart2, TrendingUp } from 'lucide-react';

export const DraftPositionTracker: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'count' | 'tiers' | 'value'>('count');
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('count')}
            className={`flex-1 py-3 px-4 text-sm font-medium text-center flex items-center justify-center ${
              activeTab === 'count'
                ? 'text-primary-600 border-b-2 border-primary-500'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <BarChart2 size={16} className="mr-2" />
            Position Counts
          </button>
          <button
            onClick={() => setActiveTab('tiers')}
            className={`flex-1 py-3 px-4 text-sm font-medium text-center flex items-center justify-center ${
              activeTab === 'tiers'
                ? 'text-primary-600 border-b-2 border-primary-500'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Layers size={16} className="mr-2" />
            Tier Breakdown
          </button>
          <button
            onClick={() => setActiveTab('value')}
            className={`flex-1 py-3 px-4 text-sm font-medium text-center flex items-center justify-center ${
              activeTab === 'value'
                ? 'text-primary-600 border-b-2 border-primary-500'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <TrendingUp size={16} className="mr-2" />
            Value Analysis
          </button>
        </div>
      </div>
      
      <div>
        {activeTab === 'count' && <DraftAvailablePlayerCount />}
        {activeTab === 'tiers' && <DraftTierTracker />}
        {activeTab === 'value' && <DraftValueTracker />}
      </div>
    </div>
  );
};