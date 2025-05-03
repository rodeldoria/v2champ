import { AIProvider } from './base';

export class FallbackProvider implements AIProvider {
  isAvailable(): boolean {
    return true; // Fallback is always available
  }

  // Implement required methods with rule-based fallbacks...
  async generateBreakoutAnalysis() { return {}; }
  async analyzeMatchup() { return {}; }
  async comparePlayers() { return {}; }
  async analyzeTrade() { return {}; }
  async optimizeRoster() { return {}; }
}