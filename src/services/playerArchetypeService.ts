import { Player } from '../types/sleeper';

interface Archetype {
  archetype: string;
  description: string;
  strengths: string[];
  style: string;
  confidence: 'low' | 'medium' | 'high';
  icon: 'Zap' | 'Target' | 'Brain' | 'Shield';
}

interface ArchetypeThresholds {
  [key: string]: {
    elite: number;
    starter: number;
    backup: number;
  };
}

// Position-specific thresholds
const THRESHOLDS: ArchetypeThresholds = {
  QB: { elite: 90, starter: 80, backup: 70 },
  RB: { elite: 88, starter: 78, backup: 68 },
  WR: { elite: 89, starter: 79, backup: 69 },
  TE: { elite: 87, starter: 77, backup: 67 },
  K: { elite: 85, starter: 75, backup: 65 },
  DEF: { elite: 85, starter: 75, backup: 65 },
  DL: { elite: 88, starter: 78, backup: 68 },
  LB: { elite: 89, starter: 79, backup: 69 },
  DB: { elite: 87, starter: 77, backup: 67 }
};

// Elite players by position for 2024
const ELITE_PLAYERS = {
  QB: ['Josh Allen', 'Patrick Mahomes', 'Lamar Jackson', 'Joe Burrow', 'Jalen Hurts'],
  RB: ['Christian McCaffrey', 'Bijan Robinson', 'Jahmyr Gibbs', 'Breece Hall'],
  WR: ['Justin Jefferson', 'CeeDee Lamb', 'Tyreek Hill', 'Ja\'Marr Chase'],
  TE: ['Travis Kelce', 'Sam LaPorta', 'T.J. Hockenson', 'Mark Andrews']
};

export const getPlayerArchetype = (
  player: Player,
  stats?: Record<string, number>
): Archetype => {
  const playerName = `${player.first_name} ${player.last_name}`;
  const isElite = ELITE_PLAYERS[player.position as keyof typeof ELITE_PLAYERS]?.includes(playerName);

  // Default archetype for when stats are not available
  if (!stats || Object.keys(stats).length === 0) {
    return {
      archetype: 'Developing Player',
      description: 'Player still developing their role and skillset',
      strengths: ['Potential for growth'],
      style: 'Style to be determined with more data',
      confidence: 'low',
      icon: 'Brain'
    };
  }

  // Position-specific archetype determination
  switch (player.position) {
    case 'QB':
      return determineQBArchetype(player, stats, isElite);
    case 'RB':
      return determineRBArchetype(player, stats, isElite);
    case 'WR':
      return determineWRArchetype(player, stats, isElite);
    case 'TE':
      return determineTEArchetype(player, stats, isElite);
    case 'K':
      return determineKArchetype(player, stats, isElite);
    case 'DEF':
      return determineDEFArchetype(player, stats);
    case 'DL':
    case 'LB':
    case 'DB':
      return determineIDPArchetype(player, stats, isElite);
    default:
      return {
        archetype: 'Versatile Player',
        description: 'A well-rounded player with diverse capabilities',
        strengths: ['Adaptability', 'Versatility'],
        style: 'Balanced approach to the game',
        confidence: 'medium',
        icon: 'Shield'
      };
  }
};

const determineQBArchetype = (player: Player, stats: Record<string, number>, isElite: boolean): Archetype => {
  const passYards = stats.pass_yd || 0;
  const rushYards = stats.rush_yd || 0;
  const passTD = stats.pass_td || 0;
  const rushTD = stats.rush_td || 0;
  const completion = (stats.pass_cmp || 0) / Math.max(stats.pass_att || 1, 1);

  if (rushYards > 400 && rushTD >= 3) {
    return {
      archetype: 'Dual-Threat QB',
      description: 'Equally dangerous through the air and on the ground',
      strengths: ['Mobility', 'Improvisation', 'Playmaking'],
      style: 'Dynamic playmaker who can extend plays',
      confidence: 'high',
      icon: 'Zap'
    };
  }

  if (passYards > 4000 || passTD > 30 || completion > 0.67) {
    return {
      archetype: 'Elite Pocket Passer',
      description: 'Master of the passing game with exceptional accuracy',
      strengths: ['Accuracy', 'Decision Making', 'Field Vision'],
      style: 'Traditional quarterback who excels in the passing game',
      confidence: 'high',
      icon: 'Brain'
    };
  }

  return {
    archetype: isElite ? 'Franchise QB' : 'Developing QB',
    description: 'Growing into their role with potential',
    strengths: ['Learning', 'Adaptability'],
    style: 'Building fundamentals and experience',
    confidence: 'medium',
    icon: 'Shield'
  };
};

const determineRBArchetype = (player: Player, stats: Record<string, number>, isElite: boolean): Archetype => {
  const rushYards = stats.rush_yd || 0;
  const receptions = stats.rec || 0;
  const totalTD = (stats.rush_td || 0) + (stats.rec_td || 0);

  if (rushYards > 1000 && totalTD >= 10) {
    return {
      archetype: 'Bell Cow Back',
      description: 'Primary rushing threat with high usage',
      strengths: ['Power', 'Vision', 'Endurance'],
      style: 'Workhorse running style',
      confidence: 'high',
      icon: 'Shield'
    };
  }

  if (receptions > 50) {
    return {
      archetype: 'Receiving Back',
      description: 'Versatile back with receiving skills',
      strengths: ['Route Running', 'Hands', 'Open Field'],
      style: 'Pass-catching specialist',
      confidence: 'high',
      icon: 'Target'
    };
  }

  return {
    archetype: isElite ? 'Feature Back' : 'Rotational Back',
    description: 'Contributes in specific situations',
    strengths: ['Role Playing', 'Situational Usage'],
    style: 'Committee approach',
    confidence: 'medium',
    icon: 'Brain'
  };
};

