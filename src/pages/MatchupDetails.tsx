import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSleeperStore } from '../store/sleeperStore';
import { ArrowLeft, Trophy, Users, Calendar, TrendingUp, TrendingDown, Star, Brain, Shield, Zap, Target, Clock } from 'lucide-react';
import { OwnerDetails } from '../components/players/OwnerDetails';
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
  playerMatchups: {
    position: string;
    team1Player: string;
    team2Player: string;
    advantage: string;
  }[];
}

const MatchupDetails: React.FC = () => {
  const { matchupId } = useParams();
  const navigate = useNavigate();
  const { matchups, teams, users, players, currentWeek } = useSleeperStore();
  const [isLoading, setIsLoading] = useState(false);
  const [projections, setProjections] = useState<Record<string, Record<string, number>>>({});
  const [analysis, setAnalysis] = useState<MatchupAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Find the matchup
  const matchupPair = matchups
    .filter(m => m.matchup_id === Number(matchupId))
    .sort((a, b) => b.points - a.points);
  
  if (matchupPair.length !== 2) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Matchup Not Found</h2>
        <p className="text-gray-600">The matchup you're looking for doesn't exist or hasn't been loaded yet.</p>
        <button 
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }
  
  const [team1Matchup, team2Matchup] = matchupPair;
  const team1 = teams.find(t => t.roster_id === team1Matchup.roster_id);
  const team2 = teams.find(t => t.roster_id === team2Matchup.roster_id);
  
  const team1Owner = users[team1?.owner_id || ''] || { display_name: 'Unknown Owner', username: 'unknown' };
  const team2Owner = users[team2?.owner_id || ''] || { display_name: 'Unknown Owner', username: 'unknown' };
  
  // Get avatar URLs
  const team1AvatarUrl = team1Owner.avatar 
    ? `https://sleepercdn.com/avatars/${team1Owner.avatar}` 
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(team1Owner.display_name || team1Owner.username || 'Unknown')}&background=6366f1&color=fff`;
  
  const team2AvatarUrl = team2Owner.avatar 
    ? `https://sleepercdn.com/avatars/${team2Owner.avatar}` 
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(team2Owner.display_name || team2Owner.username || 'Unknown')}&background=6366f1&color=fff`;
  
  // Fetch projections for players in the matchup
  useEffect(() => {
    const fetchProjections = async () => {
      if (!team1Matchup.players || !team2Matchup.players) return;
      
      setIsLoading(true);
      
      try {
        const allPlayers = [...(team1Matchup.players || []), ...(team2Matchup.players || [])];
        const projData: Record<string, Record<string, number>> = {};
        
        // Only fetch for the first 10 players to avoid rate limiting
        const topPlayers = allPlayers.slice(0, 10);
        
        for (const playerId of topPlayers) {
          try {
            const response = await fetch(
              `https://api.sleeper.app/v1/projections/nfl/regular/2024/1?player_id=${playerId}`
            );
            
            if (response.ok) {
              const data = await response.json();
              if (data[playerId]) {
                projData[playerId] = data[playerId];
              }
            }
            
            // Add a small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error) {
            console.error(`Error fetching projections for player ${playerId}:`, error);
          }
        }
        
        setProjections(projData);
      } catch (error) {
        console.error('Error fetching projections:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProjections();
  }, [team1Matchup.players, team2Matchup.players]);
  
  // Calculate projected points for a team
  const getTeamProjectedPoints = (teamMatchup: any) => {
    if (!teamMatchup.players) return 0;
    
    return teamMatchup.players.reduce((sum: number, playerId: string) => {
      const playerProj = projections[playerId];
      return sum + (playerProj?.pts_ppr || 0);
    }, 0);
  };
  
  const team1ProjectedPoints = getTeamProjectedPoints(team1Matchup);
  const team2ProjectedPoints = getTeamProjectedPoints(team2Matchup);
  
  // Calculate win probability
  const calculateWinProbability = (points: number, projectedPoints: number, opponent: number) => {
    if (points > opponent) {
      // Already winning
      const margin = points - opponent;
      return Math.min(50 + (margin / points) * 50, 99);
    } else {
      // Currently losing
      const deficit = opponent - points;
      const remainingPoints = projectedPoints - points;
      
      if (remainingPoints <= 0) return 1; // Almost no chance
      
      return Math.max(Math.min((remainingPoints - deficit) / remainingPoints * 50, 49), 1);
    }
  };
  
  const team1WinProb = calculateWinProbability(team1Matchup.points, team1ProjectedPoints, team2Matchup.points);
  const team2WinProb = calculateWinProbability(team2Matchup.points, team2ProjectedPoints, team1Matchup.points);
  
  // Function to analyze matchup with AI
  const analyzeMatchup = async () => {
    if (!openai) {
      setAnalysis({
        prediction: team1Matchup.points > team2Matchup.points ? team1?.settings?.team_name || `Team ${team1Matchup.roster_id}` : team2?.settings?.team_name || `Team ${team2Matchup.roster_id}`,
        confidence: team1Matchup.points > team2Matchup.points ? 
          Math.round((team1Matchup.points / (team1Matchup.points + team2Matchup.points)) * 100) : 
          Math.round((team2Matchup.points / (team1Matchup.points + team2Matchup.points)) * 100),
        keyPlayers: {
          team1: ["Key player data not available"],
          team2: ["Key player data not available"]
        },
        insights: "AI analysis not available. Using basic statistical projection instead.",
        factors: ["Current score differential", "Historical performance"],
        playerMatchups: []
      });
      return;
    }

    try {
      setIsAnalyzing(true);

      // Get team rosters
      const team1Players = team1Matchup.players?.map((id: string) => {
        const player = players[id];
        return player ? `${player.first_name} ${player.last_name} (${player.position})` : null;
      }).filter(Boolean) || [];
      
      const team2Players = team2Matchup.players?.map((id: string) => {
        const player = players[id];
        return player ? `${player.first_name} ${player.last_name} (${player.position})` : null;
      }).filter(Boolean) || [];

      // Get team starters
      const team1Starters = team1Matchup.starters?.map((id: string) => {
        const player = players[id];
        return player ? `${player.first_name} ${player.last_name} (${player.position})` : null;
      }).filter(Boolean) || [];
      
      const team2Starters = team2Matchup.starters?.map((id: string) => {
        const player = players[id];
        return player ? `${player.first_name} ${player.last_name} (${player.position})` : null;
      }).filter(Boolean) || [];

      const prompt = `
        Analyze this fantasy football matchup and provide detailed insights:
        
        Team 1: ${team1?.settings?.team_name || `Team ${team1Matchup.roster_id}`} (${team1Owner.display_name || team1Owner.username})
        Current Points: ${team1Matchup.points}
        Projected Points: ${team1ProjectedPoints.toFixed(1)}
        Win Probability: ${team1WinProb.toFixed(1)}%
        Record: ${team1?.wins || 0}-${team1?.losses || 0}
        Starters: ${team1Starters.slice(0, 5).join(", ")}
        
        Team 2: ${team2?.settings?.team_name || `Team ${team2Matchup.roster_id}`} (${team2Owner.display_name || team2Owner.username})
        Current Points: ${team2Matchup.points}
        Projected Points: ${team2ProjectedPoints.toFixed(1)}
        Win Probability: ${team2WinProb.toFixed(1)}%
        Record: ${team2?.wins || 0}-${team2?.losses || 0}
        Starters: ${team2Starters.slice(0, 5).join(", ")}
        
        Provide a JSON response with:
        {
          "prediction": "Team name that will win",
          "confidence": number between 1-99,
          "keyPlayers": {
            "team1": ["Player 1", "Player 2", "Player 3"],
            "team2": ["Player 1", "Player 2", "Player 3"]
          },
          "insights": "Detailed analysis of the matchup (2-3 sentences)",
          "factors": ["Key factor 1", "Key factor 2", "Key factor 3"],
          "playerMatchups": [
            {
              "position": "QB/RB/WR/etc",
              "team1Player": "Player name",
              "team2Player": "Player name",
              "advantage": "Team1" or "Team2" or "Even"
            }
          ]
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
        max_tokens: 800
      });

      const analysisResult = JSON.parse(completion.choices[0].message.content);
      setAnalysis(analysisResult);
    } catch (error) {
      console.error('Error analyzing matchup:', error);
      setAnalysis(null);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
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
        
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm">
          <Calendar size={16} className="text-gray-500" />
          <span className="font-medium text-gray-700">Week {currentWeek}</span>
        </div>
      </div>
      
      {/* Matchup Header */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-white">
          <h1 className="text-2xl font-bold mb-4">Matchup Details</h1>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Team 1 */}
            <div className="flex-1 text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                <img 
                  src={team1AvatarUrl}
                  alt={team1Owner.display_name || team1Owner.username}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(team1Owner.display_name || team1Owner.username || 'Unknown')}&background=6366f1&color=fff`;
                  }}
                />
              </div>
              <h2 className="mt-3 text-xl font-bold">
                {team1?.settings?.team_name || `Team ${team1Matchup.roster_id}`}
              </h2>
              <p className="text-white/80">{team1Owner.display_name || team1Owner.username}</p>
              <div className="mt-2 text-2xl font-bold">{team1Matchup.points.toFixed(2)}</div>
              {team1ProjectedPoints > 0 && (
                <div className="flex items-center justify-center mt-1">
                  <span className="text-sm text-white/80">Proj: {team1ProjectedPoints.toFixed(1)}</span>
                  {team1ProjectedPoints > team1Matchup.points ? (
                    <TrendingUp size={16} className="ml-1 text-green-300" />
                  ) : (
                    <TrendingDown size={16} className="ml-1 text-red-300" />
                  )}
                </div>
              )}
            </div>
            
            {/* VS */}
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold text-white/80">VS</div>
              <div className="mt-2 flex items-center gap-2">
                <div className="px-3 py-1 rounded-full text-sm font-medium bg-white/10 backdrop-blur-sm">
                  {team1WinProb.toFixed(0)}%
                </div>
                <div className="px-3 py-1 rounded-full text-sm font-medium bg-white/10 backdrop-blur-sm">
                  {team2WinProb.toFixed(0)}%
                </div>
              </div>
            </div>
            
            {/* Team 2 */}
            <div className="flex-1 text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                <img 
                  src={team2AvatarUrl}
                  alt={team2Owner.display_name || team2Owner.username}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(team2Owner.display_name || team2Owner.username || 'Unknown')}&background=6366f1&color=fff`;
                  }}
                />
              </div>
              <h2 className="mt-3 text-xl font-bold">
                {team2?.settings?.team_name || `Team ${team2Matchup.roster_id}`}
              </h2>
              <p className="text-white/80">{team2Owner.display_name || team2Owner.username}</p>
              <div className="mt-2 text-2xl font-bold">{team2Matchup.points.toFixed(2)}</div>
              {team2ProjectedPoints > 0 && (
                <div className="flex items-center justify-center mt-1">
                  <span className="text-sm text-white/80">Proj: {team2ProjectedPoints.toFixed(1)}</span>
                  {team2ProjectedPoints > team2Matchup.points ? (
                    <TrendingUp size={16} className="ml-1 text-green-300" />
                  ) : (
                    <TrendingDown size={16} className="ml-1 text-red-300" />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="h-2.5 bg-gray-100">
          <div 
            className="h-full bg-gradient-to-r from-primary-500 to-primary-600"
            style={{ width: `${(team1Matchup.points / (team1Matchup.points + team2Matchup.points)) * 100}%` }}
          />
        </div>
        
        {/* AI Analysis Button */}
        {!analysis && !isAnalyzing && (
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={analyzeMatchup}
              disabled={isAnalyzing}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors"
            >
              <Brain size={18} />
              <span className="font-medium">Generate AI Matchup Analysis</span>
            </button>
          </div>
        )}
        
        {/* Loading State */}
        {isAnalyzing && (
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center justify-center py-3 px-4 bg-gray-50 text-gray-500 rounded-lg">
              <div className="w-5 h-5 border-2 border-gray-300 border-t-primary-500 rounded-full animate-spin mr-3"></div>
              <span>Analyzing matchup with AI...</span>
            </div>
          </div>
        )}
        
        {/* AI Analysis Results */}
        {analysis && (
          <div className="p-6 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Brain size={20} className="text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-800">AI Matchup Analysis</h3>
              <div className="ml-auto px-3 py-1 bg-primary-100 rounded-full text-sm font-medium text-primary-700">
                {analysis.confidence}% Confidence
              </div>
            </div>
            
            <div className="bg-primary-50 rounded-lg p-4 mb-4">
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
            
            {/* Key Players */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                  <Star size={16} className="text-primary-500 mr-2" />
                  Key Players - {team1?.settings?.team_name || `Team ${team1Matchup.roster_id}`}
                </h4>
                <div className="space-y-2">
                  {analysis.keyPlayers.team1.map((player, idx) => (
                    <div key={idx} className="flex items-center bg-white rounded-lg p-2 shadow-sm">
                      <Zap size={16} className="text-primary-500 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">{player}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                  <Star size={16} className="text-primary-500 mr-2" />
                  Key Players - {team2?.settings?.team_name || `Team ${team2Matchup.roster_id}`}
                </h4>
                <div className="space-y-2">
                  {analysis.keyPlayers.team2.map((player, idx) => (
                    <div key={idx} className="flex items-center bg-white rounded-lg p-2 shadow-sm">
                      <Target size={16} className="text-primary-500 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">{player}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Position Matchups */}
            {analysis.playerMatchups && analysis.playerMatchups.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                  <Users size={16} className="text-primary-500 mr-2" />
                  Position Matchups
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Position
                        </th>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {team1?.settings?.team_name || `Team ${team1Matchup.roster_id}`}
                        </th>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {team2?.settings?.team_name || `Team ${team2Matchup.roster_id}`}
                        </th>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Advantage
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {analysis.playerMatchups.map((matchup, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                            {matchup.position}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            {matchup.team1Player}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            {matchup.team2Player}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              matchup.advantage === "Team1" ? "bg-green-100 text-green-800" :
                              matchup.advantage === "Team2" ? "bg-blue-100 text-blue-800" :
                              "bg-gray-100 text-gray-800"
                            }`}>
                              {matchup.advantage === "Team1" ? team1?.settings?.team_name || `Team ${team1Matchup.roster_id}` :
                               matchup.advantage === "Team2" ? team2?.settings?.team_name || `Team ${team2Matchup.roster_id}` :
                               "Even"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Team Rosters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Team 1 Roster */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-white">
            <h3 className="font-semibold text-gray-800">{team1?.settings?.team_name || `Team ${team1Matchup.roster_id}`} Roster</h3>
          </div>
          
          <div className="p-4">
            {team1Matchup.players ? (
              <div className="space-y-3">
                {team1Matchup.players.slice(0, 10).map(playerId => {
                  const player = players[playerId];
                  if (!player) return null;
                  
                  const isStarter = team1Matchup.starters?.includes(playerId);
                  const projection = projections[playerId]?.pts_ppr || 0;
                  
                  return (
                    <div key={playerId} className={`p-3 rounded-lg ${
                      isStarter ? 'bg-primary-50 border border-primary-100' : 'bg-gray-50'
                    }`}>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                            player.position === 'QB' ? 'bg-red-100 text-red-800' :
                            player.position === 'RB' ? 'bg-blue-100 text-blue-800' :
                            player.position === 'WR' ? 'bg-green-100 text-green-800' :
                            player.position === 'TE' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {player.position}
                          </div>
                          <div className="ml-2">
                            <p className="font-medium text-gray-800">{player.first_name} {player.last_name}</p>
                            <p className="text-xs text-gray-500">{player.team} - {player.position}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end">
                          {projection > 0 && (
                            <div className="text-sm font-medium text-gray-700 flex items-center">
                              <Clock size={12} className="mr-1 text-gray-400" />
                              {projection.toFixed(1)} pts
                            </div>
                          )}
                          {isStarter && (
                            <div className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full mt-1">
                              Starter
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {team1Matchup.players.length > 10 && (
                  <div className="text-center text-sm text-gray-500 mt-2">
                    +{team1Matchup.players.length - 10} more players
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No roster data available</p>
            )}
          </div>
        </div>
        
        {/* Team 2 Roster */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-white">
            <h3 className="font-semibold text-gray-800">{team2?.settings?.team_name || `Team ${team2Matchup.roster_id}`} Roster</h3>
          </div>
          
          <div className="p-4">
            {team2Matchup.players ? (
              <div className="space-y-3">
                {team2Matchup.players.slice(0, 10).map(playerId => {
                  const player = players[playerId];
                  if (!player) return null;
                  
                  const isStarter = team2Matchup.starters?.includes(playerId);
                  const projection = projections[playerId]?.pts_ppr || 0;
                  
                  return (
                    <div key={playerId} className={`p-3 rounded-lg ${
                      isStarter ? 'bg-primary-50 border border-primary-100' : 'bg-gray-50'
                    }`}>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                            player.position === 'QB' ? 'bg-red-100 text-red-800' :
                            player.position === 'RB' ? 'bg-blue-100 text-blue-800' :
                            player.position === 'WR' ? 'bg-green-100 text-green-800' :
                            player.position === 'TE' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {player.position}
                          </div>
                          <div className="ml-2">
                            <p className="font-medium text-gray-800">{player.first_name} {player.last_name}</p>
                            <p className="text-xs text-gray-500">{player.team} - {player.position}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end">
                          {projection > 0 && (
                            <div className="text-sm font-medium text-gray-700 flex items-center">
                              <Clock size={12} className="mr-1 text-gray-400" />
                              {projection.toFixed(1)} pts
                            </div>
                          )}
                          {isStarter && (
                            <div className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full mt-1">
                              Starter
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {team2Matchup.players.length > 10 && (
                  <div className="text-center text-sm text-gray-500 mt-2">
                    +{team2Matchup.players.length - 10} more players
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No roster data available</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Owner Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {team1?.owner_id && (
          <OwnerDetails ownerId={team1.owner_id} />
        )}
        
        {team2?.owner_id && (
          <OwnerDetails ownerId={team2.owner_id} />
        )}
      </div>
    </div>
  );
};

export default MatchupDetails;