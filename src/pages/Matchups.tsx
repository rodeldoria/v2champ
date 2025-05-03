import React, { useState, useEffect } from 'react';
import { useSleeperStore } from '../store/sleeperStore';
import { EnhancedMatchups } from '../components/dashboard/EnhancedMatchups';
import { ChevronLeft, ChevronRight, Calendar, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';

const Matchups: React.FC = () => {
  const { currentWeek, setCurrentWeek, selectedLeague, matchups, fetchMatchups, teams } = useSleeperStore();
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);
  const [showAIInsights, setShowAIInsights] = useState(true);
  
  useEffect(() => {
    if (selectedLeague?.league_id) {
      fetchMatchups(selectedLeague.league_id, selectedWeek);
    }
  }, [selectedWeek, selectedLeague?.league_id, fetchMatchups]);
  
  useEffect(() => {
    setCurrentWeek(selectedWeek);
  }, [selectedWeek, setCurrentWeek]);
  
  if (!selectedLeague) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">No League Selected</h2>
        <p className="text-gray-600">
          Please select a league from the sidebar to view matchups
        </p>
      </div>
    );
  }
  
  const weeks = Array.from({ length: 18 }, (_, i) => i + 1);
  
  const handlePrevWeek = () => {
    if (selectedWeek > 1) {
      setSelectedWeek(selectedWeek - 1);
    }
  };
  
  const handleNextWeek = () => {
    if (selectedWeek < 18) {
      setSelectedWeek(selectedWeek + 1);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Matchups</h1>
        
        {/* Week selector */}
        <div className="flex items-center space-x-4">
          <button
            onClick={handlePrevWeek}
            disabled={selectedWeek === 1}
            className={`p-2 rounded-lg ${
              selectedWeek === 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm">
            <Calendar size={16} className="text-gray-500" />
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
              className="pl-1 pr-8 py-1 border-0 focus:outline-none focus:ring-0 text-gray-700 font-medium bg-transparent"
            >
              {weeks.map(week => (
                <option key={week} value={week}>Week {week}</option>
              ))}
            </select>
          </div>
          
          <button
            onClick={handleNextWeek}
            disabled={selectedWeek === 18}
            className={`p-2 rounded-lg ${
              selectedWeek === 18
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      
      {/* AI Insights Toggle */}
      <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center gap-3">
          <Brain size={20} className="text-primary-500" />
          <div>
            <h3 className="font-medium text-gray-800">AI-Powered Matchup Analysis</h3>
            <p className="text-sm text-gray-500">Get advanced insights and predictions for each matchup</p>
          </div>
        </div>
        
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            className="sr-only peer" 
            checked={showAIInsights}
            onChange={() => setShowAIInsights(!showAIInsights)}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
        </label>
      </div>
      
      {/* Enhanced Matchups */}
      {showAIInsights ? (
        <EnhancedMatchups />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(matchups.reduce((acc: Record<number, any[]>, matchup) => {
            const { matchup_id } = matchup;
            if (!acc[matchup_id]) acc[matchup_id] = [];
            acc[matchup_id].push(matchup);
            return acc;
          }, {})).map(([matchupId, pair]) => (
            <Link 
              key={matchupId} 
              to={`/matchups/${matchupId}`}
              className="block"
            >
              <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                {pair.length === 2 ? (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-gray-800">Matchup {matchupId}</h3>
                      <span className="text-xs text-primary-500 font-medium">View Details</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      {/* Team 1 */}
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xl">
                          {(() => {
                            const team = teams.find(t => t.roster_id === pair[0].roster_id);
                            return (team?.settings?.team_name || 'T').substring(0, 1);
                          })()}
                        </div>
                        <p className="mt-2 font-medium text-gray-800">
                          {(() => {
                            const team = teams.find(t => t.roster_id === pair[0].roster_id);
                            return team?.settings?.team_name || `Team ${pair[0].roster_id}`;
                          })()}
                        </p>
                        <p className="text-lg font-bold text-gray-900">{pair[0].points.toFixed(2)}</p>
                      </div>
                      
                      {/* VS */}
                      <div className="text-center">
                        <div className="text-xl font-bold text-gray-400">VS</div>
                      </div>
                      
                      {/* Team 2 */}
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xl">
                          {(() => {
                            const team = teams.find(t => t.roster_id === pair[1].roster_id);
                            return (team?.settings?.team_name || 'T').substring(0, 1);
                          })()}
                        </div>
                        <p className="mt-2 font-medium text-gray-800">
                          {(() => {
                            const team = teams.find(t => t.roster_id === pair[1].roster_id);
                            return team?.settings?.team_name || `Team ${pair[1].roster_id}`;
                          })()}
                        </p>
                        <p className="text-lg font-bold text-gray-900">{pair[1].points.toFixed(2)}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    Incomplete matchup data
                  </div>
                )}
              </div>
            </Link>
          ))}
          
          {matchups.length === 0 && (
            <div className="col-span-full bg-white rounded-lg shadow-sm p-8 text-center">
              <p className="text-gray-500">No matchups available for Week {selectedWeek}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Matchups;