import { Player } from '../types/sleeper';

// Calculate player attributes based on position and stats
export const calculatePlayerAttributes = (player: Player, stats: Record<string, number> = {}) => {
  if (!player || !player.position) {
    return {};
  }

  switch (player.position) {
    case 'QB':
      return calculateQBAttributes(stats);
    case 'RB':
      return calculateRBAttributes(stats);
    case 'WR':
      return calculateWRAttributes(stats);
    case 'TE':
      return calculateTEAttributes(stats);
    case 'K':
      return calculateKAttributes(stats);
    case 'DEF':
      return calculateDEFAttributes(stats);
    default:
      return {};
  }
};

// QB attributes
const calculateQBAttributes = (stats: Record<string, number>) => {
  const completionPct = (stats.pass_cmp || 0) / Math.max(stats.pass_att || 1, 1) * 100;
  const ypa = (stats.pass_yd || 0) / Math.max(stats.pass_att || 1, 1);
  const tdInt = (stats.pass_td || 0) / Math.max(stats.pass_int || 1, 1);
  const rushYards = stats.rush_yd || 0;

  return {
    arm: Math.min(99, Math.round(75 + (ypa - 7) * 3)),
    accuracy: Math.min(99, Math.round(75 + (completionPct - 60) * 0.5)),
    awareness: Math.min(99, Math.round(75 + tdInt * 2)),
    agility: Math.min(99, Math.round(70 + (rushYards / 50)))
  };
};

// RB attributes
const calculateRBAttributes = (stats: Record<string, number>) => {
  const ypc = (stats.rush_yd || 0) / Math.max(stats.rush_att || 1, 1);
  const longRun = stats.rush_lng || 0;
  const brokenTackles = stats.broken_tackles || 0;
  const yac = stats.rush_yac || 0;

  return {
    speed: Math.min(99, Math.round(75 + (ypc - 4) * 5 + (longRun / 10))),
    agility: Math.min(99, Math.round(75 + brokenTackles * 2)),
    power: Math.min(99, Math.round(75 + (yac / 100))),
    vision: Math.min(99, Math.round(75 + (ypc - 4) * 5))
  };
};

// WR attributes
const calculateWRAttributes = (stats: Record<string, number>) => {
  const ypr = (stats.rec_yd || 0) / Math.max(stats.rec || 1, 1);
  const catchRate = (stats.rec || 0) / Math.max(stats.targets || 1, 1) * 100;
  const longPlay = stats.rec_lng || 0;
  const contested = stats.contested_catches || 0;
  const firstDowns = stats.first_downs || 0;

  return {
    speed: Math.min(99, Math.round(75 + (ypr - 10) * 2 + (longPlay / 10))),
    hands: Math.min(99, Math.round(75 + (catchRate - 60) * 0.5 + (contested * 5))),
    route: Math.min(99, Math.round(75 + (ypr - 10) * 2 + (firstDowns / 5))),
    separation: Math.min(99, Math.round(75 + (catchRate - 60) * 0.5 + (ypr - 10)))
  };
};

// TE attributes
const calculateTEAttributes = (stats: Record<string, number>) => {
  const ypr = (stats.rec_yd || 0) / Math.max(stats.rec || 1, 1);
  const catchRate = (stats.rec || 0) / Math.max(stats.targets || 1, 1) * 100;
  const blockGrade = stats.block_grade || 70;

  return {
    speed: Math.min(99, Math.round(75 + (ypr - 8) * 2)),
    hands: Math.min(99, Math.round(75 + (catchRate - 60) * 0.5)),
    route: Math.min(99, Math.round(75 + (ypr - 8) * 2)),
    blocking: Math.min(99, Math.round(blockGrade))
  };
};

// K attributes
const calculateKAttributes = (stats: Record<string, number>) => {
  const fgPct = (stats.fg_made || 0) / Math.max(stats.fg_att || 1, 1) * 100;
  const longFG = stats.fg_long || 0;
  const xpPct = (stats.xp_made || 0) / Math.max(stats.xp_att || 1, 1) * 100;

  return {
    accuracy: Math.min(99, Math.round(75 + (fgPct - 80) * 0.5)),
    power: Math.min(99, Math.round(75 + (longFG - 45) * 0.5)),
    clutch: Math.min(99, Math.round(75 + (stats.fg_made_50_plus || 0) * 5)),
    consistency: Math.min(99, Math.round(75 + (xpPct - 90) * 0.5))
  };
};

// DEF attributes
const calculateDEFAttributes = (stats: Record<string, number>) => {
  const sacks = stats.sack || 0;
  const interceptions = stats.int || 0;
  const fumbles = stats.fum_rec || 0;
  const tackles = stats.tackle || 0;

  return {
    passRush: Math.min(99, Math.round(75 + sacks * 2)),
    coverage: Math.min(99, Math.round(75 + interceptions * 5)),
    runDefense: Math.min(99, Math.round(75 + tackles / 10)),
    turnoverGen: Math.min(99, Math.round(75 + (interceptions + fumbles) * 3))
  };
};

