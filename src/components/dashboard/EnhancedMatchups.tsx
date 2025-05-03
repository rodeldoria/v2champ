import React, { useState, useEffect } from 'react';
import { useSleeperStore } from '../../store/sleeperStore';
import { Trophy, TrendingUp, TrendingDown, Brain, Zap, Target, Shield, Users, Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { OpenAI } from 'openai';

// Initialize OpenAI client if API key is available
const openai = import.meta.env.VITE_OPENAI_API_KEY 
  ? new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    })
  : null;

interface MatchupAnalysis {
  prediction: string;
  confidence: number;
  keyPlayers: {
    team1: string[];
    team2: string[];
  };
  insights: string;
  factors: string[];
}

export const EnhancedMatchups: React.FC = () => {
  const { matchups, teams, users, players, currentWeek } = useSleeperStore();
  const [isLoading, setIsLoading] = useState(false);
  const [projections, setProjections] = useState<Record<string, Record<string, number>>>({});
  const [analyses, setAnalyses] = useState<Record<string, MatchupAnalysis>>({});
  const [isAnalyzing, setIsAnalyzing] = useState<Record<string, boolean>>({});
  
  // Group matchups by matchup_id
  const matchupPairs: Record<number, any[]> = {};
  
  matchups.forEach(matchup => {
    const { matchup_id, roster_id, points } = matchup;
    
    if (!matchupPairs[matchup_id]) {
      matchupPairs[matchup_id] = [];
    }
    
    // Find the team for this roster
    const team = teams.find(t => t.roster_id === roster_id);
    
    // Find the owner of this team
    const owner = users[team?.owner_id || ''] || { display_name: 'Unknown Owner', username: 'unknown' };
    
    // Get avatar URL
    const avatarUrl = owner.avatar 
      ? `https://sleepercdn.com/avatars/${owner.avatar}` 
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(owner.display_name || owner.username || 'Unknown')}&background=6366f1&color=fff`;
    
    // Calculate win probability based on points and historical performance
    const winProbability = calculateWinProbability(points, team?.points_for || 0, team?.wins || 0, team?.losses || 0);
    
    matchupPairs[matchup_id].push({
      ...matchup,
      team,
      teamName: team?.settings?.team_name || `Team ${roster_id}`,
      ownerName: owner.display_name || owner.username || 'Unknown Owner',
      avatarUrl,
      winProbability,
      projectedPoints: calculateProjectedPoints(points, team?.points_for || 0)
    });
  });
  
  // Helper function to calculate win probability
  function calculateWinProbability(currentPoints: number, avgPoints: number, wins: number, losses: number): number {
    const winRate = wins / (wins + losses) || 0.5;
    const pointsRatio = currentPoints / (avgPoints || 1);
    return Math.min(Math.max((winRate * 0.3 + pointsRatio * 0.7) * 100, 1), 99);
  }
  
  // Helper function to calculate projected points
  function calculateProjectedPoints(currentPoints: number, avgPoints: number): number {
    const projectionMultiplier = 1 + ((currentWeek || 1) / 18) * 0.2;
    return parseFloat((currentPoints * projectionMultiplier).toFixed(2));
  }
  
  // Function to analyze matchup with AI
  const analyzeMatchup = async (matchupId: string, team1: any, team2: any) => {
    if (!openai) {
      setAnalyses(prev => ({
        ...prev,
        [matchupId]: {
          prediction: team1.points > team2.points ? team1.teamName : team2.teamName,
          confidence: team1.points > team2.points ? 
            Math.round((team1.points / (team1.points + team2.points)) * 100) : 
            Math.round((team2.points / (team1.points + team2.points)) * 100),
          keyPlayers: {
            team1: ["Key player data not available"],
            team2: ["Key player data not available"]
          },
          insights: "AI analysis not available. Using basic statistical projection instead.",
          factors: ["Current score differential", "Historical performance"]
        }
      }));
      return;
    }

    try {
      setIsAnalyzing(prev => ({ ...prev, [matchupId]: true }));

      // Get team rosters
      const team1Players = team1.team?.players?.map((id: string) => {
        const player = players[id];
        return player ? `${player.first_name} ${player.last_name} (${player.position})` : null;
      }).filter(Boolean) || [];
      
      const team2Players = team2.team?.players?.map((id: string) => {
        const player = players[id];
        return player ? `${player.first_name} ${player.last_name} (${player.position})` : null;
      }).filter(Boolean) || [];

      const prompt = `
        Analyze this fantasy football matchup and provide insights:
        
        Team 1: ${team1.teamName} (${team1.ownerName})
        Current Points: ${team1.points}
        Projected Points: ${team1.projectedPoints.toFixed(1)}
        Win Probability: ${team1.winProbability.toFixed(1)}%
        Record: ${team1.team?.wins || 0}-${team1.team?.losses || 0}
        Key Players: ${team1Players.slice(0, 5).join(", ")}
        
        Team 2: ${team2.teamName} (${team2.ownerName})
        Current Points: ${team2.points}
        Projected Points: ${team2.projectedPoints.toFixed(1)}
        Win Probability: ${team2.winProbability.toFixed(1)}%
        Record: ${team2.team?.wins || 0}-${team2.team?.losses || 0}
        Key Players: ${team2Players.slice(0, 5).join(", ")}
        
        Provide a JSON response with:
        {
          "prediction": "Team name that will win",
          "confidence": number between 1-99,
          "keyPlayers": {
            "team1": ["Player 1", "Player 2", "Player 3"],
            "team2": ["Player 1", "Player 2", "Player 3"]
          },
          "insights": "Brief analysis of the matchup and key factors (1-2 sentences)",
          "factors": ["Factor 1", "Factor 2", "Factor 3"]
        }
      `;

      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: "You are a fantasy football analyst specializing in matchup predictions and player analysis. Provide concise, data-driven insights."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 500
      });

      const analysis = JSON.parse(completion.choices[0].message.content);
      setAnalyses(prev => ({ ...prev, [matchupId]: analysis }));
    } catch (error) {
      console.error('Error analyzing matchup:', error);
    } finally {
      setIsAnalyzing(prev => ({ ...prev, [matchupId]: false }));
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy size={20} className="text-primary-500" />
          <h3 className="font-semibold text-gray-800">Week {currentWeek} Matchups</h3>
        </div>
        <Link to="/matchups" className="text-xs text-primary-500 font-medium hover:text-primary-600 flex items-center gap-1">
          View All <ChevronRight size={14} />
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(matchupPairs).map(([matchupId, pair]) => {
          if (pair.length !== 2) return null;
          
          const [team1, team2] = pair;
          const team1Winning = parseFloat(team1.points) > parseFloat(team2.points);
          const team2Winning = parseFloat(team2.points) > parseFloat(team1.points);
          const margin = Math.abs(team1.points - team2.points).toFixed(2);
          
          const analysis = analyses[matchupId];
          
          return (
            <Link 
              key={matchupId} 
              to={`/matchups/${matchupId}`}
              className="block"
            >
              <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
                {/* Matchup Header */}
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Trophy size={16} className="text-primary-200 mr-2" />
                      <p className="text-sm font-medium">Matchup {matchupId}</p>
                    </div>
                    <div className="text-xs bg-white/20 px-2 py-1 rounded-full">
                      {team1Winning ? `${team1.teamName} leads by ${margin}` : 
                       team2Winning ? `${team2.teamName} leads by ${margin}` : 'Tied Game'}
                    </div>
                  </div>
                </div>
                
                {/* Matchup Content */}
                <div className="p-4">
                  <div className="flex justify-between items-center">
                    {/* Team 1 */}
                    <div className="text-center">
                      <div className="relative">
                        <img 
                          src={team1.avatarUrl}
                          alt={team1.ownerName}
                          className="w-16 h-16 rounded-full mx-auto border-2 border-white shadow-md"
                          onError={(e) => {
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(team1.ownerName)}&background=6366f1&color=fff`;
                          }}
                        />
                        {team1Winning && (
                          <div className="absolute -top-1 -right-1 bg-green-500 rounded-full w-6 h-6 flex items-center justify-center">
                            <TrendingUp size={14} className="text-white" />
                          </div>
                        )}
                      </div>
                      <p className="mt-2 font-medium text-gray-800 text-sm">{team1.teamName}</p>
                      <p className="text-xs text-gray-500">{team1.ownerName}</p>
                      <p className={`mt-1 text-xl font-bold ${team1Winning ? 'text-green-600' : 'text-gray-800'}`}>
                        {parseFloat(team1.points).toFixed(2)}
                      </p>
                      <div className="flex items-center justify-center mt-1">
                        <span className="text-sm text-gray-500">Proj: {team1.projectedPoints.toFixed(1)}</span>
                        {team1.projectedPoints > team1.points ? (
                          <TrendingUp size={16} className="ml-1 text-green-500" />
                        ) : (
                          <TrendingDown size={16} className="ml-1 text-red-500" />
                        )}
                      </div>
                    </div>
                    
                    {/* VS */}
                    <div className="flex flex-col items-center">
                      <div className="text-2xl font-bold text-gray-300">VS</div>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                          {team1.winProbability.toFixed(0)}%
                        </div>
                        <div className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                          {team2.winProbability.toFixed(0)}%
                        </div>
                      </div>
                    </div>
                    
                    {/* Team 2 */}
                    <div className="text-center">
                      <div className="relative">
                        <img 
                          src={team2.avatarUrl}
                          alt={team2.ownerName}
                          className="w-16 h-16 rounded-full mx-auto border-2 border-white shadow-md"
                          onError={(e) => {
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(team2.ownerName)}&background=6366f1&color=fff`;
                          }}
                        />
                        {team2Winning && (
                          <div className="absolute -top-1 -right-1 bg-green-500 rounded-full w-6 h-6 flex items-center justify-center">
                            <TrendingUp size={14} className="text-white" />
                          </div>
                        )}
                      </div>
                      <p className="mt-2 font-medium text-gray-800 text-sm">{team2.teamName}</p>
                      <p className="text-xs text-gray-500">{team2.ownerName}</p>
                      <p className={`mt-1 text-xl font-bold ${team2Winning ? 'text-green-600' : 'text-gray-800'}`}>
                        {parseFloat(team2.points).toFixed(2)}
                      </p>
                      <div className="flex items-center justify-center mt-1">
                        <span className="text-sm text-gray-500">Proj: {team2.projectedPoints.toFixed(1)}</span>
                        {team2.projectedPoints > team2.points ? (
                          <TrendingUp size={16} className="ml-1 text-green-500" />
                        ) : (
                          <TrendingDown size={16} className="ml-1 text-red-500" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-4 h-2.5 bg-gray-100">
                    <div 
                      className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500"
                      style={{ width: `${(team1.points / (team1.points + team2.points)) * 100}%` }}
                    />
                  </div>
                  
                  <div className="mt-2 flex justify-between text-xs text-gray-500">
                    <span className="flex items-center">
                      <Shield size={12} className="mr-1" />
                      {team1.winProbability.toFixed(1)}% chance
                    </span>
                    <span className="flex items-center">
                      {team2.winProbability.toFixed(1)}% chance
                      <Shield size={12} className="ml-1" />
                    </span>
                  </div>
                  
                  {/* AI Analysis Button */}
                  {!analysis && !isAnalyzing[matchupId] && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        analyzeMatchup(matchupId, team1, team2);
                      }}
                      className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors"
                    >
                      <Brain size={16} />
                      <span className="font-medium">Generate AI Matchup Analysis</span>
                    </button>
                  )}
                  
                  {/* Loading State */}
                  {isAnalyzing[matchupId] && (
                    <div className="mt-4 flex items-center justify-center py-2.5 px-4 bg-gray-50 text-gray-500 rounded-lg">
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-primary-500 rounded-full animate-spin mr-2"></div>
                      <span>Analyzing matchup...</span>
                    </div>
                  )}
                  
                  {/* AI Analysis Results */}
                  {analysis && (
                    <div className="mt-4 bg-primary-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Brain size={16} className="text-primary-600" />
                        <h4 className="text-sm font-medium text-primary-700">AI Matchup Analysis</h4>
                        <div className="ml-auto px-2 py-0.5 bg-primary-100 rounded-full text-xs font-medium text-primary-700">
                          {analysis.confidence}% Confidence
                        </div>
                      </div>
                      
                      <p className="text-primary-700">{analysis.insights}</p>
                      
                      <div className="mt-3 flex flex-wrap gap-2">
                        {analysis.factors.map((factor, idx) => (
                          <span key={idx} className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                            {factor}
                          </span>
                        ))}
                      </div>
                      
                      <div className="mt-4 text-sm text-center text-primary-600 font-medium">
                        Prediction: <span className="text-primary-700">{analysis.prediction}</span> to win
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
        
        {Object.keys(matchupPairs).length === 0 && (
          <div className="col-span-full bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500">No matchups available for this week</p>
          </div>
        )}
      </div>
    </div>
  );
};