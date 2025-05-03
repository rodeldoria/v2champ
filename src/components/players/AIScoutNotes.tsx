import React, { useState, useEffect } from 'react';
import { Player } from '../../types/sleeper';
import { getPlayerInsights, PlayerInsight } from '../../services/playerInsightsService';
import { Brain, TrendingUp, TrendingDown, AlertTriangle, Info, Shield, Zap, Target, Award } from 'lucide-react';

interface AIScoutNotesProps {
  player: Player;
  stats?: Record<string, number>;
}

export const AIScoutNotes: React.FC<AIScoutNotesProps> = ({ player, stats }) => {
  const [analysis, setAnalysis] = useState<PlayerInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayText, setDisplayText] = useState('');
  const [currentSection, setCurrentSection] = useState(0);
  const [isOllamaAvailable, setIsOllamaAvailable] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!player) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const insights = await getPlayerInsights(player, stats || {});
        setAnalysis(insights);
      } catch (error) {
        console.error('Error fetching AI analysis:', error);
        setError('Unable to generate analysis. Please try again later.');
        
        if (error instanceof Error && error.message.includes('Ollama')) {
          setIsOllamaAvailable(false);
          setError('Ollama is not available. Please make sure it is running on your machine.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalysis();
  }, [player, stats]);

  useEffect(() => {
    if (!analysis || loading) return;

    const sections = [
      analysis?.performance || '',
      analysis?.outlook || '',
      ...(analysis?.strengths || []),
      ...(analysis?.weaknesses || []),
      analysis?.trajectory || '',
      ...(analysis?.risks || [])
    ].filter(Boolean);

    let currentChar = 0;
    const text = sections[currentSection] || '';

    const timer = setInterval(() => {
      if (currentChar < text.length) {
        setDisplayText(prev => prev + text[currentChar]);
        currentChar++;
      } else {
        clearInterval(timer);
        setTimeout(() => {
          if (currentSection < sections.length - 1) {
            setCurrentSection(prev => prev + 1);
            setDisplayText('');
          }
        }, 1000);
      }
    }, 30);

    return () => clearInterval(timer);
  }, [analysis, currentSection, loading]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-warning-500 bg-warning-50 p-4 rounded-md flex items-start">
          <AlertTriangle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">{error}</p>
            {!isOllamaAvailable && (
              <p className="mt-2 text-sm">
                Please make sure Ollama is running on your machine. You can start it by running:
                <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                  ollama serve
                </pre>
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center text-gray-500">
        No analysis available
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <Brain className="w-5 h-5" />
          <h3 className="font-semibold">AI Scout Analysis</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-white/10 rounded-full text-white text-sm">
            {analysis.confidence}% Confidence
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Typewriter effect */}
        <div className="min-h-[200px] relative">
          <p className="text-gray-600 font-mono whitespace-pre-wrap break-words">
            {displayText}
            <span className="animate-pulse">|</span>
          </p>
        </div>

        {/* Analysis sections */}
        {currentSection > 0 && analysis?.performance && (
          <div>
            <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Award size={16} className="text-primary-500" />
              Performance Analysis
            </h4>
            <p className="text-gray-600 whitespace-pre-wrap break-words">{analysis.performance}</p>
          </div>
        )}

        {currentSection > 1 && analysis?.outlook && (
          <div>
            <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Target size={16} className="text-blue-500" />
              Future Outlook
            </h4>
            <p className="text-gray-600 whitespace-pre-wrap break-words">{analysis.outlook}</p>
          </div>
        )}

        {currentSection > 2 && analysis?.strengths?.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
              <TrendingUp size={16} className="text-success-500" />
              Strengths
            </h4>
            <ul className="space-y-2">
              {analysis.strengths.map((strength, index) => (
                <li key={index} className="flex items-center text-gray-600">
                  <TrendingUp size={16} className="text-success-500 mr-2 flex-shrink-0" />
                  <span className="break-words">{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {currentSection > 3 && analysis?.weaknesses?.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
              <TrendingDown size={16} className="text-warning-500" />
              Areas for Improvement
            </h4>
            <ul className="space-y-2">
              {analysis.weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-center text-gray-600">
                  <TrendingDown size={16} className="text-warning-500 mr-2 flex-shrink-0" />
                  <span className="break-words">{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {currentSection > 4 && analysis?.trajectory && (
          <div>
            <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Zap size={16} className="text-primary-500" />
              Development Trajectory
            </h4>
            <p className="text-gray-600 whitespace-pre-wrap break-words">{analysis.trajectory}</p>
          </div>
        )}

        {currentSection > 5 && analysis?.risks?.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Shield size={16} className="text-error-500" />
              Risk Assessment
            </h4>
            <ul className="space-y-2">
              {analysis.risks.map((risk, index) => (
                <li key={index} className="flex items-center text-gray-600">
                  <Shield size={16} className="text-error-500 mr-2 flex-shrink-0" />
                  <span className="break-words">{risk}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Attributes visualization */}
        {analysis.attributes && Object.keys(analysis.attributes).length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Info size={16} className="text-gray-500" />
              Player Attributes
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(analysis.attributes).map(([key, value]) => (
                <div key={key} className="text-center">
                  <div className="text-xs text-gray-500 mb-1 capitalize">{key}</div>
                  <div className="text-lg font-bold text-gray-800">{value}</div>
                  <div className="h-1.5 bg-gray-200 rounded-full mt-1">
                    <div 
                      className={`h-full rounded-full ${
                        value >= 90 ? 'bg-primary-500' :
                        value >= 80 ? 'bg-success-500' :
                        value >= 70 ? 'bg-warning-500' :
                        'bg-error-500'
                      }`}
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-gray-400 text-right">
          Last updated: {new Date(analysis.lastUpdated).toLocaleString()}
        </div>
      </div>
    </div>
  );
};