export interface AIProvider {
  isAvailable(): boolean;
  generateBreakoutAnalysis(playerData: any, leagueContext?: any): Promise<any>;
  analyzeMatchup(playerData: any, opponentData: any, historicalMatchups: any[], weatherData?: any): Promise<any>;
  comparePlayers(player1: any, player2: any, comparisonContext?: any): Promise<any>;
  analyzeTrade(proposedTrade: any, teamContext: any): Promise<any>;
  optimizeRoster(roster: any, leagueSettings: any): Promise<any>;
}