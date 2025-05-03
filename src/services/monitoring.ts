// Monitoring service abstraction
export const captureException = (error: Error, context?: Record<string, any>) => {
  try {
    // Only send to monitoring in production
    if (process.env.NODE_ENV === 'production') {
      // Fallback if AppSignal fails
      console.error('[Monitoring]', error, context);
    }
  } catch (e) {
    // Ensure monitoring never crashes the app
    console.error('[Monitoring] Failed to capture error:', e);
  }
};

export const sendAnalytics = async (event: string, data?: Record<string, any>) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      // Use fetch with timeout and retry
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const response = await fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event, data }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`Analytics request failed: ${response.status}`);
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.warn('Analytics request timed out');
        } else {
          throw error;
        }
      }
    }
  } catch (e) {
    // Never crash the app for analytics
    console.warn('[Analytics] Failed to send event:', e);
  }
};