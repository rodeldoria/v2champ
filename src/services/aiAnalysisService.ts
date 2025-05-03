import { Player } from '../types/sleeper';
import { calculateAttributes } from './playerRatingService';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export interface AIAnalysis {
  performance: string;
  outlook: string;
  strengths: string[];
  weaknesses: string[];
  trajectory: string;
  risks: string[];
  attributes: Record<string, number>;
}

export const analyzePlayer = async (
  player: Player,
  stats: Record<string, number>
): Promise<AIAnalysis> => {
  try {
    const attributes = calculateAttributes(player, stats);
    
    const prompt = `
      Analyze this NFL player and provide insights:
      Name: ${player.first_name} ${player.last_name}
      Position: ${player.position}
      Team: ${player.team}
      Stats: ${JSON.stringify(stats)}
      Attributes: ${JSON.stringify(attributes)}
      
      Provide analysis in JSON format with:
      {
        "performance": "Current performance analysis",
        "outlook": "Future outlook and potential",
        "strengths": ["Key strength 1", "Key strength 2", "Key strength 3"],
        "weaknesses": ["Key weakness 1", "Key weakness 2"],
        "trajectory": "Development path analysis",
        "risks": ["Risk factor 1", "Risk factor 2"],
        "attributes": {"speed": 85, "agility": 80, etc.}
      }
    `;

    // Check if OpenAI API key is available
    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      // Return mock data if no API key
      return getMockAnalysis(player, attributes);
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are a professional NFL scout and fantasy football analyst."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('Error analyzing player:', error);
    return getMockAnalysis(player, calculateAttributes(player, stats));
  }
};

// Fallback function to generate mock analysis when API is unavailable
const getMockAnalysis = (player: Player, attributes: Record<string, number>): AIAnalysis => {
  const attributeValues = Object.values(attributes);
  const averageRating = attributeValues.length > 0 
    ? attributeValues.reduce((a, b) => a + b, 0) / attributeValues.length 
    : 75;
  
  const isElite = averageRating > 85;
  const isGood = averageRating > 75;
  
  let strengths: string[] = [];
  let weaknesses: string[] = [];
  
  // Generate position-specific analysis
  switch (player.position) {
    case 'QB':
      strengths = [
        isElite ? 'Elite arm talent and deep ball accuracy' : 'Solid arm strength',
        'Good decision-making in the pocket',
        'Effective at reading defenses'
      ];
      weaknesses = [
        isGood ? 'Occasional inaccuracy under pressure' : 'Struggles with accuracy under pressure',
        'Could improve mobility outside the pocket'
      ];
      break;
    case 'RB':
      strengths = [
        isElite ? 'Exceptional vision and cutting ability' : 'Good vision between the tackles',
        'Reliable in pass protection',
        'Consistent yards after contact'
      ];
      weaknesses = [
        isGood ? 'Limited top-end speed' : 'Lacks breakaway speed',
        'Could improve as a receiver out of the backfield'
      ];
      break;
    case 'WR':
      strengths = [
        isElite ? 'Elite route running and separation' : 'Solid route running',
        'Reliable hands in traffic',
        'Good body control on contested catches'
      ];
      weaknesses = [
        isGood ? 'Occasional concentration drops' : 'Struggles with drops',
        'Could improve yards after catch'
      ];
      break;
    case 'TE':
      strengths = [
        isElite ? 'Elite receiving threat for the position' : 'Solid receiving skills',
        'Reliable red zone target',
        'Improving as a blocker'
      ];
      weaknesses = [
        isGood ? 'Still developing as an in-line blocker' : 'Struggles as an in-line blocker',
        'Limited yards after catch ability'
      ];
      break;
    default:
      strengths = [
        'Consistent performer',
        'Good technical skills',
        'Reliable starter'
      ];
      weaknesses = [
        'Limited elite physical traits',
        'Could improve overall consistency'
      ];
  }
  
  return {
    performance: `${player.first_name} ${player.last_name} is currently performing at a ${averageRating.toFixed(1)} rating based on recent metrics. ${isElite ? 'He shows elite traits that separate him from most players at his position.' : isGood ? 'He shows above-average skills for his position.' : 'He shows average skills for his position with room for improvement.'}`,
    outlook: `${isElite ? 'Expect continued elite production' : isGood ? 'Solid contributor with upside' : 'Developing player with potential'} who should maintain his role in the offense. ${player.team ? `The ${player.team} offense provides a good fit for his skillset.` : ''}`,
    strengths,
    weaknesses,
    trajectory: isElite ? 'Maintaining elite status with consistent performance' : isGood ? 'On an upward trajectory with room to develop further' : 'Developing player with potential to improve significantly',
    risks: [
      'Potential for reduced role if performance declines',
      'Injury concerns typical for the position',
      'Offensive scheme changes could impact production'
    ],
    attributes
  };
};