// Calculate fantasy points
export const calculateFantasyPoints = (stats: Record<string, number>, scoringType: 'standard' | 'half_ppr' | 'ppr' = 'ppr') => {
  if (!stats) return 0;

  // Base scoring
  let points = 0;

  // Passing
  points += (stats.pass_yd || 0) * 0.04;
  points += (stats.pass_td || 0) * 4;
  points += (stats.pass_int || 0) * -1;
  points += (stats.pass_2pt || 0) * 2;

  // Rushing
  points += (stats.rush_yd || 0) * 0.1;
  points += (stats.rush_td || 0) * 6;
  points += (stats.rush_2pt || 0) * 2;

  // Receiving
  points += (stats.rec_yd || 0) * 0.1;
  points += (stats.rec_td || 0) * 6;
  points += (stats.rec_2pt || 0) * 2;

  // PPR adjustments
  if (scoringType === 'ppr') {
    points += (stats.rec || 0) * 1;
  } else if (scoringType === 'half_ppr') {
    points += (stats.rec || 0) * 0.5;
  }

  // Kicking
  points += (stats.fg_made || 0) * 3;
  points += (stats.fg_made_40_49 || 0) * 1; // Bonus for 40-49 yard FGs
  points += (stats.fg_made_50_plus || 0) * 2; // Bonus for 50+ yard FGs
  points += (stats.xp_made || 0) * 1;
  points += (stats.fg_miss || 0) * -1;
  points += (stats.xp_miss || 0) * -1;

  // Defense
  points += (stats.def_td || 0) * 6;
  points += (stats.def_st_td || 0) * 6;
  points += (stats.def_st_ff || 0) * 1;
  points += (stats.def_st_fr || 0) * 1;
  points += (stats.def_int || 0) * 2;
  points += (stats.def_fr || 0) * 2;
  points += (stats.def_sack || 0) * 1;
  points += (stats.def_safety || 0) * 2;
  points += (stats.def_td || 0) * 6;

  // Points allowed scoring
  if (stats.def_pa !== undefined) {
    if (stats.def_pa === 0) points += 10;
    else if (stats.def_pa <= 6) points += 7;
    else if (stats.def_pa <= 13) points += 4;
    else if (stats.def_pa <= 20) points += 1;
    else if (stats.def_pa <= 27) points += 0;
    else if (stats.def_pa <= 34) points += -1;
    else points += -4;
  }

  return points;
};

// Calculate boom/bust/breakout scores
export const calculatePlayerScores = (player: Player, stats: Record<string, number> = {}) => {
  // Default values
  let boom = 50;
  let bust = 50;
  let breakout = 50;

  // Adjust based on position
  switch (player.position) {
    case 'QB':
      boom = calculateQBBoomScore(player, stats);
      bust = calculateQBBustScore(player, stats);
      breakout = calculateQBBreakoutScore(player, stats);
      break;
    case 'RB':
      boom = calculateRBBoomScore(player, stats);
      bust = calculateRBBustScore(player, stats);
      breakout = calculateRBBreakoutScore(player, stats);
      break;
    case 'WR':
      boom = calculateWRBoomScore(player, stats);
      bust = calculateWRBustScore(player, stats);
      breakout = calculateWRBreakoutScore(player, stats);
      break;
    case 'TE':
      boom = calculateTEBoomScore(player, stats);
      bust = calculateTEBustScore(player, stats);
      breakout = calculateTEBreakoutScore(player, stats);
      break;
    default:
      // Use defaults for other positions
      break;
  }

  return {
    boom_probability: Math.round(boom),
    bust_risk: Math.round(bust),
    breakout_score: Math.round(breakout)
  };
};

// QB scoring functions
const calculateQBBoomScore = (player: Player, stats: Record<string, number>) => {
  // Base score
  let score = 50;
  
  // Adjust based on stats
  if (stats.pass_td) score += (stats.pass_td / 2) * 5;
  if (stats.pass_yd) score += (stats.pass_yd / 300) * 5;
  if (stats.rush_yd) score += (stats.rush_yd / 30) * 5;
  
  // Adjust based on player attributes
  if (player.years_exp === 0) score -= 10; // Rookies less likely to boom
  if (player.years_exp && player.years_exp > 5) score += 5; // Veterans more consistent
  
  return Math.min(Math.max(score, 10), 99);
};

const calculateQBBustScore = (player: Player, stats: Record<string, number>) => {
  // Base score
  let score = 50;
  
  // Adjust based on stats
  if (stats.pass_int) score += (stats.pass_int / 2) * 5;
  if (stats.pass_yd) score -= (stats.pass_yd / 300) * 3;
  
  // Adjust based on player attributes
  if (player.years_exp === 0) score += 15; // Rookies more likely to bust
  if (player.years_exp && player.years_exp > 5) score -= 5; // Veterans less likely to bust
  
  return Math.min(Math.max(score, 10), 99);
};

