import React, { useMemo } from 'react';
import { useDraftStore } from '../../store/draftStore';
import { Shield } from 'lucide-react';

export const DraftPositionNeeds: React.FC = () => {
  const { draft, picks, myDraftPosition } = useDraftStore();
  
  // Calculate position needs based on draft settings and picks
  const positionNeeds = useMemo(() => {
    if (!draft || !myDraftPosition) return null;
    
    const { slots_qb, slots_rb, slots_wr, slots_te, slots_flex, slots_k, slots_def } = draft.settings;
    
    // Initialize position counts
    const needs = {
      QB: { required: slots_qb, drafted: 0 },
      RB: { required: slots_rb, drafted: 0 },
      WR: { required: slots_wr, drafted: 0 },
      TE: { required: slots_te, drafted: 0 },
      K: { required: slots_k, drafted: 0 },
      DEF: { required: slots_def, drafted: 0 },
      FLEX: { required: slots_flex, drafted: 0 }
    };
    
    // Count drafted positions for my team
    const myPicks = picks.filter(pick => pick.draft_slot === myDraftPosition);
    
    myPicks.forEach(pick => {
      const position = pick.metadata.position;
      if (needs[position as keyof typeof needs]) {
        needs[position as keyof typeof needs].drafted++;
      }
    });
    
    return needs;
  }, [draft, picks, myDraftPosition]);
  
  if (!positionNeeds || !myDraftPosition) {
    return null;
  }
  
  // Calculate completion percentage for each position
  const calculateCompletion = (required: number, drafted: number): number => {
    if (required === 0) return 100;
    return Math.min(Math.round((drafted / required) * 100), 100);
  };
  
  // Get color based on completion
  const getCompletionColor = (completion: number): string => {
    if (completion >= 100) return 'bg-green-500';
    if (completion >= 50) return 'bg-yellow-500';
    return 'bg-gray-300';
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center">
          <Shield size={18} className="text-primary-500 mr-2" />
          <h3 className="font-semibold text-gray-800">Your Team Needs</h3>
        </div>
      </div>
      
      <div className="p-4">
        <div className="space-y-3">
          {Object.entries(positionNeeds).map(([position, { required, drafted }]) => {
            if (required === 0) return null;
            
            const completion = calculateCompletion(required, drafted);
            
            return (
              <div key={position}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">{position}</span>
                  <span className="text-sm text-gray-600">{drafted}/{required}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getCompletionColor(completion)}`}
                    style={{ width: `${completion}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Draft advice */}
        <div className="mt-4 p-3 bg-primary-50 rounded-lg">
          <h4 className="text-sm font-medium text-primary-700 mb-1">Draft Advice</h4>
          <p className="text-xs text-primary-600">
            {positionNeeds.RB.drafted < positionNeeds.RB.required && positionNeeds.WR.drafted < positionNeeds.WR.required ? (
              "Focus on RB/WR for your next picks to build a strong foundation."
            ) : positionNeeds.QB.drafted === 0 ? (
              "Consider drafting a QB soon if value is available."
            ) : positionNeeds.TE.drafted === 0 ? (
              "Don't forget about TE - elite options provide a significant advantage."
            ) : positionNeeds.K.drafted === 0 && positionNeeds.DEF.drafted === 0 ? (
              "Wait on K/DEF until your final rounds to maximize value."
            ) : (
              "Focus on best player available to maximize your team's potential."
            )}
          </p>
        </div>
      </div>
    </div>
  );
};