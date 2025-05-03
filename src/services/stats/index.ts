import { Player } from '../../types/sleeper';
import regression from 'regression';

interface ProcessedStats {
  stats: Record<string, number>;
  attributes: Record<string, number>;
  rating: number;
  trend: {
    direction: 'up' | 'down' | 'neutral';
    confidence: number;
    percentage: number;
  };
}

export const processPlayerStats = (player: Player, stats: Record<string, number>): ProcessedStats => {
  // Default values
  const defaultStats: ProcessedStats = {
    stats: {},
    attributes: {},
    rating: 70,
    trend: {
      direction: 'neutral',
      confidence: 0,
      percentage: 0
    }
  };

  if (!player || !stats) return defaultStats;

  // Process stats based on position
  switch (player.position) {
    case 'QB':
      return processQBStats(stats);
    case 'RB':
      return processRBStats(stats);
    case 'WR':
      return processWRStats(stats);
    case 'TE':
      return processTEStats(stats);
    case 'K':
      return processKStats(stats);
    case 'DEF':
    case 'DL':
    case 'LB':
    case 'DB':
      return processDefStats(stats);
    default:
      return defaultStats;
  }
};

const processQBStats = (stats: Record<string, number>): ProcessedStats => {
  const completionPct = (stats.pass_cmp || 0) / Math.max(stats.pass_att || 1, 1) * 100;
  const ypa = (stats.pass_yd || 0) / Math.max(stats.pass_att || 1, 1);
  const tdInt = (stats.pass_td || 0) / Math.max(stats.pass_int || 1, 1);
  const rushYards = stats.rush_yd || 0;

  // Calculate attributes
  const attributes = {
    arm: Math.min(99, Math.round(75 + (ypa - 7) * 3)),
    accuracy: Math.min(99, Math.round(75 + (completionPct - 60) * 0.5)),
    awareness: Math.min(99, Math.round(75 + tdInt * 2)),
    agility: Math.min(99, Math.round(70 + (rushYards / 50)))
  };

  // Calculate overall rating
  const rating = Math.round(
    (attributes.arm * 0.3 +
    attributes.accuracy * 0.3 +
    attributes.awareness * 0.25 +
    attributes.agility * 0.15)
  );

  return {
    stats,
    attributes,
    rating,
    trend: calculateTrend(stats)
  };
};

const processRBStats = (stats: Record<string, number>): ProcessedStats => {
  const ypc = (stats.rush_yd || 0) / Math.max(stats.rush_att || 1, 1);
  const totalYards = (stats.rush_yd || 0) + (stats.rec_yd || 0);
  const totalTD = (stats.rush_td || 0) + (stats.rec_td || 0);

  // Calculate attributes
  const attributes = {
    speed: Math.min(99, Math.round(75 + (ypc - 4) * 5)),
    agility: Math.min(99, Math.round(75 + (stats.broken_tackles || 0) * 2)),
    power: Math.min(99, Math.round(75 + (stats.rush_td || 0) * 3)),
    vision: Math.min(99, Math.round(75 + (ypc - 4) * 5))
  };

  // Calculate overall rating
  const rating = Math.round(
    (attributes.speed * 0.3 +
    attributes.agility * 0.25 +
    attributes.power * 0.25 +
    attributes.vision * 0.2)
  );

  return {
    stats,
    attributes,
    rating,
    trend: calculateTrend(stats)
  };
};

const processWRStats = (stats: Record<string, number>): ProcessedStats => {
  const catchRate = (stats.rec || 0) / Math.max(stats.targets || 1, 1) * 100;
  const ypr = (stats.rec_yd || 0) / Math.max(stats.rec || 1, 1);

  // Calculate attributes
  const attributes = {
    speed: Math.min(99, Math.round(75 + (ypr - 10) * 2)),
    hands: Math.min(99, Math.round(75 + (catchRate - 60) * 0.5)),
    route: Math.min(99, Math.round(75 + (stats.rec_td || 0) * 3)),
    separation: Math.min(99, Math.round(75 + (stats.rec_yd || 0) / 100))
  };

  // Calculate overall rating
  const rating = Math.round(
    (attributes.speed * 0.25 +
    attributes.hands * 0.3 +
    attributes.route * 0.25 +
    attributes.separation * 0.2)
  );

  return {
    stats,
    attributes,
    rating,
    trend: calculateTrend(stats)
  };
};

