import React, { useState, useEffect } from 'react';
import { X, Users, Shield, Zap, Target, Star, Trophy } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { logoColors } from '../styles/colors';
import { useAuth } from '../contexts/AuthContext';

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

  const handlePrivacyToggle = async () => {
    if (onPrivacyToggle) {
      await onPrivacyToggle(team.id, !team.is_public);
    }
  };

  const getPositionStyle = (position) => {
    const colors = {
      'GK': '#10B981', // Green
      'DF': '#3B82F6', // Blue  
      'MF': '#F59E0B', // Orange
      'FW': '#EF4444'  // Red
    };
    return { backgroundColor: colors[position] || '#6B7280' };
  };

  const renderFormationField = () => {
    const formation = teamDetails?.formation || '4-4-2';
    const players = teamDetails?.players || [];
    const bench = teamDetails?.bench || [];

    // Simple formation positions layout
    const positionLayouts = {
      '4-4-2': [
        { id: 'gk1', x: 50, y: 10, position: 'GK' },
        { id: 'df1', x: 20, y: 25, position: 'DF' },
        { id: 'df2', x: 40, y: 25, position: 'DF' },
        { id: 'df3', x: 60, y: 25, position: 'DF' },
        { id: 'df4', x: 80, y: 25, position: 'DF' },
        { id: 'mf1', x: 20, y: 50, position: 'MF' },
        { id: 'mf2', x: 40, y: 50, position: 'MF' },
        { id: 'mf3', x: 60, y: 50, position: 'MF' },
        { id: 'mf4', x: 80, y: 50, position: 'MF' },
        { id: 'fw1', x: 35, y: 75, position: 'FW' },
        { id: 'fw2', x: 65, y: 75, position: 'FW' }
      ],
      '3-5-2': [
        { id: 'gk1', x: 50, y: 10, position: 'GK' },
        { id: 'df1', x: 30, y: 25, position: 'DF' },
        { id: 'df2', x: 50, y: 25, position: 'DF' },
        { id: 'df3', x: 70, y: 25, position: 'DF' },
        { id: 'mf1', x: 15, y: 50, position: 'MF' },
        { id: 'mf2', x: 35, y: 50, position: 'MF' },
        { id: 'mf3', x: 50, y: 50, position: 'MF' },
        { id: 'mf4', x: 65, y: 50, position: 'MF' },
        { id: 'mf5', x: 85, y: 50, position: 'MF' },
        { id: 'fw1', x: 35, y: 75, position: 'FW' },
        { id: 'fw2', x: 65, y: 75, position: 'FW' }
      ]
    };

    const positions = positionLayouts[formation] || positionLayouts['4-4-2'];

    return (
      <div className="relative bg-green-600 rounded-lg p-4" style={{ height: '400px' }}>
        {/* Field markings */}
        <div className="absolute inset-2 border-2 border-white rounded-lg">
          {/* Center circle */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                          w-20 h-20 border-2 border-white rounded-full"></div>
          {/* Center line */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 
                          w-px h-full bg-white"></div>
          {/* Goal areas */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 
                          w-16 h-8 border-b-2 border-l-2 border-r-2 border-white"></div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 
                          w-16 h-8 border-t-2 border-l-2 border-r-2 border-white"></div>
        </div>

        {/* Players */}
        {positions.map((pos, index) => {
          const player = players[index];
          return (
            <div
              key={pos.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            >
              <div className="relative group">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white"
                  style={getPositionStyle(pos.position)}
                >
                  {player ? player.name?.substring(0, 2) : pos.position}
                </div>
                {player && (
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 
                                  opacity-0 group-hover:opacity-100 transition-opacity 
                                  bg-black/80 text-white text-xs p-1 rounded whitespace-nowrap z-10">
                    {player.name}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderBench = () => {
    const bench = teamDetails?.bench_players || teamDetails?.bench || [];
    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-white">Bench ({bench.length}/5)</h4>
        <div className="grid grid-cols-5 gap-2">
          {[...Array(5)].map((_, index) => {
            const player = bench[index];
            return (
              <div key={index} className="text-center">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold border border-white/30 mb-1 cursor-pointer hover:opacity-80"
                  style={{ backgroundColor: player ? getPositionStyle(player.position || 'Unknown').backgroundColor : logoColors.blackAlpha(0.5) }}
                  title={player ? `${player.name} (${player.position || 'Unknown'})` : 'Empty slot'}
                >
                  {player ? player.name?.substring(0, 2) : '-'}
                </div>
                <div className="text-xs text-gray-300 truncate">
                  {player?.name || 'Empty'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderPlayerDetails = () => {
    const allPlayers = [...(teamDetails?.players || []), ...(teamDetails?.bench_players || [])];
    
    if (allPlayers.length === 0) {
      return (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-white">Player Details</h4>
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto mb-4" style={{ color: logoColors.primaryBlue }} />
            <p className="text-gray-300">No players in this team yet.</p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-white">Player Details ({allPlayers.length})</h4>
        <div className="max-h-60 overflow-y-auto space-y-2">
          {allPlayers.map((player, index) => (
            <div key={index} className="p-3 rounded border hover:opacity-80 cursor-pointer transition-opacity" style={{ 
              backgroundColor: logoColors.blackAlpha(0.3),
              borderColor: logoColors.primaryBlueAlpha(0.2)
            }}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h5 className="font-medium text-white">{player.name || 'Unnamed Player'}</h5>
                  <p className="text-xs" style={{ color: logoColors.lightBlue }}>
                    {player.position || 'Unknown'} • Level {player.user_level || player.userLevel || player.level || 1}
                  </p>
                  {(player.user_rarity || player.userRarity || player.rarity) && (
                    <p className="text-xs text-yellow-400">
                      {(player.user_rarity || player.userRarity || player.rarity).toUpperCase()}
                    </p>
                  )}
                </div>
                <Badge style={{ backgroundColor: getPositionStyle(player.position || 'Unknown').backgroundColor }}>
                  {player.position || '?'}
                </Badge>
              </div>
              
              {/* Equipment */}
              {((player.user_equipment && Object.keys(player.user_equipment).length > 0) ||
                (player.userEquipment && Object.keys(player.userEquipment).length > 0)) && (
                <div className="mb-2">
                  <h6 className="text-xs font-medium text-gray-300 mb-1">Equipment:</h6>
                  <div className="flex flex-wrap gap-1">
                    {Object.values(player.user_equipment || player.userEquipment || {}).map((equipment, eqIndex) => (
                      equipment && (
                        <span key={eqIndex} className="text-xs px-2 py-1 rounded" 
                              style={{ backgroundColor: logoColors.primaryOrangeAlpha(0.2), color: logoColors.primaryOrange }}>
                          {equipment.name || 'Equipment'}
                        </span>
                      )
                    ))}
                  </div>
                </div>
              )}
              
              {/* Techniques */}
              {((player.user_hissatsu && player.user_hissatsu.length > 0) ||
                (player.userHissatsu && player.userHissatsu.length > 0)) && (
                <div>
                  <h6 className="text-xs font-medium text-gray-300 mb-1">Techniques:</h6>
                  <div className="flex flex-wrap gap-1">
                    {(player.user_hissatsu || player.userHissatsu || []).map((technique, techIndex) => (
                      <span key={techIndex} className="text-xs px-2 py-1 rounded" 
                            style={{ backgroundColor: logoColors.primaryYellowAlpha(0.2), color: logoColors.primaryYellow }}>
                        {technique.name || 'Technique'}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Base Stats if available */}
              {player.baseStats && (
                <div className="mt-2">
                  <h6 className="text-xs font-medium text-gray-300 mb-1">Stats:</h6>
                  <div className="grid grid-cols-3 gap-1 text-xs">
                    {Object.entries(player.baseStats).slice(0, 6).map(([stat, value]) => (
                      <div key={stat} className="flex justify-between">
                        <span className="capitalize">{stat}:</span>
                        <span className="text-white">{value.main || value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
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
                <CardContent>
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

                {/* Bench */}
                <Card className="backdrop-blur-lg text-white border" style={{ 
                  backgroundColor: logoColors.blackAlpha(0.3),
                  borderColor: logoColors.primaryBlueAlpha(0.2)
                }}>
                  <CardContent className="p-4">
                    {renderBench()}
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