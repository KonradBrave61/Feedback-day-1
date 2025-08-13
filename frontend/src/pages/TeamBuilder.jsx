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
  User,
  Trophy, 
  Target, 
  Settings,
  Save,
  Trash2,
  RotateCcw,
  Upload,
  Check,
  X,
  Zap,
  Eye,
  Settings2
} from 'lucide-react';
import { logoColors } from '../styles/colors';
import { mockFormations, mockTactics, mockCoaches, mockCharacters } from '../data/mock';
import FormationField from '../components/FormationField';
// Drag and Drop hooks are already available in this file's scope because FormationField uses react-dnd in App provider
import { useDrag, useDrop } from 'react-dnd';
import PlayerSearch from '../components/PlayerSearch';
import CharacterModal from '../components/CharacterModal';
import TacticVisualizationModal from '../components/TacticVisualizationModal';
import CoachSelector from '../components/CoachSelector';
import TacticsSelector from '../components/TacticsSelector';
import { toast } from 'sonner';
import EnhancedSaveTeamModal from '../components/EnhancedSaveTeamModal';
import LoadTeamModal from '../components/LoadTeamModal';
import { useAuth } from '../contexts/AuthContext';

const TeamBuilder = () => {
  const { user, saveTeam, loadTeamDetails } = useAuth();
  
  // Formation and tactical setup
  const [selectedFormation, setSelectedFormation] = useState(mockFormations[0]);
  const [selectedTactics, setSelectedTactics] = useState([]);
  const [selectedCoach, setSelectedCoach] = useState(null);
  
  // Preset management
  const [tacticPresets, setTacticPresets] = useState({
    1: { name: "Preset 1", tactics: [], isActive: true },
    2: { name: "Preset 2", tactics: [], isActive: false }
  });
  const [currentPreset, setCurrentPreset] = useState(1);
  
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
  
  // Helper functions for preset management
  const handlePresetsUpdate = (updatedPresets, newCurrentPreset) => {
    setTacticPresets(updatedPresets);
    setCurrentPreset(newCurrentPreset);
  };

  const handleTacticSelect = (tactics) => {
    setSelectedTactics(tactics);
  };

  const [showCoachModal, setShowCoachModal] = useState(false);
  const [showTacticVisualizationModal, setShowTacticVisualizationModal] = useState(false);
  
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
    // Detect if it's a bench player first
    const benchSlot = Object.keys(benchPlayers).find(slot => benchPlayers[slot] && benchPlayers[slot].id === player.id);

    if (benchSlot !== undefined) {
      // Bench player editing
      setEditingPlayer(player);
      setEditingPosition(`bench_${benchSlot}`);
    } else {
      // Regular field player editing — find the positionId this player currently occupies
      const positionId = Object.keys(teamPlayers).find(posId => teamPlayers[posId] && teamPlayers[posId].id === player.id);
      setEditingPlayer(player);
      // If found, set to that position so we update in place; otherwise null
      setEditingPosition(positionId || null);
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

  // Bench helpers
  const handleRemoveBenchPlayer = (index) => {
    setBenchPlayers(prev => {
      const nb = { ...prev };
      delete nb[index];
      return nb;
    });
  };

  const handleAddBenchPlayer = (index) => {
    setEditingPosition(`bench_${index}`);
    setShowPlayerSearch(true);
  };

  // Bench row with drag + drop, preserves original design but allows dropping from formation and bench
  const BenchRow = ({ index, player }) => {
    const [{ isDragging }, drag] = useDrag({
      type: 'PLAYER',
      item: { player, fromPosition: index, fromType: 'bench' },
      collect: (monitor) => ({ isDragging: monitor.isDragging() }),
      canDrag: !!player,
    });

    const [{ isOver }, drop] = useDrop({
      accept: 'PLAYER',
      drop: (draggedItem) => {
        if (draggedItem.fromType === 'formation') {
          // Move formation player to this bench index (swap if occupied)
          handleMoveToBench(draggedItem.fromPosition, index, !!player);
        } else if (draggedItem.fromType === 'bench' && draggedItem.fromPosition !== index) {
          // Move/swap within bench
          handleMoveBenchToBench(draggedItem.fromPosition, index);
        }
      },
      collect: (monitor) => ({ isOver: monitor.isOver() }),
    });

    const attachDragDrop = (el) => {
      drag(drop(el));
    };

    return (
      <div ref={attachDragDrop} className={`relative group ${isDragging ? 'opacity-50' : ''}`}>
        <div
          className={`w-full rounded-lg border ${isOver ? 'border-blue-400' : 'border-blue-500/30'} bg-blue-800/20 hover:bg-blue-800/30 p-2 flex items-center gap-3 cursor-pointer transition-colors`}
          onClick={() => handleEditPlayer(player)}
        >
          <div className="w-10 h-10 rounded-full overflow-hidden ring-1 ring-blue-400/40 flex items-center justify-center bg-blue-900/40">
            {player?.portrait ? (
              <img src={player.portrait} alt={player.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-sm font-bold">{player?.name ? player.name.charAt(0) : 'P'}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-white font-medium truncate">{player?.name}</div>
            <div className="text-xs text-gray-300 truncate">{player?.element || '—'} • {player?.position || '—'}</div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-7 h-7 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ backgroundColor: logoColors.primaryBlueAlpha(0.6), color: logoColors.white }}
              onClick={(e) => { e.stopPropagation(); handleEditPlayer(player); }}
              title="Edit"
            >
              <Settings className="h-3 w-3" />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="w-7 h-7 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => { e.stopPropagation(); handleRemoveBenchPlayer(index); }}
              title="Remove from bench"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Empty bench slot – drop target for formation and bench players
  const EmptyBenchSlot = ({ index }) => {
    const [{ isOver }, drop] = useDrop({
      accept: 'PLAYER',
      drop: (draggedItem) => {
        if (draggedItem.fromType === 'formation') {
          handleMoveToBench(draggedItem.fromPosition, index, false);
        } else if (draggedItem.fromType === 'bench' && draggedItem.fromPosition !== index) {
          handleMoveBenchToBench(draggedItem.fromPosition, index);
        }
      },
      collect: (monitor) => ({ isOver: monitor.isOver() }),
    });

    return (
      <div 
        ref={drop}
        className={`flex items-center gap-3 cursor-pointer transition-opacity ${isOver ? 'opacity-90' : 'hover:opacity-80'}`}
        onClick={() => {
          setEditingPosition(`bench_${index}`);
          setShowPlayerSearch(true);
        }}
      >
        <div className={`w-12 h-12 border-2 border-dashed ${isOver ? 'border-blue-400' : 'border-gray-400'} rounded-full flex items-center justify-center`}>
          <Plus className="h-6 w-6 text-gray-400" />
        </div>
        <span className="text-gray-400 text-sm">Empty slot</span>
      </div>
    );
  };

  // Move player within formation (swap or move)
  const handleMovePlayer = (fromPositionId, toPositionId) => {
    if (!fromPositionId || !toPositionId || fromPositionId === toPositionId) return;
    const fromPlayer = teamPlayers[fromPositionId];
    const toPlayer = teamPlayers[toPositionId];
    if (!fromPlayer) return;

    const updated = { ...teamPlayers };
    updated[toPositionId] = fromPlayer;
    if (toPlayer) {
      // swap
      updated[fromPositionId] = toPlayer;
    } else {
      delete updated[fromPositionId];
    }
    setTeamPlayers(updated);
  };
  // Move or swap bench-to-bench
  const handleMoveBenchToBench = (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    const fromPlayer = benchPlayers[fromIndex];
    const toPlayer = benchPlayers[toIndex];
    const newBench = { ...benchPlayers };
    newBench[toIndex] = fromPlayer;
    if (toPlayer) {
      newBench[fromIndex] = toPlayer;
    } else {
      delete newBench[fromIndex];
    }
    setBenchPlayers(newBench);
  };


  // Move player from bench to field (optionally swap with existing field player)
  const handleMoveFromBench = (benchIndex, toPositionId, swap = false) => {
    const index = typeof benchIndex === 'string' ? parseInt(benchIndex, 10) : benchIndex;
    const benchPlayer = benchPlayers[index];
    if (!benchPlayer || !toPositionId) return;

    const fieldPlayer = teamPlayers[toPositionId];

    // Update field
    setTeamPlayers({
      ...teamPlayers,
      [toPositionId]: benchPlayer,
    });

    // Update bench
    if (swap && fieldPlayer) {
      setBenchPlayers({
        ...benchPlayers,
        [index]: fieldPlayer,
      });
    } else {
      const newBench = { ...benchPlayers };
      delete newBench[index];
      setBenchPlayers(newBench);
    }
  };

  // Move player from field to bench (optionally swap with existing bench player)
  const handleMoveToBench = (fromPositionId, benchIndex, swap = false) => {
    const index = typeof benchIndex === 'string' ? parseInt(benchIndex, 10) : benchIndex;
    const fromPlayer = teamPlayers[fromPositionId];
    if (!fromPlayer) return;

    const benchPlayer = benchPlayers[index];

    // Update bench
    const newBench = { ...benchPlayers };
    newBench[index] = fromPlayer;
    setBenchPlayers(newBench);

    // Update field
    const newTeam = { ...teamPlayers };
    if (swap && benchPlayer) {
      newTeam[fromPositionId] = benchPlayer;
    } else {
      delete newTeam[fromPositionId];
    }
    setTeamPlayers(newTeam);
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

    // If we are editing an existing player in-place, do NOT block by duplicate check
    const isEditingInPlace = Boolean(editingPosition);

    if (!isEditingInPlace) {
      // Double-check for duplicates before saving when adding a NEW player
      const currentBenchPlayerIds = Object.values(benchPlayers).filter(Boolean).map(p => p.id);
      const currentTeamPlayerIds = Object.values(teamPlayers).filter(Boolean).map(p => p.id);
      if (currentTeamPlayerIds.includes(character.id) || currentBenchPlayerIds.includes(character.id)) {
        toast.warning('This player is already in your team or on the bench!');
        setIsProcessingPlayer(false);
        return;
      }
    }

    if (editingPosition) {
      // Update in place (field or bench) without duplicate checks
      if (editingPosition.startsWith('bench_')) {
        const benchSlot = editingPosition.replace('bench_', '');
        setBenchPlayers(prev => ({
          ...prev,
          [benchSlot]: enhancedPlayer
        }));
      } else {
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
      // Prepare team data for saving (align with backend TeamCreate)
      const saveData = {
        ...teamData,
        formation: (selectedFormation?.id ?? selectedFormation?.name ?? '').toString(),
        players: Object.entries(teamPlayers)
          .filter(([_, player]) => !!player)
          .map(([positionId, player]) => ({
            character_id: player.id,
            position_id: positionId,
            user_level: player.userLevel || player.baseLevel || 1,
            user_rarity: player.userRarity || player.baseRarity || 1,
            user_equipment: player.userEquipment || {},
            user_hissatsu: player.userHissatsu || { preset1: [], preset2: [] }
          })),
        bench_players: Object.entries(benchPlayers)
          .filter(([_, player]) => !!player)
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

      // Validate payload quickly to avoid undefined access
      const anyUndefinedId = saveData.players.some(p => !p.character_id || !p.position_id) ||
                             saveData.bench_players.some(p => !p.character_id || !p.slot_id);
      if (anyUndefinedId) {
        throw new Error('Invalid team data: some players are missing required IDs');
      }

      const result = await saveTeam(saveData);
      if (!result?.success || !result?.team || !result?.team?.id) {
        throw new Error(result?.error || 'Team save failed');
      }
      return { success: true, team: result.team };
    } catch (error) {
      console.error('Error in handleSaveTeam:', error);
      throw error;
    }
  };

  const handleLoadTeam = (incoming) => {
    try {
      // Unwrap common backend shapes
      const teamData = incoming?.team?.team || incoming?.team || incoming?.team_data || incoming;
      console.log('Loading team data (normalized):', teamData);
      
      // Load formation
      const formationIdOrName = teamData.formation_id || teamData.formation;
      if (formationIdOrName) {
        const formation = mockFormations.find(f => f.id === formationIdOrName || f.name === formationIdOrName);
        if (formation) setSelectedFormation(formation);
      }
      
      // Load tactics
      if (teamData.tactics && Array.isArray(teamData.tactics)) {
        const tacticObjects = teamData.tactics.map(tacticData => {
          if (typeof tacticData === 'object' && tacticData.id) {
            return mockTactics.find(t => t.id === tacticData.id) || tacticData;
          }
          return mockTactics.find(t => t.id === tacticData) || null;
        }).filter(Boolean);
        setSelectedTactics(tacticObjects);
      }
      
      // Load coach
      if (teamData.coach) {
        const coachObj = teamData.coach.id ? mockCoaches.find(c => c.id === teamData.coach.id) : null;
        setSelectedCoach(coachObj || teamData.coach);
      }
      
      // Load main team players
      if (teamData.players && Array.isArray(teamData.players)) {
        const newTeamPlayers = {};
        teamData.players.forEach(playerData => {
          if (playerData.character_id && playerData.position_id) {
            // Find base character to merge canonical data (portrait, nickname, position, element)
            const base = mockCharacters.find(c => c.id === playerData.character_id);
            // Normalize techniques: backend may send array or {preset1,preset2}
            const hissatsuRaw = playerData.user_hissatsu;
            const normalizedHissatsu = Array.isArray(hissatsuRaw)
              ? hissatsuRaw
              : (hissatsuRaw?.preset1 || []).concat(hissatsuRaw?.preset2 || []);
            const enhancedPlayer = {
              id: playerData.character_id,
              // show configured stats
              userLevel: playerData.user_level ?? base?.baseLevel ?? 1,
              userRarity: playerData.user_rarity ?? base?.baseRarity ?? 'Common',
              userEquipment: playerData.user_equipment || {},
              // keep both merged array and separate presets for editors
              userHissatsu: {
                preset1: Array.isArray(hissatsuRaw) ? hissatsuRaw.slice(0, 3) : (hissatsuRaw?.preset1 || []),
                preset2: Array.isArray(hissatsuRaw) ? hissatsuRaw.slice(3, 6) : (hissatsuRaw?.preset2 || [])
              },
              // display helpers
              name: base?.name || playerData.name || `Player ${playerData.character_id}`,
              nickname: base?.nickname || playerData.nickname || base?.name || `P${playerData.character_id}`,
              portrait: base?.portrait || playerData.portrait,
              position: base?.position || playerData.position || 'MF',
              element: base?.element || playerData.element || 'Wind',
              baseLevel: base?.baseLevel || playerData.base_level || 1,
              baseRarity: base?.baseRarity || playerData.base_rarity || 'Common',
              stats: base?.stats || playerData.stats || {}
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
            const base = mockCharacters.find(c => c.id === playerData.character_id);
            const hissatsuRaw = playerData.user_hissatsu;
            const normalizedHissatsu = Array.isArray(hissatsuRaw)
              ? hissatsuRaw
              : (hissatsuRaw?.preset1 || []).concat(hissatsuRaw?.preset2 || []);
            const enhancedPlayer = {
              id: playerData.character_id,
              userLevel: playerData.user_level ?? base?.baseLevel ?? 1,
              userRarity: playerData.user_rarity ?? base?.baseRarity ?? 'Common',
              userEquipment: playerData.user_equipment || {},
              userHissatsu: {
                preset1: Array.isArray(hissatsuRaw) ? hissatsuRaw.slice(0, 3) : (hissatsuRaw?.preset1 || []),
                preset2: Array.isArray(hissatsuRaw) ? hissatsuRaw.slice(3, 6) : (hissatsuRaw?.preset2 || [])
              },
              name: base?.name || playerData.name || `Player ${playerData.character_id}`,
              nickname: base?.nickname || playerData.nickname || base?.name || `P${playerData.character_id}`,
              portrait: base?.portrait || playerData.portrait,
              position: base?.position || playerData.position || 'MF',
              element: base?.element || playerData.element || 'Wind',
              baseLevel: base?.baseLevel || playerData.base_level || 1,
              baseRarity: base?.baseRarity || playerData.base_rarity || 'Common',
              stats: base?.stats || playerData.stats || {}
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

  // Handle tactic selection from visualization modal
  const handleTacticVisualizationSelect = (tactics) => {
    setSelectedTactics(tactics);
    toast.success(`Selected ${tactics.length} tactics: ${tactics.map(t => t.name).join(', ')}`);
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

  // Auto-load team if redirected from Profile/Preview
  useEffect(() => {
    try {
      const raw = localStorage.getItem('loadTeamData');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.loadOnOpen || !parsed.teamId) return;

      // Clear the flag immediately to avoid loops
      localStorage.removeItem('loadTeamData');

      // Fetch full team details via AuthContext
      (async () => {
        try {
          const result = await loadTeamDetails(parsed.teamId);
          if (result?.success && (result.team || result.team_data || result.id)) {
            const wrapped = result.team?.team || result.team || result.team_data || result;
            // Call existing handler to map into UI
            handleLoadTeam(wrapped);
            toast.success('Team loaded into builder');
          } else {
            toast.error(result?.error || 'Failed to load team details');
          }
        } catch (e) {
          console.error('Auto-load team failed:', e);
          toast.error('Failed to load team into builder');
        }
      })();
    } catch (e) {
      console.error('Invalid loadTeamData in localStorage', e);
      localStorage.removeItem('loadTeamData');
    }
  }, []);

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
                  <Zap className="h-5 w-5" style={{ color: logoColors.primaryOrange }} />
                  Tactics Presets
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {/* Selected Tactics Display */}
                <div className="space-y-2 mb-3">
                  {selectedTactics.length > 0 ? (
                    selectedTactics.map(tactic => (
                      <div 
                        key={tactic.id}
                        className="bg-blue-800/40 rounded-lg p-3 border border-blue-500/30"
                      >
                        <div className="text-white font-medium">{tactic.name}</div>
                        <div className="text-blue-300 text-sm">{tactic.effect}</div>
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
                  onClick={() => {
                    // Open the Tactical Visualization Modal
                    setShowTacticVisualizationModal(true);
                  }}
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
                  onClick={() => {
                    // Manage Presets functionality - show tactics selection
                    setShowTacticsModal(true);
                  }}
                >
                  <Target className="h-4 w-4 mr-2" />
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
                  <User className="h-5 w-5" style={{ color: logoColors.primaryYellow }} />
                  Coach
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedCoach ? (
                  <div className="space-y-3">
                    {/* Coach Portrait and Info */}
                    <div className="flex items-center gap-3">
                      <img 
                        src={selectedCoach.portrait} 
                        alt={selectedCoach.name}
                        className="w-12 h-12 rounded-lg"
                      />
                      <div>
                        <div className="text-white font-medium">{selectedCoach.name}</div>
                        <div className="text-gray-300 text-sm">{selectedCoach.title}</div>
                      </div>
                    </div>
                    
                    {/* Coach Description */}
                    <div className="text-gray-400 text-sm">
                      {selectedCoach.bonuses?.description || "Increases team's capabilities"}
                    </div>
                    
                    {/* Coach Specialties */}
                    <div className="flex flex-wrap gap-2">
                      {selectedCoach.specialties && selectedCoach.specialties.map((specialty, index) => (
                        <div 
                          key={index}
                          className="px-3 py-1 rounded-lg text-xs font-medium"
                          style={{ 
                            backgroundColor: logoColors.primaryBlueAlpha(0.3),
                            color: logoColors.white
                          }}
                        >
                          {specialty}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm text-center py-4">
                    No coach selected
                  </div>
                )}
                
                <Button 
                  className="w-full text-white border hover:opacity-80"
                  style={{ 
                    backgroundColor: logoColors.primaryBlueAlpha(0.4),
                    borderColor: logoColors.primaryBlueAlpha(0.3)
                  }}
                  onClick={() => {
                    setShowCoachModal(true);
                  }}
                >
                  <User className="h-4 w-4 mr-2" />
                  Select Coach
                </Button>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button 
                className="w-full shadow h-9 px-4 py-2 text-white border"
                style={{ 
                  backgroundColor: '#3b82f6',
                  borderColor: '#3b82f6'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#2563eb';
                  e.target.style.borderColor = '#2563eb';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#3b82f6';
                  e.target.style.borderColor = '#3b82f6';
                }}
                onClick={() => setShowLoadModal(true)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Load Team
              </Button>
              
              <Button 
                className="w-full shadow h-9 px-4 py-2 text-white border disabled:pointer-events-none disabled:opacity-50"
                style={{ 
                  backgroundColor: '#dc2626',
                  borderColor: '#dc2626'
                }}
                onMouseEnter={(e) => {
                  if (!e.target.disabled) {
                    e.target.style.backgroundColor = '#b91c1c';
                    e.target.style.borderColor = '#b91c1c';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.target.disabled) {
                    e.target.style.backgroundColor = '#dc2626';
                    e.target.style.borderColor = '#dc2626';
                  }
                }}
                onClick={() => setShowSaveModal(true)}
                disabled={Object.values(teamPlayers).filter(p => p).length === 0}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Team
              </Button>
              
              <Button 
                className="w-full shadow h-9 px-4 py-2 text-white border disabled:pointer-events-none disabled:opacity-50"
                style={{ 
                  backgroundColor: '#7c2d12',
                  borderColor: '#7c2d12'
                }}
                onMouseEnter={(e) => {
                  if (!e.target.disabled) {
                    e.target.style.backgroundColor = '#a16207';
                    e.target.style.borderColor = '#a16207';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.target.disabled) {
                    e.target.style.backgroundColor = '#7c2d12';
                    e.target.style.borderColor = '#7c2d12';
                  }
                }}
                onClick={handleClearAll}
                disabled={Object.values(teamPlayers).filter(p => p).length === 0 && Object.values(benchPlayers).filter(p => p).length === 0}
              >
                <X className="h-4 w-4 mr-2" />
                Clear Team
              </Button>
              
              <Button 
                className="w-full shadow h-9 px-4 py-2 text-white border disabled:pointer-events-none disabled:opacity-50"
                style={{ 
                  backgroundColor: '#4b5563',
                  borderColor: '#4b5563'
                }}
                onMouseEnter={(e) => {
                  if (!e.target.disabled) {
                    e.target.style.backgroundColor = '#6b7280';
                    e.target.style.borderColor = '#6b7280';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.target.disabled) {
                    e.target.style.backgroundColor = '#4b5563';
                    e.target.style.borderColor = '#4b5563';
                  }
                }}
                onClick={handleClearAll}
                disabled={Object.values(teamPlayers).filter(p => p).length === 0 && Object.values(benchPlayers).filter(p => p).length === 0 && !selectedCoach && selectedTactics.length === 0}
              >
                <X className="h-4 w-4 mr-2" />
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
              <CardContent className="p-4">
                {selectedFormation ? (
                  <FormationField
                    formation={selectedFormation}
                    players={teamPlayers}
                    benchPlayers={benchPlayers}
                    onAddPlayer={handleAddPlayer}
                    onEditPlayer={handleEditPlayer}
                    onRemovePlayer={handleRemovePlayer}
                    onMovePlayer={handleMovePlayer}
                    onMoveFromBench={handleMoveFromBench}
                    onMoveToBench={handleMoveToBench}
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
                  Bench ({Object.keys(benchPlayers).filter(key => benchPlayers[key]).length}/5)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from({ length: 5 }, (_, index) => {
                    const player = benchPlayers[index];
                    return (
                      <div key={index} className="relative">
                        {player ? (
                          <BenchRow index={index} player={player} />
                        ) : (
                          <EmptyBenchSlot index={index} />
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

      {/* Tactics Presets Management Modal */}
      <TacticsSelector
        isOpen={showTacticsModal}
        onClose={() => setShowTacticsModal(false)}
        onTacticSelect={handleTacticVisualizationSelect}
        selectedTactics={selectedTactics}
        presets={tacticPresets}
        currentPreset={currentPreset}
        onPresetsUpdate={handlePresetsUpdate}
      />

      {/* Coach Selection Modal */}
      <CoachSelector
        isOpen={showCoachModal}
        onClose={() => setShowCoachModal(false)}
        onCoachSelect={setSelectedCoach}
        selectedCoach={selectedCoach}
      />

      {/* Tactical Visualization Modal */}
      {showTacticVisualizationModal && (
        <TacticVisualizationModal
          isOpen={showTacticVisualizationModal}
          onClose={() => setShowTacticVisualizationModal(false)}
          onTacticSelect={handleTacticVisualizationSelect}
          selectedTactics={selectedTactics}
        />
      )}
    </div>
  );
};

export default TeamBuilder;