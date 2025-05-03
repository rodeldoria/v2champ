import { Player } from '../types/sleeper';

// Active NFL teams for 2024
const ACTIVE_NFL_TEAMS = [
  'ARI', 'ATL', 'BAL', 'BUF', 'CAR', 'CHI', 'CIN', 'CLE',
  'DAL', 'DEN', 'DET', 'GB', 'HOU', 'IND', 'JAX', 'KC',
  'LAC', 'LAR', 'LV', 'MIA', 'MIN', 'NE', 'NO', 'NYG',
  'NYJ', 'PHI', 'PIT', 'SEA', 'SF', 'TB', 'TEN', 'WAS'
];

// Known retired players to explicitly filter out
const RETIRED_PLAYERS = [
  'Le\'Veon Bell',
  'Ben Roethlisberger',
  // Add other known retired players here
];

// Defensive positions to filter out
const DEFENSIVE_POSITIONS = ['DL', 'LB', 'DB', 'IDP', 'IDP_FLEX'];

export const validatePlayer = (
  player: Player,
  stats: Record<string, number>
): { isActive: boolean; warnings: string[] } => {
  const warnings: string[] = [];
  let isActive = true;

  // Check if player exists and has basic info
  if (!player || !player.player_id || !player.first_name || !player.last_name) {
    return { isActive: false, warnings: ['Invalid player data'] };
  }

  // Check if player is retired
  const fullName = `${player.first_name} ${player.last_name}`;
  if (RETIRED_PLAYERS.includes(fullName)) {
    return { isActive: false, warnings: ['Player is retired'] };
  }

  // Check if player is on an active NFL team
  if (!player.team) {
    warnings.push('Not on active NFL roster');
    isActive = false;
  } else if (!ACTIVE_NFL_TEAMS.includes(player.team)) {
    warnings.push('Invalid team assignment');
    isActive = false;
  }

  // Check position assignment
  if (!player.position) {
    warnings.push('No position assigned');
    isActive = false;
  }

  // Filter out defensive players except for team defense (DEF)
  if (DEFENSIVE_POSITIONS.includes(player.position || '')) {
    warnings.push('Defensive player');
    isActive = false;
  }

  // Check active status
  if (player.active === false) {
    warnings.push('Player is inactive');
    isActive = false;
  }

  // Check injury status
  if (player.injury_status) {
    if (player.injury_status === 'IR') {
      warnings.push('Player on Injured Reserve');
      isActive = false;
    } else {
      warnings.push(`Player is ${player.injury_status}`);
    }
  }

  // Special handling for defense
  if (player.position === 'DEF') {
    return {
      isActive: true,
      warnings: []
    };
  }

  return {
    isActive,
    warnings
  };
};