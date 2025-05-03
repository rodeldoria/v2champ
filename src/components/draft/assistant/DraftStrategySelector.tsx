import React from 'react';
import { Star, Zap, Shield, TrendingUp, Brain, Info } from 'lucide-react';

interface DraftStrategy {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  strengths: string[];
  weaknesses: string[];
}

interface DraftStrategySelectorProps {
  onSelectStrategy: (strategyId: string) => void;
  selectedStrategy: string | null;
}

export const DraftStrategySelector: React.FC<DraftStrategySelectorProps> = ({
  onSelectStrategy,
  selectedStrategy
}) => {
  // Draft strategies
  const strategies: DraftStrategy[] = [
    {
      id: 'bpa',
      name: 'Best Player Available',
      description: 'Focus on drafting the highest ranked player regardless of position',
      icon: <Star className="text-yellow-500" />,
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      strengths: [
        'Maximizes overall team talent',
        'Avoids reaching for positional needs',
        'Creates trade opportunities'
      ],
      weaknesses: [
        'May create positional imbalances',
        'Could miss positional runs',
        'Requires accurate player rankings'
      ]
    },
    {
      id: 'zero-rb',
      name: 'Zero RB',
      description: 'Prioritize elite WRs early and target RBs in middle rounds',
      icon: <Zap className="text-green-500" />,
      color: 'bg-green-100 text-green-800 border-green-200',
      strengths: [
        'Capitalizes on WR consistency',
        'Avoids early-round RB busts',
        'Effective in PPR formats'
      ],
      weaknesses: [
        'Requires hitting on mid-round RBs',
        'Vulnerable if elite RBs dominate',
        'Less effective in standard scoring'
      ]
    },
    {
      id: 'hero-rb',
      name: 'Hero RB',
      description: 'Draft one elite RB early, then focus on WRs and TEs',
      icon: <Shield className="text-blue-500" />,
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      strengths: [
        'Balances positional scarcity',
        'Secures one elite RB',
        'Allows focus on WR depth'
      ],
      weaknesses: [
        'Vulnerable if your hero RB busts',
        'Less RB depth for bye weeks',
        'Requires mid/late round RB hits'
      ]
    },
    {
      id: 'robust-rb',
      name: 'Robust RB',
      description: 'Load up on RBs early to secure positional advantage',
      icon: <TrendingUp className="text-purple-500" />,
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      strengths: [
        'Capitalizes on RB scarcity',
        'Creates positional advantage',
        'Effective in standard scoring'
      ],
      weaknesses: [
        'May miss elite WRs/TEs',
        'Higher bust rate for early RBs',
        'Less effective in full PPR'
      ]
    },
    {
      id: 'value',
      name: 'Value-Based Drafting',
      description: 'Focus on players with the biggest gap between ADP and rank',
      icon: <Brain className="text-primary-500" />,
      color: 'bg-primary-100 text-primary-800 border-primary-200',
      strengths: [
        'Maximizes draft capital efficiency',
        'Adapts to draft flow',
        'Works in any scoring format'
      ],
      weaknesses: [
        'Requires accurate value assessments',
        'May create positional imbalances',
        'Depends on ranking quality'
      ]
    }
  ];
  
  const [expandedStrategy, setExpandedStrategy] = React.useState<string | null>(null);
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-800">Draft Strategies</h3>
        <p className="text-sm text-gray-500 mt-1">
          Select a strategy to guide your draft
        </p>
      </div>
      
      <div className="p-4 grid grid-cols-1 gap-3">
        {strategies.map(strategy => (
          <div key={strategy.id}>
            <div 
              className={`p-3 rounded-lg border-2 transition-colors cursor-pointer ${
                selectedStrategy === strategy.id
                  ? strategy.color
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center" onClick={() => onSelectStrategy(strategy.id)}>
                  <div className="mr-3">{strategy.icon}</div>
                  <div>
                    <h4 className="font-medium text-gray-800">{strategy.name}</h4>
                    <p className="text-xs text-gray-500">{strategy.description}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => setExpandedStrategy(expandedStrategy === strategy.id ? null : strategy.id)}
                  className="p-1 rounded-full hover:bg-gray-200"
                >
                  <Info size={16} className="text-gray-500" />
                </button>
              </div>
            </div>
            
            {/* Expanded details */}
            {expandedStrategy === strategy.id && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Strengths</h5>
                    <ul className="space-y-1">
                      {strategy.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-500 mr-2">•</span>
                          <span className="text-sm text-gray-600">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Weaknesses</h5>
                    <ul className="space-y-1">
                      {strategy.weaknesses.map((weakness, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-red-500 mr-2">•</span>
                          <span className="text-sm text-gray-600">{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};