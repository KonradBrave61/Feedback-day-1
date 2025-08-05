import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { mockCharacters, mockFormations, mockTactics, mockCoaches } from '../data/mock';
import Navigation from '../components/Navigation';
import FormationField, { BenchSlot } from '../components/FormationField';
import PlayerSearch from '../components/PlayerSearch';
import TacticsSelector from '../components/TacticsSelector';
import TacticVisualizationModal from '../components/TacticVisualizationModal';
import CoachSelector from '../components/CoachSelector';
import SaveTeamModal from '../components/EnhancedSaveTeamModal';
import LoadTeamModal from '../components/LoadTeamModal';
import CharacterModal from '../components/CharacterModal';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Users, Trophy, Target, Shield, Zap, UserCheck, Plus, X, Save, Download } from 'lucide-react';
import { logoColors, componentColors } from '../styles/colors';
import { toast } from 'sonner';

const TeamBuilder = () => {
  const { saveTeam } = useAuth();
  const [selectedFormation, setSelectedFormation] = useState(mockFormations[0]);
  const [teamPlayers, setTeamPlayers] = useState({});
  const [benchPlayers, setBenchPlayers] = useState({});
  const [selectedTactics, setSelectedTactics] = useState([]);
  const [tacticsPresets, setTacticsPresets] = useState({
    1: { name: 'Preset 1', tactics: [] },
    2: { name: 'Preset 2', tactics: [] }
  });
  const [currentTacticsPreset, setCurrentTacticsPreset] = useState(1);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [showPlayerSearch, setShowPlayerSearch] = useState(false);
  const [showTacticsSelector, setShowTacticsSelector] = useState(false);
  const [showTacticVisualization, setShowTacticVisualization] = useState(false);
  const [showCoachSelector, setShowCoachSelector] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [isBenchSelection, setIsBenchSelection] = useState(false);
  const [selectedBenchSlot, setSelectedBenchSlot] = useState(null);
  const [showSaveTeamModal, setShowSaveTeamModal] = useState(false);
  const [showLoadTeamModal, setShowLoadTeamModal] = useState(false);
  const [showCharacterModal, setShowCharacterModal] = useState(false);
  const [selectedCharacterForModal, setSelectedCharacterForModal] = useState(null);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [isProcessingPlayer, setIsProcessingPlayer] = useState(false);
  
  // Add team building mode state
  const [teamBuildingMode, setTeamBuildingMode] = useState(false);

  // Handle team built from enhanced Browse Players
  const handleTeamBuilt = (builtTeam) => {
    // Apply the built team to the current team state
    setTeamPlayers(builtTeam.players);
    setBenchPlayers(builtTeam.bench);
    setTeamBuildingMode(false);
  };

  // Get currently selected player IDs for all interfaces
  const getCurrentlySelectedPlayerIds = () => {
    return [...Object.values(teamPlayers).map(p => p.id), ...Object.values(benchPlayers).map(p => p.id)];
  };

  const handleFormationChange = (formationId) => {
    const formation = mockFormations.find(f => f.id === parseInt(formationId));
    const oldFormation = selectedFormation;
    setSelectedFormation(formation);
    
    // Preserve players that can still fit in the new formation
    if (oldFormation && formation) {
      setTeamPlayers(prev => {
        const newTeamPlayers = {};
        const newFormationPositions = formation.positions;
        const playersToRelocate = [];
        
        // First pass: Keep players whose exact position exists in the new formation
        Object.entries(prev).forEach(([positionId, player]) => {
          const existsInNewFormation = newFormationPositions.some(pos => pos.id === positionId);
          if (existsInNewFormation) {
            newTeamPlayers[positionId] = player;
          } else {
            playersToRelocate.push(player);
          }
        });
        
        // Second pass: Move displaced players to same position type or closest available
        playersToRelocate.forEach(player => {
          const oldPosition = oldFormation.positions.find(pos => prev[pos.id]?.id === player.id);
          if (!oldPosition) return;
          
          // Try to find same position type in new formation
          const samePositionTypeSlots = newFormationPositions.filter(pos => 
            pos.position === oldPosition.position && !newTeamPlayers[pos.id]
          );
          
          if (samePositionTypeSlots.length > 0) {
            // Place in same position type
            newTeamPlayers[samePositionTypeSlots[0].id] = player;
          } else {
            // Find closest available position by priority: same line, then any available
            const availableSlots = newFormationPositions.filter(pos => !newTeamPlayers[pos.id]);
            if (availableSlots.length > 0) {
              // Priority order for position placement
              const positionPriority = {
                'GK': ['GK', 'DF', 'MF', 'FW'],
                'DF': ['DF', 'MF', 'GK', 'FW'], 
                'MF': ['MF', 'DF', 'FW', 'GK'],
                'FW': ['FW', 'MF', 'DF', 'GK']
              };
              
              const playerPositionPriority = positionPriority[oldPosition.position] || ['GK', 'DF', 'MF', 'FW'];
              
              // Find best available slot based on priority
              let placedPlayer = false;
              for (const preferredPos of playerPositionPriority) {
                const matchingSlot = availableSlots.find(slot => slot.position === preferredPos);
                if (matchingSlot) {
                  newTeamPlayers[matchingSlot.id] = player;
                  placedPlayer = true;
                  break;
                }
              }
              
              // If still not placed, use first available slot
              if (!placedPlayer && availableSlots.length > 0) {
                newTeamPlayers[availableSlots[0].id] = player;
              }
            }
          }
        });
        
        return newTeamPlayers;
      });
    }
  };

  const handleAddPlayer = (positionId) => {
    setSelectedPosition(positionId);
    setShowPlayerSearch(true);
  };

  // Check if a player is already selected in team or bench
  const isPlayerAlreadySelected = (playerId) => {
    // Check team players
    const teamPlayerIds = Object.values(teamPlayers).map(p => p.id);
    // Check bench players
    const benchPlayerIds = Object.values(benchPlayers).map(p => p.id);
    return teamPlayerIds.includes(playerId) || benchPlayerIds.includes(playerId);
  };

  const handlePlayerSelect = (player) => {
    // Check if player is already selected
    if (isPlayerAlreadySelected(player.id)) {
      alert('This player is already in your team or on the bench!');
      return;
    }
    
    // Instead of direct selection, open character modal
    setSelectedCharacterForModal(player);
    setEditingPlayer(null); // This is for new player selection
    setShowPlayerSearch(false);
    setShowCharacterModal(true);
  };

  const handleEditPlayer = (player) => {
    // Check if the player is on the bench
    const isPlayerOnBench = Object.values(benchPlayers).some(benchPlayer => benchPlayer && benchPlayer.id === player.id);
    
    // Set the player for editing
    setSelectedCharacterForModal(player);
    setEditingPlayer(player);
    setIsBenchSelection(isPlayerOnBench); // Set bench selection flag if player is on bench
    setShowCharacterModal(true);
  };

  const handleCharacterModalConfirm = (character, userLevel, userRarity, equipment, hissatsu) => {
    // Prevent double processing
    if (isProcessingPlayer) {
      return;
    }

    setIsProcessingPlayer(true);

    // Create enhanced player object with user customizations
    const enhancedPlayer = {
      ...character,
      userLevel: userLevel,
      userRarity: userRarity,
      userEquipment: equipment,
      userHissatsu: hissatsu
    };

    if (editingPlayer) {
      // Update existing player
      if (isBenchSelection) {
        setBenchPlayers(prev => {
          const newBench = { ...prev };
          // Find which bench slot has this player
          const benchSlot = Object.keys(prev).find(slot => prev[slot].id === editingPlayer.id);
          if (benchSlot) {
            newBench[benchSlot] = enhancedPlayer;
          }
          setIsProcessingPlayer(false);
          return newBench;
        });
      } else {
        setTeamPlayers(prev => {
          const newTeam = { ...prev };
          // Find which position has this player
          const position = Object.keys(prev).find(pos => prev[pos].id === editingPlayer.id);
          if (position) {
            newTeam[position] = enhancedPlayer;
          }
          setIsProcessingPlayer(false);
          return newTeam;
        });
      }
    } else {
      // Add new player - double check for duplicates
      const currentTeamPlayerIds = Object.values(teamPlayers).map(p => p.id);
      const currentBenchPlayerIds = Object.values(benchPlayers).map(p => p.id);
      
      if (currentTeamPlayerIds.includes(character.id) || currentBenchPlayerIds.includes(character.id)) {
        alert('This player is already in your team or on the bench!');
        setIsProcessingPlayer(false);
        return;
      }

      if (isBenchSelection) {
        if (selectedBenchSlot !== null) {
          // Specific bench slot selected
          setBenchPlayers(prev => {
            setIsProcessingPlayer(false);
            return {
              ...prev,
              [selectedBenchSlot]: enhancedPlayer
            };
          });
        } else {
          // Find first available bench slot
          setBenchPlayers(prev => {
            const newBench = { ...prev };
            for (let i = 0; i < 5; i++) {
              if (!newBench[i]) {
                newBench[i] = enhancedPlayer;
                break;
              }
            }
            setIsProcessingPlayer(false);
            return newBench;
          });
        }
        setIsBenchSelection(false);
        setSelectedBenchSlot(null);
      } else if (selectedPosition) {
        // Specific position selected
        setTeamPlayers(prev => {
          setIsProcessingPlayer(false);
          return {
            ...prev,
            [selectedPosition]: enhancedPlayer
          };
        });
      } else {
        // No specific position - user needs to select during modal or find best fit
        // For now, we'll alert user to select a specific position
        alert('Please select a specific position on the field or use the position-specific add buttons.');
        setIsProcessingPlayer(false);
        return;
      }
    }
    
    setShowCharacterModal(false);
    setSelectedCharacterForModal(null);
    setSelectedPosition(null);
    setEditingPlayer(null);
  };

  const handleAddBenchPlayer = (slotIndex) => {
    setSelectedBenchSlot(slotIndex);
    setIsBenchSelection(true);
    setShowPlayerSearch(true);
  };

  const handleRemoveBenchPlayer = (slotIndex) => {
    setBenchPlayers(prev => {
      const newBench = { ...prev };
      delete newBench[slotIndex];
      return newBench;
    });
  };

  const handleRemovePlayer = (positionId) => {
    setTeamPlayers(prev => {
      const newTeam = { ...prev };
      delete newTeam[positionId];
      return newTeam;
    });
  };

  const handleMovePlayer = (fromPosition, toPosition) => {
    setTeamPlayers(prev => {
      const newTeam = { ...prev };
      const playerToMove = newTeam[fromPosition];
      const playerAtDestination = newTeam[toPosition];
      
      // Swap players or move to empty position
      if (playerAtDestination) {
        newTeam[fromPosition] = playerAtDestination;
      } else {
        delete newTeam[fromPosition];
      }
      newTeam[toPosition] = playerToMove;
      
      return newTeam;
    });
  };

  // Move player from formation to bench
  const handleMoveToBench = (fromPosition, toBenchSlot) => {
    const playerToMove = teamPlayers[fromPosition];
    if (!playerToMove) return;

    // Remove from formation
    setTeamPlayers(prev => {
      const newTeam = { ...prev };
      delete newTeam[fromPosition];
      return newTeam;
    });

    // Add to bench (replace if slot is occupied)
    setBenchPlayers(prev => ({
      ...prev,
      [toBenchSlot]: playerToMove
    }));
  };

  // Move player from bench to formation
  const handleMoveFromBench = (fromBenchSlot, toPosition, isSwap = false) => {
    const playerToMove = benchPlayers[fromBenchSlot];
    if (!playerToMove) return;

    if (isSwap && teamPlayers[toPosition]) {
      // Swap players between bench and formation
      const formationPlayer = teamPlayers[toPosition];
      
      setTeamPlayers(prev => ({
        ...prev,
        [toPosition]: playerToMove
      }));
      
      setBenchPlayers(prev => ({
        ...prev,
        [fromBenchSlot]: formationPlayer
      }));
    } else {
      // Simple move from bench to formation
      setTeamPlayers(prev => ({
        ...prev,
        [toPosition]: playerToMove
      }));

      setBenchPlayers(prev => {
        const newBench = { ...prev };
        delete newBench[fromBenchSlot];
        return newBench;
      });
    }
  };

  const handleTacticsSelect = (tactics) => {
    setSelectedTactics(tactics);
  };

  const handleTacticsPresetUpdate = (presets, currentPreset) => {
    setTacticsPresets(presets);
    setCurrentTacticsPreset(currentPreset);
  };

  const handleCoachSelect = (coach) => {
    setSelectedCoach(coach);
  };

  const handleSaveTeam = async (teamData) => {
    try {
      const teamPayload = {
        name: teamData.name,
        description: teamData.description,
        is_public: teamData.is_public,
        tags: teamData.tags,
        formation: selectedFormation.name,
        players: Object.entries(teamPlayers).map(([positionId, player]) => ({
          position_id: positionId,
          character_id: player.id,
          user_level: player.userLevel || player.level || 1,
          user_rarity: player.userRarity || player.rarity || 'common',
          user_equipment: player.userEquipment || {},
          user_hissatsu: player.userHissatsu || []
        })),
        bench: Object.entries(benchPlayers).map(([slotId, player]) => ({
          slot_id: slotId,
          character_id: player.id,
          user_level: player.userLevel || player.level || 1,
          user_rarity: player.userRarity || player.rarity || 'common',
          user_equipment: player.userEquipment || {},
          user_hissatsu: player.userHissatsu || []
        })),
        tactics: selectedTactics,
        coach: selectedCoach
      };

      const result = await saveTeam(teamPayload);
      if (result.success) {
        setShowSaveTeamModal(false);
        // You could show a success toast here
        return result;
      } else {
        throw new Error(result.error || 'Failed to save team');
      }
    } catch (error) {
      console.error('Error saving team:', error);
      throw error;
    }
  };

  const handleLoadTeam = (teamData) => {
    try {
      console.log('Loading team data:', teamData);
      
      // Clear current team
      setTeamPlayers({});
      setBenchPlayers({});
      setSelectedTactics([]);
      setSelectedCoach(null);
      setSelectedFormation(null);
      
      // Load formation if available
      if (teamData.formation) {
        const formation = mockFormations.find(f => f.id === teamData.formation || f.name === teamData.formation);
        if (formation) {
          setSelectedFormation(formation);
          console.log('Loaded formation:', formation.name);
        }
      }
      
      // Load players from the correct field (could be 'players' or 'team_data')
      const playersArray = teamData.players || teamData.team_data?.players || [];
      if (playersArray && Array.isArray(playersArray)) {
        const newTeamPlayers = {};
        playersArray.forEach((playerData) => {
          if (playerData && playerData.character_id) {
            // Use the position_id from the data or generate one
            const positionId = playerData.position_id || `position_${Object.keys(newTeamPlayers).length + 1}`;
            
            // Find the base character data
            const baseCharacter = mockCharacters.find(c => c.id === playerData.character_id);
            if (baseCharacter) {
              newTeamPlayers[positionId] = {
                ...baseCharacter,
                userLevel: playerData.user_level || baseCharacter.level,
                userRarity: playerData.user_rarity || baseCharacter.rarity,
                userEquipment: playerData.user_equipment || {},
                userHissatsu: playerData.user_hissatsu || []
              };
            }
          }
        });
        setTeamPlayers(newTeamPlayers);
        console.log('Loaded players:', Object.keys(newTeamPlayers).length);
      }
      
      // Load bench players (could be 'bench' or 'bench_players' or inside team_data)
      const benchArray = teamData.bench || teamData.bench_players || teamData.team_data?.bench || [];
      if (benchArray && Array.isArray(benchArray)) {
        const newBenchPlayers = {};
        benchArray.forEach((playerData, index) => {
          if (playerData && playerData.character_id) {
            const slotId = `bench_${index + 1}`;
            const baseCharacter = mockCharacters.find(c => c.id === playerData.character_id);
            if (baseCharacter) {
              newBenchPlayers[slotId] = {
                ...baseCharacter,
                userLevel: playerData.user_level || baseCharacter.level,
                userRarity: playerData.user_rarity || baseCharacter.rarity,
                userEquipment: playerData.user_equipment || {},
                userHissatsu: playerData.user_hissatsu || []
              };
            }
          }
        });
        setBenchPlayers(newBenchPlayers);
        console.log('Loaded bench players:', Object.keys(newBenchPlayers).length);
      }
      
      // Load tactics (could be array of tactics or inside team_data)
      const tacticsArray = teamData.tactics || teamData.team_data?.tactics || [];
      if (tacticsArray && Array.isArray(tacticsArray) && tacticsArray.length > 0) {
        // Load tactics into selectedTactics array
        const loadedTactics = [];
        tacticsArray.forEach(tacticData => {
          // Add null check for tacticData
          if (tacticData && typeof tacticData === 'object') {
            // Find matching tactic from mockTactics
            const tactic = mockTactics.find(t => 
              (tacticData.id && t.id === tacticData.id) || 
              (tacticData.name && t.name === tacticData.name)
            );
            if (tactic) {
              loadedTactics.push(tactic);
            }
          } else if (typeof tacticData === 'string') {
            // Handle case where tacticData is just a string name
            const tactic = mockTactics.find(t => t.name === tacticData);
            if (tactic) {
              loadedTactics.push(tactic);
            }
          }
        });
        setSelectedTactics(loadedTactics);
        console.log('Loaded tactics:', loadedTactics.map(t => t.name).join(', '));
        
        // Also update the tactics presets
        if (loadedTactics.length > 0) {
          const updatedPresets = { ...tacticsPresets };
          updatedPresets[currentTacticsPreset].tactics = loadedTactics;
          setTacticsPresets(updatedPresets);
        }
      }
      
      // Load coach (could be coach object or inside team_data)
      const coachData = teamData.coach || teamData.team_data?.coach;
      if (coachData) {
        // Add null check for coachData
        if (typeof coachData === 'object' && coachData !== null) {
          // Find matching coach from mockCoaches
          const coach = mockCoaches.find(c => 
            (coachData.id && c.id === coachData.id) || 
            (coachData.name && c.name === coachData.name)
          );
          if (coach) {
            setSelectedCoach(coach);
            console.log('Loaded coach:', coach.name);
          }
        } else if (typeof coachData === 'string') {
          // Handle case where coachData is just a string name
          const coach = mockCoaches.find(c => c.name === coachData);
          if (coach) {
            setSelectedCoach(coach);
            console.log('Loaded coach:', coach.name);
          }
        }
      }
      
      toast.success('Team loaded successfully!');
      
    } catch (error) {
      console.error('Error loading team:', error);
      toast.error('Failed to load team data');
    }
  };

  const getTeamStats = () => {
    const players = Object.values(teamPlayers);
    if (players.length === 0) return null;

    const totalStats = players.reduce((acc, player) => {
      // Add base stats
      Object.keys(player.baseStats).forEach(stat => {
        acc[stat] = (acc[stat] || 0) + player.baseStats[stat].main;
      });
      
      // Add equipment bonuses if player has userEquipment
      if (player.userEquipment) {
        Object.values(player.userEquipment).forEach(equipment => {
          if (equipment && equipment.stats) {
            Object.keys(equipment.stats).forEach(stat => {
              acc[stat] = (acc[stat] || 0) + equipment.stats[stat];
            });
          }
        });
      }
      
      return acc;
    }, {});

    // Apply coach bonuses
    if (selectedCoach) {
      Object.keys(selectedCoach.bonuses.teamStats).forEach(stat => {
        if (totalStats[stat]) {
          totalStats[stat] += selectedCoach.bonuses.teamStats[stat];
        }
      });
    }

    return {
      ...totalStats,
      playerCount: players.length,
      avgLevel: Math.round(players.reduce((acc, player) => acc + player.baseLevel, 0) / players.length)
    };
  };

  const teamStats = getTeamStats();

  return (
    <div className="min-h-screen" style={{ background: logoColors.backgroundGradient }}>
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4 bg-clip-text text-transparent" 
              style={{ background: logoColors.yellowOrangeGradient, WebkitBackgroundClip: 'text' }}>
            Team Builder
          </h1>
          <p className="text-xl text-gray-300">
            Build your ultimate Inazuma Eleven team
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel - Formation & Controls */}
          <div className="lg:col-span-1 space-y-4">
            {/* Quick Actions */}
            <Card className="backdrop-blur-lg text-white border" style={{ 
              backgroundColor: logoColors.blackAlpha(0.3),
              borderColor: logoColors.primaryBlueAlpha(0.2)
            }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" style={{ color: logoColors.primaryBlue }} />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    className="w-full text-black font-bold hover:opacity-80"
                    style={{ background: logoColors.yellowOrangeGradient }}
                    onClick={() => {
                      setTeamBuildingMode(true);
                      setSelectedPosition(null);
                      setIsBenchSelection(false);
                      setShowPlayerSearch(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Quick Team Builder
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Formation Selection */}
            <Card className="backdrop-blur-lg text-white border" style={{ 
              backgroundColor: logoColors.blackAlpha(0.3),
              borderColor: logoColors.primaryBlueAlpha(0.2)
            }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" style={{ color: logoColors.primaryBlue }} />
                  Formation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedFormation.id.toString()} onValueChange={handleFormationChange}>
                  <SelectTrigger className="text-white border" style={{ 
                    backgroundColor: logoColors.blackAlpha(0.3),
                    borderColor: logoColors.primaryBlueAlpha(0.3)
                  }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent style={{ 
                    backgroundColor: logoColors.blackAlpha(0.9),
                    borderColor: logoColors.primaryBlueAlpha(0.3)
                  }}>
                    {mockFormations.map(formation => (
                      <SelectItem 
                        key={formation.id} 
                        value={formation.id.toString()} 
                        className="text-white hover:opacity-80"
                        style={{ backgroundColor: logoColors.primaryBlueAlpha(0.1) }}
                      >
                        {formation.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Tactics Selection */}
            <Card className="backdrop-blur-lg text-white border" style={{ 
              backgroundColor: logoColors.blackAlpha(0.3),
              borderColor: logoColors.primaryBlueAlpha(0.2)
            }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" style={{ color: logoColors.primaryYellow }} />
                  Tactics Presets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  {selectedTactics.length > 0 ? (
                    selectedTactics.map((tactic, index) => (
                      <div key={index} className="p-2 rounded-lg border" style={{ 
                        backgroundColor: logoColors.primaryBlueAlpha(0.2),
                        borderColor: logoColors.primaryBlueAlpha(0.3)
                      }}>
                        <div className="font-medium text-sm">{tactic.name}</div>
                        <div className="text-xs text-gray-300">{tactic.effect}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400 text-sm">No tactics selected</div>
                  )}
                </div>
                <Button
                  className="w-full text-white border hover:opacity-80 mb-2"
                  style={{ 
                    backgroundColor: logoColors.primaryBlueAlpha(0.4),
                    borderColor: logoColors.primaryBlueAlpha(0.3)
                  }}
                  onClick={() => setShowTacticVisualization(true)}
                >
                  <Target className="h-4 w-4 mr-2" />
                  Tactical Visualization
                </Button>
                <Button
                  className="w-full text-white border hover:opacity-80"
                  style={{ 
                    backgroundColor: logoColors.primaryBlueAlpha(0.4),
                    borderColor: logoColors.primaryBlueAlpha(0.3)
                  }}
                  onClick={() => setShowTacticsSelector(true)}
                >
                  <Target className="h-4 w-4 mr-2" />
                  Manage Presets
                </Button>
              </CardContent>
            </Card>

            {/* Coach Selection */}
            <Card className="backdrop-blur-lg text-white border" style={{ 
              backgroundColor: logoColors.blackAlpha(0.3),
              borderColor: logoColors.primaryBlueAlpha(0.2)
            }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" style={{ color: logoColors.primaryYellow }} />
                  Coach
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedCoach ? (
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={selectedCoach.portrait}
                        alt={selectedCoach.name}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <div className="font-medium">{selectedCoach.name}</div>
                        <div className="text-sm text-gray-300">{selectedCoach.title}</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {selectedCoach.bonuses.description}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {selectedCoach.specialties.map((specialty, index) => (
                        <Badge key={index} variant="outline" className="text-xs text-white" 
                               style={{ 
                                 borderColor: logoColors.primaryBlueAlpha(0.3),
                                 backgroundColor: logoColors.primaryBlueAlpha(0.3)
                               }}>
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm mb-4">No coach selected</div>
                )}
                <Button
                  className="w-full text-white border hover:opacity-80"
                  style={{ 
                    backgroundColor: logoColors.primaryBlueAlpha(0.4),
                    borderColor: logoColors.primaryBlueAlpha(0.3)
                  }}
                  onClick={() => setShowCoachSelector(true)}
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Select Coach
                </Button>
              </CardContent>
            </Card>

            {/* Team Stats */}
            {teamStats && (
              <Card className="backdrop-blur-lg text-white border" style={{ 
                backgroundColor: logoColors.blackAlpha(0.3),
                borderColor: logoColors.primaryBlueAlpha(0.2)
              }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" style={{ color: logoColors.primaryYellow }} />
                    Team Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Players:</span>
                      <Badge variant="outline" className="text-white" 
                             style={{ 
                               borderColor: logoColors.primaryBlueAlpha(0.3),
                               backgroundColor: logoColors.primaryBlueAlpha(0.3)
                             }}>
                        {teamStats.playerCount}/11
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Avg Level:</span>
                      <Badge variant="outline" className="text-black font-bold" 
                             style={{ 
                               borderColor: logoColors.primaryYellow,
                               backgroundColor: logoColors.primaryYellow
                             }}>
                        {teamStats.avgLevel}
                      </Badge>
                    </div>
                    {selectedCoach && (
                      <div className="text-xs text-orange-400">
                        Coach bonuses applied
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span>Kick:</span>
                        <span className="text-red-400">{teamStats.kick}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Control:</span>
                        <span className="text-orange-400">{teamStats.control}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Technique:</span>
                        <span className="text-yellow-400">{teamStats.technique}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Intelligence:</span>
                        <span style={{ color: logoColors.lightBlue }}>{teamStats.intelligence}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pressure:</span>
                        <span className="text-purple-400">{teamStats.pressure}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Agility:</span>
                        <span style={{ color: logoColors.secondaryBlue }}>{teamStats.agility}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Physical:</span>
                        <span className="text-gray-400">{teamStats.physical}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Team Actions */}
            <Card className="bg-black/30 backdrop-blur-lg border-orange-400/20 text-white">
              <CardContent className="p-4 space-y-2">
                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                  onClick={() => setShowLoadTeamModal(true)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Load Team
                </Button>
                <Button
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
                  onClick={() => setShowSaveTeamModal(true)}
                  disabled={Object.keys(teamPlayers).length === 0}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Team
                </Button>
                <Button
                  className="w-full bg-red-800/40 border-red-400/30 hover:bg-red-700/60 text-white"
                  onClick={() => {
                    setTeamPlayers({});
                    setBenchPlayers({});
                  }}
                  disabled={Object.keys(teamPlayers).length === 0 && Object.keys(benchPlayers).length === 0}
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Team
                </Button>
                <Button
                  className="w-full bg-red-900/60 border-red-500/40 hover:bg-red-800/80 text-white"
                  onClick={() => {
                    // Clear all players and bench
                    setTeamPlayers({});
                    setBenchPlayers({});
                    // Clear tactics and reset tactics presets
                    setSelectedTactics([]);
                    setTacticsPresets({
                      1: { name: 'Preset 1', tactics: [] },
                      2: { name: 'Preset 2', tactics: [] }
                    });
                    setCurrentTacticsPreset(1);
                    // Also clear coach and formation
                    setSelectedCoach(null);
                    setSelectedFormation(null);
                    toast.success('All team data cleared!');
                  }}
                  disabled={
                    Object.keys(teamPlayers).length === 0 && 
                    Object.keys(benchPlayers).length === 0 && 
                    selectedTactics.length === 0 && 
                    !selectedCoach && 
                    !selectedFormation
                  }
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Middle Panel - Formation Field */}
          <div className="lg:col-span-2">
            <Card className="bg-black/30 backdrop-blur-lg border-orange-400/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-orange-400" />
                  {selectedFormation.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormationField
                  formation={selectedFormation}
                  teamPlayers={teamPlayers}
                  benchPlayers={benchPlayers}
                  onAddPlayer={handleAddPlayer}
                  onRemovePlayer={handleRemovePlayer}
                  onMovePlayer={handleMovePlayer}
                  onEditPlayer={handleEditPlayer}
                  onAddBenchPlayer={handleAddBenchPlayer}
                  onRemoveBenchPlayer={handleRemoveBenchPlayer}
                  onMoveToBench={handleMoveToBench}
                  onMoveFromBench={handleMoveFromBench}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Bench */}
          <div className="lg:col-span-1">
            <Card className="bg-black/30 backdrop-blur-lg border-orange-400/20 text-white h-[600px] w-20 mt-16">
              <CardHeader className="p-2 pb-1">
                <CardTitle className="flex items-center gap-1 text-xs">
                  <Users className="h-3 w-3 text-orange-400" />
                  <span className="text-xs">({Object.keys(benchPlayers).length}/5)</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[calc(100%-2.5rem)] p-2">
                <div className="h-full flex flex-col justify-between">
                  {Array.from({ length: 5 }, (_, index) => (
                    <BenchSlot
                      key={index}
                      slotIndex={index}
                      player={benchPlayers[index]}
                      onAddBenchPlayer={handleAddBenchPlayer}
                      onRemoveBenchPlayer={handleRemoveBenchPlayer}
                      onMoveToBench={handleMoveToBench}
                      onMoveFromBench={handleMoveFromBench}
                      onEditPlayer={handleEditPlayer}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modals */}
        {showPlayerSearch && (
          <PlayerSearch
            isOpen={showPlayerSearch}
            onClose={() => {
              setShowPlayerSearch(false);
              setTeamBuildingMode(false);
            }}
            onPlayerSelect={handlePlayerSelect}
            position={selectedPosition}
            selectedPlayerIds={getCurrentlySelectedPlayerIds()}
            teamBuildingMode={teamBuildingMode}
            currentFormation={selectedFormation}
            onTeamBuilt={handleTeamBuilt}
            currentTeamPlayers={teamPlayers}
            currentBenchPlayers={benchPlayers}
          />
        )}

        {showTacticsSelector && (
          <TacticsSelector
            isOpen={showTacticsSelector}
            onClose={() => setShowTacticsSelector(false)}
            onTacticSelect={handleTacticsSelect}
            selectedTactics={selectedTactics}
            presets={tacticsPresets}
            currentPreset={currentTacticsPreset}
            onPresetsUpdate={handleTacticsPresetUpdate}
          />
        )}

        {showTacticVisualization && (
          <TacticVisualizationModal
            isOpen={showTacticVisualization}
            onClose={() => setShowTacticVisualization(false)}
            onTacticSelect={handleTacticsSelect}
            selectedTactics={selectedTactics}
          />
        )}

        {showCoachSelector && (
          <CoachSelector
            isOpen={showCoachSelector}
            onClose={() => setShowCoachSelector(false)}
            onCoachSelect={handleCoachSelect}
            selectedCoach={selectedCoach}
          />
        )}

        {showSaveTeamModal && (
          <SaveTeamModal
            isOpen={showSaveTeamModal}
            onClose={() => setShowSaveTeamModal(false)}
            onSave={handleSaveTeam}
          />
        )}

        {showLoadTeamModal && (
          <LoadTeamModal
            isOpen={showLoadTeamModal}
            onClose={() => setShowLoadTeamModal(false)}
            onLoadTeam={handleLoadTeam}
          />
        )}

        {showCharacterModal && selectedCharacterForModal && (
          <CharacterModal
            character={selectedCharacterForModal}
            isOpen={showCharacterModal}
            onClose={() => {
              setShowCharacterModal(false);
              setSelectedCharacterForModal(null);
              setEditingPlayer(null);
            }}
            allCharacters={mockCharacters}
            onAddToTeam={handleCharacterModalConfirm}
            teamBuildingMode={false}
          />
        )}
      </div>
    </div>
  );
};

export default TeamBuilder;