const determineWRArchetype = (player: Player, stats: Record<string, number>, isElite: boolean): Archetype => {
  const recYards = stats.rec_yd || 0;
  const receptions = stats.rec || 0;
  const touchdowns = stats.rec_td || 0;

  if (recYards > 1000 && touchdowns >= 8) {
    return {
      archetype: 'Alpha Receiver',
      description: 'Dominant WR1 with game-breaking ability',
      strengths: ['Route Running', 'Hands', 'Big Play'],
      style: 'Primary receiving option',
      confidence: 'high',
      icon: 'Target'
    };
  }

  if (receptions > 80) {
    return {
      archetype: 'Volume Receiver',
      description: 'Reliable target with consistent production',
      strengths: ['Consistency', 'Route Running', 'Hands'],
      style: 'Chain-moving possession receiver',
      confidence: 'high',
      icon: 'Brain'
    };
  }

  return {
    archetype: isElite ? 'Playmaker' : 'Role Player',
    description: 'Specialized receiver with specific strengths',
    strengths: ['Specialization', 'Role Execution'],
    style: 'Situational contributor',
    confidence: 'medium',
    icon: 'Shield'
  };
};

const determineTEArchetype = (player: Player, stats: Record<string, number>, isElite: boolean): Archetype => {
  const receptions = stats.rec || 0;
  const recYards = stats.rec_yd || 0;
  const touchdowns = stats.rec_td || 0;

  if (receptions > 60 && recYards > 600) {
    return {
      archetype: 'Receiving Tight End',
      description: 'Primary receiving threat from the tight end position',
      strengths: ['Route Running', 'Hands', 'Red Zone'],
      style: 'Pass-catching focus',
      confidence: 'high',
      icon: 'Target'
    };
  }

  if (touchdowns >= 5) {
    return {
      archetype: 'Red Zone Specialist',
      description: 'Reliable target in scoring situations',
      strengths: ['Red Zone', 'Contested Catches'],
      style: 'Scoring threat',
      confidence: 'high',
      icon: 'Zap'
    };
  }

  return {
    archetype: isElite ? 'Complete TE' : 'Balanced TE',
    description: 'Contributes in both blocking and receiving',
    strengths: ['Versatility', 'Team Play'],
    style: 'Well-rounded approach',
    confidence: 'medium',
    icon: 'Shield'
  };
};

const determineKArchetype = (player: Player, stats: Record<string, number>, isElite: boolean): Archetype => {
  const fgMade = stats.fg_made || 0;
  const fgLong = stats.fg_long || 0;

  if (fgMade >= 30 || fgLong >= 55) {
    return {
      archetype: 'Elite Kicker',
      description: 'Exceptional accuracy and leg strength',
      strengths: ['Accuracy', 'Power', 'Clutch'],
      style: 'Reliable in all situations',
      confidence: 'high',
      icon: 'Target'
    };
  }

  return {
    archetype: isElite ? 'Reliable Kicker' : 'Developing Kicker',
    description: 'Solid fundamentals with room for growth',
    strengths: ['Consistency', 'Technique'],
    style: 'Traditional kicking style',
    confidence: 'medium',
    icon: 'Shield'
  };
};

const determineDEFArchetype = (player: Player, stats: Record<string, number>): Archetype => {
  const sacks = stats.def_sack || 0;
  const interceptions = stats.def_int || 0;
  const fumbles = stats.def_fr || 0;

  if ((sacks + interceptions + fumbles) >= 20) {
    return {
      archetype: 'Elite Defense',
      description: 'Dominant defensive unit',
      strengths: ['Playmaking', 'Pressure', 'Turnovers'],
      style: 'Aggressive defense',
      confidence: 'high',
      icon: 'Shield'
    };
  }

  return {
    archetype: 'Balanced Defense',
    description: 'Well-rounded defensive approach',
    strengths: ['Fundamentals', 'Scheme Fit'],
    style: 'Traditional defense',
    confidence: 'medium',
    icon: 'Shield'
  };
};

const determineIDPArchetype = (player: Player, stats: Record<string, number>, isElite: boolean): Archetype => {
  const tackles = (stats.tackle_solo || 0) + (stats.tackle_ast || 0);
  const bigPlays = (stats.sack || 0) + (stats.int || 0) + (stats.fum_rec || 0);

  if (tackles > 100 || bigPlays > 10) {
    return {
      archetype: 'Playmaking Defender',
      description: 'Impact player on defense',
      strengths: ['Instincts', 'Tackling', 'Big Play'],
      style: 'Aggressive defender',
      confidence: 'high',
      icon: 'Shield'
    };
  }

  return {
    archetype: isElite ? 'Impact Defender' : 'Role Defender',
    description: 'Solid defensive contributor',
    strengths: ['Fundamentals', 'Position Play'],
    style: 'Assignment-sound defense',
    confidence: 'medium',
    icon: 'Shield'
  };
};