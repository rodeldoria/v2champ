import React, { useState } from 'react';
import { Activity, TrendingUp, TrendingDown, Zap, Brain, Calendar } from 'lucide-react';
import Plot from 'react-plotly.js';

interface PlayerSeasonSummaryProps {
  stats: Record<string, number>;
}

export const PlayerSeasonSummary: React.FC<PlayerSeasonSummaryProps> = ({ stats }) => {
  const [selectedSeason, setSelectedSeason] = useState<string>("2024");
  const seasons = ["2024", "2023", "2022", "2021", "2020", "Career Avg"];
  
  // Calculate snap percentage - ensure it's displayed even if not in stats
  const snapPct = stats.snap_pct ? Math.round(stats.snap_pct * 100) : 
                 stats.off_pct ? Math.round(stats.off_pct * 100) : 
                 stats.def_pct ? Math.round(stats.def_pct * 100) : 75;
                 
  const totalYards = (stats.rush_yd || 0) + (stats.rec_yd || 0) + (stats.pass_yd || 0);
  const fantasyPoints = (
    (stats.pass_yd || 0) * 0.04 +
    (stats.pass_td || 0) * 4 +
    (stats.pass_int || 0) * -1 +
    (stats.rush_yd || 0) * 0.1 +
    (stats.rush_td || 0) * 6 +
    (stats.rec || 0) * 1 +
    (stats.rec_yd || 0) * 0.1 +
    (stats.rec_td || 0) * 6
  );
  
  // Position rank - use a default if not available
  const posRank = stats.pos_rank || stats.ros_rank || '-';
  const posRankTrend = stats.pos_rank_trend || stats.ros_rank_trend || 0;

  // Get AI insights based on metrics
  const getSnapInsight = (pct: number): string => {
    if (pct >= 85) return "Elite usage indicates a cornerstone player in the offense.";
    if (pct >= 70) return "Strong snap share shows consistent involvement in the game plan.";
    if (pct >= 50) return "Moderate usage suggests a rotational role with upside.";
    return "Limited snap count indicates a specialized role or developing player.";
  };

  const getYardsInsight = (yards: number): string => {
    if (yards >= 1500) return "Exceptional production places player among elite fantasy options.";
    if (yards >= 1000) return "Strong yardage total demonstrates consistent offensive involvement.";
    if (yards >= 500) return "Moderate production indicates complementary offensive role.";
    return "Limited yardage suggests specialized usage or developing role.";
  };

  const getPointsInsight = (points: number): string => {
    if (points >= 25) return "Elite fantasy production makes player a weekly must-start.";
    if (points >= 15) return "Strong fantasy scoring provides reliable weekly production.";
    if (points >= 10) return "Solid fantasy value with matchup-dependent upside.";
    return "Limited fantasy scoring suggests streaming or bench consideration.";
  };

  const getRankInsight = (rank: any): string => {
    if (typeof rank === 'number') {
      if (rank <= 12) return "Top-tier positional ranking indicates elite fantasy value.";
      if (rank <= 24) return "Strong positional ranking provides weekly starter potential.";
      if (rank <= 36) return "Flex-worthy ranking with situational starting value.";
      return "Depth position ranking suggests bench or streaming consideration.";
    }
    return "Position ranking unavailable for complete analysis.";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Season selector */}
      <div className="md:col-span-2 bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-800">Season Summary</h3>
          <div className="flex space-x-2">
            <Calendar className="w-5 h-5 text-gray-500 mr-2" />
            <div className="flex space-x-1">
              {seasons.map(season => (
                <button
                  key={season}
                  onClick={() => setSelectedSeason(season)}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    selectedSeason === season
                      ? 'bg-primary-100 text-primary-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {season}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Left side - Stat cards */}
      <div className="grid grid-cols-1 gap-4 p-4 md:p-6 bg-white rounded-lg shadow-sm">
        {/* Snap Percentage */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Activity className={`w-5 h-5 ${
                snapPct >= 75 ? 'text-success-500' :
                snapPct >= 50 ? 'text-warning-500' :
                'text-error-500'
              }`} />
              <span className="ml-2 text-sm font-medium text-gray-600">Snap %</span>
            </div>
            <span className={`text-lg font-bold ${
              snapPct >= 75 ? 'text-success-700' :
              snapPct >= 50 ? 'text-warning-700' :
              'text-error-700'
            }`}>
              {snapPct}%
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${
                snapPct >= 75 ? 'bg-success-500' :
                snapPct >= 50 ? 'bg-warning-500' :
                'bg-error-500'
              }`}
              style={{ width: `${snapPct}%` }}
            />
          </div>
          <div className="mt-3 flex items-start">
            <Brain className="w-4 h-4 text-primary-500 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-xs text-gray-600">{getSnapInsight(snapPct)}</p>
          </div>
        </div>

        {/* Total Yards */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Zap className="w-5 h-5 text-primary-500" />
              <span className="ml-2 text-sm font-medium text-gray-600">Total Yards</span>
            </div>
            <span className="text-lg font-bold text-primary-700">{totalYards.toLocaleString()}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full bg-primary-500 transition-all"
              style={{ width: `${Math.min((totalYards / 2000) * 100, 100)}%` }}
            />
          </div>
          <div className="mt-3 flex items-start">
            <Brain className="w-4 h-4 text-primary-500 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-xs text-gray-600">{getYardsInsight(totalYards)}</p>
          </div>
        </div>

        {/* Fantasy Points */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <TrendingUp className="w-5 h-5 text-success-500" />
              <span className="ml-2 text-sm font-medium text-gray-600">Fantasy Pts</span>
            </div>
            <span className="text-lg font-bold text-success-700">{fantasyPoints.toFixed(1)}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full bg-success-500 transition-all"
              style={{ width: `${Math.min((fantasyPoints / 40) * 100, 100)}%` }}
            />
          </div>
          <div className="mt-3 flex items-start">
            <Brain className="w-4 h-4 text-primary-500 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-xs text-gray-600">{getPointsInsight(fantasyPoints)}</p>
          </div>
        </div>

        {/* Position Rank */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              {posRankTrend > 0 ? (
                <TrendingUp className="w-5 h-5 text-success-500" />
              ) : (
                <TrendingDown className="w-5 h-5 text-error-500" />
              )}
              <span className="ml-2 text-sm font-medium text-gray-600">Pos Rank</span>
            </div>
            <span className={`text-lg font-bold ${
              (typeof posRank === 'number' && posRank <= 12) ? 'text-success-700' :
              (typeof posRank === 'number' && posRank <= 24) ? 'text-warning-700' :
              'text-error-700'
            }`}>
              #{posRank}
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${
                (typeof posRank === 'number' && posRank <= 12) ? 'bg-success-500' :
                (typeof posRank === 'number' && posRank <= 24) ? 'bg-warning-500' :
                'bg-error-500'
              }`}
              style={{ width: `${Math.max(100 - ((typeof posRank === 'number' ? posRank : 50) / 0.32), 0)}%` }}
            />
          </div>
          <div className="mt-3 flex items-start">
            <Brain className="w-4 h-4 text-primary-500 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-xs text-gray-600">{getRankInsight(posRank)}</p>
          </div>
        </div>
      </div>

      {/* Right side - Gauge charts */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="font-medium text-gray-800 mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-40">
            <Plot
              data={[{
                type: 'indicator',
                mode: 'gauge+number',
                value: snapPct,
                title: { 
                  text: 'Snap %',
                  font: { 
                    size: 14,
                    family: 'Inter, system-ui, sans-serif'
                  }
                },
                gauge: {
                  axis: { 
                    range: [null, 100],
                    tickwidth: 1,
                    tickfont: {
                      size: 10,
                      family: 'Inter, system-ui, sans-serif'
                    }
                  },
                  bar: { color: 'rgba(16, 185, 129, 0.8)' },
                  bgcolor: "white",
                  borderwidth: 2,
                  bordercolor: "gray",
                  steps: [
                    { range: [0, 33], color: 'rgba(0, 0, 0, 0.05)' },
                    { range: [33, 66], color: 'rgba(0, 0, 0, 0.1)' },
                    { range: [66, 100], color: 'rgba(0, 0, 0, 0.15)' }
                  ]
                }
              }]}
              layout={{
                margin: { t: 25, b: 25, l: 25, r: 25 },
                width: 180,
                height: 150,
                font: {
                  family: 'Inter, system-ui, sans-serif',
                  size: 12
                },
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)'
              }}
              config={{
                responsive: true,
                displayModeBar: false
              }}
            />
          </div>
          
          <div className="h-40">
            <Plot
              data={[{
                type: 'indicator',
                mode: 'gauge+number',
                value: Math.min(fantasyPoints, 40),
                title: { 
                  text: 'Fantasy Points',
                  font: { 
                    size: 14,
                    family: 'Inter, system-ui, sans-serif'
                  }
                },
                gauge: {
                  axis: { 
                    range: [null, 40],
                    tickwidth: 1,
                    tickfont: {
                      size: 10,
                      family: 'Inter, system-ui, sans-serif'
                    }
                  },
                  bar: { color: 'rgba(99, 102, 241, 0.8)' },
                  bgcolor: "white",
                  borderwidth: 2,
                  bordercolor: "gray",
                  steps: [
                    { range: [0, 13], color: 'rgba(0, 0, 0, 0.05)' },
                    { range: [13, 26], color: 'rgba(0, 0, 0, 0.1)' },
                    { range: [26, 40], color: 'rgba(0, 0, 0, 0.15)' }
                  ]
                }
              }]}
              layout={{
                margin: { t: 25, b: 25, l: 25, r: 25 },
                width: 180,
                height: 150,
                font: {
                  family: 'Inter, system-ui, sans-serif',
                  size: 12
                },
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)'
              }}
              config={{
                responsive: true,
                displayModeBar: false
              }}
            />
          </div>
          
          <div className="h-40">
            <Plot
              data={[{
                type: 'indicator',
                mode: 'gauge+number',
                value: Math.min(totalYards / 20, 100),
                title: { 
                  text: 'Total Yards',
                  font: { 
                    size: 14,
                    family: 'Inter, system-ui, sans-serif'
                  }
                },
                gauge: {
                  axis: { 
                    range: [null, 100],
                    tickwidth: 1,
                    tickfont: {
                      size: 10,
                      family: 'Inter, system-ui, sans-serif'
                    }
                  },
                  bar: { color: 'rgba(245, 158, 11, 0.8)' },
                  bgcolor: "white",
                  borderwidth: 2,
                  bordercolor: "gray",
                  steps: [
                    { range: [0, 33], color: 'rgba(0, 0, 0, 0.05)' },
                    { range: [33, 66], color: 'rgba(0, 0, 0, 0.1)' },
                    { range: [66, 100], color: 'rgba(0, 0, 0, 0.15)' }
                  ]
                }
              }]}
              layout={{
                margin: { t: 25, b: 25, l: 25, r: 25 },
                width: 180,
                height: 150,
                font: {
                  family: 'Inter, system-ui, sans-serif',
                  size: 12
                },
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)'
              }}
              config={{
                responsive: true,
                displayModeBar: false
              }}
            />
          </div>
          
          <div className="h-40">
            <Plot
              data={[{
                type: 'indicator',
                mode: 'gauge+number',
                value: typeof posRank === 'number' ? Math.max(100 - posRank, 0) : 50,
                title: { 
                  text: 'Position Rank',
                  font: { 
                    size: 14,
                    family: 'Inter, system-ui, sans-serif'
                  }
                },
                gauge: {
                  axis: { 
                    range: [null, 100],
                    tickwidth: 1,
                    tickfont: {
                      size: 10,
                      family: 'Inter, system-ui, sans-serif'
                    }
                  },
                  bar: { color: 'rgba(239, 68, 68, 0.8)' },
                  bgcolor: "white",
                  borderwidth: 2,
                  bordercolor: "gray",
                  steps: [
                    { range: [0, 33], color: 'rgba(0, 0, 0, 0.05)' },
                    { range: [33, 66], color: 'rgba(0, 0, 0, 0.1)' },
                    { range: [66, 100], color: 'rgba(0, 0, 0, 0.15)' }
                  ]
                }
              }]}
              layout={{
                margin: { t: 25, b: 25, l: 25, r: 25 },
                width: 180,
                height: 150,
                font: {
                  family: 'Inter, system-ui, sans-serif',
                  size: 12
                },
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)'
              }}
              config={{
                responsive: true,
                displayModeBar: false
              }}
            />
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-primary-50 rounded-lg border border-primary-100">
          <div className="flex items-center mb-1">
            <Brain size={16} className="text-primary-600 mr-2" />
            <h4 className="text-sm font-medium text-primary-700">AI Performance Summary</h4>
          </div>
          <p className="text-xs text-primary-600">
            {snapPct >= 75 && fantasyPoints >= 15 ? 
              "Elite usage and production make this player a cornerstone fantasy asset with consistent weekly value." :
              snapPct >= 60 && fantasyPoints >= 10 ?
              "Solid snap share and fantasy production indicate a reliable weekly starter with good floor." :
              snapPct >= 50 && fantasyPoints >= 8 ?
              "Moderate usage suggests a flex-worthy player with matchup-dependent upside." :
              "Limited role indicates a bench stash with potential for increased opportunity."}
          </p>
        </div>
      </div>
    </div>
  );
};