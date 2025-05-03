import React from 'react';
import { useSleeperStore } from '../store/sleeperStore';
import { DraftHistory } from '../components/draft/DraftHistory';
import { DraftList } from '../components/draft/DraftList';

const History: React.FC = () => {
  const { selectedLeague } = useSleeperStore();

  if (!selectedLeague) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">No League Selected</h2>
        <p className="text-gray-600">
          Please select a league from the sidebar to view history
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">League History</h1>
      
      {/* Draft List */}
      <DraftList leagueId={selectedLeague.league_id} />
      
      {/* Draft History */}
      <DraftHistory />
    </div>
  );
};

export default History;