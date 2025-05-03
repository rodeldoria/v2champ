import React, { useState, useRef, useEffect } from 'react';
import { useDraftStore } from '../../../store/draftStore';
import { useSleeperStore } from '../../../store/sleeperStore';
import { DraftPlayer } from '../../../types/draft';
import { Brain, Send, ChevronDown, X, Zap, Star, TrendingUp, Shield, AlertTriangle, Minimize2, Maximize2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface DraftStrategy {
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export const DraftCoachAI: React.FC = () => {
  const { availablePlayers, picks, myNextPick, myDraftPosition, draft } = useDraftStore();
  const { players, selectedLeague } = useSleeperStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'system',
      content: 'You are Coach AI, an expert fantasy football draft assistant. You provide concise, data-driven advice to help users make optimal draft decisions.'
    },
    {
      role: 'assistant',
      content: "👋 I'm Coach AI, your fantasy draft expert! Ask me anything about draft strategy, player recommendations, or specific players. I can help with:\n\n- Best available players\n- Draft strategy advice\n- Player comparisons\n- Position needs\n- Value-based drafting\n\nWhat can I help you with today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
  const [showStrategies, setShowStrategies] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Draft strategies
  const draftStrategies: DraftStrategy[] = [
    {
      name: 'Best Player Available',
      description: 'Focus on drafting the highest ranked player regardless of position',
      icon: <Star className="text-yellow-500" />,
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    },
    {
      name: 'Zero RB',
      description: 'Prioritize elite WRs early and target RBs in middle rounds',
      icon: <Zap className="text-green-500" />,
      color: 'bg-green-100 text-green-800 border-green-200'
    },
    {
      name: 'Hero RB',
      description: 'Draft one elite RB early, then focus on WRs and TEs',
      icon: <Shield className="text-blue-500" />,
      color: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    {
      name: 'Robust RB',
      description: 'Load up on RBs early to secure positional advantage',
      icon: <TrendingUp className="text-purple-500" />,
      color: 'bg-purple-100 text-purple-800 border-purple-200'
    },
    {
      name: 'Value-Based Drafting',
      description: 'Focus on players with the biggest gap between ADP and rank',
      icon: <Brain className="text-primary-500" />,
      color: 'bg-primary-100 text-primary-800 border-primary-200'
    }
  ];
  
  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Get drafted player IDs
  const draftedPlayerIds = picks.map(pick => pick.player_id);
  
  // Filter out drafted players
  const availablePlayersFiltered = availablePlayers.filter(
    player => !draftedPlayerIds.includes(player.player_id)
  );
  
  // Get position color class
  const getPositionColorClass = (position: string): string => {
    switch (position) {
      case 'QB':
        return 'bg-red-100 text-red-800';
      case 'RB':
        return 'bg-blue-100 text-blue-800';
      case 'WR':
        return 'bg-green-100 text-green-800';
      case 'TE':
        return 'bg-purple-100 text-purple-800';
      case 'K':
        return 'bg-yellow-100 text-yellow-800';
      case 'DEF':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get player image URL
  const getPlayerImageUrl = (playerId: string) => {
    return `https://sleepercdn.com/content/nfl/players/thumb/${playerId}.jpg`;
  };
  
  // Get team logo URL
  const getTeamLogoUrl = (team: string) => {
    return `https://sleepercdn.com/images/team_logos/nfl/${team?.toLowerCase()}.png`;
  };
  
  // Handle sending message
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage: Message = {
      role: 'user',
      content: input
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Prepare context for the AI
      const draftContext = {
        currentPick: picks.length + 1,
        myNextPick,
        myDraftPosition,
        draftType: draft?.type || 'snake',
        scoringType: draft?.metadata?.scoring_type || 'ppr',
        leagueName: selectedLeague?.name || 'Unknown League',
        teamCount: draft?.settings?.teams || 12,
        availablePlayers: availablePlayersFiltered.slice(0, 20).map(p => ({
          name: `${p.first_name} ${p.last_name}`,
          position: p.position,
          team: p.team,
          rank: p.rank,
          adp: p.adp,
          tier: p.tier,
          boom: p.boom_probability,
          bust: p.bust_risk,
          breakout: p.breakout_score
        })),
        recentPicks: picks.slice(-5).map(p => ({
          name: `${p.metadata.first_name} ${p.metadata.last_name}`,
          position: p.metadata.position,
          team: p.metadata.team,
          pickNo: p.pick_no,
          round: p.round
        })),
        selectedStrategy
      };
      
      // Simulate AI response (in a real app, you'd call an API)
      setTimeout(() => {
        // Generate a response based on the user's message
        let response = generateResponse(userMessage.content, draftContext);
        
        // Process response to extract player recommendations if any
        const processedResponse = processResponseForPlayerCards(response);
        
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: processedResponse
        }]);
        
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Error generating response:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm sorry, I encountered an error while generating a response. Please try again."
      }]);
      setIsLoading(false);
    }
  };
  
  // Generate a response based on the user's message
  const generateResponse = (userMessage: string, context: any): string => {
    const message = userMessage.toLowerCase();
    
    // Check for common questions and provide canned responses
    if (message.includes('best player') || message.includes('who should i draft')) {
      const topPlayer = context.availablePlayers[0];
      return `Based on the available players, I recommend drafting ${topPlayer.name} (${topPlayer.position}, ${topPlayer.team}). They're currently the highest ranked player available at rank #${topPlayer.rank}.`;
    }
    
    if (message.includes('strategy') || message.includes('approach')) {
      if (context.selectedStrategy) {
        const strategy = draftStrategies.find(s => s.name === context.selectedStrategy);
        return `You're currently using the ${strategy?.name} strategy. ${strategy?.description}. This is a solid approach for your draft position at #${context.myDraftPosition}.`;
      } else {
        return `For your draft position at #${context.myDraftPosition}, I'd recommend a balanced approach focusing on securing elite RBs and WRs in the early rounds, then filling out your roster based on value in the middle rounds.`;
      }
    }
    
    if (message.includes('zero rb')) {
      return "The Zero RB strategy involves avoiding RBs in the early rounds (typically the first 4-5 rounds) and instead loading up on elite WRs, an elite TE, and possibly an elite QB. This strategy works best in PPR formats where WRs tend to be more valuable and consistent. You'd then target high-upside RBs in the middle and late rounds.";
    }
    
    if (message.includes('hero rb')) {
      return "The Hero RB strategy involves drafting one elite RB in the first round, then pivoting to elite WRs and possibly an elite TE in the next few rounds. This gives you positional advantage at RB while still building a strong WR corps. It's a balanced approach that works well in most formats.";
    }
    
    if (message.includes('next pick') || message.includes('when do i pick')) {
      return context.myNextPick 
        ? `Your next pick is at position #${context.myNextPick}.` 
        : "I don't have information about your next pick position.";
    }
    
    // Default response
    return "I'm here to help with your draft! You can ask me about specific players, draft strategies, or who to pick next. What would you like to know?";
  };
  
  // Process response to extract player recommendations
  const processResponseForPlayerCards = (response: string): string => {
    // This is a simple implementation - in a real app, you might want to use a more sophisticated approach
    // to extract player names and match them to your player database
    
    // For now, we'll just check if any player names are mentioned in the response
    const playerMatches: DraftPlayer[] = [];
    
    availablePlayersFiltered.forEach(player => {
      const playerName = `${player.first_name} ${player.last_name}`;
      if (response.includes(playerName)) {
        playerMatches.push(player);
      }
    });
    
    // If we found player matches, add player cards to the response
    if (playerMatches.length > 0) {
      // Add a special marker that we'll use to render player cards
      return `${response}\n\n[PLAYER_CARDS:${playerMatches.map(p => p.player_id).join(',')}]`;
    }
    
    return response;
  };
  
  // Render player cards from message content
  const renderMessageContent = (content: string) => {
    // Check if the message contains player cards
    if (content.includes('[PLAYER_CARDS:')) {
      const parts = content.split('[PLAYER_CARDS:');
      const textContent = parts[0];
      const playerIdsString = parts[1].split(']')[0];
      const playerIds = playerIdsString.split(',');
      
      const playerCards = playerIds.map(id => {
        const player = availablePlayers.find(p => p.player_id === id);
        if (!player) return null;
        
        return (
          <div key={player.player_id} className="bg-white rounded-lg p-3 border border-gray-200 mt-2">
            <div className="flex items-center">
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                <img
                  src={getPlayerImageUrl(player.player_id)}
                  alt={`${player.first_name} ${player.last_name}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${player.first_name}+${player.last_name}&background=6366f1&color=fff`;
                  }}
                />
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-800 truncate">
                    {player.first_name} {player.last_name}
                  </h3>
                  <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                    getPositionColorClass(player.position)
                  }`}>
                    {player.position}
                  </span>
                </div>
                <div className="flex items-center mt-1">
                  {player.team && (
                    <div className="flex items-center">
                      <img 
                        src={getTeamLogoUrl(player.team)} 
                        alt={player.team} 
                        className="w-4 h-4 mr-1"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <span className="text-xs text-gray-500">{player.team}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div>
                <div className="text-xs text-gray-500">Rank</div>
                <div className="font-semibold text-gray-800">{player.rank || 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">ADP</div>
                <div className="font-semibold text-gray-800">{player.adp?.toFixed(1) || 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Tier</div>
                <div className="font-semibold text-gray-800">{player.tier || 'N/A'}</div>
              </div>
            </div>
            
            {/* Player metrics */}
            <div className="grid grid-cols-3 gap-2 mt-2">
              {player.boom_probability !== undefined && (
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Boom</span>
                    <span className="font-medium">{player.boom_probability}%</span>
                  </div>
                  <div className="h-1 bg-gray-200 rounded-full">
                    <div 
                      className="h-full bg-primary-500 rounded-full"
                      style={{ width: `${player.boom_probability}%` }}
                    />
                  </div>
                </div>
              )}
              
              {player.bust_risk !== undefined && (
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Bust</span>
                    <span className="font-medium">{player.bust_risk}%</span>
                  </div>
                  <div className="h-1 bg-gray-200 rounded-full">
                    <div 
                      className="h-full bg-red-500 rounded-full"
                      style={{ width: `${player.bust_risk}%` }}
                    />
                  </div>
                </div>
              )}
              
              {player.breakout_score !== undefined && (
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Breakout</span>
                    <span className="font-medium">{player.breakout_score}%</span>
                  </div>
                  <div className="h-1 bg-gray-200 rounded-full">
                    <div 
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${player.breakout_score}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            
            <button className="w-full mt-2 px-3 py-1.5 bg-primary-500 text-white rounded-lg text-xs font-medium hover:bg-primary-600 transition-colors">
              Draft Player
            </button>
          </div>
        );
      });
      
      return (
        <>
          <div className="whitespace-pre-wrap">{textContent}</div>
          <div className="space-y-2 mt-2">
            {playerCards}
          </div>
        </>
      );
    }
    
    // Regular message without player cards
    return <div className="whitespace-pre-wrap">{content}</div>;
  };
  
  // Apply draft strategy
  const applyStrategy = (strategyName: string) => {
    setSelectedStrategy(strategyName);
    
    // Add a message about the selected strategy
    const strategy = draftStrategies.find(s => s.name === strategyName);
    
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: `I've set your draft strategy to **${strategyName}**. ${strategy?.description}. I'll tailor my recommendations to this strategy going forward. Let me know if you have any questions!`
    }]);
    
    setShowStrategies(false);
  };
  
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-primary-500 text-white p-4 rounded-full shadow-lg hover:bg-primary-600 transition-colors"
        >
          <Brain size={24} />
        </button>
      </div>
    );
  }
  
  return (
    <div className="fixed bottom-4 right-4 w-80 md:w-96 h-96 bg-white rounded-lg shadow-lg overflow-hidden flex flex-col z-50">
      <div className="p-3 border-b border-gray-200 flex justify-between items-center bg-primary-500 text-white">
        <div className="flex items-center">
          <Brain size={18} className="mr-2" />
          <h3 className="font-semibold">Coach AI</h3>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 rounded-full hover:bg-primary-400 transition-colors"
          >
            <Minimize2 size={16} />
          </button>
          <button
            onClick={() => setShowStrategies(!showStrategies)}
            className="p-1 rounded-full hover:bg-primary-400 transition-colors"
          >
            {showStrategies ? <X size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>
      
      {/* Strategy selector dropdown */}
      {showStrategies && (
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium text-gray-800">Draft Strategies</h4>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            {draftStrategies.map(strategy => (
              <button
                key={strategy.name}
                onClick={() => applyStrategy(strategy.name)}
                className={`p-2 rounded-lg border text-left hover:bg-gray-50 transition-colors ${
                  selectedStrategy === strategy.name
                    ? `${strategy.color} border-2`
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-center">
                  <div className="mr-2">{strategy.icon}</div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-800">{strategy.name}</h5>
                    <p className="text-xs text-gray-500">{strategy.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.filter(m => m.role !== 'system').map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg p-2 ${
                message.role === 'user'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {renderMessageContent(message.content)}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-lg p-2 bg-gray-100 text-gray-800">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <div className="p-3 border-t border-gray-200">
        <div className="flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ask Coach AI..."
            className="flex-1 px-3 py-1.5 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            className="px-3 py-1.5 bg-primary-500 text-white rounded-r-lg hover:bg-primary-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};