const processTEStats = (stats: Record<string, number>): ProcessedStats => {
  const catchRate = (stats.rec || 0) / Math.max(stats.targets || 1, 1) * 100;
  const blockingGrade = stats.block_grade || 70;

  // Calculate attributes
  const attributes = {
    hands: Math.min(99, Math.round(75 + (catchRate - 60) * 0.5)),
    blocking: Math.min(99, Math.round(blockingGrade)),
    route: Math.min(99, Math.round(75 + (stats.rec_td || 0) * 3)),
    athleticism: Math.min(99, Math.round(75 + (stats.rec_yd || 0) / 100))
  };

  // Calculate overall rating
  const rating = Math.round(
    (attributes.hands * 0.3 +
    attributes.blocking * 0.25 +
    attributes.route * 0.25 +
    attributes.athleticism * 0.2)
  );

  return {
    stats,
    attributes,
    rating,
    trend: calculateTrend(stats)
  };
};

const processKStats = (stats: Record<string, number>): ProcessedStats => {
  const fgPct = (stats.fg_made || 0) / Math.max(stats.fg_att || 1, 1) * 100;
  const longFG = stats.fg_long || 0;

  // Calculate attributes
  const attributes = {
    accuracy: Math.min(99, Math.round(75 + (fgPct - 80) * 0.5)),
    power: Math.min(99, Math.round(75 + (longFG - 45) * 0.5)),
    clutch: Math.min(99, Math.round(75 + (stats.fg_made_50_plus || 0) * 5)),
    consistency: Math.min(99, Math.round(fgPct))
  };

  // Calculate overall rating
  const rating = Math.round(
    (attributes.accuracy * 0.35 +
    attributes.power * 0.25 +
    attributes.clutch * 0.2 +
    attributes.consistency * 0.2)
  );

  return {
    stats,
    attributes,
    rating,
    trend: calculateTrend(stats)
  };
};

const processDefStats = (stats: Record<string, number>): ProcessedStats => {
  const totalTackles = (stats.tackle_solo || 0) + (stats.tackle_ast || 0) * 0.5;
  const playmaking = (stats.sack || 0) * 2 + (stats.int || 0) * 3 + (stats.pass_defended || 0);

  // Calculate attributes
  const attributes = {
    tackling: Math.min(99, Math.round(75 + (totalTackles / 10))),
    coverage: Math.min(99, Math.round(75 + playmaking)),
    passRush: Math.min(99, Math.round(75 + (stats.sack || 0) * 5)),
    playmaking: Math.min(99, Math.round(75 + playmaking / 2))
  };

  // Calculate overall rating
  const rating = Math.round(
    (attributes.tackling * 0.3 +
    attributes.coverage * 0.25 +
    attributes.passRush * 0.25 +
    attributes.playmaking * 0.2)
  );

  return {
    stats,
    attributes,
    rating,
    trend: calculateTrend(stats)
  };
};

const calculateTrend = (stats: Record<string, number>) => {
  // Get relevant stats for trend calculation
  const relevantStats = Object.entries(stats)
    .filter(([key]) => !key.includes('pct') && !key.includes('grade'))
    .map(([_, value]) => value);

  if (relevantStats.length < 2) {
    return {
      direction: 'neutral' as const,
      confidence: 0,
      percentage: 0
    };
  }

  // Create data points for regression
  const points = relevantStats.map((value, index) => [index, value]);
  
  // Calculate regression
  const result = regression.linear(points);
  const slope = result.equation[0];
  
  // Calculate confidence
  const confidence = Math.abs(result.r2 * 100);
  
  // Calculate percentage change
  const first = relevantStats[0];
  const last = relevantStats[relevantStats.length - 1];
  const percentageChange = first === 0 ? 0 : ((last - first) / first) * 100;

  return {
    direction: slope > 0.1 ? 'up' as const : slope < -0.1 ? 'down' as const : 'neutral' as const,
    confidence,
    percentage: Math.abs(percentageChange)
  };
};