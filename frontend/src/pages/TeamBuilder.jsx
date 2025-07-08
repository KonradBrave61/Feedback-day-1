import React, { useState } from 'react';
import { mockCharacters, mockFormations } from '../data/mock';
import Navigation from '../components/Navigation';
import FormationField from '../components/FormationField';
import PlayerSearch from '../components/PlayerSearch';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Users, Trophy, Target, Shield } from 'lucide-react';

const TeamBuilder = () => {
  const [selectedFormation, setSelectedFormation] = useState(mockFormations[0]);
  const [teamPlayers, setTeamPlayers] = useState({});
  const [showPlayerSearch, setShowPlayerSearch] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);

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
    if (selectedPosition) {
      setTeamPlayers(prev => ({
        ...prev,
        [selectedPosition]: player
      }));
    }
    setShowPlayerSearch(false);
    setSelectedPosition(null);
  };

  const handleRemovePlayer = (positionId) => {
    setTeamPlayers(prev => {
      const newTeam = { ...prev };
      delete newTeam[positionId];
      return newTeam;
    });
  };

  const getTeamStats = () => {
    const players = Object.values(teamPlayers);
    if (players.length === 0) return null;

    const totalStats = players.reduce((acc, player) => {
      Object.keys(player.stats).forEach(stat => {
        acc[stat] = (acc[stat] || 0) + player.stats[stat].main;
      });
      return acc;
    }, {});

    return {
      ...totalStats,
      playerCount: players.length,
      avgLevel: Math.round(players.reduce((acc, player) => acc + player.level, 0) / players.length)
    };
  };

  const teamStats = getTeamStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Team Builder
          </h1>
          <p className="text-xl text-gray-300">
            Build your ultimate Inazuma Eleven team
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formation Selection */}
          <div className="lg:col-span-1">
            <Card className="bg-black/20 backdrop-blur-md border-white/10 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Formation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedFormation.id.toString()} onValueChange={handleFormationChange}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mockFormations.map(formation => (
                      <SelectItem key={formation.id} value={formation.id.toString()}>
                        {formation.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Team Stats */}
            {teamStats && (
              <Card className="bg-black/20 backdrop-blur-md border-white/10 text-white mt-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Team Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Players:</span>
                      <Badge variant="outline" className="text-white border-white/20">
                        {teamStats.playerCount}/11
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Avg Level:</span>
                      <Badge variant="outline" className="text-blue-400 border-blue-400">
                        {teamStats.avgLevel}
                      </Badge>
                    </div>
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
                        <span className="text-blue-400">{teamStats.intelligence}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pressure:</span>
                        <span className="text-purple-400">{teamStats.pressure}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Agility:</span>
                        <span className="text-green-400">{teamStats.agility}</span>
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

          {/* Formation Field */}
          <div className="lg:col-span-2">
            <Card className="bg-black/20 backdrop-blur-md border-white/10 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  {selectedFormation.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormationField
                  formation={selectedFormation}
                  teamPlayers={teamPlayers}
                  onAddPlayer={handleAddPlayer}
                  onRemovePlayer={handleRemovePlayer}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Player Search Modal */}
        {showPlayerSearch && (
          <PlayerSearch
            isOpen={showPlayerSearch}
            onClose={() => setShowPlayerSearch(false)}
            onPlayerSelect={handlePlayerSelect}
            position={selectedPosition}
          />
        )}
      </div>
    </div>
  );
};

export default TeamBuilder;