import { Player } from '../types/sleeper';
import { getPlayerArchetype } from './playerArchetypeService';

// Initialize AI services with environment variables
const PERPLEXITY_API_KEY = import.meta.env.VITE_PERPLEXITY_API_KEY;
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// Store API keys in memory after validation
let validatedKeys = {
  perplexity: '',
  openai: ''
};

// Export initialization status
const isAIServicesInitialized = () => {
  // Require at least one AI service
  return Boolean(validatedKeys.perplexity || validatedKeys.openai);
};

// Export error checking
const checkAIServiceErrors = () => {
  const errors = [];
  if (!validatedKeys.perplexity) errors.push('Perplexity API key not found');
  if (!validatedKeys.openai) errors.push('OpenAI API key not found');
  return errors;
};

// Validate and store API keys
export const initializeAIServices = () => {
  if (PERPLEXITY_API_KEY?.trim()) {
    validatedKeys.perplexity = PERPLEXITY_API_KEY.trim();
  }
  if (OPENAI_API_KEY?.trim()) {
    validatedKeys.openai = OPENAI_API_KEY.trim();
  }
  
  return isAIServicesInitialized();
};

// Get validated API key
export const getApiKey = (service: 'perplexity' | 'openai') => {
  return validatedKeys[service] || '';
};

// Check if specific service is available
export const isServiceAvailable = (service: 'perplexity' | 'openai') => {
  return Boolean(validatedKeys[service]);
};

// Export necessary functions
;