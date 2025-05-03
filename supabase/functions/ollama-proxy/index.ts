import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OLLAMA_URL = 'http://localhost:11434';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  let retries = 0;
  while (retries < MAX_RETRIES) {
    try {
      console.log(`Attempt ${retries + 1}: Received request: ${req.method} ${new URL(req.url).pathname}`);
      
      const url = new URL(req.url);
      const ollamaPath = url.pathname.replace('/ollama-proxy', '');
      const ollamaUrl = `${OLLAMA_URL}${ollamaPath}`;
      
      console.log(`Proxying request to Ollama: ${ollamaUrl}`);

      // For GET requests, no body is needed
      // For POST requests, extract the body
      const requestBody = req.method !== 'GET' ? await req.text() : undefined;
      
      // Log request details (but limit body size for logs)
      if (requestBody) {
        console.log(`Request body: ${requestBody.substring(0, 100)}...`);
      }

      // Create mock response if Ollama is not available
      // This is for development/testing when Ollama isn't running
      try {
        const ollamaResponse = await fetch(ollamaUrl, {
          method: req.method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: requestBody,
        });

        if (!ollamaResponse.ok) {
          throw new Error(`Ollama returned status: ${ollamaResponse.status}`);
        }

        console.log(`Ollama response status: ${ollamaResponse.status}`);
        
        const responseText = await ollamaResponse.text();
        console.log(`Ollama response (first 100 chars): ${responseText.substring(0, 100)}...`);
        
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          console.error('Error parsing Ollama response as JSON:', e);
          data = { text: responseText };
        }

        return new Response(
          JSON.stringify(data),
          {
            status: 200,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      } catch (connectionError) {
        console.error(`Connection to Ollama failed:`, connectionError);
        
        // If this is a GET request to /api/tags, return a mock response
        if (req.method === 'GET' && ollamaPath === '/api/tags') {
          return new Response(
            JSON.stringify({ models: [{ name: "llama3" }] }),
            {
              status: 200,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
              },
            }
          );
        }
        
        // If this is a POST request to /api/generate, return a mock response
        if (req.method === 'POST' && ollamaPath === '/api/generate') {
          let mockResponse = {
            response: JSON.stringify({
              performance: "This player has shown consistent performance in recent games.",
              outlook: "Expected to maintain current role with potential for growth.",
              strengths: ["Versatility", "Reliability", "Game awareness"],
              weaknesses: ["Limited explosive plays", "Matchup dependent"],
              trajectory: "Gradual improvement expected as the season progresses.",
              risks: ["Competition for touches", "Scheme changes"],
              attributes: {
                speed: 82,
                agility: 78,
                power: 75,
                vision: 80
              }
            })
          };
          
          return new Response(
            JSON.stringify(mockResponse),
            {
              status: 200,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
              },
            }
          );
        }
        
        // For other requests, throw the error to be caught by retry mechanism
        throw connectionError;
      }
    } catch (error) {
      console.error(`Attempt ${retries + 1} failed:`, error);
      
      if (retries < MAX_RETRIES - 1) {
        await delay(RETRY_DELAY * Math.pow(2, retries));
        retries++;
        continue;
      }
      
      // After all retries failed, return a fallback response
      return new Response(
        JSON.stringify({ 
          response: JSON.stringify({
            performance: "Player analysis currently unavailable.",
            outlook: "Check back later for updated insights.",
            strengths: ["Data unavailable"],
            weaknesses: ["Data unavailable"],
            trajectory: "Unable to determine at this time.",
            risks: ["Data unavailable"],
            attributes: {}
          }),
          error: 'Failed to connect to Ollama service after multiple attempts',
          details: error.message
        }),
        {
          status: 200, // Return 200 with fallback data instead of error
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }
  }
  
  // This should never be reached due to the retry loop
  return new Response(
    JSON.stringify({ error: 'Unexpected error in Ollama proxy' }),
    {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    }
  );
});