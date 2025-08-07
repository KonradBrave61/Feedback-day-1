import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { 
  Plus, 
  Users, 
  Trophy, 
  Target, 
  Settings,
  Save,
  Trash2,
  RotateCcw,
  Upload
} from 'lucide-react';
import { logoColors } from '../styles/colors';
import { mockFormations, mockTactics, mockCoaches } from '../data/mock';
import FormationField from '../components/FormationField';
import PlayerSearch from '../components/PlayerSearch';
import CharacterModal from '../components/CharacterModal';
import EnhancedSaveTeamModal from '../components/EnhancedSaveTeamModal';
import LoadTeamModal from '../components/LoadTeamModal';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import TacticVisualizationModal from '../components/TacticVisualizationModal';

const TeamBuilder = () => {
  const { user, saveTeam } = useAuth();
  
  // Formation and tactical setup
  const [selectedFormation, setSelectedFormation] = useState(mockFormations[0]);
  const [selectedTactics, setSelectedTactics] = useState([]);
  const [selectedCoach, setSelectedCoach] = useState(null);
  
  // Team composition
  const [teamPlayers, setTeamPlayers] = useState({});
  const [benchPlayers, setBenchPlayers] = useState({});
  
  // Modal states
  const [showPlayerSearch, setShowPlayerSearch] = useState(false);
  const [showTeamBuilderSearch, setShowTeamBuilderSearch] = useState(false);
  const [showCharacterModal, setShowCharacterModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [showTacticsModal, setShowTacticsModal] = useState(false);
  const [showCoachModal, setShowCoachModal] = useState(false);
  
  // Current editing context
  const [editingPosition, setEditingPosition] = useState(null);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [isProcessingPlayer, setIsProcessingPlayer] = useState(false);

  const handlePlayerSelect = (player) => {
    // Check if player is already selected
    if (isPlayerAlreadySelected(player.id)) {
      toast.warning('This player is already in your team or on the bench!');
      return;
    }
    
    // Open character modal for configuration
    setEditingPlayer(player);
    setShowCharacterModal(true);
    setShowPlayerSearch(false);
  };

  // Helper function to get currently selected player IDs
  const getCurrentlySelectedPlayerIds = () => {
    if (!teamPlayers || !benchPlayers) return [];
    
    const teamPlayerIds = Object.values(teamPlayers)
      .filter(player => player && player.id)
      .map(player => player.id);
    
    const benchPlayerIds = Object.values(benchPlayers)
      .filter(player => player && player.id)
      .map(player => player.id);
    
    return [...teamPlayerIds, ...benchPlayerIds];
  };

  const handleQuickTeamBuilder = (builtTeam) => {
    if (builtTeam.players) {
      setTeamPlayers(builtTeam.players);
    }
    if (builtTeam.bench) {
      setBenchPlayers(builtTeam.bench);
    }
    
    const totalPlayers = Object.keys(builtTeam.players || {}).length + Object.keys(builtTeam.bench || {}).length;
    toast.success(`Team applied successfully! Added ${totalPlayers} players to your squad.`);
  };

  // Check if a player is already selected in team or bench
  const isPlayerAlreadySelected = (playerId) => {
    if (!playerId) return false;
    return getCurrentlySelectedPlayerIds().includes(playerId);
  };

  const handleAddPlayer = (positionId) => {
    setEditingPosition(positionId);
    setShowPlayerSearch(true);
  };

  const handleEditPlayer = (player) => {
    // Check if it's a bench player
    const benchSlot = Object.keys(benchPlayers).find(slot => benchPlayers[slot] && benchPlayers[slot].id === player.id);
    
    if (benchSlot !== undefined) {
      // Bench player editing
      setEditingPlayer(player);
      setEditingPosition(`bench_${benchSlot}`);
    } else {
      // Regular field player editing
      setEditingPlayer(player);
      setEditingPosition(null);
    }
    
    setShowCharacterModal(true);
  };

  const handleRemovePlayer = (positionId) => {
    if (positionId.startsWith('bench_')) {
      const benchSlot = positionId.replace('bench_', '');
      setBenchPlayers(prev => {
        const newBench = { ...prev };
        delete newBench[benchSlot];
        return newBench;
      });
    } else {
      setTeamPlayers(prev => {
        const newTeam = { ...prev };
        delete newTeam[positionId];
        return newTeam;
      });
    }
  };

  const handleCharacterModalSave = (character, userLevel, userRarity, equipment, hissatsu) => {
    setIsProcessingPlayer(true);

    // Create enhanced player with user configurations
    const enhancedPlayer = {
      ...character,
      userLevel,
      userRarity,
      userEquipment: equipment,
      userHissatsu: hissatsu
    };

    // Double-check for duplicates before saving
    const currentPlayerIds = getCurrentlySelectedPlayerIds();
    const currentBenchPlayerIds = Object.values(benchPlayers).map(p => p.id);
    const currentTeamPlayerIds = Object.values(teamPlayers).map(p => p.id);
    
    if (currentTeamPlayerIds.includes(character.id) || currentBenchPlayerIds.includes(character.id)) {
      toast.warning('This player is already in your team or on the bench!');
      setIsProcessingPlayer(false);
      return;
    }

    if (editingPosition) {
      if (editingPosition.startsWith('bench_')) {
        // Handle bench player
        const benchSlot = editingPosition.replace('bench_', '');
        setBenchPlayers(prev => ({
          ...prev,
          [benchSlot]: enhancedPlayer
        }));
      } else {
        // Handle field position
        setTeamPlayers(prev => ({
          ...prev,
          [editingPosition]: enhancedPlayer
        }));
      }
    } else if (selectedFormation) {
      // Auto-assign to best available position
      const assignedPosition = autoAssignPosition(character);
      
      if (assignedPosition) {
        setTeamPlayers(prev => ({
          ...prev,
          [assignedPosition]: enhancedPlayer
        }));
      } else {
        // Try to add to bench - find first available slot
        let foundBenchSlot = false;
        for (let i = 0; i < 5; i++) {
          if (!benchPlayers[i]) {
            setBenchPlayers(prev => ({
              ...prev,
              [i]: enhancedPlayer
            }));
            foundBenchSlot = true;
            break;
          }
        }
        
        if (!foundBenchSlot) {
          toast.error('Please select a specific position on the field or use the position-specific add buttons.');
          setIsProcessingPlayer(false);
          return;
        }
      }
    } else {
      // No specific position - user needs to select during modal or find best fit
      // For now, we'll show message to select a specific position
      toast.warning('Please select a specific position on the field or use the position-specific add buttons.');
      setIsProcessingPlayer(false);
      return;
    }

    // Reset states
    setShowCharacterModal(false);
    setEditingPlayer(null);
    setEditingPosition(null);
    setIsProcessingPlayer(false);
  };

  // Auto-assign player to best position
  const autoAssignPosition = (player) => {
    if (!selectedFormation) return null;

    // First, try to find an empty position that matches the player's position
    const matchingPositions = selectedFormation.positions.filter(
      pos => pos.position === player.position && !teamPlayers[pos.id]
    );

    if (matchingPositions.length > 0) {
      return matchingPositions[0].id;
    }

    // If no exact position match available, try ANY available formation position
    const anyAvailablePositions = selectedFormation.positions.filter(
      pos => !teamPlayers[pos.id]
    );

    if (anyAvailablePositions.length > 0) {
      return anyAvailablePositions[0].id;
    }

    return null; // All positions filled
  };

  const handleFormationChange = (formation) => {
    if (!selectedFormation) {
      setSelectedFormation(formation);
      return;
    }

    // When changing formations, keep players that can fit in new formation
    const newTeamPlayers = {};
    
    // Try to preserve as many players as possible
    const newPositions = formation.positions;
    const currentPlayers = Object.entries(teamPlayers);
    
    // First, try to place players in matching positions
    currentPlayers.forEach(([oldPositionId, player]) => {
      if (!player) return;
      
      const oldPosition = selectedFormation.positions.find(p => p.id === oldPositionId);
      if (!oldPosition) return;
      
      // Try to find a matching position in new formation
      const matchingNewPosition = newPositions.find(
        pos => pos.position === oldPosition.position && !newTeamPlayers[pos.id]
      );
      
      if (matchingNewPosition) {
        newTeamPlayers[matchingNewPosition.id] = player;
      }
    });
    
    // Then, try to fit remaining players in any available spots
    currentPlayers.forEach(([oldPositionId, player]) => {
      if (!player) return;
      
      // Skip if player is already placed
      if (Object.values(newTeamPlayers).some(p => p?.id === player.id)) return;
      
      // Find any available position
      const availablePosition = newPositions.find(pos => !newTeamPlayers[pos.id]);
      if (availablePosition) {
        newTeamPlayers[availablePosition.id] = player;
      }
    });
    
    setTeamPlayers(newTeamPlayers);
    setSelectedFormation(formation);
  };

  const handleTacticToggle = (tactic) => {
    setSelectedTactics(prev => {
      const isSelected = prev.some(t => t.id === tactic.id);
      if (isSelected) {
        return prev.filter(t => t.id !== tactic.id);
      } else {
        // Limit to 2 tactics
        if (prev.length >= 2) {
          toast.warning('You can only select up to 2 tactics at a time.');
          return prev;
        }
        return [...prev, tactic];
      }
    });
  };

  const getTeamStats = () => {
    const players = Object.values(teamPlayers).filter(p => p);
    if (players.length === 0) return { total: 0, average: 0, breakdown: {} };

    const stats = {
      kick: 0,
      control: 0,
      technique: 0,
      intelligence: 0,
      pressure: 0,
      agility: 0,
      physical: 0
    };

    let totalPlayers = 0;

    players.forEach(player => {
      // Base stats from player level and rarity
      const baseStats = player.calculatedStats || player.stats || {};
      
      // Equipment bonuses
      let equipmentBonus = {};
      if (player.userEquipment) {
        Object.values(player.userEquipment).forEach(equipment => {
          if (equipment && equipment.stats) {
            Object.entries(equipment.stats).forEach(([stat, value]) => {
              equipmentBonus[stat] = (equipmentBonus[stat] || 0) + value;
            });
          }
        });
      }

      // Add to team totals
      Object.keys(stats).forEach(stat => {
        const baseStat = baseStats[stat] || 0;
        const equipBonus = equipmentBonus[stat] || 0;
        stats[stat] += baseStat + equipBonus;
      });

      totalPlayers++;
    });

    const total = Object.values(stats).reduce((sum, val) => sum + val, 0);
    const average = totalPlayers > 0 ? Math.round(total / totalPlayers / 7) : 0;

    return { total, average, breakdown: stats, playerCount: totalPlayers };
  };

  const handleSaveTeam = async (teamData) => {
    try {
      // Prepare team data for saving
      const saveData = {
        ...teamData,
        formation_id: selectedFormation?.id,
        formation_name: selectedFormation?.name,
        players: Object.entries(teamPlayers)
          .filter(([_, player]) => player)
          .map(([positionId, player]) => ({
            character_id: player.id,
            position_id: positionId,
            user_level: player.userLevel || player.baseLevel || 1,
            user_rarity: player.userRarity || player.baseRarity || 1,
            user_equipment: player.userEquipment || {},
            user_hissatsu: player.userHissatsu || { preset1: [], preset2: [] }
          })),
        bench_players: Object.entries(benchPlayers)
          .filter(([_, player]) => player)
          .map(([slot, player]) => ({
            character_id: player.id,
            slot_id: `bench_${slot}`,
            user_level: player.userLevel || player.baseLevel || 1,
            user_rarity: player.userRarity || player.baseRarity || 1,
            user_equipment: player.userEquipment || {},
            user_hissatsu: player.userHissatsu || { preset1: [], preset2: [] }
          })),
        tactics: selectedTactics.map(t => ({ id: t.id, name: t.name })),
        coach: selectedCoach ? { id: selectedCoach.id, name: selectedCoach.name } : null
      };

      const result = await saveTeam(saveData);
      return { success: true, team: result.team };
    } catch (error) {
      console.error('Error in handleSaveTeam:', error);
      throw error;
    }
  };

  const handleLoadTeam = (teamData) => {
    try {
      console.log('Loading team data:', teamData);
      
      // Load formation
      if (teamData.formation_id) {
        const formation = mockFormations.find(f => f.id === teamData.formation_id);
        if (formation) {
          setSelectedFormation(formation);
        }
      }
      
      // Load tactics
      if (teamData.tactics && Array.isArray(teamData.tactics)) {
        const tacticObjects = teamData.tactics.map(tacticData => {
          if (typeof tacticData === 'object' && tacticData.id) {
            return mockTactics.find(t => t.id === tacticData.id);
          }
          return mockTactics.find(t => t.id === tacticData);
        }).filter(Boolean);
        setSelectedTactics(tacticObjects);
      }
      
      // Load coach
      if (teamData.coach && teamData.coach.id) {
        const coach = mockCoaches.find(c => c.id === teamData.coach.id);
        if (coach) {
          setSelectedCoach(coach);
        }
      }
      
      // Load main team players
      if (teamData.players && Array.isArray(teamData.players)) {
        const newTeamPlayers = {};
        teamData.players.forEach(playerData => {
          if (playerData.character_id && playerData.position_id) {
            // Create player object with loaded configuration
            const enhancedPlayer = {
              id: playerData.character_id,
              userLevel: playerData.user_level,
              userRarity: playerData.user_rarity,
              userEquipment: playerData.user_equipment || {},
              userHissatsu: playerData.user_hissatsu || { preset1: [], preset2: [] },
              // Add other character data here - you may need to fetch full character data
              name: playerData.name || `Player ${playerData.character_id}`,
              position: playerData.position || 'MF',
              element: playerData.element || 'Wind'
            };
            newTeamPlayers[playerData.position_id] = enhancedPlayer;
          }
        });
        setTeamPlayers(newTeamPlayers);
      }
      
      // Load bench players
      if (teamData.bench_players && Array.isArray(teamData.bench_players)) {
        const newBenchPlayers = {};
        teamData.bench_players.forEach(playerData => {
          if (playerData.character_id && playerData.slot_id) {
            const slotIndex = playerData.slot_id.replace('bench_', '');
            const enhancedPlayer = {
              id: playerData.character_id,
              userLevel: playerData.user_level,
              userRarity: playerData.user_rarity,
              userEquipment: playerData.user_equipment || {},
              userHissatsu: playerData.user_hissatsu || { preset1: [], preset2: [] },
              name: playerData.name || `Player ${playerData.character_id}`,
              position: playerData.position || 'MF',
              element: playerData.element || 'Wind'
            };
            newBenchPlayers[slotIndex] = enhancedPlayer;
          }
        });
        setBenchPlayers(newBenchPlayers);
      }
      
      toast.success('Team loaded successfully!');
    } catch (error) {
      console.error('Error loading team:', error);
      toast.error('Failed to load team');
    }
  };

  const handleClearAll = () => {
    setTeamPlayers({});
    setBenchPlayers({});
    setSelectedTactics([]);
    setSelectedCoach(null);
    setSelectedFormation(mockFormations[0]); // Reset to default formation instead of null
    toast.success('Team cleared successfully!');
  };

  const teamStats = getTeamStats();

  return (
    <div className="min-h-screen" style={{ background: logoColors.backgroundGradient }}>
      <Navigation />
      
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Team Builder</h1>
          <p className="text-gray-300">Create and customize your ultimate team</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-1 space-y-4">
            {/* Quick Actions */}
            <Card className="backdrop-blur-lg text-white border"
                  style={{ 
                    backgroundColor: logoColors.blackAlpha(0.3),
                    borderColor: logoColors.primaryBlueAlpha(0.2)
                  }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5" style={{ color: logoColors.primaryBlue }} />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  className="w-full text-white hover:opacity-80"
                  style={{ background: logoColors.yellowOrangeGradient, color: logoColors.black }}
                  onClick={() => setShowTeamBuilderSearch(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Quick Team Builder
                </Button>
              </CardContent>
            </Card>

            {/* Formation Selection */}
            <Card className="backdrop-blur-lg text-white border"
                  style={{ 
                    backgroundColor: logoColors.blackAlpha(0.3),
                    borderColor: logoColors.primaryBlueAlpha(0.2)
                  }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5" style={{ color: logoColors.primaryYellow }} />
                  Formation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select 
                  value={selectedFormation?.id.toString() || ''} 
                  onValueChange={(value) => {
                    const formation = mockFormations.find(f => f.id.toString() === value);
                    if (formation) handleFormationChange(formation);
                  }}
                >
                  <SelectTrigger className="text-white border"
                                style={{ 
                                  backgroundColor: logoColors.blackAlpha(0.3),
                                  borderColor: logoColors.primaryBlueAlpha(0.3)
                                }}>
                    <SelectValue placeholder="Select Formation" />
                  </SelectTrigger>
                  <SelectContent style={{ backgroundColor: logoColors.blackAlpha(0.9) }}>
                    {mockFormations.map(formation => (
                      <SelectItem 
                        key={formation.id} 
                        value={formation.id.toString()} 
                        className="text-white hover:bg-blue-800"
                      >
                        {formation.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Tactics Presets */}
            <Card className="backdrop-blur-lg text-white border"
                  style={{ 
                    backgroundColor: logoColors.blackAlpha(0.3),
                    borderColor: logoColors.primaryBlueAlpha(0.2)
                  }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5" style={{ color: logoColors.primaryOrange }} />
                  Tactics Presets
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-gray-400 text-sm mb-3">
                  {selectedTactics.length > 0 ? 
                    selectedTactics.map(t => t.name).join(', ') : 
                    'No tactics selected'
                  }
                </div>
                <Button 
                  variant="outline"
                  className="w-full text-white border hover:opacity-80"
                  style={{ 
                    backgroundColor: logoColors.primaryBlue, 
                    borderColor: logoColors.primaryBlue,
                    color: 'white'
                  }}
                  onClick={() => {
                    // Tactical Visualization functionality
                    toast.info('Opening tactical visualization...');
                  }}
                >
                  Tactical Visualization
                </Button>
                <Button 
                  variant="outline"
                  className="w-full text-white border hover:opacity-80"
                  style={{ 
                    backgroundColor: logoColors.primaryBlue, 
                    borderColor: logoColors.primaryBlue,
                    color: 'white'
                  }}
                  onClick={() => {
                    // Manage Presets functionality - show tactics selection
                    setShowTacticsModal(true);
                  }}
                >
                  Manage Presets
                </Button>
              </CardContent>
            </Card>

            {/* Coach Selection */}
            <Card className="backdrop-blur-lg text-white border"
                  style={{ 
                    backgroundColor: logoColors.blackAlpha(0.3),
                    borderColor: logoColors.primaryBlueAlpha(0.2)
                  }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" style={{ color: logoColors.primaryYellow }} />
                  Coach
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-gray-400 text-sm mb-3">
                  {selectedCoach ? selectedCoach.name : 'No coach selected'}
                </div>
                <Button 
                  variant="outline"
                  className="w-full text-white border hover:opacity-80"
                  style={{ 
                    backgroundColor: logoColors.primaryBlue, 
                    borderColor: logoColors.primaryBlue,
                    color: 'white'
                  }}
                  onClick={() => {
                    setShowCoachModal(true);
                  }}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Select Coach
                </Button>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button 
                className="w-full text-white hover:opacity-80"
                style={{ 
                  backgroundColor: logoColors.primaryBlue, 
                  color: 'white'
                }}
                onClick={() => setShowLoadModal(true)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Load Team
              </Button>
              
              <Button 
                className="w-full text-white hover:opacity-80"
                style={{ 
                  backgroundColor: '#dc2626', 
                  color: 'white'
                }}
                onClick={() => setShowSaveModal(true)}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Team
              </Button>
              
              <Button 
                variant="outline"
                className="w-full bg-transparent border-gray-500/40 hover:bg-gray-800/20 text-white hover:text-white"
                onClick={handleClearAll}
                disabled={!selectedFormation}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Team
              </Button>
              
              <Button 
                variant="outline"
                className="w-full bg-transparent border-gray-500/40 hover:bg-gray-800/20 text-white hover:text-white"
                onClick={handleClearAll}
                disabled={!selectedFormation}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          </div>

          {/* Center Panel - Formation Field */}
          <div className="lg:col-span-2">
            <Card className="backdrop-blur-lg text-white border"
                  style={{ 
                    backgroundColor: logoColors.blackAlpha(0.3),
                    borderColor: logoColors.primaryBlueAlpha(0.2)
                  }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5" style={{ color: logoColors.primaryBlue }} />
                  {selectedFormation ? selectedFormation.name : 'Select Formation'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {selectedFormation ? (
                  <FormationField
                    formation={selectedFormation}
                    players={teamPlayers}
                    benchPlayers={benchPlayers}
                    onAddPlayer={handleAddPlayer}
                    onEditPlayer={handleEditPlayer}
                    onRemovePlayer={handleRemovePlayer}
                    selectedTactics={selectedTactics}
                    selectedCoach={selectedCoach}
                  />
                ) : (
                  <div className="h-[600px] flex items-center justify-center">
                    <div className="text-center">
                      <Target className="h-12 w-12 mx-auto mb-4" style={{ color: logoColors.primaryBlue }} />
                      <p className="text-gray-400">Select a formation to start building your team</p>
                      <Button 
                        className="mt-4 text-white hover:opacity-80"
                        style={{ background: logoColors.yellowOrangeGradient, color: logoColors.black }}
                        onClick={() => setSelectedFormation(mockFormations[0])}
                      >
                        Choose Default Formation
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Player Count Display - Like Target */}
            <div className="mt-4 text-center">
              <p className="text-white font-medium text-lg">
                {selectedFormation ? selectedFormation.name : '4-4-2 Diamond'}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                {teamStats.playerCount}/11 players
              </p>
              <p className="text-gray-500 text-xs">
                ({Object.keys(benchPlayers).filter(key => benchPlayers[key]).length}/5)
              </p>
            </div>
          </div>

          {/* Right Panel - Bench */}
          <div className="lg:col-span-1">
            <Card className="backdrop-blur-lg text-white border"
                  style={{ 
                    backgroundColor: logoColors.blackAlpha(0.3),
                    borderColor: logoColors.primaryBlueAlpha(0.2)
                  }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" style={{ color: logoColors.lightBlue }} />
                  ({Object.keys(benchPlayers).filter(key => benchPlayers[key]).length}/5)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Array.from({ length: 5 }, (_, index) => {
                    const player = benchPlayers[index];
                    return (
                      <div key={index} className="relative">
                        {player ? (
                          <div className="w-full h-12 border-2 border-blue-400 bg-blue-400/20 rounded-lg flex items-center justify-center">
                            <span className="text-white font-medium text-sm">{player.name}</span>
                          </div>
                        ) : (
                          <div 
                            className="w-full h-12 border-2 border-dashed border-gray-500 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400"
                            onClick={() => {
                              setEditingPosition(`bench_${index}`);
                              setShowPlayerSearch(true);
                            }}
                          >
                            <Plus className="h-6 w-6 text-gray-500" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showPlayerSearch && (
        <PlayerSearch
          isOpen={showPlayerSearch}
          onClose={() => {
            setShowPlayerSearch(false);
            setEditingPosition(null);
          }}
          onPlayerSelect={handlePlayerSelect}
          position={editingPosition}
          selectedPlayerIds={getCurrentlySelectedPlayerIds()}
        />
      )}

      {showTeamBuilderSearch && (
        <PlayerSearch
          isOpen={showTeamBuilderSearch}
          onClose={() => setShowTeamBuilderSearch(false)}
          teamBuildingMode={true}
          currentFormation={selectedFormation}
          onTeamBuilt={handleQuickTeamBuilder}
          currentTeamPlayers={teamPlayers}
          currentBenchPlayers={benchPlayers}
        />
      )}

      {showCharacterModal && editingPlayer && (
        <CharacterModal
          character={editingPlayer}
          isOpen={showCharacterModal}
          onClose={() => {
            setShowCharacterModal(false);
            setEditingPlayer(null);
            setEditingPosition(null);
          }}
          onAddToTeam={handleCharacterModalSave}
        />
      )}

      {showSaveModal && (
        <EnhancedSaveTeamModal
          isOpen={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          onSave={handleSaveTeam}
          teamData={{
            formation: selectedFormation?.name,
            players: Object.keys(teamPlayers).length,
            bench: Object.keys(benchPlayers).length,
            tactics: selectedTactics.length
          }}
        />
      )}

      {showLoadModal && (
        <LoadTeamModal
          isOpen={showLoadModal}
          onClose={() => setShowLoadModal(false)}
          onLoadTeam={handleLoadTeam}
        />
      )}

      {/* Tactics Selection Modal */}
      {showTacticsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto backdrop-blur-lg text-white border"
                style={{ 
                  backgroundColor: logoColors.blackAlpha(0.9),
                  borderColor: logoColors.primaryBlueAlpha(0.3)
                }}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Manage Tactics Presets ({selectedTactics.length}/2)</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTacticsModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockTactics.map(tactic => {
                  const isSelected = selectedTactics.some(t => t.id === tactic.id);
                  return (
                    <div
                      key={tactic.id}
                      className={`p-3 rounded border cursor-pointer transition-all hover:opacity-80 ${
                        isSelected ? 'border-orange-400 bg-orange-400/20' : 'border-gray-600 hover:border-gray-400'
                      }`}
                      onClick={() => handleTacticToggle(tactic)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-white">{tactic.name}</p>
                          <p className="text-sm text-gray-400">{tactic.effect}</p>
                        </div>
                        <div className="text-2xl">{tactic.icon}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Coach Selection Modal */}
      {showCoachModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto backdrop-blur-lg text-white border"
                style={{ 
                  backgroundColor: logoColors.blackAlpha(0.9),
                  borderColor: logoColors.primaryBlueAlpha(0.3)
                }}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Select Coach</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCoachModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockCoaches.map(coach => (
                  <div
                    key={coach.id}
                    className="p-3 rounded border cursor-pointer transition-all hover:border-gray-400 border-gray-600"
                    onClick={() => {
                      setSelectedCoach(coach);
                      setShowCoachModal(false);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full border-2 flex items-center justify-center"
                           style={{
                             backgroundColor: logoColors.primaryYellow,
                             borderColor: logoColors.primaryOrange,
                             color: logoColors.black
                           }}>
                        👨‍💼
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-white">{coach.name}</p>
                        <p className="text-sm text-gray-400">{coach.title}</p>
                        <p className="text-xs text-gray-500">{coach.specialties}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TeamBuilder;