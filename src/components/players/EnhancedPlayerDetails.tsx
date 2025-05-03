import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Brain, Star, Activity, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { useSleeperStore } from '../../store/sleeperStore';
import { Player } from '../../types/sleeper';
import { PlayerHeader } from './PlayerHeader';
import { PlayerSeasonSummary } from './PlayerSeasonSummary';
import { AIScoutNotes } from './AIScoutNotes';
import { PlayerAttributes } from './PlayerAttributes';
import { PlayerNews } from './PlayerNews';
import { SocialMediaFeed } from './SocialMediaFeed';
import { usePlayerStats } from '../../hooks/usePlayerStats';
import { EnhancedPlayerTabs } from './EnhancedPlayerTabs';
import { AIScoutButton } from './AIScoutButton';

const EnhancedPlayerDetails: React.FC = () => {
  const navigate = useNavigate();
  const { playerId } = useParams();
  const { players } = useSleeperStore();
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [scoringFormat] = useState('ppr');
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [careerStats, setCareerStats] = useState<Record<string, Record<string, number>>>({});
  const [isLoadingCareer, setIsLoadingCareer] = useState(true);
  const [projections, setProjections] = useState<Record<string, number>>({});
  const [isLoadingProjections, setIsLoadingProjections] = useState(true);

  // Get player data
  const player = playerId ? players[playerId] : null;
  const { stats: currentStats, isLoading } = usePlayerStats(player);

  const handleAIAnalysis = (analysis: any) => {
    setAiAnalysis(analysis);
    setShowAIInsights(true);
  };

  // Fetch career stats
  useEffect(() => {
    const fetchCareerData = async () => {
      if (!player?.player_id) return;
      
      setIsLoadingCareer(true);
      
      try {
        // Try to fetch from FastAPI first if available
        const apiUrl = import.meta.env.VITE_API_URL;
        if (apiUrl) {
          try {
            const response = await fetch(`${apiUrl}/api/players/${player.player_id}/career_stats`);
            if (response.ok) {
              const data = await response.json();
              setCareerStats(data);
              setIsLoadingCareer(false);
              return;
            }
          } catch (apiError) {
            console.warn('Error fetching from FastAPI, falling back to Sleeper API:', apiError);
          }
        }
        
        // Fetch stats for each season from Sleeper API
        const seasons = ['2024', '2023', '2022', '2021', '2020'];
        const stats: Record<string, Record<string, number>> = {};
        
        for (const season of seasons) {
          try {
            // Fetch season totals (week 0 is often used for season totals)
            const seasonStats = await fetch(
              `https://api.sleeper.app/v1/stats/nfl/regular/${season}/0?player_id=${player.player_id}`
            );
            
            if (seasonStats.ok) {
              const data = await seasonStats.json();
              if (data[player.player_id]) {
                stats[season] = data[player.player_id];
                
                // Fetch weekly stats for the season
                for (let week = 1; week <= 17; week++) {
                  try {
                    const weekStats = await fetch(
                      `https://api.sleeper.app/v1/stats/nfl/regular/${season}/${week}?player_id=${player.player_id}`
                    );
                    
                    if (weekStats.ok) {
                      const weekData = await weekStats.json();
                      if (weekData[player.player_id]) {
                        stats[`${season}_week_${week}`] = weekData[player.player_id];
                      }
                    }
                  } catch (weekError) {
                    console.warn(`Error fetching week ${week} stats for ${season}:`, weekError);
                  }
                }
              }
            }
          } catch (seasonError) {
            console.warn(`Error fetching stats for season ${season}:`, seasonError);
          }
        }
        
        setCareerStats(stats);
      } catch (error) {
        console.error('Error fetching career stats:', error);
      } finally {
        setIsLoadingCareer(false);
      }
    };
    
    fetchCareerData();
  }, [player?.player_id]);

  // Fetch projections
  useEffect(() => {
    const fetchProjectionsData = async () => {
      if (!player?.player_id) return;
      
      setIsLoadingProjections(true);
      
      try {
        // Try to fetch from FastAPI first if available
        const apiUrl = import.meta.env.VITE_API_URL;
        if (apiUrl) {
          try {
            const response = await fetch(`${apiUrl}/api/players/${player.player_id}/projections?season=2024&week=1`);
            if (response.ok) {
              const data = await response.json();
              setProjections(data);
              setIsLoadingProjections(false);
              return;
            }
          } catch (apiError) {
            console.warn('Error fetching projections from FastAPI, falling back to Sleeper API:', apiError);
          }
        }
        
        // Fallback to Sleeper API
        const response = await fetch(
          `https://api.sleeper.app/v1/projections/nfl/regular/2024/1?player_id=${player.player_id}`
        );
        
        if (response.ok) {
          const data = await response.json();
          setProjections(data[player.player_id] || {});
        }
      } catch (error) {
        console.error('Error fetching projections:', error);
      } finally {
        setIsLoadingProjections(false);
      }
    };
    
    fetchProjectionsData();
  }, [player?.player_id]);

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 rounded-full bg-white shadow-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>

        <AIScoutButton 
          player={player} 
          stats={currentStats} 
          onAnalysis={handleAIAnalysis} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Player Header */}
          <div className="player-header">
            <PlayerHeader player={player} stats={currentStats} />
          </div>

          {/* AI Insights */}
          {showAIInsights && aiAnalysis && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Brain size={20} className="text-primary-500" />
                  <h3 className="font-semibold text-gray-800">AI Analysis</h3>
                </div>
                <button 
                  onClick={() => setShowAIInsights(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <ChevronUp size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Performance</h4>
                  <p className="text-gray-600">{aiAnalysis.performance}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Future Outlook</h4>
                  <p className="text-gray-600">{aiAnalysis.outlook}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Strengths</h4>
                    <ul className="space-y-1">
                      {aiAnalysis.strengths.map((strength: string, index: number) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <TrendingUp size={14} className="text-success-500 mr-2 flex-shrink-0" />
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Weaknesses</h4>
                    <ul className="space-y-1">
                      {aiAnalysis.weaknesses.map((weakness: string, index: number) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <TrendingDown size={14} className="text-warning-500 mr-2 flex-shrink-0" />
                          <span>{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Season Summary */}
          <div className="player-season-summary">
            <PlayerSeasonSummary stats={currentStats} />
          </div>

          {/* Player Attributes */}
          <div className="player-attributes">
            <PlayerAttributes player={player} stats={currentStats} />
          </div>

          {/* Enhanced Tabs with Stats, Trends, Career, Projections */}
          <div className="player-stats-table">
            <EnhancedPlayerTabs 
              player={player}
              weeklyStats={currentStats}
              projections={projections}
              scoringType={scoringFormat}
              careerStats={careerStats}
              isLoadingCareer={isLoadingCareer}
              isLoadingProjections={isLoadingProjections}
            />
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4 hidden lg:block">
          <div className="player-news">
            <PlayerNews player={player} />
            <SocialMediaFeed player={player} />
          </div>
          <div className="ai-scout-notes">
            <AIScoutNotes player={player} stats={currentStats} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedPlayerDetails;