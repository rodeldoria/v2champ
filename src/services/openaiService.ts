import { Player } from '../types/sleeper';

interface OpenAIAnalysis {
  performance: string;
  outlook: string;
  strengths: string[];
  weaknesses: string[];
  trajectory: string;
  risks: string[];
  attributes: Record<string, number>;
}

const validateApiKey = () => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenAI API key not configured. Please check your .env file.');
  }
  
  if (apiKey.trim() === '') {
    throw new Error('OpenAI API key cannot be empty. Please check your .env file.');
  }
  
  // Clean and validate the key format
  const cleanKey = apiKey.trim();
  
  // Validate the key format
  if (!cleanKey.startsWith('sk-')) {
    throw new Error('Invalid OpenAI API key format. The key should start with "sk-".');
  }
  
  // Validate key length (typical OpenAI key length is around 51 characters)
  if (cleanKey.length < 40) {
    throw new Error('Invalid OpenAI API key length. Please check your API key.');
  }

  return cleanKey;
};

export const analyzePlayerWithOpenAI = async (
  player: Player,
  stats?: Record<string, number>
): Promise<OpenAIAnalysis> => {
  try {
    const apiKey = validateApiKey();

    const prompt = `Analyze this NFL player and provide insights:
      Name: ${player.first_name} ${player.last_name}
      Position: ${player.position}
      Team: ${player.team}
      Age: ${player.age}
      Stats: ${JSON.stringify(stats)}
      
      Provide a detailed analysis in the following format:
      
      1. Performance Analysis:
      [Detailed analysis of current performance level and recent trends]
      
      2. Fantasy Outlook:
      [Analysis of fantasy value and potential]
      
      3. Strengths:
      - [Key strength 1]
      - [Key strength 2]
      - [Key strength 3]
      
      4. Weaknesses:
      - [Key weakness 1]
      - [Key weakness 2]
      - [Key weakness 3]
      
      5. Development Trajectory:
      [Analysis of future development and career path]
      
      6. Risk Factors:
      - [Risk factor 1]
      - [Risk factor 2]
      - [Risk factor 3]
      
      7. Physical Attributes (rate 0-100):
      Speed: [rating]
      Agility: [rating]
      Power: [rating]
      Vision: [rating]
      
      IMPORTANT: Ensure all text is properly spelled and grammatically correct. Use proper spacing between words and avoid typos.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [{
          role: 'user',
          content: prompt
        }],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `API request failed: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return parseOpenAIResponse(data.choices[0].message.content);
  } catch (error) {
    if (error instanceof Error) {
      // Enhance error message for API key issues
      if (error.message.includes('API key')) {
        throw new Error(`OpenAI API key error: ${error.message}`);
      }
      throw error;
    }
    throw new Error('An unexpected error occurred while analyzing the player.');
  }
};

const parseOpenAIResponse = (text: string): OpenAIAnalysis => {
  // Split into sections based on numbered headers
  const sections = text.split(/\d+\.\s+/);
  sections.shift(); // Remove empty first element
  
  // Extract lists (items starting with - or •)
  const extractList = (text: string = ''): string[] => 
    text.split('\n')
      .filter(line => line.trim().match(/^[-•]/))
      .map(line => line.trim().replace(/^[-•]\s*/, ''));

  // Extract attributes from the physical attributes section
  const extractAttributes = (text: string = ''): Record<string, number> => {
    const attributes: Record<string, number> = {};
    const lines = text.split('\n');
    
    lines.forEach(line => {
      const match = line.match(/([A-Za-z\s]+):\s*(\d+)/);
      if (match) {
        attributes[match[1].toLowerCase().trim()] = parseInt(match[2]);
      }
    });
    
    return attributes;
  };

  return {
    performance: sections[0]?.trim() || '',
    outlook: sections[1]?.trim() || '',
    strengths: extractList(sections[2]),
    weaknesses: extractList(sections[3]),
    trajectory: sections[4]?.trim() || '',
    risks: extractList(sections[5]),
    attributes: extractAttributes(sections[6])
  };
};