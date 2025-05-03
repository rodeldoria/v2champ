interface TeamColors {
  primary: string;
  secondary: string;
  gradient?: string;
}

// NFL team colors using Tailwind color classes
const NFL_TEAM_COLORS: Record<string, TeamColors> = {
  ARI: { 
    primary: 'red-700', 
    secondary: 'yellow-400',
    gradient: 'from-red-700 to-red-900'
  },
  ATL: { 
    primary: 'red-600', 
    secondary: 'gray-900',
    gradient: 'from-red-600 via-gray-900 to-black'
  },
  BAL: { 
    primary: 'purple-900', 
    secondary: 'yellow-500',
    gradient: 'from-purple-900 via-black to-purple-800'
  },
  BUF: { 
    primary: 'blue-700', 
    secondary: 'red-600',
    gradient: 'from-blue-700 to-red-600'
  },
  CAR: { 
    primary: 'blue-600', 
    secondary: 'gray-900',
    gradient: 'from-blue-600 via-gray-900 to-black'
  },
  CHI: { 
    primary: 'blue-900', 
    secondary: 'orange-600',
    gradient: 'from-blue-900 via-orange-600 to-blue-800'
  },
  CIN: { 
    primary: 'orange-600', 
    secondary: 'gray-900',
    gradient: 'from-orange-600 via-black to-gray-900'
  },
  CLE: { 
    primary: 'orange-700', 
    secondary: 'brown-700',
    gradient: 'from-orange-700 to-brown-800'
  },
  DAL: { 
    primary: 'blue-900', 
    secondary: 'gray-400',
    gradient: 'from-blue-900 via-gray-400 to-blue-800'
  },
  DEN: { 
    primary: 'orange-600', 
    secondary: 'blue-900',
    gradient: 'from-orange-600 to-blue-900'
  },
  DET: { 
    primary: 'blue-600', 
    secondary: 'gray-400',
    gradient: 'from-blue-600 to-gray-400'
  },
  GB: { 
    primary: 'green-700', 
    secondary: 'yellow-500',
    gradient: 'from-green-700 via-yellow-500 to-green-800'
  },
  HOU: { 
    primary: 'red-700', 
    secondary: 'blue-900',
    gradient: 'from-red-700 via-blue-900 to-red-800'
  },
  IND: { 
    primary: 'blue-600', 
    secondary: 'gray-100',
    gradient: 'from-blue-600 to-blue-700'
  },
  JAX: { 
    primary: 'teal-500', 
    secondary: 'yellow-400',
    gradient: 'from-teal-500 via-yellow-400 to-teal-600'
  },
  KC: { 
    primary: 'red-600', 
    secondary: 'yellow-400',
    gradient: 'from-red-600 via-yellow-400 to-red-700'
  },
  LAC: { 
    primary: 'blue-500', 
    secondary: 'yellow-400',
    gradient: 'from-blue-500 via-yellow-400 to-blue-600'
  },
  LAR: { 
    primary: 'blue-600', 
    secondary: 'yellow-500',
    gradient: 'from-blue-600 via-yellow-500 to-blue-700'
  },
  LV: { 
    primary: 'gray-900', 
    secondary: 'gray-400',
    gradient: 'from-gray-900 via-gray-800 to-black'
  },
  MIA: { 
    primary: 'teal-500', 
    secondary: 'orange-500',
    gradient: 'from-teal-500 via-orange-500 to-teal-600'
  },
  MIN: { 
    primary: 'purple-800', 
    secondary: 'yellow-400',
    gradient: 'from-purple-800 via-yellow-400 to-purple-900'
  },
  NE: { 
    primary: 'blue-900', 
    secondary: 'red-600',
    gradient: 'from-blue-900 via-red-600 to-blue-800'
  },
  NO: { 
    primary: 'yellow-500', 
    secondary: 'gray-900',
    gradient: 'from-yellow-500 via-gray-900 to-black'
  },
  NYG: { 
    primary: 'blue-800', 
    secondary: 'red-600',
    gradient: 'from-blue-800 via-red-600 to-blue-900'
  },
  NYJ: { 
    primary: 'green-700', 
    secondary: 'gray-100',
    gradient: 'from-green-700 to-green-800'
  },
  PHI: { 
    primary: 'green-800', 
    secondary: 'gray-400',
    gradient: 'from-green-800 via-gray-400 to-green-900'
  },
  PIT: { 
    primary: 'yellow-400', 
    secondary: 'gray-900',
    gradient: 'from-yellow-400 via-gray-900 to-black'
  },
  SF: { 
    primary: 'red-700', 
    secondary: 'yellow-500',
    gradient: 'from-red-700 via-yellow-500 to-red-800'
  },
  SEA: { 
    primary: 'blue-600', 
    secondary: 'green-500',
    gradient: 'from-blue-600 via-green-500 to-blue-700'
  },
  TB: { 
    primary: 'red-700', 
    secondary: 'gray-800',
    gradient: 'from-red-700 via-gray-800 to-red-800'
  },
  TEN: { 
    primary: 'blue-700', 
    secondary: 'red-600',
    gradient: 'from-blue-700 via-red-600 to-blue-800'
  },
  WAS: { 
    primary: 'red-800', 
    secondary: 'yellow-600',
    gradient: 'from-red-800 via-yellow-600 to-red-900'
  }
};

export const getTeamColors = (teamId: string): TeamColors => {
  return NFL_TEAM_COLORS[teamId] || { 
    primary: 'gray-800', 
    secondary: 'gray-400',
    gradient: 'from-gray-800 to-gray-900'
  };
};