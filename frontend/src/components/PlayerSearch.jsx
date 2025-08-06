import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search, X, Users, Check, Plus, Target, Trophy } from 'lucide-react';
import { mockCharacters, mockFormations } from '../data/mock';
import CharacterCard from './CharacterCard';
import CharacterModal from './CharacterModal';
import { logoColors } from '../styles/colors';

const PlayerSearch = ({ isOpen, onClose, onPlayerSelect, position, selectedPlayerIds = [], teamBuildingMode = false, currentFormation = null, onTeamBuilt, currentTeamPlayers = {}, currentBenchPlayers = {} }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPosition, setFilterPosition] = useState('all');
  const [filterElement, setFilterElement] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [filteredPlayers, setFilteredPlayers] = useState(mockCharacters);
  const [isProcessingPlayer, setIsProcessingPlayer] = useState(false); // Add loading state
  
  // Team building states - Initialize with current team if in team building mode
  const [builtTeam, setBuiltTeam] = useState(() => {
    if (teamBuildingMode) {
      return {
        players: { ...currentTeamPlayers },
        bench: { ...currentBenchPlayers },
        totalPlayers: Object.keys(currentTeamPlayers).length + Object.keys(currentBenchPlayers).length
      };
    }
    return {
      players: {},
      bench: {},
      totalPlayers: 0
    };
  });
  const [showCharacterModal, setShowCharacterModal] = useState(false);
  const [selectedCharacterForModal, setSelectedCharacterForModal] = useState(null);
  const [pendingPosition, setPendingPosition] = useState(null);
  const [pendingIsBench, setPendingIsBench] = useState(false);
  const [pendingBenchSlot, setPendingBenchSlot] = useState(null);

  const positions = ['all', 'FW', 'MF', 'DF', 'GK'];
  const elements = ['all', 'Fire', 'Earth', 'Wind', 'Wood'];
  const sortOptions = [
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'name_desc', label: 'Name (Z-A)' },
    { value: 'position', label: 'Position' }
  ];

  // Auto-assign player to best position
  const autoAssignPosition = (player) => {
    if (!currentFormation || !teamBuildingMode) return null;

    // First, try to find an empty position that matches the player's position
    const matchingPositions = currentFormation.positions.filter(
      pos => pos.position === player.position && !builtTeam.players[pos.id]
    );

    if (matchingPositions.length > 0) {
      return matchingPositions[0].id;
    }

    // If no exact position match available, try ANY available formation position
    // This allows flexibility to place players in non-matching positions when needed
    const anyAvailablePositions = currentFormation.positions.filter(
      pos => !builtTeam.players[pos.id]
    );

    if (anyAvailablePositions.length > 0) {
      return anyAvailablePositions[0].id;
    }

    // If all formation positions are full, try bench
    for (let i = 0; i < 5; i++) {
      if (!builtTeam.bench[i]) {
        return null; // Signal to add to bench
      }
    }

    return null; // Team is completely full
  };

  // Check if player is already selected
  const isPlayerInTeam = (playerId) => {
    const teamPlayerIds = Object.values(builtTeam.players).map(p => p.id);
    const benchPlayerIds = Object.values(builtTeam.bench).map(p => p.id);
    return teamPlayerIds.includes(playerId) || benchPlayerIds.includes(playerId) || selectedPlayerIds.includes(playerId);
  };

  // Get visual feedback class for character cards
  const getCardVisualFeedback = (player) => {
    // Removed green selection box as requested
    return '';
  };

  // Get position info for a player in the built team
  const getPlayerPositionInfo = (playerId) => {
    // Check main team
    for (const [positionId, player] of Object.entries(builtTeam.players)) {
      if (player.id === playerId) {
        const position = currentFormation?.positions.find(p => p.id === positionId);
        return { type: 'main', position: position?.position || 'Unknown' };
      }
    }
    
    // Check bench
    for (const [slot, player] of Object.entries(builtTeam.bench)) {
      if (player.id === playerId) {
        return { type: 'bench', slot: parseInt(slot) + 1 };
      }
    }
    
    return null;
  };

  useEffect(() => {
    applyFilters();
  }, [searchQuery, filterPosition, filterElement, sortBy]);

  // Sync builtTeam with current team state when in team building mode
  useEffect(() => {
    if (teamBuildingMode) {
      setBuiltTeam(prevBuiltTeam => {
        const currentTeamCount = Object.keys(currentTeamPlayers || {}).length;
        const currentBenchCount = Object.keys(currentBenchPlayers || {}).length;
        const newTotalPlayers = currentTeamCount + currentBenchCount;
        
        // Only update if the count has actually changed
        if (prevBuiltTeam.totalPlayers !== newTotalPlayers) {
          return {
            players: { ...currentTeamPlayers },
            bench: { ...currentBenchPlayers },
            totalPlayers: newTotalPlayers
          };
        }
        return prevBuiltTeam;
      });
    }
  }, [teamBuildingMode, currentTeamPlayers, currentBenchPlayers]);

  const applyFilters = () => {
    let filtered = [...mockCharacters];

    if (searchQuery) {
      filtered = filtered.filter(player => 
        player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.nickname.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterPosition !== 'all') {
      filtered = filtered.filter(player => player.position === filterPosition);
    }

    if (filterElement !== 'all') {
      filtered = filtered.filter(player => player.element === filterElement);
    }

    // Sort the filtered results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        case 'position':
          return a.position.localeCompare(b.position);
        default:
          return 0;
      }
    });

    setFilteredPlayers(filtered);
  };

  const handlePlayerSelect = (player) => {
    if (!teamBuildingMode) {
      // Legacy mode - open character modal for configuration
      if (onPlayerSelect) {
        onPlayerSelect(player);
      }
      return;
    }

    // Prevent rapid clicks and double processing
    if (isProcessingPlayer) {
      return;
    }

    // Team building mode - check if player is already selected
    if (isPlayerInTeam(player.id)) {
      return; // Already selected, do nothing
    }

    setIsProcessingPlayer(true);

    // Check if we can add the player
    const assignedPosition = autoAssignPosition(player);
    
    // Create enhanced player with default settings for quick selection
    const enhancedPlayer = {
      ...player,
      userLevel: player.baseLevel, // Use base level
      userRarity: player.baseRarity, // Use base rarity
      userEquipment: {
        boots: null,
        bracelets: null,
        pendants: null,
        special: null
      },
      userHissatsu: {
        preset1: player.hissatsu?.slice(0, 3) || [],
        preset2: player.hissatsu?.slice(3, 6) || []
      }
    };

    // Direct team assignment
    setBuiltTeam(prev => {
      // Double-check again inside the state update to prevent race conditions
      const currentTeamPlayerIds = Object.values(prev.players).map(p => p.id);
      const currentBenchPlayerIds = Object.values(prev.bench).map(p => p.id);
      
      if (currentTeamPlayerIds.includes(player.id) || currentBenchPlayerIds.includes(player.id)) {
        // Player was already added, don't add again
        setIsProcessingPlayer(false);
        return prev;
      }
      
      const newTeam = { ...prev };
      
      if (assignedPosition) {
        // Add to main team position
        newTeam.players[assignedPosition] = enhancedPlayer;
      } else {
        // Try to add to bench - find first available slot
        let foundBenchSlot = false;
        for (let i = 0; i < 5; i++) {
          if (!newTeam.bench[i]) {
            newTeam.bench[i] = enhancedPlayer;
            foundBenchSlot = true;
            break;
          }
        }
        
        if (!foundBenchSlot) {
          // Team is completely full - all formation spots and bench spots are occupied
          alert('Team is completely full! All 11 formation positions and 5 bench slots are occupied.');
          setIsProcessingPlayer(false);
          return prev;
        }
      }
      
      newTeam.totalPlayers = Object.keys(newTeam.players).length + Object.keys(newTeam.bench).length;
      setIsProcessingPlayer(false);
      return newTeam;
    });
  };

  const handleCharacterModalConfirm = (character, userLevel, userRarity, equipment, hissatsu) => {
    const enhancedPlayer = {
      ...character,
      userLevel: userLevel,
      userRarity: userRarity,
      userEquipment: equipment,
      userHissatsu: hissatsu
    };

    setBuiltTeam(prev => {
      const newTeam = { ...prev };
      
      if (pendingIsBench) {
        // Add to bench
        const slot = pendingBenchSlot !== null ? pendingBenchSlot : Object.keys(newTeam.bench).length;
        newTeam.bench[slot] = enhancedPlayer;
      } else {
        // Add to main team
        newTeam.players[pendingPosition] = enhancedPlayer;
      }
      
      newTeam.totalPlayers = Object.keys(newTeam.players).length + Object.keys(newTeam.bench).length;
      return newTeam;
    });

    // Reset pending states
    setShowCharacterModal(false);
    setSelectedCharacterForModal(null);
    setPendingPosition(null);
    setPendingIsBench(false);
    setPendingBenchSlot(null);
  };

  const handleRemovePlayer = (playerId) => {
    setBuiltTeam(prev => {
      const newTeam = { ...prev };
      
      // Remove from main team
      Object.keys(newTeam.players).forEach(positionId => {
        if (newTeam.players[positionId].id === playerId) {
          delete newTeam.players[positionId];
        }
      });
      
      // Remove from bench
      Object.keys(newTeam.bench).forEach(slot => {
        if (newTeam.bench[slot].id === playerId) {
          delete newTeam.bench[slot];
        }
      });
      
      newTeam.totalPlayers = Object.keys(newTeam.players).length + Object.keys(newTeam.bench).length;
      return newTeam;
    });
  };

  const handleApplyTeam = () => {
    // Allow applying even empty teams for maximum flexibility
    if (onTeamBuilt) {
      onTeamBuilt(builtTeam);
    }
    onClose();
  };

  const handleClearTeam = () => {
    setBuiltTeam({
      players: {},
      bench: {},
      totalPlayers: 0
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterPosition('all');
    setFilterElement('all');
    setSortBy('name');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] text-white border"
                     style={{ 
                       background: logoColors.backgroundGradient,
                       borderColor: logoColors.primaryBlueAlpha(0.2)
                     }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" style={{ color: logoColors.primaryBlue }} />
            {teamBuildingMode ? (
              <span>Quick Team Builder - {builtTeam.totalPlayers}/16 players selected</span>
            ) : (
              position ? `Add Player for ${position}` : 'Browse Players'
            )}
          </DialogTitle>
          {teamBuildingMode && (
            <div className="text-sm text-gray-400 mt-2">
              Build your complete team (11 main + 5 bench players) directly here. Players will be auto-assigned to best positions.
            </div>
          )}
          {position && !teamBuildingMode && (
            <div className="text-sm text-gray-400 mt-2">
              Searching for players suitable for the {position} position
            </div>
          )}
          {!position && !teamBuildingMode && (
            <div className="text-sm text-gray-400 mt-2">
              Browse all available players - click on a player to configure and add to your team
            </div>
          )}
        </DialogHeader>

        <div className="flex gap-6">
          {/* Left Panel - Search and Filters */}
          <div className="flex-1">
            {/* Search and Filters */}
            <div className="flex flex-col gap-4 mb-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4" style={{ color: logoColors.primaryBlue }} />
                  <Input
                    placeholder="Search players by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 text-white border"
                    style={{ 
                      backgroundColor: logoColors.blackAlpha(0.3),
                      borderColor: logoColors.primaryBlueAlpha(0.3),
                      '--placeholder-color': logoColors.primaryBlue
                    }}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Select value={filterPosition} onValueChange={setFilterPosition}>
                    <SelectTrigger className="text-white min-w-[100px] border"
                                  style={{ 
                                    backgroundColor: logoColors.blackAlpha(0.3),
                                    borderColor: logoColors.primaryBlueAlpha(0.3)
                                  }}>
                      <SelectValue placeholder="Position" />
                    </SelectTrigger>
                    <SelectContent style={{ backgroundColor: logoColors.blackAlpha(0.9) }}>
                      {positions.map(pos => (
                        <SelectItem key={pos} value={pos} className="text-white hover:bg-blue-800">
                          {pos === 'all' ? 'All' : pos}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filterElement} onValueChange={setFilterElement}>
                    <SelectTrigger className="text-white min-w-[100px] border"
                                  style={{ 
                                    backgroundColor: logoColors.blackAlpha(0.3),
                                    borderColor: logoColors.primaryBlueAlpha(0.3)
                                  }}>
                      <SelectValue placeholder="Element" />
                    </SelectTrigger>
                    <SelectContent style={{ backgroundColor: logoColors.blackAlpha(0.9) }}>
                      {elements.map(elem => (
                        <SelectItem key={elem} value={elem} className="text-white hover:bg-blue-800">
                          {elem === 'all' ? 'All' : elem}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="text-white min-w-[140px] border"
                                  style={{ 
                                    backgroundColor: logoColors.blackAlpha(0.3),
                                    borderColor: logoColors.primaryBlueAlpha(0.3)
                                  }}>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent style={{ backgroundColor: logoColors.blackAlpha(0.9) }}>
                      {sortOptions.map(option => (
                        <SelectItem key={option.value} value={option.value} className="text-white hover:bg-blue-800">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button 
                    onClick={clearFilters} 
                    className="text-white border px-4 hover:opacity-80"
                    style={{ 
                      backgroundColor: logoColors.blackAlpha(0.4),
                      borderColor: logoColors.primaryBlueAlpha(0.5)
                    }}
                    title="Clear Filters"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </div>

            {/* Results Info */}
            <div className="mb-4 flex items-center justify-between">
              <Badge variant="secondary" className="text-white"
                     style={{ backgroundColor: logoColors.primaryBlue }}>
                {filteredPlayers.length} players found
              </Badge>
              
              {teamBuildingMode && (
                <div className="flex gap-2">
                  <Badge variant="outline" className="border"
                         style={{ color: logoColors.primaryYellow, borderColor: logoColors.primaryYellow }}>
                    Main: {Object.keys(builtTeam.players).length}/11
                  </Badge>
                  <Badge variant="outline" className="border"
                         style={{ color: logoColors.lightBlue, borderColor: logoColors.lightBlue }}>
                    Bench: {Object.keys(builtTeam.bench).length}/5
                  </Badge>
                </div>
              )}
            </div>

            {/* Player Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[400px] overflow-y-auto pr-2">
              {filteredPlayers.map((player) => {
                const isAlreadySelected = teamBuildingMode ? isPlayerInTeam(player.id) : selectedPlayerIds.includes(player.id);
                const positionInfo = teamBuildingMode ? getPlayerPositionInfo(player.id) : null;
                
                return (
                  <div key={player.id} className="relative">
                    <div className={`${isAlreadySelected ? 'opacity-90' : ''} ${getCardVisualFeedback(player)}`}>
                      <CharacterCard
                        character={player}
                        onClick={() => !isAlreadySelected && !isProcessingPlayer && handlePlayerSelect(player)}
                        viewMode="grid"
                      />
                      
                      {/* Visual Feedback Option 1: Checkmark */}
                      {isAlreadySelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                             style={{ backgroundColor: logoColors.primaryYellow }}>
                          <Check className="h-4 w-4 text-black" />
                        </div>
                      )}
                      
                      {/* Visual Feedback Option 2: Position Badge */}
                      {teamBuildingMode && positionInfo && (
                        <div className="absolute bottom-2 left-2">
                          {positionInfo.type === 'main' ? (
                            <Badge className="text-white text-xs"
                                   style={{ backgroundColor: logoColors.primaryYellow, color: logoColors.black }}>
                              {positionInfo.position}
                            </Badge>
                          ) : (
                            <Badge className="text-white text-xs"
                                   style={{ backgroundColor: logoColors.primaryBlue }}>
                              Bench {positionInfo.slot}
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      {/* Remove button for team building mode */}
                      {teamBuildingMode && isAlreadySelected && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 left-2 w-6 h-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemovePlayer(player.id);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                      
                      {/* Legacy selected indicator */}
                      {!teamBuildingMode && isAlreadySelected && (
                        <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center rounded-lg">
                          <span className="text-red-400 font-bold text-xs bg-red-900/70 px-2 py-1 rounded">
                            SELECTED
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* No Results */}
            {filteredPlayers.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <p>No players found matching your criteria</p>
                <p className="text-sm">Try adjusting your search filters</p>
              </div>
            )}
          </div>

          {/* Right Panel - Team Composition (Visual Feedback Option 3) */}
          {teamBuildingMode && (
            <div className="w-80 backdrop-blur-lg border rounded-lg p-4"
                 style={{ 
                   backgroundColor: logoColors.blackAlpha(0.3),
                   borderColor: logoColors.primaryBlueAlpha(0.2)
                 }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Users className="h-5 w-5" style={{ color: logoColors.primaryBlue }} />
                  Team Composition
                </h3>
                <Badge className="text-white"
                       style={{ backgroundColor: logoColors.primaryBlue }}>
                  {builtTeam.totalPlayers}/16
                </Badge>
              </div>

              {/* Formation Preview */}
              {currentFormation && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2"
                      style={{ color: logoColors.primaryBlue }}>
                    <Target className="h-4 w-4" />
                    {currentFormation.name}
                  </h4>
                  <div className="bg-green-900/20 rounded-lg p-3 h-48 relative border border-green-600/30">
                    {currentFormation.positions.map((pos) => {
                      const player = builtTeam.players[pos.id];
                      return (
                        <div
                          key={pos.id}
                          className={`absolute w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                            player 
                              ? 'text-white border-2' 
                              : 'bg-gray-700 border-gray-500 text-gray-300'
                          }`}
                          style={player ? {
                            backgroundColor: logoColors.primaryBlue,
                            borderColor: logoColors.lightBlue,
                            left: `${pos.x}%`,
                            top: `${pos.y}%`,
                            transform: 'translate(-50%, -50%)'
                          } : {
                            left: `${pos.x}%`,
                            top: `${pos.y}%`,
                            transform: 'translate(-50%, -50%)'
                          }}
                          title={player ? player.name : `Empty ${pos.position}`}
                        >
                          {player ? player.name.charAt(0) : pos.position}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Bench Preview */}
              <div className="mb-4">
                <h4 className="font-medium mb-2" style={{ color: logoColors.lightBlue }}>Bench Players</h4>
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({ length: 5 }, (_, index) => {
                    const player = builtTeam.bench[index];
                    return (
                      <div
                        key={index}
                        className={`aspect-square rounded border-2 flex items-center justify-center text-xs ${
                          player 
                            ? 'text-white' 
                            : 'bg-gray-700 border-gray-500 text-gray-400'
                        }`}
                        style={player ? {
                          backgroundColor: logoColors.lightBlue,
                          borderColor: logoColors.primaryBlue
                        } : {}}
                        title={player ? player.name : `Empty bench slot ${index + 1}`}
                      >
                        {player ? player.name.charAt(0) : (index + 1)}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Team Actions */}
              <div className="space-y-2">
                <Button
                  className="w-full text-white hover:opacity-80"
                  style={{ background: logoColors.yellowOrangeGradient, color: logoColors.black }}
                  onClick={handleApplyTeam}
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  Apply Team ({builtTeam.totalPlayers}/16)
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full bg-red-900/60 border-red-500/40 hover:bg-red-800/80 text-white"
                  onClick={handleClearTeam}
                >
                  Clear Team
                </Button>
              </div>

              {/* Progress Indicators */}
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Main Team Progress:</span>
                  <span style={{ color: logoColors.primaryYellow }}>
                    {Object.keys(builtTeam.players).length}/11
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ 
                      backgroundColor: logoColors.primaryYellow,
                      width: `${(Object.keys(builtTeam.players).length / 11) * 100}%` 
                    }}
                  ></div>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Bench Progress:</span>
                  <span style={{ color: logoColors.lightBlue }}>
                    {Object.keys(builtTeam.bench).length}/5
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ 
                      backgroundColor: logoColors.lightBlue,
                      width: `${(Object.keys(builtTeam.bench).length / 5) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Character Modal */}
        {showCharacterModal && selectedCharacterForModal && (
          <CharacterModal
            character={selectedCharacterForModal}
            isOpen={showCharacterModal}
            onClose={() => {
              setShowCharacterModal(false);
              setSelectedCharacterForModal(null);
              setPendingPosition(null);
              setPendingIsBench(false);
              setPendingBenchSlot(null);
            }}
            allCharacters={mockCharacters}
            onAddToTeam={handleCharacterModalConfirm}
            teamBuildingMode={teamBuildingMode}
            pendingPosition={pendingPosition}
            pendingIsBench={pendingIsBench}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PlayerSearch;