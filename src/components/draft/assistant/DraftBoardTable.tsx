import React, { useState, useEffect } from 'react';
import { useDraftStore } from '../../../store/draftStore';
import { DraftPlayer } from '../../../types/draft';
import { ChevronDown, ChevronUp, Filter, Search, ArrowUpDown, Star, TrendingUp, AlertTriangle } from 'lucide-react';
import { PlayerCardModal } from '../PlayerCardModal';

type SortField = 'name' | 'position' | 'team' | 'rank' | 'adp' | 'value' | 'tier' | 'boom' | 'bust' | 'breakout';
type SortDirection = 'asc' | 'desc';

interface DraftBoardTableProps {
  onSelectPlayer?: (player: DraftPlayer) => void;
  hideDrafted?: boolean;
}

export const DraftBoardTable: React.FC<DraftBoardTableProps> = ({ 
  onSelectPlayer,
  hideDrafted = false
}) => {
  const { availablePlayers, picks } = useDraftStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<DraftPlayer | null>(null);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [loadedTeamLogos, setLoadedTeamLogos] = useState<Record<string, boolean>>({});
  
  // Get drafted player IDs
  const draftedPlayerIds = picks.map(pick => pick.player_id);
  
  // Filter and sort players
  const filteredPlayers = availablePlayers
    .filter(player => {
      // Filter by position
      const matchesPosition = positionFilter === 'ALL' || 
        player.position === positionFilter ||
        (positionFilter === 'FLEX' && ['RB', 'WR', 'TE'].includes(player.position));
      
      // Filter by search term
      const matchesSearch = searchTerm === '' || 
        `${player.first_name} ${player.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.team?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.position?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter out drafted players if hideDrafted is true
      const isAvailable = !hideDrafted || !draftedPlayerIds.includes(player.player_id);
      
      return matchesPosition && matchesSearch && isAvailable;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'name':
          comparison = `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
          break;
        case 'position':
          comparison = (a.position || '').localeCompare(b.position || '');
          break;
        case 'team':
          comparison = (a.team || '').localeCompare(b.team || '');
          break;
        case 'rank':
          comparison = (a.rank || 999) - (b.rank || 999);
          break;
        case 'adp':
          comparison = (a.adp || 999) - (b.adp || 999);
          break;
        case 'value':
          const aValue = (a.adp || 0) - (a.rank || 0);
          const bValue = (b.adp || 0) - (b.rank || 0);
          comparison = aValue - bValue;
          break;
        case 'tier':
          comparison = (a.tier || 999) - (b.tier || 999);
          break;
        case 'boom':
          comparison = (b.boom_probability || 0) - (a.boom_probability || 0);
          break;
        case 'bust':
          comparison = (a.bust_risk || 0) - (b.bust_risk || 0);
          break;
        case 'breakout':
          comparison = (b.breakout_score || 0) - (a.breakout_score || 0);
          break;
        default:
          comparison = (a.rank || 999) - (b.rank || 999);
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  
  // Calculate expected draft round
  const calculateExpectedRound = (adp: number | undefined): string => {
    if (!adp) return 'N/A';
    const round = Math.ceil(adp / 12); // Assuming 12-team league
    return `Round ${round}`;
  };
  
  // Calculate draft value
  const calculateDraftValue = (adp: number | undefined, rank: number | undefined): { value: number; className: string } => {
    if (!adp || !rank) return { value: 0, className: 'text-gray-500' };
    
    const value = adp - rank;
    
    if (value > 20) return { value, className: 'text-green-600 font-semibold' }; // Great value
    if (value > 10) return { value, className: 'text-green-500' }; // Good value
    if (value < -20) return { value, className: 'text-red-600 font-semibold' }; // Bad value
    if (value < -10) return { value, className: 'text-red-500' }; // Poor value
    
    return { value, className: 'text-gray-600' }; // Neutral value
  };
  
  // Get position color class
  const getPositionColorClass = (position: string): string => {
    switch (position) {
      case 'QB':
        return 'bg-red-100 text-red-800';
      case 'RB':
        return 'bg-blue-100 text-blue-800';
      case 'WR':
        return 'bg-green-100 text-green-800';
      case 'TE':
        return 'bg-purple-100 text-purple-800';
      case 'K':
        return 'bg-yellow-100 text-yellow-800';
      case 'DEF':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Handle sort change
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default direction
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Get sort icon
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown size={14} className="ml-1 text-gray-400" />;
    return sortDirection === 'asc' ? 
      <ChevronUp size={14} className="ml-1 text-primary-500" /> : 
      <ChevronDown size={14} className="ml-1 text-primary-500" />;
  };

  // Get player image URL
  const getPlayerImageUrl = (player_id: string) => {
    return `https://sleepercdn.com/content/nfl/players/thumb/${player_id}.jpg`;
  };

  // Get team logo URL
  const getTeamLogoUrl = (team: string) => {
    return `https://sleepercdn.com/images/team_logos/nfl/${team?.toLowerCase()}.png`;
  };

  // Handle image load
  const handleImageLoad = (player_id: string) => {
    setLoadedImages(prev => ({
      ...prev,
      [player_id]: true
    }));
  };

  // Handle image error
  const handleImageError = (player_id: string) => {
    setLoadedImages(prev => ({
      ...prev,
      [player_id]: true
    }));
  };

  // Handle team logo load
  const handleTeamLogoLoad = (team: string) => {
    setLoadedTeamLogos(prev => ({
      ...prev,
      [team]: true
    }));
  };

  // Handle team logo error
  const handleTeamLogoError = (team: string) => {
    setLoadedTeamLogos(prev => ({
      ...prev,
      [team]: true
    }));
  };

  // Handle player card click
  const handlePlayerClick = (player: DraftPlayer) => {
    setSelectedPlayer(player);
  };

  // Handle draft from modal
  const handleDraftFromModal = (player_id: string) => {
    if (onSelectPlayer) {
      const player = availablePlayers.find(p => p.player_id === player_id);
      if (player) {
        onSelectPlayer(player);
      }
    }
  };
  
  return (
    <>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h3 className="font-semibold text-gray-800">Draft Board</h3>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search players..."
                  className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm"
                />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                <Filter size={16} className="text-gray-500" />
              </button>
            </div>
          </div>
          
          {/* Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex flex-wrap gap-2">
                <div className="font-medium text-sm text-gray-700 mr-2">Position:</div>
                {['ALL', 'QB', 'RB', 'WR', 'TE', 'FLEX', 'K', 'DEF'].map(pos => (
                  <button
                    key={pos}
                    onClick={() => setPositionFilter(pos)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      positionFilter === pos
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
              
              <div className="flex items-center mt-4">
                <div className="font-medium text-sm text-gray-700 mr-2">Show Drafted:</div>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!hideDrafted}
                    onChange={() => onSelectPlayer && onSelectPlayer({ ...filteredPlayers[0], player_id: 'toggle-drafted' })}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>
            </div>
          )}
        </div>
        
        {/* Player Grid */}
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredPlayers.map((player) => {
              const isDrafted = draftedPlayerIds.includes(player.player_id);
              const draftValue = calculateDraftValue(player.adp, player.rank);
              
              return (
                <div 
                  key={player.player_id} 
                  className={`bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${
                    isDrafted ? 'opacity-50 bg-gray-50' : ''
                  }`}
                  onClick={() => handlePlayerClick(player)}
                >
                  <div className="flex items-center p-3 border-b border-gray-100">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                      <img
                        src={getPlayerImageUrl(player.player_id)}
                        alt={`${player.first_name} ${player.last_name}`}
                        className={`w-full h-full object-cover transition-opacity duration-300 ${loadedImages[player.player_id] ? 'opacity-100' : 'opacity-0'}`}
                        onLoad={() => handleImageLoad(player.player_id)}
                        onError={() => handleImageError(player.player_id)}
                      />
                      {!loadedImages[player.player_id] && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                          <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-800 truncate">
                          {player.first_name} {player.last_name}
                        </h3>
                        <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                          getPositionColorClass(player.position)
                        }`}>
                          {player.position}
                        </span>
                      </div>
                      <div className="flex items-center mt-1">
                        {player.team && (
                          <div className="flex items-center">
                            <img 
                              src={getTeamLogoUrl(player.team)} 
                              alt={player.team} 
                              className={`w-4 h-4 mr-1 transition-opacity duration-300 ${loadedTeamLogos[player.team] ? 'opacity-100' : 'opacity-0'}`}
                              onLoad={() => handleTeamLogoLoad(player.team)}
                              onError={() => handleTeamLogoError(player.team)}
                            />
                            {!loadedTeamLogos[player.team] && (
                              <div className="w-4 h-4 mr-1 bg-gray-200 rounded-full"></div>
                            )}
                            <span className="text-xs text-gray-500">{player.team}</span>
                          </div>
                        )}
                        {isDrafted && <span className="ml-2 text-xs text-red-500">(Drafted)</span>}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3">
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div>
                        <div className="text-xs text-gray-500">Rank</div>
                        <div className="font-semibold text-gray-800">{player.rank || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">ADP</div>
                        <div className="font-semibold text-gray-800">{player.adp?.toFixed(1) || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Value</div>
                        <div className={draftValue.className}>
                          {draftValue.value > 0 ? '+' : ''}{draftValue.value.toFixed(1)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <div className="text-xs text-gray-500">Tier</div>
                        <div className="font-semibold text-gray-800">{player.tier || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Round</div>
                        <div className="font-semibold text-gray-800">{calculateExpectedRound(player.adp).replace('Round ', '')}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Bye</div>
                        <div className="font-semibold text-gray-800">{player.bye_week || 'N/A'}</div>
                      </div>
                    </div>
                    
                    {/* Player metrics */}
                    <div className="mt-3 space-y-2">
                      {player.boom_probability !== undefined && (
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="flex items-center text-gray-500">
                              <Star size={12} className="mr-1 text-primary-500" />
                              Boom
                            </span>
                            <span>{player.boom_probability}%</span>
                          </div>
                          <div className="h-1 bg-gray-200 rounded-full">
                            <div 
                              className="h-full bg-primary-500 rounded-full"
                              style={{ width: `${player.boom_probability}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      {player.bust_risk !== undefined && (
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="flex items-center text-gray-500">
                              <AlertTriangle size={12} className="mr-1 text-red-500" />
                              Bust
                            </span>
                            <span>{player.bust_risk}%</span>
                          </div>
                          <div className="h-1 bg-gray-200 rounded-full">
                            <div 
                              className="h-full bg-red-500 rounded-full"
                              style={{ width: `${player.bust_risk}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      {player.breakout_score !== undefined && (
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="flex items-center text-gray-500">
                              <TrendingUp size={12} className="mr-1 text-green-500" />
                              Breakout
                            </span>
                            <span>{player.breakout_score}%</span>
                          </div>
                          <div className="h-1 bg-gray-200 rounded-full">
                            <div 
                              className="h-full bg-green-500 rounded-full"
                              style={{ width: `${player.breakout_score}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {filteredPlayers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No players found matching your criteria
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Showing {filteredPlayers.length} of {availablePlayers.length} players
            </div>
            <div className="flex space-x-2">
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                Great Value
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                Poor Value
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Player Card Modal */}
      {selectedPlayer && (
        <PlayerCardModal 
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
          onDraft={handleDraftFromModal}
          isDrafted={draftedPlayerIds.includes(selectedPlayer.player_id)}
        />
      )}
    </>
  );
};