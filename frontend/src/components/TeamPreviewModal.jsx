import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Users, Shield, Zap, Target, Edit, Award } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { AspectRatio } from './ui/aspect-ratio';
import { HoverCard, HoverCardTrigger, HoverCardContent } from './ui/hover-card';
import { logoColors } from '../styles/colors';
import { useAuth } from '../contexts/AuthContext';
import { mockFormations, mockCharacters } from '../data/mock';
import { calculateStats } from '../data/mock';

const TeamPreviewModal = ({ isOpen, onClose, team, onPrivacyToggle }) => {
  const { loadTeamDetails } = useAuth();
  const navigate = useNavigate();
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
        const result = await loadTeamDetails(team.id);
        if (result.success) {
          const teamData = result.team?.team || result.team;
          setTeamDetails(teamData);
        } else {
          setTeamDetails(team);
        }
      } else {
        setTeamDetails(team);
      }
    } catch (error) {
      console.error('Failed to load team details:', error);
      setTeamDetails(team);
    } finally {
      setLoading(false);
    }
  };

  const getPlayerName = (player) => {
    if (player?.name && !['Unknown', 'Unnamed Player', 'Player'].includes(player.name)) {
      return player.name;
    }
    if (player?.character_id) {
      const character = mockCharacters.find(char => char.id === player.character_id || char.id === parseInt(player.character_id));
      if (character) return character.name;
    }
    if (player?.id) {
      const character = mockCharacters.find(char => char.id === player.id || char.id === parseInt(player.id));
      if (character) return character.name;
    }
    const fallback = ['Roberto Silva','Marco Gonzalez','David Rodriguez','Carlos Mendez','Antonio Lopez','Miguel Santos','Fernando Torres','Alberto Vega','Diego Morales','Ricardo Herrera','Gabriel Ruiz','Manuel Castro','Alejandro Ortiz','Francisco Jimenez','Juan Romero'];
    const nameIndex = (parseInt(player?.position_id || player?.id || 1) + (player?.position?.charCodeAt(0) || 65)) % fallback.length;
    return fallback[nameIndex];
  };

  const getPlayerPosition = (player) => {
    if (player?.position) return player.position;
    if (player?.character_id) {
      const character = mockCharacters.find(char => char.id === player.character_id || char.id === parseInt(player.character_id));
      if (character?.position) return character.position;
    }
    if (player?.id) {
      const character = mockCharacters.find(char => char.id === player.id || char.id === parseInt(player.id));
      if (character?.position) return character.position;
    }
    return 'FW';
  };

  const getCharacterRef = (player) => {
    const cid = player?.character_id || player?.id;
    if (!cid) return null;
    const char = mockCharacters.find(c => c.id === cid || c.id === parseInt(cid));
    return char || null;
  };

  const getPlayerElement = (player) => {
    if (player?.element) return player.element;
    const ref = getCharacterRef(player);
    return ref?.element || 'Neutral';
  };

  const getPlayerLevel = (player) => player?.user_level || player?.userLevel || getCharacterRef(player)?.baseLevel || 1;
  const getPlayerRarity = (player) => (player?.user_rarity || player?.userRarity || getCharacterRef(player)?.baseRarity || 'Common');

  const getPlayerEquipment = (player) => {
    const eq = player?.user_equipment || player?.userEquipment || {};
    return {
      boots: eq.boots || null,
      bracelets: eq.bracelets || null,
      pendants: eq.pendants || null,
      special: eq.special || null,
    };
  };

  const getPlayerTechniques = (player) => (player?.user_hissatsu || player?.userHissatsu || []);

  const handlePrivacyToggle = async () => {
    if (onPrivacyToggle) await onPrivacyToggle(team.id, !team.is_public);
  };

  const handleEditInBuilder = () => {
    localStorage.setItem('loadTeamData', JSON.stringify({ teamId: team.id, loadOnOpen: true }));
    onClose();
    navigate('/team-builder');
  };

  const getPositionStyle = (position) => {
    const positionColors = {
      GK: { backgroundColor: logoColors.primaryYellow, color: logoColors.black },
      DF: { backgroundColor: logoColors.primaryBlue, color: logoColors.white },
      MF: { backgroundColor: logoColors.primaryOrange, color: logoColors.white },
      FW: { backgroundColor: logoColors.secondaryBlue, color: logoColors.white },
    };
    return positionColors[position] || { backgroundColor: logoColors.lightGray, color: logoColors.black };
  };

  const StatBar = ({ label, value, base, bonus, color }) => {
    const v = Number(value) || 0;
    const pct = Math.max(5, Math.min(100, Math.round((v / 200) * 100)));
    return (
      <div className="space-y-0.5">
        <div className="flex items-center justify-between text-[12px]">
          <span className="text-gray-200">{label}</span>
          <span className="font-semibold text-white">{v}</span>
        </div>
        <div className="h-2 rounded bg-white/10 overflow-hidden">
          <div className="h-full" style={{ width: `${pct}%`, backgroundColor: color }} />
        </div>
        <div className="text-[11px] text-gray-300">{base ?? '-'} base{typeof bonus === 'number' && bonus !== 0 ? ` + ${bonus} eq` : ''}</div>
      </div>
    );
  };

  const EquipmentChip = ({ item }) => {
    if (!item) return null;
    const totalBonus = item?.stats && typeof item.stats === 'object'
      ? Object.values(item.stats).reduce((a, b) => a + (Number(b) || 0), 0)
      : 0;
    return (
      <span className="text-[11px] px-1.5 py-0.5 rounded border" style={{ backgroundColor: logoColors.blackAlpha(0.4), borderColor: logoColors.primaryBlueAlpha(0.3), color: logoColors.white }}>
        {item.name || 'Item'}{totalBonus ? ` (+${totalBonus})` : ''}
      </span>
    );
  };

  const PlayerHoverCard = ({ player }) => {
    if (!player) return null;
    const charRef = getCharacterRef(player) || {};
    const level = getPlayerLevel(player);
    const rarity = getPlayerRarity(player);
    const element = getPlayerElement(player);
    const equipment = getPlayerEquipment(player);
    const techniques = getPlayerTechniques(player);

    const stats = calculateStats(
      { ...charRef },
      equipment,
      level,
      rarity
    );

    return (
      <div className="w-[420px] rounded-md border p-4" style={{ backgroundColor: logoColors.blackAlpha(0.98), borderColor: logoColors.primaryBlueAlpha(0.5) }}>
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full overflow-hidden border" style={{ borderColor: logoColors.whiteAlpha(0.35) }}>
            {player?.image ? (
              <img src={player.image} alt={getPlayerName(player)} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold">
                {getPlayerName(player).substring(0, 2)}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="text-[14px] font-semibold text-white truncate">{getPlayerName(player)}</div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge className="text-[11px] px-1.5 py-0.5" style={{ backgroundColor: getPositionStyle(getPlayerPosition(player)).backgroundColor }}>
                {getPlayerPosition(player)}
              </Badge>
              <span className="text-[11px] px-1.5 py-0.5 rounded border" style={{ color: logoColors.primaryYellow, borderColor: logoColors.primaryYellow }}>
                {String(rarity).toUpperCase()}
              </span>
              <span className="text-[11px] px-1.5 py-0.5 rounded border" style={{ color: logoColors.secondaryBlue, borderColor: logoColors.secondaryBlue }}>
                {element}
              </span>
              <span className="text-[11px] px-1.5 py-0.5 rounded border text-gray-200" style={{ borderColor: logoColors.primaryBlueAlpha(0.2) }}>Lv {level}</span>
            </div>
          </div>
        </div>

        {/* Stats - 7 bars with breakdown */}
        <div className="mt-3 grid grid-cols-2 gap-3">
          <StatBar label="Kick" value={stats.kick?.main} base={stats.kick?.base} bonus={stats.kick?.equipmentBonus} color={logoColors.primaryYellow} />
          <StatBar label="Control" value={stats.control?.main} base={stats.control?.base} bonus={stats.control?.equipmentBonus} color={logoColors.secondaryBlue} />
          <StatBar label="Technique" value={stats.technique?.main} base={stats.technique?.base} bonus={stats.technique?.equipmentBonus} color={logoColors.primaryOrange} />
          <StatBar label="Intelligence" value={stats.intelligence?.main} base={stats.intelligence?.base} bonus={stats.intelligence?.equipmentBonus} color={logoColors.lightBlue} />
          <StatBar label="Pressure" value={stats.pressure?.main} base={stats.pressure?.base} bonus={stats.pressure?.equipmentBonus} color={logoColors.darkBlue} />
          <StatBar label="Agility" value={stats.agility?.main} base={stats.agility?.base} bonus={stats.agility?.equipmentBonus} color={logoColors.secondaryBlue} />
          <StatBar label="Physical" value={stats.physical?.main} base={stats.physical?.base} bonus={stats.physical?.equipmentBonus} color={logoColors.gray} />
        </div>

        {/* Equipment */}
        {(equipment.boots || equipment.bracelets || equipment.pendants || equipment.special) && (
          <div className="mt-3">
            <div className="text-[12px] text-gray-200 mb-1">Equipment</div>
            <div className="flex flex-wrap gap-1.5">
              <EquipmentChip item={equipment.boots} />
              <EquipmentChip item={equipment.bracelets} />
              <EquipmentChip item={equipment.pendants} />
              <EquipmentChip item={equipment.special} />
            </div>
          </div>
        )}

        {/* Techniques */}
        {Array.isArray(techniques) && techniques.length > 0 && (
          <div className="mt-3">
            <div className="text-[12px] text-gray-200 mb-1">Techniques</div>
            <div className="flex flex-wrap gap-1.5">
              {techniques.map((tech, idx) => (
                <span key={idx} className="text-[11px] px-1.5 py-0.5 rounded border" style={{ backgroundColor: logoColors.primaryYellowAlpha(0.15), borderColor: logoColors.primaryYellowAlpha(0.3), color: logoColors.primaryYellow }}>
                  {tech?.name || `Tech ${idx + 1}`}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderFormationField = () => {
    if (!teamDetails || !teamDetails.players) return null;
    const formation = mockFormations.find(f => f.name === teamDetails.formation) || mockFormations[0];

    return (
      <div className="w-full h-full flex items-center justify-center">
        {/* Fit field to full container with consistent padding */}
        <div
          className="relative w-full h-full rounded-lg overflow-hidden"
          style={{
            background: 'linear-gradient(to bottom, #22c55e 0%, #16a34a 50%, #22c55e 100%)',
            backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 70%),linear-gradient(0deg, rgba(255,255,255,0.1) 49%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.1) 51%)`,
          }}
        >
          {/* Field markings */}
          <div className="absolute inset-0">
            <div className="absolute left-0 right-0 top-1/2 h-1 bg-white/40 -translate-y-1/2"></div>
            <div className="absolute top-1/2 left-1/2 w-16 h-16 border-2 border-white/40 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute top-0 left-1/2 w-32 h-16 border-2 border-white/40 border-t-0 -translate-x-1/2"></div>
            <div className="absolute bottom-0 left-1/2 w-32 h-16 border-2 border-white/40 border-b-0 -translate-x-1/2"></div>
            <div className="absolute top-0 left-1/2 w-16 h-8 border-2 border-white/40 border-t-0 -translate-x-1/2"></div>
            <div className="absolute bottom-0 left-1/2 w-16 h-8 border-2 border-white/40 border-b-0 -translate-x-1/2"></div>
            <div className="absolute top-0 left-1/2 w-12 h-1 bg-white/60 -translate-x-1/2"></div>
            <div className="absolute bottom-0 left-1/2 w-12 h-1 bg-white/60 -translate-x-1/2"></div>
            <div className="absolute top-0 left-0 w-4 h-4 border-b-2 border-r-2 border-white/40 rounded-br-lg"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-b-2 border-l-2 border-white/40 rounded-bl-lg"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-t-2 border-r-2 border-white/40 rounded-tr-lg"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-t-2 border-l-2 border-white/40 rounded-tl-lg"></div>
          </div>

          {/* Players with hover info (portal to avoid clipping) */}
          {formation.positions.map((position) => {
            const player = teamDetails.players.find(p => p.position_id === position.id);
            const side = position.x > 60 ? 'left' : 'right';
            return (
              <div
                key={position.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                style={{ left: `${position.x}%`, top: `${position.y}%` }}
              >
                {player ? (
                  <HoverCard openDelay={100} closeDelay={180}>
                    <HoverCardTrigger asChild>
                      <div className="flex flex-col items-center">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full border-2 border-white bg-gray-800 flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform">
                            {player?.image ? (
                              <img src={player.image} alt={player.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="text-white text-xs font-bold">{getPlayerName(player).substring(0, 2)}</div>
                            )}
                          </div>
                          <div className="absolute -top-1 -right-1 text-xs px-1 py-0.5 rounded text-white font-bold" style={{ backgroundColor: getPositionStyle(position.position).backgroundColor }}>
                            {position.position}
                          </div>
                        </div>
                        <div className="text-xs font-medium text-white bg-black/50 px-2 py-1 rounded mt-1 min-w-max">
                          {getPlayerName(player)}
                        </div>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent side={side} align="center" sideOffset={12} className="p-0 bg-transparent border-0 shadow-none w-auto">
                      <PlayerHoverCard player={player} />
                    </HoverCardContent>
                  </HoverCard>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full border-2 border-dashed border-white/50 flex items-center justify-center">
                      <div className="text-white/50 text-xs">{position.position}</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Memoized bench list
  const benchPlayers = useMemo(() => {
    if (!teamDetails) return [];
    if (Array.isArray(teamDetails.bench_players)) return teamDetails.bench_players;
    if (Array.isArray(teamDetails.bench)) return teamDetails.bench;
    if (teamDetails.team_data) {
      if (Array.isArray(teamDetails.team_data.bench_players)) return teamDetails.team_data.bench_players;
      if (Array.isArray(teamDetails.team_data.bench)) return teamDetails.team_data.bench;
    }
    return [];
  }, [teamDetails]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-lg border" style={{ backgroundColor: logoColors.blackAlpha(0.9), borderColor: logoColors.primaryBlueAlpha(0.3) }}>
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b" style={{ borderColor: logoColors.primaryBlueAlpha(0.2) }}>
          <div>
            <h2 className="text-2xl font-bold text-white">{teamDetails?.name || 'Team Preview'}</h2>
            <p className="text-sm text-gray-300">{teamDetails?.formation || 'Unknown Formation'}</p>
          </div>
          <div className="flex items-center gap-3">
            {onPrivacyToggle && (
              <Button onClick={handlePrivacyToggle} className="text-white border hover:opacity-80" style={{ backgroundColor: team?.is_public ? logoColors.primaryBlueAlpha(0.4) : logoColors.blackAlpha(0.5), borderColor: logoColors.primaryBlueAlpha(0.3) }}>
                {team?.is_public ? (<> <Users className="h-4 w-4 mr-2" />Make Private</>) : (<> <Shield className="h-4 w-4 mr-2" />Make Public</>)}
              </Button>
            )}
            <Button onClick={handleEditInBuilder} className="text-black hover:opacity-80 font-bold" style={{ background: logoColors.yellowOrangeGradient }}>
              <Edit className="h-4 w-4 mr-2" />
              Edit in Builder
            </Button>
            <Button onClick={onClose} className="text-white hover:opacity-80" style={{ backgroundColor: logoColors.blackAlpha(0.5) }}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 rounded-full mx-auto mb-4 animate-spin border-4 border-t-transparent" style={{ borderColor: logoColors.primaryBlue, borderTopColor: 'transparent' }} />
            <p className="text-gray-300">Loading team details...</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Formation Field */}
              <Card className="relative backdrop-blur-lg text-white border" style={{ backgroundColor: logoColors.blackAlpha(0.3), borderColor: logoColors.primaryBlueAlpha(0.2) }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="h-5 w-5" style={{ color: logoColors.primaryBlue }} />
                    Formation: {teamDetails?.formation || 'Unknown'}
                  </CardTitle>
                </CardHeader>
                {/* Coach in the top-right corner of the formation card at the same level */}
                {teamDetails?.coach && (
                  <div className="absolute top-3 right-3 flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1 border"
                       style={{ borderColor: logoColors.primaryBlueAlpha(0.2) }}>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
                         style={{ backgroundColor: logoColors.primaryYellow, color: 'black' }}>
                      {teamDetails.coach.name?.substring(0, 2) || 'CO'}
                    </div>
                    <div className="hidden md:flex flex-col leading-tight">
                      <div className="text-[11px] font-medium">{teamDetails.coach.name}</div>
                      <div className="text-[10px] text-gray-300">{teamDetails.coach.title || 'Coach'}</div>
                    </div>
                  </div>
                )}
                {/* Lock the formation area to a soccer-pitch friendly aspect ratio (~2:3) and let it scale responsively */}
                <CardContent className="p-4">
                  <AspectRatio ratio={3/4}>
                    <div className="absolute inset-0">
                      {renderFormationField()}
                    </div>
                  </AspectRatio>
                </CardContent>
              </Card>

              {/* Right Column: Tactics up, Bench up, Team Info after */}
              <div className="space-y-4">
                {/* Tactics (goes up) */}
                <Card className="backdrop-blur-lg text-white border" style={{ backgroundColor: logoColors.blackAlpha(0.3), borderColor: logoColors.primaryBlueAlpha(0.2) }}>
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
                          <div key={index} className="p-2 rounded border" style={{ backgroundColor: logoColors.primaryBlueAlpha(0.1), borderColor: logoColors.primaryBlueAlpha(0.2) }}>
                            <div className="text-sm font-medium">{tactic.name}</div>
                            {tactic.description && (
                              <div className="text-xs text-gray-300 mt-1">{tactic.description}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-2 text-gray-400 text-sm">No tactics assigned</div>
                    )}
                  </CardContent>
                </Card>

                {/* Bench (goes up) */}
                <Card className="backdrop-blur-lg text-white border" style={{ backgroundColor: logoColors.blackAlpha(0.3), borderColor: logoColors.primaryBlueAlpha(0.2) }}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Award className="h-4 w-4" style={{ color: logoColors.primaryOrange }} />
                      Bench ({benchPlayers.length}/5)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    {benchPlayers.length > 0 ? (
                      <div className="space-y-3">
                        {benchPlayers.map((player, index) => (
                          <HoverCard key={index} openDelay={100} closeDelay={150}>
                            <HoverCardTrigger asChild>
                              <div className="flex items-center gap-3 p-2 rounded border cursor-pointer" style={{ backgroundColor: logoColors.blackAlpha(0.2), borderColor: logoColors.primaryBlueAlpha(0.15) }}>
                                <div className="w-10 h-10 rounded-full bg-gray-700 border border-white/50 overflow-hidden">
                                  {player.image ? (
                                    <img src={player.image} alt={player.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                                      {getPlayerName(player).substring(0, 2)}
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-white font-medium text-sm truncate">{getPlayerName(player)}</div>
                                  <div className="text-xs text-gray-400">{getPlayerPosition(player)} • Lv {player.user_level || player.userLevel || 1}</div>
                                  {((player.user_hissatsu && player.user_hissatsu.length > 0) || (player.userHissatsu && player.userHissatsu.length > 0)) && (
                                    <div className="mt-1 flex flex-wrap gap-1">
                                      {(player.user_hissatsu || player.userHissatsu || []).map((technique, techIndex) => (
                                        <span key={techIndex} className="text-[10px] px-1 py-0.5 rounded" style={{ backgroundColor: logoColors.primaryYellowAlpha(0.15), color: logoColors.primaryYellow }}>
                                          {technique.name || `Tech${techIndex + 1}`}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <Badge className="shrink-0" style={{ backgroundColor: getPositionStyle(getPlayerPosition(player)).backgroundColor }}>
                                  {getPlayerPosition(player)}
                                </Badge>
                              </div>
                            </HoverCardTrigger>
                            <HoverCardContent side="left" align="center" sideOffset={12} className="p-0 bg-transparent border-0 shadow-none w-auto">
                              <PlayerHoverCard player={player} />
                            </HoverCardContent>
                          </HoverCard>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-2 text-gray-400 text-sm">No bench players</div>
                    )}
                  </CardContent>
                </Card>

                {/* Team Info moved down */}
                <Card className="backdrop-blur-lg text-white border" style={{ backgroundColor: logoColors.blackAlpha(0.3), borderColor: logoColors.primaryBlueAlpha(0.2) }}>
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
                      <Badge style={{ backgroundColor: teamDetails?.is_public ? logoColors.primaryBlueAlpha(0.2) : logoColors.blackAlpha(0.5), color: logoColors.white }}>
                        {teamDetails?.is_public ? 'Public Team' : 'Private Team'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Removed the Starting XI list below the pitch as requested */}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamPreviewModal;