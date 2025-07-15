import React, { useState } from 'react';
import { mockCharacters, mockFormations, mockTactics, mockCoaches } from '../data/mock';
import Navigation from '../components/Navigation';
import FormationField from '../components/FormationField';
import PlayerSearch from '../components/PlayerSearch';
import TacticsSelector from '../components/TacticsSelector';
import TacticVisualizationModal from '../components/TacticVisualizationModal';
import CoachSelector from '../components/CoachSelector';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Users, Trophy, Target, Shield, Zap, UserCheck, Plus, X } from 'lucide-react';

const TeamBuilder = () => {
  const [selectedFormation, setSelectedFormation] = useState(mockFormations[0]);
  const [teamPlayers, setTeamPlayers] = useState({});
  const [benchPlayers, setBenchPlayers] = useState({});
  const [selectedTactics, setSelectedTactics] = useState([]);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [showPlayerSearch, setShowPlayerSearch] = useState(false);
  const [showTacticsSelector, setShowTacticsSelector] = useState(false);
  const [showTacticVisualization, setShowTacticVisualization] = useState(false);
  const [showCoachSelector, setShowCoachSelector] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [isBenchSelection, setIsBenchSelection] = useState(false);
  const [selectedBenchSlot, setSelectedBenchSlot] = useState(null);

  const handleFormationChange = (formationId) => {
    const formation = mockFormations.find(f => f.id === parseInt(formationId));
    setSelectedFormation(formation);
    setTeamPlayers({}); // Clear team when formation changes
  };

  const handleAddPlayer = (positionId) => {
    setSelectedPosition(positionId);
    setShowPlayerSearch(true);
  };

  const handlePlayerSelect = (player) => {
    if (isBenchSelection) {
      setBenchPlayers(prev => ({
        ...prev,
        [selectedBenchSlot]: player
      }));
      setIsBenchSelection(false);
      setSelectedBenchSlot(null);
    } else if (selectedPosition) {
      setTeamPlayers(prev => ({
        ...prev,
        [selectedPosition]: player
      }));
    }
    setShowPlayerSearch(false);
    setSelectedPosition(null);
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

  const handleTacticsSelect = (tactics) => {
    setSelectedTactics(tactics);
  };

  const handleCoachSelect = (coach) => {
    setSelectedCoach(coach);
  };

  const getTeamStats = () => {
    const players = Object.values(teamPlayers);
    if (players.length === 0) return null;

    const totalStats = players.reduce((acc, player) => {
      Object.keys(player.baseStats).forEach(stat => {
        acc[stat] = (acc[stat] || 0) + player.baseStats[stat].main;
      });
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
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-800 to-orange-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
            Team Builder
          </h1>
          <p className="text-xl text-gray-300">
            Build your ultimate Inazuma Eleven team
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel - Formation & Controls */}
          <div className="lg:col-span-1 space-y-4">
            {/* Formation Selection */}
            <Card className="bg-black/30 backdrop-blur-lg border-orange-400/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-orange-400" />
                  Formation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedFormation.id.toString()} onValueChange={handleFormationChange}>
                  <SelectTrigger className="bg-orange-900/30 border-orange-400/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-orange-900 border-orange-400/30">
                    {mockFormations.map(formation => (
                      <SelectItem key={formation.id} value={formation.id.toString()} className="text-white hover:bg-orange-800">
                        {formation.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Tactics Selection */}
            <Card className="bg-black/30 backdrop-blur-lg border-orange-400/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-orange-400" />
                  Tactics Presets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  {selectedTactics.length > 0 ? (
                    selectedTactics.map((tactic, index) => (
                      <div key={index} className="p-2 bg-orange-600/20 rounded-lg border border-orange-500/30">
                        <div className="font-medium text-sm">{tactic.name}</div>
                        <div className="text-xs text-gray-300">{tactic.effect}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400 text-sm">No tactics selected</div>
                  )}
                </div>
                <Button
                  variant="outline"
                  className="w-full text-white border-orange-400/30 hover:bg-orange-700 mb-2"
                  onClick={() => setShowTacticVisualization(true)}
                >
                  <Target className="h-4 w-4 mr-2" />
                  Tactical Visualization
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-white border-orange-400/30 hover:bg-orange-700"
                  onClick={() => setShowTacticsSelector(true)}
                >
                  <Target className="h-4 w-4 mr-2" />
                  Manage Presets
                </Button>
              </CardContent>
            </Card>

            {/* Coach Selection */}
            <Card className="bg-black/30 backdrop-blur-lg border-orange-400/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-orange-400" />
                  Coach
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedCoach ? (
                  <div className="space-y-3">
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
                        <Badge key={index} variant="outline" className="text-xs border-orange-400/30">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm mb-4">No coach selected</div>
                )}
                <Button
                  variant="outline"
                  className="w-full text-white border-orange-400/30 hover:bg-orange-700"
                  onClick={() => setShowCoachSelector(true)}
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Select Coach
                </Button>
              </CardContent>
            </Card>

            {/* Team Stats */}
            {teamStats && (
              <Card className="bg-black/30 backdrop-blur-lg border-orange-400/20 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-orange-400" />
                    Team Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Players:</span>
                      <Badge variant="outline" className="text-white border-orange-400/30">
                        {teamStats.playerCount}/11
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Avg Level:</span>
                      <Badge variant="outline" className="text-orange-400 border-orange-400">
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
                        <span className="text-cyan-400">{teamStats.intelligence}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pressure:</span>
                        <span className="text-purple-400">{teamStats.pressure}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Agility:</span>
                        <span className="text-teal-400">{teamStats.agility}</span>
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
                  onAddPlayer={handleAddPlayer}
                  onRemovePlayer={handleRemovePlayer}
                  onMovePlayer={handleMovePlayer}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Bench */}
          <div className="lg:col-span-1">
            <Card className="bg-black/30 backdrop-blur-lg border-orange-400/20 text-white h-[600px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-orange-400" />
                  Bench ({Object.keys(benchPlayers).length}/5)
                </CardTitle>
              </CardHeader>
              <CardContent className="h-full">
                <div className="space-y-4 h-full flex flex-col justify-start">
                  {Array.from({ length: 5 }, (_, index) => (
                    <div key={index} className="flex-1 min-h-[80px]">
                      {benchPlayers[index] ? (
                        <div className="relative group h-full">
                          <div className="w-full h-full bg-orange-800/30 rounded-lg border border-orange-400/30 p-2 flex flex-col items-center justify-center cursor-pointer hover:bg-orange-700/30 transition-colors">
                            <img
                              src={benchPlayers[index].portrait}
                              alt={benchPlayers[index].name}
                              className="w-8 h-8 rounded-full mb-1"
                            />
                            <div className="text-xs text-center font-medium truncate w-full">{benchPlayers[index].name}</div>
                            <div className="text-xs text-gray-400 mt-1">{benchPlayers[index].position}</div>
                          </div>
                          <button
                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemoveBenchPlayer(index)}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <div
                          className="w-full h-full bg-orange-800/20 rounded-lg border-2 border-dashed border-orange-400/30 flex items-center justify-center cursor-pointer hover:bg-orange-700/20 transition-colors"
                          onClick={() => handleAddBenchPlayer(index)}
                        >
                          <Plus className="h-6 w-6 text-orange-400" />
                        </div>
                      )}
                    </div>
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
            onClose={() => setShowPlayerSearch(false)}
            onPlayerSelect={handlePlayerSelect}
            position={selectedPosition}
          />
        )}

        {showTacticsSelector && (
          <TacticsSelector
            isOpen={showTacticsSelector}
            onClose={() => setShowTacticsSelector(false)}
            onTacticSelect={handleTacticsSelect}
            selectedTactics={selectedTactics}
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
      </div>
    </div>
  );
};

export default TeamBuilder;