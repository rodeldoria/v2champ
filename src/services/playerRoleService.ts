import { Player } from '../types/sleeper';

export interface PlayerRole {
  role: string;
  snapShare: number;
  experience: string;
  tier: string;
  confidence: number;
}

export const getPlayerRole = (player: Player, stats: Record<string, number>): PlayerRole => {
  // Calculate snap share from offensive/defensive snaps
  const snapShare = calculateSnapShare(stats, player);
  const gamesStarted = stats.games_started || 0;
  const yearsExp = calculateYearsExperience(player);
  const performance = calculatePerformanceScore(stats, player.position);

  // Determine experience level and tier
  const { experience, tier } = determineExperienceAndTier(yearsExp, snapShare, gamesStarted, performance, player);

  // Determine role based on snap share and performance
  const role = determineRole(snapShare, performance, player);

  // Calculate confidence in role assessment
  const confidence = calculateConfidence(snapShare, gamesStarted, performance);

  return {
    role,
    snapShare,
    experience,
    tier,
    confidence
  };
};

const calculateSnapShare = (stats: Record<string, number>, player: Player): number => {
  // First try offensive/defensive snap percentage
  if (typeof stats.off_pct === 'number') {
    return Math.round(stats.off_pct * 100);
  }
  if (typeof stats.def_pct === 'number') {
    return Math.round(stats.def_pct * 100);
  }
  
  // Then try snap percentage
  if (typeof stats.snap_pct === 'number') {
    return Math.round(stats.snap_pct * 100);
  }

  // Finally try calculating from raw snap counts
  const offSnaps = stats.off_snp || 0;
  const defSnaps = stats.def_snp || 0;
  const totalTeamSnaps = stats.tm_off_snp || stats.tm_def_snp || 0;

  if (totalTeamSnaps > 0) {
    return Math.round(((offSnaps + defSnaps) / totalTeamSnaps) * 100);
  }

  // If no snap data is available, estimate based on player name and position
  const playerName = `${player.first_name} ${player.last_name}`;
  const eliteQBs = ['Patrick Mahomes', 'Josh Allen', 'Jalen Hurts', 'Lamar Jackson', 'Joe Burrow', 'Dak Prescott'];
  const eliteRBs = ['Christian McCaffrey', 'Bijan Robinson', 'Saquon Barkley', 'Jonathan Taylor', 'Breece Hall'];
  const eliteWRs = ['Justin Jefferson', 'Ja\'Marr Chase', 'CeeDee Lamb', 'Amon-Ra St. Brown', 'Tyreek Hill'];
  const eliteTEs = ['Travis Kelce', 'Sam LaPorta', 'T.J. Hockenson', 'Mark Andrews', 'George Kittle'];

  if (eliteQBs.includes(playerName) || 
      eliteRBs.includes(playerName) || 
      eliteWRs.includes(playerName) || 
      eliteTEs.includes(playerName)) {
    return 85; // Elite players get high snap share
  }

  // Default snap share based on position
  switch (player.position) {
    case 'QB':
      return 75; // QBs typically have high snap counts
    case 'RB':
      return 60; // RBs often rotate
    case 'WR':
      return 70; // WRs typically have good snap counts
    case 'TE':
      return 65; // TEs often have good snap counts
    default:
      return 50; // Default value
  }
};

const calculateYearsExperience = (player: Player): number => {
  const currentYear = new Date().getFullYear();
  const rookieYear = player.years_exp ? currentYear - player.years_exp : currentYear;
  return currentYear - rookieYear;
};

const calculatePerformanceScore = (stats: Record<string, number>, position?: string): number => {
  if (!stats || !position) return 0;

  switch (position) {
    case 'QB':
      return (
        ((stats.pass_td || 0) * 4) +
        ((stats.pass_yd || 0) / 25) +
        ((stats.rush_yd || 0) / 10)
      ) / 10;
    case 'RB':
      return (
        ((stats.rush_yd || 0) / 10) +
        ((stats.rush_td || 0) * 6) +
        ((stats.rec_yd || 0) / 10)
      ) / 10;
    case 'WR':
    case 'TE':
      return (
        ((stats.rec_yd || 0) / 10) +
        ((stats.rec_td || 0) * 6) +
        (stats.rec || 0)
      ) / 10;
    default:
      return 0;
  }
};

