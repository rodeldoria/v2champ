import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, TrendingDown, Shield, Star, Activity } from 'lucide-react';
import { Player } from '../../types/sleeper';
import { calculateAttributes } from '../../services/playerRatingService';

interface AIInsightsProps {
  player: Player;
  stats?: Record<string, number>;
  onClose?: () => void;
}

export const AIInsights: React.FC<AIInsightsProps> = ({ player, stats, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [insights, setInsights] = useState<{
    performance: string;
    trend: 'up' | 'down' | 'neutral';
    confidence: number;
    recommendations: string[];
    risks: string[];
  } | null>(null);

  useEffect(() => {
    const generateInsights = async () => {
      setIsLoading(true);
      try {
        const attributes = calculateAttributes(player, stats);
        const attributeValues = Object.values(attributes);
        const averageRating = attributeValues.reduce((a, b) => a + b, 0) / attributeValues.length;

        // Simulate AI analysis with calculated insights
        setInsights({
          performance: `${player.first_name} ${player.last_name} is currently performing at a ${averageRating.toFixed(1)} rating based on recent performance metrics and historical data.`,
          trend: averageRating > 80 ? 'up' : averageRating > 70 ? 'neutral' : 'down',
          confidence: Math.min(averageRating + 10, 99),
          recommendations: [
            'Monitor snap count trends for usage patterns',
            'Track red zone opportunities',
            'Analyze matchup-specific performance',
          ],
          risks: [
            'Schedule difficulty may impact production',
            'Target share volatility',
            'Game script dependency',
          ],
        });
      } catch (error) {
        console.error('Error generating insights:', error);
      } finally {
        setIsLoading(false);
      }
    };

    generateInsights();
  }, [player, stats]);

  if (isLoading) {
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

  if (!insights) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <Brain className="w-5 h-5" />
          <h3 className="font-semibold">AI Performance Analysis</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-white/10 rounded-full text-white text-sm">
            {insights.confidence}% Confidence
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Performance Summary */}
        <div className="flex items-start gap-4">
          <div className={`p-2 rounded-lg ${
            insights.trend === 'up' ? 'bg-green-100 text-green-600' :
            insights.trend === 'down' ? 'bg-red-100 text-red-600' :
            'bg-yellow-100 text-yellow-600'
          }`}>
            {insights.trend === 'up' ? <TrendingUp /> :
             insights.trend === 'down' ? <TrendingDown /> :
             <Activity />}
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Performance Trend</h4>
            <p className="text-gray-600">{insights.performance}</p>
          </div>
        </div>

        {/* Recommendations */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Strategic Recommendations</h4>
          <ul className="space-y-2">
            {insights.recommendations.map((rec, index) => (
              <li key={index} className="flex items-center gap-2 text-gray-600">
                <Star className="w-4 h-4 text-primary-500 flex-shrink-0" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Risk Assessment */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Risk Assessment</h4>
          <ul className="space-y-2">
            {insights.risks.map((risk, index) => (
              <li key={index} className="flex items-center gap-2 text-gray-600">
                <Shield className="w-4 h-4 text-warning-500 flex-shrink-0" />
                <span>{risk}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};