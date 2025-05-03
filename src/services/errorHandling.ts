// Error types
export enum ErrorType {
  NETWORK = 'NETWORK',
  API = 'API',
  AUTH = 'AUTH',
  DATA = 'DATA'
}

// Error handler
export const handleError = (error: unknown, type: ErrorType = ErrorType.NETWORK): string => {
  // Log error
  console.error(`[${type}] Error:`, error);

  // Return user-friendly message
  return getUserMessage(error, type);
};

// Get user-friendly error message
const getUserMessage = (error: unknown, type: ErrorType): string => {
  // Check if it's an Error object
  if (error instanceof Error) {
    // Check for specific error messages
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      return 'Unable to connect to the server. Please check your internet connection.';
    }
    
    if (error.message.includes('timeout') || error.message.includes('Timeout')) {
      return 'The request timed out. Please try again later.';
    }
    
    if (error.message.includes('Ollama')) {
      return 'Ollama service is not available. Please make sure it is running.';
    }
    
    if (error.message.includes('Supabase')) {
      return 'Database connection error. Please check your configuration.';
    }
    
    // Return the actual error message if it's user-friendly
    if (error.message.length < 100 && !error.message.includes('Error:')) {
      return error.message;
    }
  }

  // Default messages based on error type
  switch (type) {
    case ErrorType.NETWORK:
      return 'Unable to connect to the server. Please check your internet connection.';
    case ErrorType.API:
      return 'There was a problem fetching the data. Please try again later.';
    case ErrorType.AUTH:
      return 'Authentication error. Please try logging in again.';
    case ErrorType.DATA:
      return 'There was a problem processing the data. Please try again.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};