import React, { useState, useEffect } from 'react';
import { DraftPlayer } from '../../types/draft';
import { calculateBoomProbability, calculateBustRisk, calculateBreakoutScore } from '../../services/draftService';
import { Zap, AlertTriangle, TrendingUp, Star } from 'lucide-react';

interface DraftPlayerAnalysisProps {
  player: DraftPlayer;
}

export const DraftPlayerAnalysis: React.FC<DraftPlayerAnalysisProps> = ({ player }) => {
  const [analysis, setAnalysis] = useState({
    boom: 0,
    bust: 0,
    breakout: 0,
    overall: 0
  });
  
  useEffect(() => {
    // Calculate metrics
    const boom = calculateBoomProbability(player);
    const bust = calculateBustRisk(player);
    const breakout = calculateBreakoutScore(player);
    
    // Calculate overall score (higher boom and breakout are good, higher bust is bad)
    const overall = Math.round((boom + breakout + (100 - bust)) / 3);
    
    setAnalysis({
      boom,
      bust,
      breakout,
      overall
    });
  }, [player]);
  
  // Get grade based on score
  const getGrade = (score: number): string => {
    if (score >= 90) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 80) return 'A-';
    if (score >= 75) return 'B+';
    if (score >= 70) return 'B';
    if (score >= 65) return 'B-';
    if (score >= 60) return 'C+';
    if (score >= 55) return 'C';
    if (score >= 50) return 'C-';
    if (score >= 45) return 'D+';
    if (score >= 40) return 'D';
    return 'F';
  };
  
  // Get color based on score
  const getScoreColor = (score: number, isReversed: boolean = false): string => {
    const effectiveScore = isReversed ? 100 - score : score;
    
    if (effectiveScore >= 80) return 'text-green-600';
    if (effectiveScore >= 60) return 'text-blue-600';
    if (effectiveScore >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">AI Player Analysis</h3>
          <div className="flex items-center gap-2">
            <Star size={16} className="text-yellow-500" />
            <span className="font-medium text-gray-800">
              Grade: <span className={getScoreColor(analysis.overall)}>{getGrade(analysis.overall)}</span>
            </span>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Boom Potential */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Zap size={18} className="text-primary-500 mr-2" />
                <span className="font-medium text-gray-800">Boom Potential</span>
              </div>
              <span className={`font-bold ${getScoreColor(analysis.boom)}`}>
                {analysis.boom}%
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary-500 rounded-full"
                style={{ width: `${analysis.boom}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Likelihood of significantly outperforming expectations
            </p>
          </div>
          
          {/* Bust Risk */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <AlertTriangle size={18} className="text-red-500 mr-2" />
                <span className="font-medium text-gray-800">Bust Risk</span>
              </div>
              <span className={`font-bold ${getScoreColor(analysis.bust, true)}`}>
                {analysis.bust}%
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-red-500 rounded-full"
                style={{ width: `${analysis.bust}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Likelihood of underperforming relative to draft position
            </p>
          </div>
          
          {/* Breakout Score */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <TrendingUp size={18} className="text-green-500 mr-2" />
                <span className="font-medium text-gray-800">Breakout Score</span>
              </div>
              <span className={`font-bold ${getScoreColor(analysis.breakout)}`}>
                {analysis.breakout}%
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${analysis.breakout}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Potential for a significant leap in production this season
            </p>
          </div>
        </div>
        
        {/* AI Insights */}
        <div className="mt-4 bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-2">AI Insights</h4>
          <p className="text-sm text-gray-600">
            {analysis.boom > 70 && analysis.breakout > 70 && analysis.bust < 40 && (
              <>
                <span className="font-medium text-green-600">High Upside Pick:</span> {player.first_name} {player.last_name} shows excellent boom potential with manageable risk. Consider prioritizing this player in your draft.
              </>
            )}
            
            {analysis.boom > 70 && analysis.bust > 60 && (
              <>
                <span className="font-medium text-yellow-600">Boom or Bust:</span> {player.first_name} {player.last_name} has high ceiling but comes with significant risk. Best suited for managers willing to gamble.
              </>
            )}
            
            {analysis.boom < 50 && analysis.bust < 40 && (
              <>
                <span className="font-medium text-blue-600">Safe Floor:</span> {player.first_name} {player.last_name} offers consistent production with limited upside. Solid pick for stability in your lineup.
              </>
            )}
            
            {analysis.breakout > 75 && player.years_exp !== undefined && player.years_exp <= 3 && (
              <>
                <span className="font-medium text-primary-600">Breakout Candidate:</span> {player.first_name} {player.last_name} shows strong indicators for a potential breakout season. Consider targeting before ADP.
              </>
            )}
            
            {analysis.bust > 70 && (
              <>
                <span className="font-medium text-red-600">High Risk Alert:</span> {player.first_name} {player.last_name} carries significant downside risk at current draft position. Consider alternatives with similar upside.
              </>
            )}
            
            {/* Default message if no specific insight applies */}
            {!(
              (analysis.boom > 70 && analysis.breakout > 70 && analysis.bust < 40) ||
              (analysis.boom > 70 && analysis.bust > 60) ||
              (analysis.boom < 50 && analysis.bust < 40) ||
              (analysis.breakout > 75 && player.years_exp !== undefined && player.years_exp <= 3) ||
              (analysis.bust > 70)
            ) && (
              <>
                {player.first_name} {player.last_name} is a {analysis.overall >= 70 ? 'solid' : 'average'} fantasy option with balanced metrics. Consider team needs and draft position when making your selection.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};