const calculateQBBreakoutScore = (player: Player, stats: Record<string, number>) => {
  // Base score
  let score = 50;
  
  // Adjust based on player attributes
  if (player.years_exp === 0) score += 20; // Rookies have high breakout potential
  if (player.years_exp === 1 || player.years_exp === 2) score += 15; // 2nd and 3rd year QBs often break out
  if (player.years_exp && player.years_exp > 5) score -= 20; // Veterans unlikely to break out
  
  return Math.min(Math.max(score, 10), 99);
};

// RB scoring functions
const calculateRBBoomScore = (player: Player, stats: Record<string, number>) => {
  // Base score
  let score = 50;
  
  // Adjust based on stats
  if (stats.rush_td) score += (stats.rush_td / 1) * 5;
  if (stats.rush_yd) score += (stats.rush_yd / 100) * 5;
  if (stats.rec) score += (stats.rec / 3) * 5;
  
  // Adjust based on player attributes
  if (player.years_exp === 0) score -= 5; // Rookies slightly less likely to boom
  
  return Math.min(Math.max(score, 10), 99);
};

const calculateRBBustScore = (player: Player, stats: Record<string, number>) => {
  // Base score
  let score = 50;
  
  // Adjust based on stats
  if (stats.rush_yd) score -= (stats.rush_yd / 100) * 3;
  if (stats.rush_att) score += (stats.rush_att / 20) * 5; // High usage = higher injury risk
  
  // Adjust based on player attributes
  if (player.years_exp === 0) score += 10; // Rookies more likely to bust
  if (player.years_exp && player.years_exp > 5) score += 15; // Older RBs more likely to bust
  
  return Math.min(Math.max(score, 10), 99);
};

const calculateRBBreakoutScore = (player: Player, stats: Record<string, number>) => {
  // Base score
  let score = 50;
  
  // Adjust based on player attributes
  if (player.years_exp === 0) score += 25; // Rookies have high breakout potential
  if (player.years_exp === 1) score += 20; // 2nd year RBs often break out
  if (player.years_exp && player.years_exp > 4) score -= 25; // Veterans unlikely to break out
  
  return Math.min(Math.max(score, 10), 99);
};

// WR scoring functions
const calculateWRBoomScore = (player: Player, stats: Record<string, number>) => {
  // Base score
  let score = 50;
  
  // Adjust based on stats
  if (stats.rec_td) score += (stats.rec_td / 1) * 5;
  if (stats.rec_yd) score += (stats.rec_yd / 100) * 5;
  if (stats.rec) score += (stats.rec / 5) * 5;
  
  // Adjust based on player attributes
  if (player.years_exp === 0) score -= 10; // Rookies less likely to boom
  
  return Math.min(Math.max(score, 10), 99);
};

const calculateWRBustScore = (player: Player, stats: Record<string, number>) => {
  // Base score
  let score = 50;
  
  // Adjust based on stats
  if (stats.rec_yd) score -= (stats.rec_yd / 100) * 3;
  if (stats.targets) score += (stats.targets / 10) * 3; // High targets can mean inconsistency
  
  // Adjust based on player attributes
  if (player.years_exp === 0) score += 15; // Rookies more likely to bust
  
  return Math.min(Math.max(score, 10), 99);
};

const calculateWRBreakoutScore = (player: Player, stats: Record<string, number>) => {
  // Base score
  let score = 50;
  
  // Adjust based on player attributes
  if (player.years_exp === 0) score += 15; // Rookies have breakout potential
  if (player.years_exp === 1 || player.years_exp === 2) score += 25; // 2nd and 3rd year WRs often break out
  if (player.years_exp && player.years_exp > 5) score -= 20; // Veterans unlikely to break out
  
  return Math.min(Math.max(score, 10), 99);
};

// TE scoring functions
const calculateTEBoomScore = (player: Player, stats: Record<string, number>) => {
  // Base score
  let score = 50;
  
  // Adjust based on stats
  if (stats.rec_td) score += (stats.rec_td / 1) * 7;
  if (stats.rec_yd) score += (stats.rec_yd / 80) * 5;
  if (stats.rec) score += (stats.rec / 5) * 5;
  
  // Adjust based on player attributes
  if (player.years_exp === 0) score -= 15; // Rookie TEs rarely boom
  
  return Math.min(Math.max(score, 10), 99);
};

const calculateTEBustScore = (player: Player, stats: Record<string, number>) => {
  // Base score
  let score = 50;
  
  // Adjust based on stats
  if (stats.rec_yd) score -= (stats.rec_yd / 80) * 3;
  
  // Adjust based on player attributes
  if (player.years_exp === 0) score += 20; // Rookie TEs very likely to bust
  if (player.years_exp === 1) score += 10; // 2nd year TEs still likely to bust
  
  return Math.min(Math.max(score, 10), 99);
};

const calculateTEBreakoutScore = (player: Player, stats: Record<string, number>) => {
  // Base score
  let score = 50;
  
  // Adjust based on player attributes
  if (player.years_exp === 0) score += 5; // Rookies have some breakout potential
  if (player.years_exp === 1 || player.years_exp === 2) score += 30; // 2nd and 3rd year TEs often break out
  if (player.years_exp && player.years_exp > 5) score -= 20; // Veterans unlikely to break out
  
  return Math.min(Math.max(score, 10), 99);
};