import { AIProvider } from './ai_providers/base';
import { PerplexityProvider } from './ai_providers/perplexity';
import { AnthropicProvider } from './ai_providers/anthropic';
import { OpenAIProvider } from './ai_providers/openai';
import { FallbackProvider } from './ai_providers/fallback';

export class AIEngine {
  private providers: Record<string, AIProvider>;
  private availableProviders: Record<string, boolean>;

  constructor() {
    // Initialize AI providers
    this.providers = {
      perplexity: new PerplexityProvider(),
      anthropic: new AnthropicProvider(),
      openai: new OpenAIProvider(),
      fallback: new FallbackProvider()
    };

    // Track available providers
    this.availableProviders = {
      perplexity: this.providers.perplexity.isAvailable(),
      anthropic: this.providers.anthropic.isAvailable(),
      openai: this.providers.openai.isAvailable()
    };

    // Function routing preferences
    this.functionRouting = {
      breakoutAnalysis: ['perplexity', 'anthropic', 'openai'],
      matchupAnalysis: ['openai', 'anthropic', 'perplexity'],
      playerComparison: ['anthropic', 'openai', 'perplexity'],
      tradeAnalysis: ['anthropic', 'openai', 'perplexity'],
      rosterOptimization: ['anthropic', 'openai', 'perplexity']
    };
  }

  private getProviderForFunction(functionName: string): AIProvider {
    if (!(functionName in this.functionRouting)) {
      return this.providers.fallback;
    }

    // Try each provider in order of preference
    for (const providerName of this.functionRouting[functionName]) {
      if (this.availableProviders[providerName]) {
        return this.providers[providerName];
      }
    }

    return this.providers.fallback;
  }

  async getBreakoutAnalysis(playerData: any, leagueContext?: any) {
    const provider = this.getProviderForFunction('breakoutAnalysis');
    return provider.generateBreakoutAnalysis(playerData, leagueContext);
  }

  async getMatchupAnalysis(playerData: any, opponentData: any, historicalMatchups: any[], weatherData?: any) {
    const provider = this.getProviderForFunction('matchupAnalysis');
    return provider.analyzeMatchup(playerData, opponentData, historicalMatchups, weatherData);
  }

  async getPlayerComparison(player1: any, player2: any, comparisonContext?: any) {
    const provider = this.getProviderForFunction('playerComparison');
    return provider.comparePlayers(player1, player2, comparisonContext);
  }

  async getTradeAnalysis(proposedTrade: any, teamContext: any) {
    const provider = this.getProviderForFunction('tradeAnalysis');
    return provider.analyzeTrade(proposedTrade, teamContext);
  }

  async getRosterOptimization(roster: any, leagueSettings: any) {
    const provider = this.getProviderForFunction('rosterOptimization');
    return provider.optimizeRoster(roster, leagueSettings);
  }
}