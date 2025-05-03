import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSleeperStore } from '../../store/sleeperStore';
import { fetchLeagueDrafts } from '../../services/draftService';
import { Draft } from '../../types/draft';
import { Calendar, Clock, Users, ChevronRight } from 'lucide-react';

interface DraftListProps {
  leagueId?: string;
}

export const DraftList: React.FC<DraftListProps> = ({ leagueId }) => {
  const { selectedLeague } = useSleeperStore();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const effectiveLeagueId = leagueId || selectedLeague?.league_id;
  
  useEffect(() => {
    const loadDrafts = async () => {
      if (!effectiveLeagueId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const draftsData = await fetchLeagueDrafts(effectiveLeagueId);
        setDrafts(draftsData);
      } catch (error) {
        console.error('Error loading drafts:', error);
        setError('Failed to load drafts');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDrafts();
  }, [effectiveLeagueId]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-primary-500 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p>{error}</p>
      </div>
    );
  }
  
  if (drafts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <p className="text-gray-500">No drafts found for this league</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-800">Available Drafts</h3>
      </div>
      
      <div className="divide-y divide-gray-200">
        {drafts.map((draft) => (
          <Link
            key={draft.draft_id}
            to={`/draft/${draft.draft_id}`}
            className="block p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium text-gray-800">
                  {draft.metadata.name || 'League Draft'}
                </h4>
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar size={16} className="mr-1" />
                    <span>{new Date(draft.start_time * 1000).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock size={16} className="mr-1" />
                    <span>{draft.status}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Users size={16} className="mr-1" />
                    <span>{draft.settings.teams} Teams</span>
                  </div>
                </div>
              </div>
              
              <ChevronRight size={20} className="text-gray-400" />
            </div>
            
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium text-gray-600">
                {draft.type.charAt(0).toUpperCase() + draft.type.slice(1)}
              </span>
              <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium text-gray-600">
                {draft.settings.rounds} Rounds
              </span>
              <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium text-gray-600">
                {draft.metadata.scoring_type.toUpperCase()} Scoring
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};