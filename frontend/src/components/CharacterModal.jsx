import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Dialog, DialogContent, DialogHeader } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ChevronLeft, ChevronRight, Plus, X, Check, Zap, Users, Target, Shield, Activity, Gauge, Dumbbell } from 'lucide-react';
import { mockEquipment, mockHissatsu, calculateStats } from '../data/mock';
import { toast } from 'sonner';
import { logoColors } from '../styles/colors';

const CharacterModal = ({ character, isOpen, onClose, allCharacters, onAddToTeam, teamBuildingMode = false, pendingPosition = null, pendingIsBench = false }) => {
  const [currentCharacterIndex, setCurrentCharacterIndex] = useState(
    allCharacters && character ? allCharacters.findIndex(c => c.id === character.id) : 0
  );
  // Initialize with saved values if they exist, otherwise use base values
  const [userLevel, setUserLevel] = useState(character.userLevel || character.baseLevel || 1);
  const [userRarity, setUserRarity] = useState(character.userRarity || character.baseRarity || 'Common');
  const [selectedEquipment, setSelectedEquipment] = useState({
    boots: character.userEquipment?.boots || null,
    bracelets: character.userEquipment?.bracelets || null,
    pendants: character.userEquipment?.pendants || null,
    special: character.userEquipment?.special || null
  });
  const normalizePresets = (char) => {
    const raw = char?.userHissatsu || char?.user_hissatsu || null;
    const makeSlots = (arr) => {
      const out = [null, null, null, null, null, null];
      if (!Array.isArray(arr)) return out;
      if (arr.length >= 6) {
        for (let i = 0; i < 6; i++) out[i] = arr[i] || null;
        return out;
      }
      // Legacy: 3 techniques (one per slot) -> place into first sub-slot of each slot
      for (let i = 0; i < Math.min(3, arr.length); i++) out[i * 2] = arr[i] || null;
      return out;
    };

    if (Array.isArray(raw)) {
      // Legacy: flat array. Interpret as 6 for preset1 and next 6 for preset2
      const p1 = raw.slice(0, 6);
      const p2 = raw.slice(6, 12);
      return {
        preset1: makeSlots(p1),
        preset2: makeSlots(p2)
      };
    }
    if (raw && (Array.isArray(raw.preset1) || Array.isArray(raw.preset2))) {
      return {
        preset1: makeSlots(raw.preset1 || []),
        preset2: makeSlots(raw.preset2 || [])
      };
    }
    // Fallback to character's default techniques
    const base = Array.isArray(char?.hissatsu) ? char.hissatsu : [];
    return {
      preset1: makeSlots(base.slice(0, 3)),
      preset2: makeSlots(base.slice(3, 6))
    };
  };
  const [selectedHissatsu, setSelectedHissatsu] = useState(normalizePresets(character));

  // Update state when character changes (for editing different players)
  useEffect(() => {
    if (character) {
      setUserLevel(character.userLevel || character.baseLevel || 1);
      setUserRarity(character.userRarity || character.baseRarity || 'Common');
      setSelectedEquipment({
        boots: character.userEquipment?.boots || null,
        bracelets: character.userEquipment?.bracelets || null,
        pendants: character.userEquipment?.pendants || null,
        special: character.userEquipment?.special || null
      });
      setSelectedHissatsu(normalizePresets(character));
    }
  }, [character, isOpen]);
  const [activePreset, setActivePreset] = useState(1);
  const [showEquipmentList, setShowEquipmentList] = useState(false);
  const [showHissatsuList, setShowHissatsuList] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const currentCharacter = allCharacters && allCharacters[currentCharacterIndex] ? allCharacters[currentCharacterIndex] : character;
  const calculatedStats = calculateStats(currentCharacter || {}, selectedEquipment || {}, userLevel, userRarity);

  const getPositionColor = (position) => {
    switch (position) {
      case 'FW': return 'bg-red-500 text-white';
      case 'MF': return 'bg-orange-500 text-white';
      case 'DF': return 'bg-blue-500 text-white';
      case 'GK': return 'bg-green-600 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatColor = (position) => {
    switch (position) {
      case 'FW': return 'text-red-400';
      case 'MF': return 'text-orange-400';
      case 'DF': return 'text-blue-400';
      case 'GK': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'Legendary': return `bg-gradient-to-r from-yellow-400 to-orange-500`;
      case 'Epic': return `bg-gradient-to-r from-purple-500 to-pink-500`;
      case 'Rare': return `bg-gradient-to-r from-blue-500 to-[${logoColors.secondaryBlue}]`;
      case 'Common': return 'bg-gradient-to-r from-gray-400 to-gray-600';
      default: return 'bg-gradient-to-r from-orange-500 to-red-600';
    }
  };

  const getRarityTextColor = (rarity) => {
    switch (rarity) {
      case 'Legendary': return 'text-yellow-400';
      case 'Epic': return 'text-purple-400';
      case 'Rare': return `text-[${logoColors.secondaryBlue}]`;
      case 'Common': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getStatIcon = (stat) => {
    switch (stat) {
      case 'kick': return <Zap className="h-4 w-4" />;
      case 'control': return <Target className="h-4 w-4" />;
      case 'technique': return <Users className="h-4 w-4" />;
      case 'intelligence': return <Activity className="h-4 w-4" />;
      case 'pressure': return <Shield className="h-4 w-4" />;
      case 'agility': return <Gauge className="h-4 w-4" />;
      case 'physical': return <Dumbbell className="h-4 w-4" />;
      default: return null;
    }
  };

  const navigateCharacter = (direction) => {
    if (!allCharacters || allCharacters.length === 0) {
      return; // Don't navigate if no characters available
    }
    
    const newIndex = direction === 'next' 
      ? (currentCharacterIndex + 1) % allCharacters.length
      : (currentCharacterIndex - 1 + allCharacters.length) % allCharacters.length;
    
    setCurrentCharacterIndex(newIndex);
    // Reset user preferences for new character
    setUserLevel(99);
    setUserRarity('Legendary');
    setSelectedEquipment({
      boots: null,
      bracelets: null,
      pendants: null,
      special: null
    });
  };

  const handleEquipmentSelect = (equipment) => {
    setSelectedEquipment(prev => ({
      ...prev,
      [selectedCategory]: equipment
    }));
    setShowEquipmentList(false);
    setSelectedCategory(null);
    toast.success(`${equipment.name} equipped!`);
  };

  const handleEquipmentUnequip = (category) => {
    setSelectedEquipment(prev => ({
      ...prev,
      [category]: null
    }));
    toast.success(`Equipment unequipped!`);
  };

  const handleHissatsuToggle = (hissatsu, slotIndex) => {
    const currentPreset = `preset${activePreset}`;
    setSelectedHissatsu(prev => {
      const newPresets = { ...prev };
      const currentTechniques = [...newPresets[currentPreset]];
      
      // If slot is empty, add the technique
      if (!currentTechniques[slotIndex]) {
        currentTechniques[slotIndex] = hissatsu;
      } else {
        // If slot is occupied, remove the technique
        currentTechniques[slotIndex] = null;
      }
      
      // Filter out null values and ensure array length is 3
      const filteredTechniques = currentTechniques.filter(t => t !== null);
      while (filteredTechniques.length < 3) {
        filteredTechniques.push(null);
      }
      
      newPresets[currentPreset] = filteredTechniques;
      return newPresets;
    });
  };

  const handleHissatsuSlotClick = (slotIndex) => {
    setSelectedCategory(slotIndex);
    setShowHissatsuList(true);
  };

  // Map 0..5 index to Slot number and sub-slot
  const displaySlotLabel = (i) => {
    const slotNum = Math.floor(i / 2) + 1;
    const sub = i % 2 === 0 ? 'A' : 'B';
    return `${slotNum}-${sub}`;
  };

  // Compute AT value for a technique based on current calculated stats
  const getTechniqueAT = (tech) => {
    if (!tech || !calculatedStats) return null;
    const type = (tech.type || '').toLowerCase();
    let key = 'technique';
    if (type.includes('shot')) key = 'kick';
    else if (type.includes('dribble')) key = 'technique';
    else if (type.includes('pass')) key = 'control';
    else if (type.includes('block')) key = 'pressure';
    else if (type.includes('catch')) key = 'intelligence';
    else if (type.includes('punch')) key = 'physical';
    const val = Number(calculatedStats?.[key]?.main || 0);
    // Normalize to 1..99 similar to UI in reference
    const at = Math.max(1, Math.min(99, Math.round((val / 200) * 99)));
    return at;
  };

  const handleHissatsuSelect = (hissatsu) => {
    const currentPreset = `preset${activePreset}`;
    const slotIndex = selectedCategory;

    setSelectedHissatsu(prev => {
      const newPresets = { ...prev };
      const currentTechniques = Array.isArray(newPresets[currentPreset]) ? [...newPresets[currentPreset]] : [null, null, null, null, null, null];
      // Prevent duplicates within the same preset
      const existsIdx = currentTechniques.findIndex(t => t && hissatsu && t.id === hissatsu.id);
      if (existsIdx !== -1 && existsIdx !== slotIndex) {
        // Swap to the clicked slot to allow moving a technique
        currentTechniques[existsIdx] = currentTechniques[slotIndex] || null;
      }
      currentTechniques[slotIndex] = hissatsu;
      newPresets[currentPreset] = currentTechniques;
      return newPresets;
    });

    setShowHissatsuList(false);
    setSelectedCategory(null);
  };

  const handleRemoveHissatsu = (slotIndex) => {
    const currentPreset = `preset${activePreset}`;
    setSelectedHissatsu(prev => {
      const newPresets = { ...prev };
      const currentTechniques = [...newPresets[currentPreset]];
      currentTechniques[slotIndex] = null;
      newPresets[currentPreset] = currentTechniques;
      return newPresets;
    });
  };

  const handleHissatsuConfirm = () => {
    setShowHissatsuList(false);
    setSelectedCategory(null);
    toast.success('Hissatsu techniques updated!');
  };

  const addToTeam = () => {
    if (onAddToTeam) {
      onAddToTeam(currentCharacter, userLevel, userRarity, selectedEquipment, selectedHissatsu);
      onClose();
    } else {
      toast.success(`${currentCharacter.name} (Lv.${userLevel}) added to team!`);
    }
  };

  const StatRadarChart = ({ stats }) => {
    const statNames = ['kick', 'control', 'technique', 'intelligence', 'pressure', 'agility', 'physical'];
    const statIcons = {
      'kick': '⚽',        // Soccer ball for kick (more visible)
      'control': '🎯',     // Target for control 
      'technique': '⭐',    // Star for technique (more visible)
      'intelligence': '🧠', // Brain for intelligence
      'pressure': '🛡️',    // Shield for pressure
      'agility': '⚡',     // Lightning for agility
      'physical': '💪'     // Muscle for physical
    };
    
    // Calculate dynamic max value based on actual stats for better scaling
    const statValues = statNames.map(stat => stats[stat].main);
    const maxStatValue = Math.max(...statValues);
    const maxValue = Math.max(150, maxStatValue * 1.2); // At least 150, or 20% above max stat
    
    const center = 60;
    const radius = 50;
    
    const points = statNames.map((stat, index) => {
      const angle = (index * 2 * Math.PI) / statNames.length - Math.PI / 2;
      const value = stats[stat].main;
      const r = Math.max(3, (value / maxValue) * radius); // Minimum radius of 3 for visibility
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return { x, y, value, stat };
    });

    const pathData = points.map((point, index) => 
      `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ') + ' Z';

    return (
      <div className="relative">
        <svg width="120" height="120" className="mx-auto">
          {/* Background circles with better visibility */}
          {[0.2, 0.4, 0.6, 0.8, 1.0].map((ratio, index) => (
            <circle
              key={index}
              cx={center}
              cy={center}
              r={radius * ratio}
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="1"
            />
          ))}
          
          {/* Stat lines */}
          {statNames.map((stat, index) => {
            const angle = (index * 2 * Math.PI) / statNames.length - Math.PI / 2;
            const x = center + radius * Math.cos(angle);
            const y = center + radius * Math.sin(angle);
            return (
              <line
                key={stat}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="1"
              />
            );
          })}
          
          {/* Stat labels with improved icons and visibility */}
          {statNames.map((stat, index) => {
            const angle = (index * 2 * Math.PI) / statNames.length - Math.PI / 2;
            const labelRadius = radius + 18;
            const x = center + labelRadius * Math.cos(angle);
            const y = center + labelRadius * Math.sin(angle);
            return (
              <g key={stat}>
                {/* White background circle for better visibility */}
                <circle
                  cx={x}
                  cy={y}
                  r="10"
                  fill="rgba(255,255,255,0.1)"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="1"
                />
                {/* Icon */}
                <text
                  x={x}
                  y={y + 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-white text-[14px]"
                  style={{ textShadow: '0 0 3px rgba(0,0,0,0.8)' }}
                >
                  {statIcons[stat]}
                </text>
              </g>
            );
          })}
          
          {/* Stat area with better opacity */}
          <path
            d={pathData}
            fill={logoColors.primaryBlueAlpha(0.4)}
            stroke={logoColors.primaryBlue}
            strokeWidth="2"
          />
          
          {/* Stat points with better visibility */}
          {points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="4"
              fill={logoColors.primaryBlue}
              stroke="white"
              strokeWidth="2"
            />
          ))}
        </svg>
        {/* Max value indicator */}
        <div className="text-center mt-2">
          <span className="text-xs text-gray-400">Max: {Math.round(maxValue)}</span>
        </div>
      </div>
    );
  };

  if (!currentCharacter) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] text-white border-orange-400/20 overflow-y-auto"
                     style={{ background: logoColors.backgroundGradient }}>
        <DialogHeader className="relative">
          {/* Navigation Arrows */}
          {allCharacters && allCharacters.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-0 top-0 text-white hover:bg-blue-700/30"
                onClick={() => navigateCharacter('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 text-white hover:bg-blue-700/30"
                onClick={() => navigateCharacter('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Character Header */}
          <div className={`${getRarityColor(userRarity)} rounded-lg p-4 mt-8`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">{currentCharacter.title}</h2>
                <h3 className="text-xl text-white">{currentCharacter.name}</h3>
                <p className="text-lg text-white">{currentCharacter.nickname}</p>
              </div>
              <div className="text-right">
                <Badge className={`${getRarityTextColor(userRarity)} text-lg px-3 py-1 mb-2 bg-white/20`}>
                  {userRarity}
                </Badge>
                <Badge className={`${getPositionColor(currentCharacter.position)} text-lg px-3 py-1`}>
                  {currentCharacter.position}
                </Badge>
              </div>
            </div>
          </div>

          {/* User Controls */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-2">Level (1-99)</label>
              <Select value={userLevel.toString()} onValueChange={(value) => setUserLevel(parseInt(value))}>
                <SelectTrigger className="text-white border"
                               style={{ 
                                 backgroundColor: logoColors.blackAlpha(0.3),
                                 borderColor: logoColors.primaryBlueAlpha(0.3)
                               }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: logoColors.blackAlpha(0.9) }}>
                  {Array.from({ length: 99 }, (_, i) => i + 1).map(level => (
                    <SelectItem key={level} value={level.toString()} className="text-white hover:bg-blue-800">
                      Level {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Rarity</label>
              <Select value={userRarity} onValueChange={setUserRarity}>
                <SelectTrigger className="text-white border"
                               style={{ 
                                 backgroundColor: logoColors.blackAlpha(0.3),
                                 borderColor: logoColors.primaryBlueAlpha(0.3)
                               }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: logoColors.blackAlpha(0.9) }}>
                  <SelectItem value="Common" className="text-white hover:bg-blue-800">Common</SelectItem>
                  <SelectItem value="Rare" className="text-white hover:bg-blue-800">Rare</SelectItem>
                  <SelectItem value="Epic" className="text-white hover:bg-blue-800">Epic</SelectItem>
                  <SelectItem value="Legendary" className="text-white hover:bg-blue-800">Legendary</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="p-3 rounded-lg mt-4 border-l-4 text-white"
               style={{ 
                 backgroundColor: logoColors.primaryBlueAlpha(0.2),
                 borderLeftColor: logoColors.primaryBlue
               }}>
            <p className="italic">{currentCharacter.description}</p>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Stats Panel */}
          <Card className="backdrop-blur-lg border text-white"
                style={{ 
                  backgroundColor: logoColors.blackAlpha(0.3),
                  borderColor: logoColors.primaryBlueAlpha(0.2)
                }}>
            <CardContent className="p-4">
              <h4 className="text-lg font-bold mb-4 text-center">PARAMETERS</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <StatRadarChart stats={calculatedStats} />
                </div>
                <div className="space-y-2">
                  {Object.entries(calculatedStats).map(([stat, values]) => (
                    <div key={stat} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatIcon(stat)}
                        <span className="text-sm capitalize">{stat}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          {/* Final total value */}
                          <div className={`text-lg font-bold ${getStatColor(currentCharacter.position)}`}>
                            {values.main}
                          </div>
                          {/* Base + Equipment breakdown */}
                          <div className="text-xs flex items-center gap-1">
                            <span className="text-white">{values.base}</span>
                            {values.equipmentBonus > 0 && (
                              <>
                                <span className="text-gray-400">+</span>
                                <span className="text-yellow-400">{values.equipmentBonus}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <span className="text-sm text-gray-400">
                          {values.secondary}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Equipment Panel */}
          <Card className="backdrop-blur-lg border text-white"
                style={{ 
                  backgroundColor: logoColors.blackAlpha(0.3),
                  borderColor: logoColors.primaryBlueAlpha(0.2)
                }}>
            <CardContent className="p-4">
              <h4 className="text-lg font-bold mb-4">EQUIPMENT</h4>
              
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(selectedEquipment).map(([category, item]) => (
                  <div
                    key={category}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      item ? getRarityColor(item.rarity) : 'border-dashed bg-orange-900/20'
                    } hover:scale-105`}
                    style={!item ? { 
                      borderColor: logoColors.primaryBlueAlpha(0.3),
                      backgroundColor: logoColors.blackAlpha(0.2)
                    } : {}}
                    onClick={() => {
                      setSelectedCategory(category);
                      setShowEquipmentList(true);
                    }}
                  >
                    {item ? (
                      <div className="relative">
                        <div className="flex items-center gap-2">
                          <img src={item.icon} alt={item.name} className="w-8 h-8" />
                          <div>
                            <div className="font-medium text-sm">{item.name}</div>
                            <div className="text-xs text-gray-200">{item.category}</div>
                          </div>
                        </div>
                        {/* Unequip button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute -top-2 -right-2 w-5 h-5 rounded-full p-0 bg-red-500 hover:bg-red-600 text-white flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEquipmentUnequip(category);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Plus className="h-6 w-6 mx-auto mb-1" style={{ color: logoColors.primaryBlue }} />
                        <div className="text-xs capitalize" style={{ color: logoColors.primaryBlue }}>{category}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Team Passives */}
          <Card className="backdrop-blur-lg border text-white"
                style={{ 
                  backgroundColor: logoColors.blackAlpha(0.3),
                  borderColor: logoColors.primaryBlueAlpha(0.2)
                }}>
            <CardContent className="p-4">
              <h4 className="text-lg font-bold mb-4">TEAM PASSIVES</h4>
              
              <div className="space-y-3">
                {(currentCharacter.teamPassives || []).map((passive, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <img src={passive.icon} alt={passive.name} className="w-6 h-6 mt-1" />
                    <div>
                      <div className="font-medium text-sm">{passive.name}</div>
                      <div className="text-xs text-gray-300">{passive.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Hissatsu Panel */}
          <Card className="backdrop-blur-lg border text-white"
                style={{ 
                  backgroundColor: logoColors.blackAlpha(0.3),
                  borderColor: logoColors.primaryBlueAlpha(0.2)
                }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold">HISSATSU (TECHNIQUES)</h4>
                <div className="flex gap-2">
                  <Button
                    variant={activePreset === 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActivePreset(1)}
                    className={activePreset === 1 
                      ? "text-white" 
                      : "text-white border hover:bg-blue-700"
                    }
                    style={activePreset === 1 ? {
                      background: logoColors.primaryBlue
                    } : {
                      borderColor: logoColors.primaryBlueAlpha(0.3)
                    }}
                  >
                    Preset 1
                  </Button>
                  <Button
                    variant={activePreset === 2 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActivePreset(2)}
                    className={activePreset === 2 
                      ? "text-white" 
                      : "text-white border hover:bg-blue-700"
                    }
                    style={activePreset === 2 ? {
                      background: logoColors.primaryBlue
                    } : {
                      borderColor: logoColors.primaryBlueAlpha(0.3)
                    }}
                  >
                    Preset 2
                  </Button>
                </div>
              </div>
              
              <div className="space-y-3">
                {[0, 2, 4].map(slotBase => {
                  const currentPreset = `preset${activePreset}`;
                  const techniqueA = (selectedHissatsu?.[currentPreset] || [])[slotBase] || null;
                  const techniqueB = (selectedHissatsu?.[currentPreset] || [])[slotBase + 1] || null;

                  const renderSlot = (idx, technique) => {
                    const atVal = technique ? getTechniqueAT(technique) : null;
                    return (
                      <div
                        key={idx}
                        className={`relative p-0 rounded-lg border cursor-pointer transition-all hover:scale-[1.005] overflow-hidden h-[72px] ${
                          technique ? 'border-orange-500/30' : 'border-dashed hover:border-blue-400/60'
                        }`}
                        style={technique ? {
                          backgroundColor: logoColors.primaryBlueAlpha(0.12),
                          borderColor: logoColors.primaryBlueAlpha(0.3)
                        } : {
                          backgroundColor: logoColors.blackAlpha(0.1),
                          borderColor: logoColors.primaryBlueAlpha(0.25)
                        }}
                        onClick={() => handleHissatsuSlotClick(idx)}
                      >
                        {/* Single box layout matching the provided sketch */}
                        <div className="flex items-center justify-between px-3 py-2">
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Technique type icon circle */}
                            <div className="w-8 h-8 rounded-full border flex items-center justify-center overflow-hidden"
                                 style={{ borderColor: logoColors.primaryBlueAlpha(0.4), backgroundColor: logoColors.blackAlpha(0.2) }}>
                              {technique ? (
                                <img src={technique.icon} alt={technique.type} className="w-6 h-6 object-cover" />
                              ) : (
                                <Plus className="h-4 w-4" style={{ color: logoColors.primaryBlue }} />
                              )}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <div className="text-sm font-medium truncate">{technique ? technique.name : 'Add Technique'}</div>
                              <div className="text-[11px] text-gray-400">{displaySlotLabel(idx)}</div>
                            </div>
                          </div>
                          {/* AT value on the right, stacked label and number */}
                          <div className="text-right leading-none">
                            <div className="text-[10px] text-white/80 mb-0.5">AT</div>
                            <div className="text-[22px] font-extrabold" style={{ color: logoColors.primaryBlue }}>{atVal ?? '--'}</div>
                          </div>
                        </div>
                        {technique && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 bg-red-500 hover:bg-red-600 text-white"
                            onClick={(e) => { e.stopPropagation(); handleRemoveHissatsu(idx); }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    );
                  };

                  return (
                    <div key={slotBase} className="rounded-lg border p-3" style={{ borderColor: logoColors.primaryBlueAlpha(0.2), backgroundColor: logoColors.blackAlpha(0.05) }}>
                      <SlotGroup slotNum={Math.floor(slotBase/2) + 1}>
                        {renderSlot(slotBase, techniqueA)}
                        {renderSlot(slotBase + 1, techniqueB)}
                      </SlotGroup>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-400">
                  Click on a slot to add/change technique. Click preset buttons to switch between presets.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add to Team Button - Restored with enhanced functionality */}
        {onAddToTeam && (
          <div className="mt-6 flex justify-center">
            <Button
              onClick={addToTeam}
              className="text-white px-8 py-3 text-lg font-semibold hover:opacity-80"
              style={{ background: logoColors.yellowOrangeGradient, color: logoColors.black }}
            >
              <Plus className="h-5 w-5 mr-2" />
              {teamBuildingMode ? (
                pendingIsBench ? 
                  'Add to Bench' : 
                  `Add to ${pendingPosition ? 'Position' : 'Team'}`
              ) : (
                'Add to Team'
              )}
            </Button>
          </div>
        )}

        {/* Equipment List Modal */}
        {showEquipmentList && selectedCategory && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="p-6 rounded-lg max-w-md w-full mx-4 max-h-96 overflow-y-auto border text-white"
                 style={{ 
                   backgroundColor: logoColors.blackAlpha(0.9),
                   borderColor: logoColors.primaryBlueAlpha(0.3)
                 }}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Select {selectedCategory}</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowEquipmentList(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {mockEquipment[selectedCategory]?.map((equipment) => (
                  <div
                    key={equipment.id}
                    className={`p-3 rounded-lg cursor-pointer hover:scale-105 transition-all ${getRarityColor(equipment.rarity)}`}
                    onClick={() => handleEquipmentSelect(equipment)}
                  >
                    <div className="flex items-center gap-2">
                      <img src={equipment.icon} alt={equipment.name} className="w-8 h-8" />
                      <div>
                        <div className="font-medium">{equipment.name}</div>
                        <div className="text-sm text-gray-200">{equipment.category}</div>
                        <div className="text-xs" style={{ color: logoColors.primaryYellow }}>
                          {Object.entries(equipment.stats).map(([stat, value]) => 
                            `${stat}: +${value}`
                          ).join(', ')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Hissatsu Selection Modal */}
        {showHissatsuList && selectedCategory !== null && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="p-6 rounded-lg max-w-2xl w-full mx-4 max-h-96 overflow-y-auto border text-white"
                 style={{ 
                   backgroundColor: logoColors.blackAlpha(0.9),
                   borderColor: logoColors.primaryBlueAlpha(0.3)
                 }}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Select Technique for Slot {selectedCategory + 1}</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowHissatsuList(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {mockHissatsu.map((hissatsu) => {
                  const currentPreset = `preset${activePreset}`;
                  const isUsedInPreset = (selectedHissatsu?.[currentPreset] || []).some(h => h && h.id === hissatsu.id);
                  
                  return (
                    <div
                      key={hissatsu.id}
                      className={`p-3 rounded-lg cursor-pointer transition-all border ${
                        isUsedInPreset
                          ? 'opacity-50 cursor-not-allowed' 
                          : 'hover:bg-blue-700/30'
                      }`}
                      style={isUsedInPreset ? {
                        backgroundColor: logoColors.blackAlpha(0.3),
                        borderColor: logoColors.primaryBlueAlpha(0.2)
                      } : {
                        backgroundColor: logoColors.blackAlpha(0.2),
                        borderColor: logoColors.primaryBlueAlpha(0.3)
                      }}
                      onClick={() => !isUsedInPreset && handleHissatsuSelect(hissatsu)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img src={hissatsu.icon} alt={hissatsu.name} className="w-8 h-8" />
                          <div>
                            <div className="font-medium">{hissatsu.name}</div>
                            <div className="text-sm text-gray-300">{hissatsu.description}</div>
                            <Badge variant="outline" className="mt-1" 
                                   style={{ color: logoColors.primaryBlue, borderColor: logoColors.primaryBlue }}>
                              {hissatsu.type}
                            </Badge>
                          </div>
                        </div>
                        {isUsedInPreset && (
                          <Badge variant="outline" className="text-gray-400 border-gray-400">
                            Already Selected
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <Button 
                  onClick={() => setShowHissatsuList(false)} 
                  className="text-white border hover:bg-blue-700/60"
                  style={{ 
                    backgroundColor: logoColors.blackAlpha(0.4),
                    borderColor: logoColors.primaryBlueAlpha(0.3)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};


// Group wrapper that renders the left number circle and uses SlotConnector for 90° lines
const SlotGroup = ({ slotNum, children }) => {
  return (
    <div className="grid grid-cols-[36px_1fr] gap-2">
      {/* Left label column with number circle and a short connector */}
      <div className="relative">
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-md grid place-items-center text-[12px] font-bold text-white/90"
          style={{ border: '2px solid rgba(255,255,255,0.45)', background: 'transparent' }}
        >
          {slotNum}
        </div>
        {/* small horizontal line to meet the vertical spine */}
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 h-[2px]"
          style={{ width: 12, background: 'rgba(255,255,255,0.45)' }}
        />
      </div>
      {/* Right column with precise connector and technique boxes */}
      <SlotConnector>
        {children}
      </SlotConnector>
    </div>
  );
};

// Precise connector wrapper: measures children and draws an SVG connector to midpoints
const SlotConnector = ({ children }) => {
  const containerRef = useRef(null);
  const [arms, setArms] = useState(null);
  const rafRef = useRef(null);
  const lastRef = useRef(null);

  const measure = () => {
    const el = containerRef.current;
    if (!el) return;
    const boxes = Array.from(el.querySelectorAll('[data-tech-box]'));
    if (boxes.length === 0) return;
    const rectParent = el.getBoundingClientRect();
    const mids = boxes.map(b => {
      const r = b.getBoundingClientRect();
      return { y: r.top - rectParent.top + r.height / 2 };
    });
    const y1 = mids[0]?.y ?? 0;
    const y2 = mids[mids.length - 1]?.y ?? y1;
    const next = { y1, y2, mids };
    const prev = lastRef.current;
    const same = prev && prev.y1 === next.y1 && prev.y2 === next.y2 && prev.mids.length === next.mids.length && prev.mids.every((m, i) => m.y === next.mids[i].y);
    if (!same) {
      lastRef.current = next;
      setArms(next);
    }
  };

  useLayoutEffect(() => {
    // measure once after mount/children change
    rafRef.current = requestAnimationFrame(measure);
    const el = containerRef.current;
    if (!el) return () => {};
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(measure);
    });
    ro.observe(el);
    const onResize = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(measure);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      ro.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, [children]);

  return (
    <div ref={containerRef} className="flex-1 space-y-4 relative">
      {/* Custom connector drawing: top elbow to first box, bottom elbow to second box */}
      <svg className="pointer-events-none absolute left-[-24px] top-0 h-full" width="36" height="100%" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
        {arms && (
          <g stroke="rgba(255,255,255,0.45)" strokeWidth="2" fill="none">
            {/* Top elbow (slightly above the midpoint of the first box) */}
            {arms.mids[0] && (
              <>
                {/* short up segment off the top wall */}
                <line x1="18" y1={arms.mids[0].y - 10} x2="18" y2={arms.mids[0].y - 2} />
                {/* 90-degree turn into the first technique box */}
                <line x1="18" y1={arms.mids[0].y - 2} x2="36" y2={arms.mids[0].y - 2} />
              </>
            )}
            {/* Bottom elbow (slightly below the midpoint of the second box) – mirror of the top */}
            {arms.mids[1] && (
              <>
                {/* short down segment off the bottom wall */}
                <line x1="18" y1={arms.mids[1].y + 10} x2="18" y2={arms.mids[1].y + 2} />
                {/* 90-degree turn into the second technique box */}
                <line x1="18" y1={arms.mids[1].y + 2} x2="36" y2={arms.mids[1].y + 2} />
              </>
            )}
          </g>
        )}
      </svg>
      {React.Children.map(children, (child) => (
        <div data-tech-box className="relative">{child}</div>
      ))}
    </div>
  );
};

export default CharacterModal;