import React, { useState, useEffect } from 'react';
import { X, Users, Shield, Zap, Target, Star, Trophy, Shirt, Award, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { logoColors } from '../styles/colors';
import { useAuth } from '../contexts/AuthContext';
import { mockFormations, mockCharacters } from '../data/mock';

const TeamPreviewModal = ({ isOpen, onClose, team, onPrivacyToggle }) => {
  const { loadTeamDetails } = useAuth();
  const [teamDetails, setTeamDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && team) {
      fetchTeamDetails();
    }
  }, [isOpen, team]);

  const fetchTeamDetails = async () => {
    setLoading(true);
    try {
      if (team && team.id) {
        // Try to load detailed team data from API
        const result = await loadTeamDetails(team.id);
        if (result.success) {
          setTeamDetails(result.team);
        } else {
          // If API call fails, fall back to basic team data
          console.warn('Failed to load team details, using basic team data:', result.error);
          setTeamDetails(team);
        }
      } else {
        // Use basic team data as fallback
        setTeamDetails(team);
      }
    } catch (error) {
      console.error('Failed to load team details:', error);
      // Fall back to basic team data
      setTeamDetails(team);
    } finally {
      setLoading(false);
    }
  };

  const getPlayerName = (player) => {
    // If player has a name already, use it
    if (player.name && player.name !== 'Unknown' && player.name !== 'Unnamed Player' && player.name !== 'Player') {
      return player.name;
    }
    
    // Try to find the character by character_id
    if (player.character_id) {
      const character = mockCharacters.find(char => char.id === player.character_id || char.id === parseInt(player.character_id));
      if (character) {
        return character.name;
      }
    }
    
    // Try to find by player id as fallback
    if (player.id) {
      const character = mockCharacters.find(char => char.id === player.id || char.id === parseInt(player.id));
      if (character) {
        return character.name;
      }
    }
    
    // Final fallback - generate a proper football player name
    const footballNames = [
      'Roberto Silva', 'Marco Gonzalez', 'David Rodriguez', 'Carlos Mendez', 'Antonio Lopez',
      'Miguel Santos', 'Fernando Torres', 'Alberto Vega', 'Diego Morales', 'Ricardo Herrera',
      'Gabriel Ruiz', 'Manuel Castro', 'Alejandro Ortiz', 'Francisco Jimenez', 'Juan Romero'
    ];
    
    // Use a consistent name based on player position and some identifier
    const nameIndex = (parseInt(player.position_id || player.id || 1) + (player.position?.charCodeAt(0) || 65)) % footballNames.length;
    return footballNames[nameIndex];
  };

  const handlePrivacyToggle = async () => {
    if (onPrivacyToggle) {
      await onPrivacyToggle(team.id, !team.is_public);
    }
  };

  const getPositionStyle = (position) => {
    const positionColors = {
      'GK': { backgroundColor: logoColors.primaryYellow, color: logoColors.black },
      'DF': { backgroundColor: logoColors.primaryBlue, color: logoColors.white },
      'MF': { backgroundColor: logoColors.primaryOrange, color: logoColors.white },
      'FW': { backgroundColor: logoColors.secondaryBlue, color: logoColors.white }
    };
    return positionColors[position] || { backgroundColor: logoColors.lightGray, color: logoColors.black };
  };

  const calculatePlayerStats = (player) => {
    const baseStats = {
      kick: 50,
      control: 50,
      technique: 50,
      intelligence: 50,
      pressure: 50,
      agility: 50,
      physical: 50
    };

    // Apply equipment bonuses if available
    let equipmentBonus = {};
    const equipment = player.user_equipment || player.userEquipment || {};
    Object.values(equipment).forEach(item => {
      if (item && item.stats) {
        Object.entries(item.stats).forEach(([stat, bonus]) => {
          equipmentBonus[stat] = (equipmentBonus[stat] || 0) + bonus;
        });
      }
    });

    // Calculate final stats
    const finalStats = {};
    Object.keys(baseStats).forEach(stat => {
      const base = baseStats[stat];
      const bonus = equipmentBonus[stat] || 0;
      finalStats[stat] = base + bonus;
    });

    return finalStats;
  };

  const renderFormationField = () => {
    if (!teamDetails || !teamDetails.players) return null;

    // Find the formation
    const formation = mockFormations.find(f => f.name === teamDetails.formation) || mockFormations[0];
    
    return (
      <div className="w-full max-w-full">
        <div className="relative w-full rounded-lg overflow-hidden" 
             style={{ 
               height: '300px',
               maxWidth: '100%',
               background: 'linear-gradient(to bottom, #22c55e 0%, #16a34a 50%, #22c55e 100%)',
               backgroundImage: `
                 radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 70%),
                 linear-gradient(0deg, rgba(255,255,255,0.1) 49%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.1) 51%)
               `
             }}>
          
          {/* Field markings */}
          <div className="absolute inset-0">
            {/* Center line (horizontal) */}
            <div className="absolute left-0 right-0 top-1/2 h-1 bg-white/40 transform -translate-y-1/2"></div>
            
            {/* Center circle */}
            <div className="absolute top-1/2 left-1/2 w-16 h-16 border-2 border-white/40 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
            
            {/* Penalty areas - properly positioned for goals at top and bottom */}
            <div className="absolute top-0 left-1/2 w-24 h-12 border-2 border-white/40 border-t-0 transform -translate-x-1/2"></div>
            <div className="absolute bottom-0 left-1/2 w-24 h-12 border-2 border-white/40 border-b-0 transform -translate-x-1/2"></div>
            
            {/* Goal areas - smaller boxes inside penalty areas */}
            <div className="absolute top-0 left-1/2 w-12 h-6 border-2 border-white/40 border-t-0 transform -translate-x-1/2"></div>
            <div className="absolute bottom-0 left-1/2 w-12 h-6 border-2 border-white/40 border-b-0 transform -translate-x-1/2"></div>
            
            {/* Goals - visible goal posts */}
            <div className="absolute top-0 left-1/2 w-8 h-1 bg-white/60 transform -translate-x-1/2"></div>
            <div className="absolute bottom-0 left-1/2 w-8 h-1 bg-white/60 transform -translate-x-1/2"></div>
            
            {/* Corner arcs */}
            <div className="absolute top-0 left-0 w-3 h-3 border-b-2 border-r-2 border-white/40 rounded-br-lg"></div>
            <div className="absolute top-0 right-0 w-3 h-3 border-b-2 border-l-2 border-white/40 rounded-bl-lg"></div>
            <div className="absolute bottom-0 left-0 w-3 h-3 border-t-2 border-r-2 border-white/40 rounded-tr-lg"></div>
            <div className="absolute bottom-0 right-0 w-3 h-3 border-t-2 border-l-2 border-white/40 rounded-tl-lg"></div>
          </div>

        {/* Players */}
        {formation.positions.map((position) => {
          const player = teamDetails.players.find(p => p.position_id === position.id);
          
          return (
            <div
              key={position.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`
              }}
            >
              {player ? (
                <div className="flex flex-col items-center">
                  {/* Player avatar */}
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-800 flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform">
                      {player.image ? (
                        <img src={player.image} alt={player.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-white text-xs font-bold">
                          {getPlayerName(player).substring(0, 2)}
                        </div>
                      )}
                    </div>
                    {/* Position badge */}
                    <div className="absolute -top-1 -right-1 text-xs px-1 py-0.5 rounded text-white font-bold"
                         style={{ backgroundColor: getPositionStyle(position.position).backgroundColor }}>
                      {position.position}
                    </div>
                  </div>
                  
                  {/* Player name */}
                  <div className="text-xs font-medium text-white bg-black/50 px-2 py-1 rounded mt-1 min-w-max">
                    {getPlayerName(player)}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full border-2 border-dashed border-white/50 flex items-center justify-center">
                    <div className="text-white/50 text-xs">{position.position}</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };



  const renderPlayerDetails = () => {
    const players = teamDetails?.players || [];
    const bench = teamDetails?.bench_players || teamDetails?.bench || [];
    
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Starting XI */}
        <div>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" style={{ color: logoColors.primaryBlue }} />
            Starting XI
          </h3>
          <div className="space-y-3">
            {players.map((player, index) => (
              <Card key={index} className="backdrop-blur-lg border" style={{ 
                backgroundColor: logoColors.blackAlpha(0.4),
                borderColor: logoColors.primaryBlueAlpha(0.2)
              }}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Player Avatar */}
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-gray-700 border-2 border-white overflow-hidden">
                        {player.image ? (
                          <img src={player.image} alt={player.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white font-bold">
                            {getPlayerName(player).substring(0, 2)}
                          </div>
                        )}
                      </div>
                      <Badge className="absolute -bottom-1 -right-1 text-xs" 
                             style={{ backgroundColor: getPositionStyle(player.position).backgroundColor }}>
                        {player.position}
                      </Badge>
                    </div>
                    
                    {/* Player Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-semibold truncate">{getPlayerName(player)}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-300 mb-2">
                        <span>Level {player.user_level || player.userLevel || 1}</span>
                        {(player.user_rarity || player.userRarity) && (
                          <Badge variant="outline" className="text-xs"
                                 style={{ color: logoColors.primaryYellow, borderColor: logoColors.primaryYellow }}>
                            {(player.user_rarity || player.userRarity).toUpperCase()}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Player Stats */}
                      <div className="grid grid-cols-4 gap-2 text-xs mb-3">
                        {Object.entries(calculatePlayerStats(player)).slice(0, 4).map(([stat, value]) => (
                          <div key={stat} className="text-center">
                            <div className="text-gray-400 capitalize">{stat}</div>
                            <div className="text-white font-bold">{value}</div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Equipment */}
                      {((player.user_equipment && Object.keys(player.user_equipment).length > 0) ||
                        (player.userEquipment && Object.keys(player.userEquipment).length > 0)) && (
                        <div className="mb-2">
                          <div className="flex items-center gap-1 mb-1">
                            <Shirt className="h-3 w-3" style={{ color: logoColors.primaryOrange }} />
                            <span className="text-xs font-medium text-gray-300">Equipment</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {Object.values(player.user_equipment || player.userEquipment || {}).map((equipment, eqIndex) => (
                              equipment && (
                                <Badge key={eqIndex} variant="outline" className="text-xs"
                                       style={{ 
                                         backgroundColor: logoColors.primaryOrangeAlpha(0.1), 
                                         color: logoColors.primaryOrange,
                                         borderColor: logoColors.primaryOrange
                                       }}>
                                  {equipment.name || 'Equipment'}
                                </Badge>
                              )
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Techniques */}
                      {((player.user_hissatsu && player.user_hissatsu.length > 0) ||
                        (player.userHissatsu && player.userHissatsu.length > 0)) && (
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <Zap className="h-3 w-3" style={{ color: logoColors.primaryYellow }} />
                            <span className="text-xs font-medium text-gray-300">Techniques</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {(player.user_hissatsu || player.userHissatsu || []).map((technique, techIndex) => (
                              <Badge key={techIndex} variant="outline" className="text-xs"
                                     style={{ 
                                       backgroundColor: logoColors.primaryYellowAlpha(0.1), 
                                       color: logoColors.primaryYellow,
                                       borderColor: logoColors.primaryYellow
                                     }}>
                                {technique.name || 'Technique'}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Bench Players */}
        <div>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Award className="h-5 w-5" style={{ color: logoColors.primaryOrange }} />
            Bench ({bench.length}/5)
          </h3>
          <div className="space-y-3">
            {bench.map((player, index) => (
              <Card key={index} className="backdrop-blur-lg border" style={{ 
                backgroundColor: logoColors.blackAlpha(0.3),
                borderColor: logoColors.primaryBlueAlpha(0.1)
              }}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-700 border border-white/50 overflow-hidden">
                      {player.image ? (
                        <img src={player.image} alt={player.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                          {getPlayerName(player).substring(0, 2)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h5 className="text-white font-medium text-sm">{getPlayerName(player)}</h5>
                      <div className="text-xs text-gray-400">
                        {player.position} • Level {player.user_level || player.userLevel || 1}
                      </div>
                    </div>
                    <Badge style={{ backgroundColor: getPositionStyle(player.position).backgroundColor }}>
                      {player.position}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Empty bench slots */}
            {Array.from({ length: 5 - bench.length }, (_, index) => (
              <Card key={`empty-${index}`} className="backdrop-blur-lg border border-dashed" style={{ 
                backgroundColor: logoColors.blackAlpha(0.1),
                borderColor: logoColors.primaryBlueAlpha(0.1)
              }}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-3 opacity-50">
                    <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-500 flex items-center justify-center">
                      <span className="text-gray-500 text-xs">Empty</span>
                    </div>
                    <span className="text-gray-500 text-sm">Bench Slot {bench.length + index + 1}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-lg border" style={{ 
        backgroundColor: logoColors.blackAlpha(0.9),
        borderColor: logoColors.primaryBlueAlpha(0.3)
      }}>
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b" style={{ 
          borderColor: logoColors.primaryBlueAlpha(0.2)
        }}>
          <div>
            <h2 className="text-2xl font-bold text-white">{teamDetails?.name || 'Team Preview'}</h2>
            <p className="text-sm text-gray-300">{teamDetails?.formation || 'Unknown Formation'}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handlePrivacyToggle}
              className="text-white border hover:opacity-80"
              style={{ 
                backgroundColor: team?.is_public ? logoColors.primaryBlueAlpha(0.4) : logoColors.blackAlpha(0.5),
                borderColor: logoColors.primaryBlueAlpha(0.3)
              }}
            >
              {team?.is_public ? (
                <>
                  <Users className="h-4 w-4 mr-2" />
                  Make Private
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Make Public
                </>
              )}
            </Button>
            <Button
              onClick={onClose}
              className="text-white hover:opacity-80"
              style={{ backgroundColor: logoColors.blackAlpha(0.5) }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 rounded-full mx-auto mb-4 animate-spin border-4 border-t-transparent" 
                 style={{ borderColor: logoColors.primaryBlue, borderTopColor: 'transparent' }} />
            <p className="text-gray-300">Loading team details...</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Formation Field */}
              <Card className="backdrop-blur-lg text-white border" style={{ 
                backgroundColor: logoColors.blackAlpha(0.3),
                borderColor: logoColors.primaryBlueAlpha(0.2)
              }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="h-5 w-5" style={{ color: logoColors.primaryBlue }} />
                    Formation: {teamDetails?.formation || 'Unknown'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 flex justify-center">
                  {renderFormationField()}
                </CardContent>
              </Card>

              {/* Team Info & Stats */}
              <div className="space-y-4">
                {/* Team Meta */}
                <Card className="backdrop-blur-lg text-white border" style={{ 
                  backgroundColor: logoColors.blackAlpha(0.3),
                  borderColor: logoColors.primaryBlueAlpha(0.2)
                }}>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-white">{teamDetails?.likes || 0}</div>
                        <div className="text-xs text-gray-300">Likes</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-white">{teamDetails?.views || 0}</div>
                        <div className="text-xs text-gray-300">Views</div>
                      </div>
                    </div>
                    <div className="mt-3 text-center">
                      <Badge style={{ 
                        backgroundColor: teamDetails?.is_public ? logoColors.primaryBlueAlpha(0.2) : logoColors.blackAlpha(0.5),
                        color: logoColors.white
                      }}>
                        {teamDetails?.is_public ? 'Public Team' : 'Private Team'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Coach Info */}
                <Card className="backdrop-blur-lg text-white border" style={{ 
                  backgroundColor: logoColors.blackAlpha(0.3),
                  borderColor: logoColors.primaryBlueAlpha(0.2)
                }}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4" style={{ color: logoColors.primaryYellow }} />
                      Coach
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    {teamDetails?.coach ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" 
                               style={{ backgroundColor: logoColors.primaryYellow, color: 'black' }}>
                            {teamDetails.coach.name?.substring(0, 2) || 'CO'}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{teamDetails.coach.name || 'Unknown Coach'}</div>
                            <div className="text-xs text-gray-400">{teamDetails.coach.title || 'Coach'}</div>
                          </div>
                        </div>
                        {teamDetails.coach.specialties && (
                          <div className="flex flex-wrap gap-1">
                            {teamDetails.coach.specialties.map((specialty, index) => (
                              <span key={index} className="text-xs px-2 py-1 rounded" 
                                    style={{ backgroundColor: logoColors.primaryYellowAlpha(0.2), color: logoColors.primaryYellow }}>
                                {specialty}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-400 text-sm">No coach assigned</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Tactics */}
                <Card className="backdrop-blur-lg text-white border" style={{ 
                  backgroundColor: logoColors.blackAlpha(0.3),
                  borderColor: logoColors.primaryBlueAlpha(0.2)
                }}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Zap className="h-4 w-4" style={{ color: logoColors.primaryBlue }} />
                      Tactics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    {teamDetails?.tactics && teamDetails.tactics.length > 0 ? (
                      <div className="space-y-2">
                        {teamDetails.tactics.map((tactic, index) => (
                          <div key={index} className="p-2 rounded border" style={{ 
                            backgroundColor: logoColors.primaryBlueAlpha(0.1),
                            borderColor: logoColors.primaryBlueAlpha(0.2)
                          }}>
                            <div className="font-medium text-sm">{tactic.name || 'Unknown Tactic'}</div>
                            <div className="text-xs text-gray-300">{tactic.effect || tactic.description || 'No description'}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-400 text-sm">No tactics selected</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Player Details */}
            <div className="mt-6">
              <Card className="backdrop-blur-lg text-white border" style={{ 
                backgroundColor: logoColors.blackAlpha(0.3),
                borderColor: logoColors.primaryBlueAlpha(0.2)
              }}>
                <CardContent className="p-4">
                  {renderPlayerDetails()}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamPreviewModal;