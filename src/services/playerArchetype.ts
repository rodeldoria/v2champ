import { Player } from '../types/sleeper';
import regression from 'regression';

interface ArchetypeResult {
  archetype: string;
  confidence: number;
  traits: string[];
  description: string;
  playstyle: string[];
  strengths: string[];
  weaknesses: string[];
  comparison?: string;
}

export const inferPlayerArchetype = (
  player: Player,
  stats: Record<string, number>,
  historicalStats?: Record<string, Record<string, number>>
): ArchetypeResult => {
  if (!player || !stats) {
    return {
      archetype: 'Unknown',
      confidence: 0,
      traits: [],
      description: 'Insufficient data to determine archetype',
      playstyle: [],
      strengths: [],
      weaknesses: []
    };
  }

  switch (player.position) {
    case 'QB':
      return inferQBArchetype(stats, historicalStats);
    case 'RB':
      return inferRBArchetype(stats, historicalStats);
    case 'WR':
      return inferWRArchetype(stats, historicalStats);
    case 'TE':
      return inferTEArchetype(stats, historicalStats);
    case 'K':
      return inferKickerArchetype(stats, historicalStats);
    case 'DEF':
      return inferDefenseArchetype(stats, historicalStats);
    default:
      return {
        archetype: 'Unknown',
        confidence: 0,
        traits: [],
        description: 'Position not supported for archetype analysis',
        playstyle: [],
        strengths: [],
        weaknesses: []
      };
  }
};

const inferQBArchetype = (
  stats: Record<string, number>,
  historicalStats?: Record<string, Record<string, number>>
): ArchetypeResult => {
  const passYards = stats.pass_yd || 0;
  const rushYards = stats.rush_yd || 0;
  const completionPct = (stats.pass_cmp || 0) / Math.max(stats.pass_att || 1, 1) * 100;
  const deepPasses = stats.pass_cmp_40p || 0;
  const redZoneTD = stats.pass_td_rz || 0;
  const pressureRate = stats.pressure_rate || 0;
  const timeToThrow = stats.time_to_throw || 0;

  // Scrambling Magician
  if (rushYards > 500 && pressureRate < 20 && timeToThrow > 3) {
    return {
      archetype: 'Scrambling Magician',
      confidence: 90,
      traits: ['Elusiveness', 'Improvisation', 'Deep Ball'],
      description: 'Elite improviser who extends plays and creates magic outside the pocket',
      playstyle: ['Scramble Drill', 'Off-Platform Throws', 'Deep Shot Artist'],
      strengths: ['Play Extension', 'Arm Talent', 'Escapability'],
      weaknesses: ['Traditional Pocket Passing', 'Quick Game'],
      comparison: 'Patrick Mahomes'
    };
  }

  // Field General
  if (completionPct > 68 && stats.pass_td > 25 && pressureRate < 15) {
    return {
      archetype: 'Field General',
      confidence: 90,
      traits: ['Pre-Snap Reads', 'Quick Release', 'Accuracy'],
      description: 'Master of pre-snap reads and quick decisions who controls the game',
      playstyle: ['Quick Game', 'Audibles', 'No-Huddle'],
      strengths: ['Mental Processing', 'Short/Medium Accuracy', 'Game Management'],
      weaknesses: ['Deep Ball', 'Off-Script Plays'],
      comparison: 'Tom Brady'
    };
  }

  // Dual-Threat Dynamo
  if (rushYards > 700 && stats.rush_td > 5) {
    return {
      archetype: 'Dual-Threat Dynamo',
      confidence: 85,
      traits: ['Speed', 'Running Ability', 'Arm Talent'],
      description: 'Dynamic playmaker who threatens defenses through air and ground',
      playstyle: ['RPO', 'Zone Read', 'Play Action'],
      strengths: ['Athleticism', 'Big Play Ability', 'Dual-Threat'],
      weaknesses: ['Traditional Dropback', 'Pocket Presence'],
      comparison: 'Lamar Jackson'
    };
  }

  // Gunslinger
  if (deepPasses > 0.15 && stats.pass_int > 10) {
    return {
      archetype: 'Gunslinger',
      confidence: 85,
      traits: ['Arm Strength', 'Aggressiveness', 'Big Play'],
      description: 'Fearless passer who pushes the ball downfield and takes risks',
      playstyle: ['Vertical Passing', 'Shot Plays', 'Aggressive Reads'],
      strengths: ['Deep Ball', 'Arm Talent', 'Explosive Plays'],
      weaknesses: ['Ball Security', 'Decision Making'],
      comparison: 'Brett Favre'
    };
  }

  // West Coast Technician
  if (completionPct > 65 && stats.pass_yac > 1500) {
    return {
      archetype: 'West Coast Technician',
      confidence: 85,
      traits: ['Timing', 'Rhythm', 'Ball Placement'],
      description: 'Precise passer who excels in the short/intermediate game',
      playstyle: ['West Coast', 'Timing Routes', 'YAC Throws'],
      strengths: ['Accuracy', 'Touch', 'Rhythm Passing'],
      weaknesses: ['Deep Ball', 'Off-Platform Throws'],
      comparison: 'Jimmy Garoppolo'
    };
  }

  // Red Zone Specialist
  if (redZoneTD > 20 && stats.pass_td_rz_pct > 0.6) {
    return {
      archetype: 'Red Zone Specialist',
      confidence: 80,
      traits: ['Red Zone Efficiency', 'Decision Making', 'Touch'],
      description: 'Expert at converting in the red zone with precise throws',
      playstyle: ['Fade Routes', 'Quick Game', 'Goal Line'],
      strengths: ['Red Zone Efficiency', 'Ball Placement', 'Decision Making'],
      weaknesses: ['Deep Ball', 'Between-the-20s'],
      comparison: 'Kirk Cousins'
    };
  }

  return {
    archetype: 'Game Manager',
    confidence: 75,
    traits: ['Ball Security', 'Efficiency', 'Game Control'],
    description: 'Conservative decision-maker who protects the ball',
    playstyle: ['Check Downs', 'Game Management', 'Ball Control'],
    strengths: ['Ball Security', 'Game Management', 'Efficiency'],
    weaknesses: ['Big Play Ability', 'Playmaking'],
    comparison: 'Alex Smith'
  };
};

const inferRBArchetype = (
  stats: Record<string, number>,
  historicalStats?: Record<string, Record<string, number>>
): ArchetypeResult => {
  const rushYards = stats.rush_yd || 0;
  const receptions = stats.rec || 0;
  const ypc = (stats.rush_yd || 0) / Math.max(stats.rush_att || 1, 1);
  const brokenTackles = stats.broken_tackles || 0;
  const rushYAC = stats.rush_yac || 0;
  const redZoneTouches = stats.rz_touches || 0;

  // Workhorse Back
  if (rushYards > 1200 && stats.rush_att > 250) {
    return {
      archetype: 'Workhorse Back',
      confidence: 90,
      traits: ['Durability', 'Vision', 'Power'],
      description: 'Three-down back who can handle heavy workload',
      playstyle: ['Inside Zone', 'Power', 'Goal Line'],
      strengths: ['Endurance', 'Between-the-Tackles', 'Ball Security'],
      weaknesses: ['Explosiveness', 'Receiving'],
      comparison: 'Derrick Henry'
    };
  }

  // Satellite Back
  if (receptions > 60 && stats.rec_yd > 500) {
    return {
      archetype: 'Satellite Back',
      confidence: 85,
      traits: ['Receiving', 'Route Running', 'Space'],
      description: 'Pass-catching specialist who creates mismatches',
      playstyle: ['Option Routes', 'Screen Game', 'Split Out Wide'],
      strengths: ['Receiving', 'Route Running', 'Open Field'],
      weaknesses: ['Inside Running', 'Pass Protection'],
      comparison: 'Christian McCaffrey'
    };
  }

  // One-Cut Specialist
  if (ypc > 5.0 && rushYAC > 500) {
    return {
      archetype: 'One-Cut Specialist',
      confidence: 85,
      traits: ['Vision', 'Burst', 'Decision Making'],
      description: 'Zone runner with excellent vision and burst',
      playstyle: ['Outside Zone', 'One-Cut', 'Stretch Plays'],
      strengths: ['Vision', 'Burst', 'Zone Running'],
      weaknesses: ['Power', 'Short Yardage'],
      comparison: 'Arian Foster'
    };
  }

  // Elusive Playmaker
  if (brokenTackles > 40 && stats.rush_20p > 10) {
    return {
      archetype: 'Elusive Playmaker',
      confidence: 85,
      traits: ['Agility', 'Balance', 'Speed'],
      description: 'Dynamic runner who creates in space',
      playstyle: ['Outside Runs', 'Screen Game', 'Space Plays'],
      strengths: ['Elusiveness', 'Big Play', 'Open Field'],
      weaknesses: ['Inside Running', 'Short Yardage'],
      comparison: 'Barry Sanders'
    };
  }

  // Goal Line Hammer
  if (redZoneTouches > 40 && stats.rush_td > 10) {
    return {
      archetype: 'Goal Line Hammer',
      confidence: 80,
      traits: ['Power', 'Balance', 'Vision'],
      description: 'Short-yardage specialist who excels in red zone',
      playstyle: ['Power Runs', 'Goal Line', 'Short Yardage'],
      strengths: ['Power', 'Ball Security', 'Short Yardage'],
      weaknesses: ['Speed', 'Receiving'],
      comparison: 'LeGarrette Blount'
    };
  }

  return {
    archetype: 'Committee Back',
    confidence: 75,
    traits: ['Versatility', 'Reliability', 'Situational'],
    description: 'Rotational back who contributes in specific situations',
    playstyle: ['Situational Runs', 'Change of Pace', 'Committee'],
    strengths: ['Versatility', 'Fresh Legs', 'Role Playing'],
    weaknesses: ['Feature Back Role', 'Consistency'],
    comparison: 'James White'
  };
};

const inferWRArchetype = (
  stats: Record<string, number>,
  historicalStats?: Record<string, Record<string, number>>
): ArchetypeResult => {
  const receptions = stats.rec || 0;
  const yards = stats.rec_yd || 0;
  const ypr = yards / Math.max(receptions, 1);
  const redZoneTargets = stats.rz_tgt || 0;
  const contestedCatch = stats.contested_catches || 0;
  const yac = stats.rec_yac || 0;
  const routeWinRate = stats.route_win_rate || 0;

  // Route Technician
  if (routeWinRate > 0.65 && receptions > 80) {
    return {
      archetype: 'Route Technician',
      confidence: 90,
      traits: ['Route Running', 'Separation', 'Hands'],
      description: 'Elite route runner who creates separation with technique',
      playstyle: ['Option Routes', 'Double Moves', 'Timing Routes'],
      strengths: ['Route Running', 'Separation', 'Reliability'],
      weaknesses: ['Contested Catches', 'Deep Speed'],
      comparison: 'Keenan Allen'
    };
  }

  // YAC Monster
  if (yac > 500 && stats.broken_tackles > 15) {
    return {
      archetype: 'YAC Monster',
      confidence: 85,
      traits: ['Run After Catch', 'Vision', 'Elusiveness'],
      description: 'Dynamic playmaker who excels with ball in hands',
      playstyle: ['Screens', 'Slants', 'Quick Game'],
      strengths: ['YAC', 'Open Field', 'Explosiveness'],
      weaknesses: ['Contested Catches', 'Deep Routes'],
      comparison: 'Deebo Samuel'
    };
  }

  // Contested Catch King
  if (contestedCatch > 20 && redZoneTargets > 15) {
    return {
      archetype: 'Contested Catch King',
      confidence: 85,
      traits: ['Size', 'Jump Ball', 'Body Control'],
      description: 'Physical receiver who wins 50/50 balls',
      playstyle: ['Fade Routes', 'Back Shoulder', 'Jump Balls'],
      strengths: ['Contested Catches', 'Red Zone', 'High Point'],
      weaknesses: ['Separation', 'YAC'],
      comparison: 'Mike Evans'
    };
  }

  // Deep Threat
  if (ypr > 15 && stats.rec_20p > 15) {
    return {
      archetype: 'Deep Threat',
      confidence: 85,
      traits: ['Speed', 'Tracking', 'Separation'],
      description: 'Vertical threat who stretches the field',
      playstyle: ['Go Routes', 'Post Routes', 'Double Moves'],
      strengths: ['Deep Speed', 'Ball Tracking', 'Big Plays'],
      weaknesses: ['Short Routes', 'Consistency'],
      comparison: 'DeSean Jackson'
    };
  }

  // Slot Machine
  if (stats.slot_snaps_pct > 0.7 && receptions > 70) {
    return {
      archetype: 'Slot Machine',
      confidence: 85,
      traits: ['Quickness', 'Route Running', 'Hands'],
      description: 'Reliable slot receiver who moves the chains',
      playstyle: ['Option Routes', 'Quick Game', 'Zone Beater'],
      strengths: ['Short Routes', 'Zone Coverage', 'Reliability'],
      weaknesses: ['Outside Routes', 'Deep Speed'],
      comparison: 'Wes Welker'
    };
  }

  return {
    archetype: 'Possession Receiver',
    confidence: 80,
    traits: ['Reliability', 'Hands', 'Routes'],
    description: 'Chain-moving receiver with reliable hands',
    playstyle: ['Intermediate Routes', 'Sit Routes', 'Zone Beater'],
    strengths: ['Hands', 'Route Running', 'Reliability'],
    weaknesses: ['Big Play Ability', 'YAC'],
    comparison: 'Mohamed Sanu'
  };
};

const inferTEArchetype = (
  stats: Record<string, number>,
  historicalStats?: Record<string, Record<string, number>>
): ArchetypeResult => {
  const receptions = stats.rec || 0;
  const yards = stats.rec_yd || 0;
  const blockGrade = stats.block_grade || 0;
  const seam_routes = stats.seam_routes || 0;
  const inline_snaps = stats.inline_snaps || 0;

  // Seam Stretcher
  if (yards > 800 && seam_routes > 100) {
    return {
      archetype: 'Seam Stretcher',
      confidence: 90,
      traits: ['Speed', 'Route Running', 'Hands'],
      description: 'Athletic tight end who attacks the seam',
      playstyle: ['Seam Routes', 'Option Routes', 'Split Out'],
      strengths: ['Athleticism', 'Receiving', 'Mismatches'],
      weaknesses: ['Blocking', 'In-Line'],
      comparison: 'Travis Kelce'
    };
  }

  // In-Line Mauler
  if (blockGrade > 80 && inline_snaps > 400) {
    return {
      archetype: 'In-Line Mauler',
      confidence: 85,
      traits: ['Blocking', 'Power', 'Technique'],
      description: 'Elite blocking tight end who dominates the edge',
      playstyle: ['In-Line', 'Run Blocking', 'Pass Protection'],
      strengths: ['Run Blocking', 'Pass Protection', 'Power'],
      weaknesses: ['Route Running', 'Speed'],
      comparison: 'George Kittle'
    };
  }

  // Red Zone Weapon
  if (stats.rz_tgt > 15 && stats.rec_td > 8) {
    return {
      archetype: 'Red Zone Weapon',
      confidence: 85,
      traits: ['Size', 'Hands', 'Body Control'],
      description: 'Dominant red zone target with size advantage',
      playstyle: ['Fade Routes', 'Jump Balls', 'Box Out'],
      strengths: ['Red Zone', 'Contested Catches', 'Size'],
      weaknesses: ['Open Field', 'Speed'],
      comparison: 'Kyle Pitts'
    };
  }

  // Move Tight End
  if (stats.slot_snaps > 200 && yards > 500) {
    return {
      archetype: 'Move Tight End',
      confidence: 85,
      traits: ['Versatility', 'Route Running', 'YAC'],
      description: 'Versatile tight end who can align anywhere',
      playstyle: ['H-Back', 'Slot', 'Motion'],
      strengths: ['Versatility', 'Route Running', 'Matchups'],
      weaknesses: ['In-Line Blocking', 'Power'],
      comparison: 'Evan Engram'
    };
  }

  return {
    archetype: 'Balanced Tight End',
    confidence: 80,
    traits: ['Versatility', 'Balance', 'Technique'],
    description: 'Well-rounded tight end who contributes in all phases',
    playstyle: ['In-Line', 'Short Routes', 'Chip Block'],
    strengths: ['Versatility', 'Reliability', 'Balance'],
    weaknesses: ['Elite Traits', 'Specialization'],
    comparison: 'Jack Doyle'
  };
};

const inferKickerArchetype = (
  stats: Record<string, number>,
  historicalStats?: Record<string, Record<string, number>>
): ArchetypeResult => {
  const fgPct = (stats.fg_made || 0) / Math.max(stats.fg_att || 1, 1) * 100;
  const longFG = stats.fg_long || 0;
  const pressure_kicks = stats.pressure_kicks_made || 0;

  // Power Leg
  if (longFG >= 55 && stats.fg_50_plus_made > 5) {
    return {
      archetype: 'Power Leg',
      confidence: 90,
      traits: ['Leg Strength', 'Distance', 'Kickoffs'],
      description: 'Strong-legged kicker with exceptional range',
      playstyle: ['Long FGs', 'Deep Kickoffs', 'Weather Kicking'],
      strengths: ['Distance', 'Power', 'Range'],
      weaknesses: ['Short Accuracy', 'Consistency'],
      comparison: 'Justin Tucker'
    };
  }

  // Precision Artist
  if (fgPct > 90 && stats.fg_att > 25) {
    return {
      archetype: 'Precision Artist',
      confidence: 85,
      traits: ['Accuracy', 'Technique', 'Consistency'],
      description: 'Highly accurate kicker who rarely misses',
      playstyle: ['Mid-Range', 'Indoor', 'Technical'],
      strengths: ['Accuracy', 'Consistency', 'Technique'],
      weaknesses: ['Long Distance', 'Power'],
      comparison: 'Harrison Butker'
    };
  }

  // Clutch Specialist
  if (pressure_kicks > 5 && stats.fg_last_2min > 3) {
    return {
      archetype: 'Clutch Specialist',
      confidence: 85,
      traits: ['Mental Toughness', 'Consistency', 'Focus'],
      description: 'Reliable kicker who performs under pressure',
      playstyle: ['Pressure Kicks', 'Game Winners', 'Clutch'],
      strengths: ['Pressure', 'Mental Game', 'Reliability'],
      weaknesses: ['Range', 'Power'],
      comparison: 'Adam Vinatieri'
    };
  }

  return {
    archetype: 'All-Around Kicker',
    confidence: 80,
    traits: ['Balance', 'Consistency', 'Technique'],
    description: 'Well-rounded kicker with good balance of skills',
    playstyle: ['Balanced', 'Consistent', 'Technical'],
    strengths: ['Versatility', 'Consistency', 'Technique'],
    weaknesses: ['Elite Traits', 'Specialization'],
    comparison: 'Nick Folk'
  };
};

const inferDefenseArchetype = (
  stats: Record<string, number>,
  historicalStats?: Record<string, Record<string, number>>
): ArchetypeResult => {
  const sacks = stats.sack || 0;
  const interceptions = stats.int || 0;
  const pressures = stats.pressures || 0;
  const turnovers = stats.turnovers || 0;

  // Pressure Machine
  if (sacks > 40 && pressures > 100) {
    return {
      archetype: 'Pressure Machine',
      confidence: 90,
      traits: ['Pass Rush', 'Disruption', 'Pressure'],
      description: 'Elite pass rushing defense that creates havoc',
      playstyle: ['Blitz Heavy', 'Aggressive', 'Pass Rush'],
      strengths: ['Pass Rush', 'Pressure', 'Sacks'],
      weaknesses: ['Coverage', 'Run Defense'],
      comparison: '2000 Ravens'
    };
  }

  // Ball Hawks
  if (interceptions > 15 && turnovers > 25) {
    return {
      archetype: 'Ball Hawks',
      confidence: 85,
      traits: ['Coverage', 'Instincts', 'Turnovers'],
      description: 'Opportunistic defense that creates turnovers',
      playstyle: ['Zone Coverage', 'Takeaways', 'Disguise'],
      strengths: ['Turnovers', 'Coverage', 'Ball Skills'],
      weaknesses: ['Run Defense', 'Pressure'],
      comparison: '2009 Saints'
    };
  }

  // Run Stuffers
  if (stats.rush_yd_allowed < 1500 && stats.ypc_allowed < 3.5) {
    return {
      archetype: 'Run Stuffers',
      confidence: 85,
      traits: ['Run Defense', 'Gap Control', 'Tackling'],
      description: 'Physical defense that dominates against the run',
      playstyle: ['Stack Box', 'Gap Control', 'Physical'],
      strengths: ['Run Defense', 'Tackling', 'Power'],
      weaknesses: ['Pass Coverage', 'Speed'],
      comparison: '2000 Titans'
    };
  }

  return {
    archetype: 'Balanced Defense',
    confidence: 80,
    traits: ['Balance', 'Fundamentals', 'Scheme'],
    description: 'Well-rounded defense with no major weaknesses',
    playstyle: ['Multiple', 'Balanced', 'Fundamental'],
    strengths: ['Versatility', 'Fundamentals', 'Scheme'],
    weaknesses: ['Elite Traits', 'Specialization'],
    comparison: '2019 Patriots'
  };
};