import React, { useState, useEffect } from 'react';
import { useDraftStore } from '../../../store/draftStore';
import { useSleeperStore } from '../../../store/sleeperStore';
import { History, TrendingUp, TrendingDown, AlertTriangle, Info } from 'lucide-react';

interface DraftTrend {
  position: string;
  count: number;
  percentage: number;
  trend: 'up' | 'down' | 'neutral';
}

interface PositionRun {
  position: string;
  startPick: number;
  endPick: number;
  count: number;
  round: number;
}

export const DraftHistoryAnalyzer: React.FC = () => {
  const { picks } = useDraftStore();
  const [positionTrends, setPositionTrends] = useState<DraftTrend[]>([]);
  const [positionRuns, setPositionRuns] = useState<PositionRun[]>([]);
  const [showInfo, setShowInfo] = useState(false);
  
  // Calculate position trends and runs whenever picks change
  useEffect(() => {
    if (picks.length === 0) return;
    
    // Calculate position counts
    const positionCounts: Record<string, number> = {};
    picks.forEach(pick => {
      const position = pick.metadata.position;
      positionCounts[position] = (positionCounts[position] || 0) + 1;
    });
    
    // Calculate total picks
    const totalPicks = picks.length;
    
    // Calculate position trends
    const trends: DraftTrend[] = Object.entries(positionCounts).map(([position, count]) => {
      const percentage = (count / totalPicks) * 100;
      
      // Calculate trend based on recent picks (last 10)
      const recentPicks = picks.slice(-10);
      const recentCount = recentPicks.filter(p => p.metadata.position === position).length;
      const recentPercentage = (recentCount / recentPicks.length) * 100;
      
      const trend: 'up' | 'down' | 'neutral' = 
        recentPercentage > percentage + 5 ? 'up' :
        recentPercentage < percentage - 5 ? 'down' :
        'neutral';
      
      return {
        position,
        count,
        percentage,
        trend
      };
    }).sort((a, b) => b.count - a.count);
    
    setPositionTrends(trends);
    
    // Detect position runs (3+ consecutive picks of same position)
    const runs: PositionRun[] = [];
    let currentRun: PositionRun | null = null;
    
    picks.forEach((pick, index) => {
      const position = pick.metadata.position;
      const round = pick.round;
      
      if (!currentRun) {
        // Start a new run
        currentRun = {
          position,
          startPick: pick.pick_no,
          endPick: pick.pick_no,
          count: 1,
          round
        };
      } else if (currentRun.position === position) {
        // Continue the current run
        currentRun.endPick = pick.pick_no;
        currentRun.count++;
      } else {
        // End the current run if it has at least 3 picks
        if (currentRun.count >= 3) {
          runs.push(currentRun);
        }
        
        // Start a new run
        currentRun = {
          position,
          startPick: pick.pick_no,
          endPick: pick.pick_no,
          count: 1,
          round
        };
      }
      
      // Check if we're at the end of the picks
      if (index === picks.length - 1 && currentRun && currentRun.count >= 3) {
        runs.push(currentRun);
      }
    });
    
    setPositionRuns(runs);
  }, [picks]);
  
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
  
  // Get trend icon
  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={16} className="text-green-500" />;
      case 'down':
        return <TrendingDown size={16} className="text-red-500" />;
      case 'neutral':
        return null;
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center">
          <History size={18} className="text-primary-500 mr-2" />
          <h3 className="font-semibold text-gray-800">Draft Trends</h3>
        </div>
        
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <Info size={16} className="text-gray-500" />
        </button>
      </div>
      
      {showInfo && (
        <div className="p-4 bg-blue-50 border-b border-blue-100">
          <h4 className="text-sm font-medium text-blue-800 mb-1">How to use this information</h4>
          <p className="text-xs text-blue-700">
            Position trends show which positions are being drafted most frequently. Position runs indicate when 3+ consecutive picks of the same position occurred, which can signal a positional run. Use this information to anticipate draft patterns and adjust your strategy accordingly.
          </p>
        </div>
      )}
      
      <div className="p-4">
        <h4 className="font-medium text-gray-800 mb-3">Position Breakdown</h4>
        
        <div className="space-y-3">
          {positionTrends.map(trend => (
            <div key={trend.position} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                getPositionColorClass(trend.position)
              }`}>
                {trend.position}
              </div>
              <div className="ml-3 flex-1">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700">{trend.position}s</span>
                    <span className="ml-2 text-xs text-gray-500">{trend.count} picks ({trend.percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="flex items-center">
                    {getTrendIcon(trend.trend)}
                    {trend.trend !== 'neutral' && (
                      <span className={`ml-1 text-xs ${
                        trend.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {trend.trend === 'up' ? 'Trending Up' : 'Trending Down'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${
                      trend.position === 'QB' ? 'bg-red-500' :
                      trend.position === 'RB' ? 'bg-blue-500' :
                      trend.position === 'WR' ? 'bg-green-500' :
                      trend.position === 'TE' ? 'bg-purple-500' :
                      trend.position === 'K' ? 'bg-yellow-500' :
                      'bg-gray-500'
                    }`}
                    style={{ width: `${trend.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {positionRuns.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium text-gray-800 mb-3">Position Runs Detected</h4>
            
            <div className="space-y-2">
              {positionRuns.map((run, index) => (
                <div key={index} className="bg-yellow-50 border border-yellow-100 rounded-lg p-3">
                  <div className="flex items-center">
                    <AlertTriangle size={16} className="text-yellow-600 mr-2" />
                    <div>
                      <h5 className="text-sm font-medium text-gray-800">
                        {run.position} Run in Round {run.round}
                      </h5>
                      <p className="text-xs text-gray-600">
                        {run.count} consecutive {run.position}s drafted from pick {run.startPick} to {run.endPick}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-sm text-gray-500">
          {picks.length > 0 
            ? `Analysis based on ${picks.length} draft picks`
            : 'No draft picks to analyze yet'}
        </div>
      </div>
    </div>
  );
};