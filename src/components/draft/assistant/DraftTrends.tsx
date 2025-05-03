import React, { useState, useEffect } from 'react';
import { useDraftStore } from '../../../store/draftStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, Info, BarChart2 } from 'lucide-react';

interface PositionTrend {
  position: string;
  count: number;
  percentage: number;
  round1: number;
  round2: number;
  round3: number;
  round4: number;
  round5Plus: number;
}

interface PositionRun {
  position: string;
  startPick: number;
  endPick: number;
  count: number;
  round: number;
}

export const DraftTrends: React.FC = () => {
  const { picks, draft } = useDraftStore();
  const [positionTrends, setPositionTrends] = useState<PositionTrend[]>([]);
  const [positionRuns, setPositionRuns] = useState<PositionRun[]>([]);
  const [roundDistribution, setRoundDistribution] = useState<any[]>([]);
  const [showInfo, setShowInfo] = useState(false);
  
  // Calculate position trends and runs whenever picks change
  useEffect(() => {
    if (picks.length === 0) return;
    
    // Calculate position counts
    const positionCounts: Record<string, number> = {};
    const roundCounts: Record<string, Record<number, number>> = {};
    
    picks.forEach(pick => {
      const position = pick.metadata.position;
      const round = pick.round;
      
      // Update position counts
      positionCounts[position] = (positionCounts[position] || 0) + 1;
      
      // Update round counts
      if (!roundCounts[position]) {
        roundCounts[position] = {};
      }
      roundCounts[position][round] = (roundCounts[position][round] || 0) + 1;
    });
    
    // Calculate total picks
    const totalPicks = picks.length;
    
    // Calculate position trends
    const trends: PositionTrend[] = Object.entries(positionCounts).map(([position, count]) => {
      const percentage = (count / totalPicks) * 100;
      
      // Calculate round distribution
      const round1 = roundCounts[position][1] || 0;
      const round2 = roundCounts[position][2] || 0;
      const round3 = roundCounts[position][3] || 0;
      const round4 = roundCounts[position][4] || 0;
      const round5Plus = count - (round1 + round2 + round3 + round4);
      
      return {
        position,
        count,
        percentage,
        round1,
        round2,
        round3,
        round4,
        round5Plus
      };
    }).sort((a, b) => b.count - a.count);
    
    setPositionTrends(trends);
    
    // Prepare round distribution data for chart
    const roundData = [];
    for (let round = 1; round <= 5; round++) {
      const roundObj: any = { name: `Round ${round}` };
      
      Object.entries(roundCounts).forEach(([position, rounds]) => {
        roundObj[position] = rounds[round] || 0;
      });
      
      roundData.push(roundObj);
    }
    
    setRoundDistribution(roundData);
    
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
  
  // Get position color for chart
  const getPositionColor = (position: string): string => {
    switch (position) {
      case 'QB':
        return '#ef4444';
      case 'RB':
        return '#3b82f6';
      case 'WR':
        return '#22c55e';
      case 'TE':
        return '#a855f7';
      case 'K':
        return '#eab308';
      case 'DEF':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center">
          <BarChart2 size={18} className="text-primary-500 mr-2" />
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
            Position trends show which positions are being drafted most frequently and in which rounds. Position runs indicate when 3+ consecutive picks of the same position occurred, which can signal a positional run. Use this information to anticipate draft patterns and adjust your strategy accordingly.
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
                
                {/* Round distribution */}
                <div className="flex mt-1">
                  {trend.round1 > 0 && (
                    <div className="h-2 bg-primary-500" style={{ width: `${(trend.round1 / trend.count) * 100}%` }}></div>
                  )}
                  {trend.round2 > 0 && (
                    <div className="h-2 bg-green-500" style={{ width: `${(trend.round2 / trend.count) * 100}%` }}></div>
                  )}
                  {trend.round3 > 0 && (
                    <div className="h-2 bg-blue-500" style={{ width: `${(trend.round3 / trend.count) * 100}%` }}></div>
                  )}
                  {trend.round4 > 0 && (
                    <div className="h-2 bg-yellow-500" style={{ width: `${(trend.round4 / trend.count) * 100}%` }}></div>
                  )}
                  {trend.round5Plus > 0 && (
                    <div className="h-2 bg-gray-500" style={{ width: `${(trend.round5Plus / trend.count) * 100}%` }}></div>
                  )}
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Round 1: {trend.round1}</span>
                  <span>Round 2: {trend.round2}</span>
                  <span>Round 3: {trend.round3}</span>
                  <span>Round 4: {trend.round4}</span>
                  <span>Round 5+: {trend.round5Plus}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Round Distribution Chart */}
        <div className="mt-6">
          <h4 className="font-medium text-gray-800 mb-3">Round Distribution</h4>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={roundDistribution}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                {positionTrends.map(trend => (
                  <Bar 
                    key={trend.position}
                    dataKey={trend.position}
                    stackId="a"
                    fill={getPositionColor(trend.position)}
                    name={`${trend.position}s`}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
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