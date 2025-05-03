import React from 'react';
import { useSleeperStore } from '../../store/sleeperStore';
import { formatDistanceToNow } from 'date-fns';
import { RefreshCw, UserPlus, UserMinus, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

export const RecentTransactions: React.FC = () => {
  const { transactions, teams, players, users } = useSleeperStore();
  
  // Take most recent transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => b.created - a.created)
    .slice(0, 5);
  
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'trade':
        return <RefreshCw size={14} className="text-primary-500" />;
      case 'waiver':
        return <DollarSign size={14} className="text-warning-500" />;
      case 'free_agent':
        return <UserPlus size={14} className="text-success-500" />;
      default:
        return <UserMinus size={14} className="text-error-500" />;
    }
  };
  
  const getTransactionImpact = (transaction: any): { impact: string; trend: 'up' | 'down' | 'neutral' } => {
    const { adds, drops, type } = transaction;
    
    if (type === 'trade') {
      return { impact: 'Balanced Trade', trend: 'neutral' };
    }
    
    if (adds && Object.keys(adds).length > 0) {
      const addedPlayer = players[Object.keys(adds)[0]];
      if (addedPlayer?.rank && addedPlayer.rank <= 50) {
        return { impact: 'High Impact Addition', trend: 'up' };
      }
      return { impact: 'Roster Improvement', trend: 'up' };
    }
    
    if (drops && Object.keys(drops).length > 0) {
      const droppedPlayer = players[Object.keys(drops)[0]];
      if (droppedPlayer?.rank && droppedPlayer.rank <= 50) {
        return { impact: 'Significant Drop', trend: 'down' };
      }
      return { impact: 'Roster Adjustment', trend: 'down' };
    }
    
    return { impact: 'Minor Change', trend: 'neutral' };
  };
  
  const getTransactionTitle = (transaction: any) => {
    const { type, adds, drops, roster_ids } = transaction;
    
    // Get team name
    const team = teams.find(t => t.roster_id === roster_ids[0]);
    const teamName = team?.settings?.team_name || `Team ${roster_ids[0]}`;
    
    // Get manager name
    const owner = users[team?.owner_id || ''] || { display_name: 'Unknown Manager', username: 'unknown' };
    const manager = owner.display_name || owner.username || 'Unknown Manager';
    
    // For trades, show both teams
    if (type === 'trade' && roster_ids.length > 1) {
      const team2 = teams.find(t => t.roster_id === roster_ids[1]);
      const team2Name = team2?.settings?.team_name || `Team ${roster_ids[1]}`;
      
      const owner2 = users[team2?.owner_id || ''] || { display_name: 'Unknown Manager', username: 'unknown' };
      const manager2 = owner2.display_name || owner2.username || 'Unknown Manager';
      
      return `Trade between ${manager} (${teamName}) and ${manager2} (${team2Name})`;
    }
    
    // For adds
    if (adds && Object.keys(adds).length > 0) {
      const playerId = Object.keys(adds)[0];
      const player = players[playerId];
      const playerName = player ? `${player.first_name} ${player.last_name}` : 'Unknown Player';
      
      if (type === 'waiver') {
        return `${manager} (${teamName}) claimed ${playerName} (${player?.position || 'Unknown'})`;
      }
      return `${manager} (${teamName}) added ${playerName} (${player?.position || 'Unknown'})`;
    }
    
    // For drops
    if (drops && Object.keys(drops).length > 0) {
      const playerId = Object.keys(drops)[0];
      const player = players[playerId];
      const playerName = player ? `${player.first_name} ${player.last_name}` : 'Unknown Player';
      return `${manager} (${teamName}) dropped ${playerName} (${player?.position || 'Unknown'})`;
    }
    
    return `${type.replace('_', ' ')} transaction by ${manager} (${teamName})`;
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Recent Transactions</h3>
        <span className="text-xs text-primary-500 font-medium">View All</span>
      </div>
      
      <div className="space-y-3">
        {recentTransactions.map((transaction) => {
          const impact = getTransactionImpact(transaction);
          
          return (
            <div 
              key={transaction.transaction_id} 
              className="p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-all duration-200"
            >
              <div className="flex items-start">
                <div className="mt-1 mr-3">
                  {getTransactionIcon(transaction.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">
                    {getTransactionTitle(transaction)}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(transaction.created * 1000), { addSuffix: true })}
                    </p>
                    <div className="flex items-center">
                      {impact.trend === 'up' && <TrendingUp size={12} className="text-success-500 mr-1" />}
                      {impact.trend === 'down' && <TrendingDown size={12} className="text-error-500 mr-1" />}
                      <span className={`text-xs font-medium ${
                        impact.trend === 'up' ? 'text-success-500' :
                        impact.trend === 'down' ? 'text-error-500' :
                        'text-gray-500'
                      }`}>
                        {impact.impact}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {recentTransactions.length === 0 && (
          <p className="text-center text-gray-500 py-4">No recent transactions</p>
        )}
      </div>
    </div>
  );
};