const determineExperienceAndTier = (
  years: number,
  snapShare: number,
  gamesStarted: number,
  performance: number,
  player: Player
): { experience: string; tier: string } => {
  // Check for elite players by name
  const playerName = `${player.first_name} ${player.last_name}`;
  const eliteQBs = ['Patrick Mahomes', 'Josh Allen', 'Jalen Hurts', 'Lamar Jackson', 'Joe Burrow', 'Dak Prescott'];
  const eliteRBs = ['Christian McCaffrey', 'Bijan Robinson', 'Saquon Barkley', 'Jonathan Taylor', 'Breece Hall'];
  const eliteWRs = ['Justin Jefferson', 'Ja\'Marr Chase', 'CeeDee Lamb', 'Amon-Ra St. Brown', 'Tyreek Hill'];
  const eliteTEs = ['Travis Kelce', 'Sam LaPorta', 'T.J. Hockenson', 'Mark Andrews', 'George Kittle'];

  if (eliteQBs.includes(playerName) || 
      eliteRBs.includes(playerName) || 
      eliteWRs.includes(playerName) || 
      eliteTEs.includes(playerName)) {
    return { experience: 'Elite Veteran', tier: 'Elite' };
  }

  // Elite veteran
  if (years >= 7 && snapShare > 75 && performance > 80) {
    return { experience: 'Elite Veteran', tier: 'Elite' };
  }

  // Veteran
  if (years >= 4 && snapShare > 50) {
    return { experience: 'Veteran', tier: 'Veteran' };
  }

  // Rising star
  if (years <= 3 && snapShare > 60 && performance > 70) {
    return { experience: 'Rising Star', tier: 'Starter' };
  }

  // Rookie
  if (years === 0) {
    if (snapShare > 50 && performance > 60) {
      return { experience: 'Impact Rookie', tier: 'Starter' };
    }
    return { experience: 'Rookie', tier: 'Developing' };
  }

  // Developing player
  if (years <= 2) {
    return { experience: 'Developing', tier: 'Developing' };
  }

  // Journeyman
  return { experience: 'Journeyman', tier: 'Veteran' };
};

const determineRole = (snapShare: number, performance: number, player: Player): string => {
  // Check for elite players by name
  const playerName = `${player.first_name} ${player.last_name}`;
  const eliteQBs = ['Patrick Mahomes', 'Josh Allen', 'Jalen Hurts', 'Lamar Jackson', 'Joe Burrow', 'Dak Prescott'];
  const eliteRBs = ['Christian McCaffrey', 'Bijan Robinson', 'Saquon Barkley', 'Jonathan Taylor', 'Breece Hall'];
  const eliteWRs = ['Justin Jefferson', 'Ja\'Marr Chase', 'CeeDee Lamb', 'Amon-Ra St. Brown', 'Tyreek Hill'];
  const eliteTEs = ['Travis Kelce', 'Sam LaPorta', 'T.J. Hockenson', 'Mark Andrews', 'George Kittle'];

  if (eliteQBs.includes(playerName) || 
      eliteRBs.includes(playerName) || 
      eliteWRs.includes(playerName) || 
      eliteTEs.includes(playerName)) {
    return 'Feature Player';
  }

  if (snapShare > 75 && performance > 80) {
    return 'Feature Player';
  }

  if (snapShare > 75) {
    return 'Starter';
  }

  if (snapShare > 50 && performance > 70) {
    return 'Key Contributor';
  }

  if (snapShare > 50) {
    return 'Rotational Player';
  }

  if (snapShare > 25) {
    return 'Backup';
  }

  if (snapShare > 10) {
    return 'Special Teams';
  }

  return 'Depth';
};

const calculateConfidence = (snapShare: number, gamesStarted: number, performance: number): number => {
  let confidence = 70; // Base confidence

  // Adjust based on snap share
  if (snapShare > 75) confidence += 15;
  else if (snapShare > 50) confidence += 10;
  else if (snapShare > 25) confidence += 5;

  // Adjust based on games started
  if (gamesStarted > 10) confidence += 10;
  else if (gamesStarted > 5) confidence += 5;

  // Adjust based on performance
  if (performance > 80) confidence += 10;
  else if (performance > 70) confidence += 5;

  return Math.min(confidence, 99);
};