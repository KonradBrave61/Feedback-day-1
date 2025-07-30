import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navigation from '../components/Navigation';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { toast } from 'sonner';
import {
  Stars, Zap, Info, Gamepad2, Monitor, Smartphone,
  Sparkles, ArrowLeft, ArrowRight, RotateCcw
} from 'lucide-react';

const ConstellationsPage = () => {
  const { user, updateUser } = useAuth();
  const [constellations, setConstellations] = useState([]);
  const [currentConstellationIndex, setCurrentConstellationIndex] = useState(0);
  const [characterPools, setCharacterPools] = useState({});
  const [dropRates, setDropRates] = useState({});
  const [selectedOrbCharacters, setSelectedOrbCharacters] = useState([]); // New state for clicked orb
  const [platformBonuses, setPlatformBonuses] = useState({
    nintendo: false,
    playstation: false,
    pc: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isPulling, setIsPulling] = useState(false);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    fetchConstellations();
  }, []);

  useEffect(() => {
    if (constellations.length > 0) {
      const currentConstellation = constellations[currentConstellationIndex];
      fetchConstellationData(currentConstellation.id);
      startConstellationAnimation();
    }
  }, [currentConstellationIndex, constellations]);

  const fetchConstellations = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/constellations/`);
      if (response.ok) {
        const data = await response.json();
        setConstellations(data);
        if (data.length > 0) {
          fetchConstellationData(data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching constellations:', error);
      toast.error('Failed to load constellations');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchConstellationData = async (constellationId) => {
    try {
      // Fetch character pool
      const poolResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/constellations/${constellationId}/characters`);
      if (poolResponse.ok) {
        const poolData = await poolResponse.json();
        setCharacterPools(prev => ({ ...prev, [constellationId]: poolData }));
      }

      // Fetch drop rates with platform bonuses
      const bonusString = `${platformBonuses.nintendo ? '1' : '0'}${platformBonuses.playstation ? '1' : '0'}${platformBonuses.pc ? '1' : '0'}`;
      const ratesResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/constellations/${constellationId}/drop-rates?platform_bonuses=${bonusString}`);
      if (ratesResponse.ok) {
        const ratesData = await ratesResponse.json();
        setDropRates(prev => ({ ...prev, [constellationId]: ratesData }));
      }
    } catch (error) {
      console.error('Error fetching constellation data:', error);
    }
  };

  const startConstellationAnimation = () => {
    const canvas = canvasRef.current;
    if (!canvas || !constellations[currentConstellationIndex]) return;

    const ctx = canvas.getContext('2d');
    const constellation = constellations[currentConstellationIndex];
    
    // Set canvas size
    canvas.width = 600;
    canvas.height = 400;

    let time = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw constellation background
      const gradient = ctx.createRadialGradient(300, 200, 0, 300, 200, 300);
      gradient.addColorStop(0, constellation.background_color + '40');
      gradient.addColorStop(1, constellation.background_color + '10');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw connections first
      ctx.strokeStyle = constellation.orb_color + '60';
      ctx.lineWidth = 2;
      constellation.connections.forEach(connection => {
        const [orb1Id, orb2Id] = connection;
        const orb1 = constellation.orbs.find(o => o.id === orb1Id);
        const orb2 = constellation.orbs.find(o => o.id === orb2Id);
        
        if (orb1 && orb2) {
          ctx.beginPath();
          ctx.moveTo(orb1.x * 6, orb1.y * 4);
          ctx.lineTo(orb2.x * 6, orb2.y * 4);
          ctx.stroke();
        }
      });

      // Draw orbs
      constellation.orbs.forEach((orb, index) => {
        const x = orb.x * 6;
        const y = orb.y * 4;
        const baseSize = 8;
        const pulseSize = Math.sin(time * 0.05 + index) * 2;
        const size = baseSize + pulseSize * orb.glow_intensity;

        // Outer glow
        const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
        glowGradient.addColorStop(0, constellation.orb_color + 'FF');
        glowGradient.addColorStop(0.3, constellation.orb_color + '80');
        glowGradient.addColorStop(1, constellation.orb_color + '00');
        
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(x, y, size * 3, 0, Math.PI * 2);
        ctx.fill();

        // Inner orb
        const orbGradient = ctx.createRadialGradient(x - size/3, y - size/3, 0, x, y, size);
        orbGradient.addColorStop(0, '#ffffff');
        orbGradient.addColorStop(0.7, constellation.orb_color);
        orbGradient.addColorStop(1, constellation.orb_color + '80');
        
        ctx.fillStyle = orbGradient;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      });

      time += 1;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  // New function to handle canvas clicks
  const handleCanvasClick = (event) => {
    const canvas = canvasRef.current;
    if (!canvas || !constellations[currentConstellationIndex]) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    console.log('Canvas click:', { x, y, canvasWidth: canvas.width, canvasHeight: canvas.height });

    const constellation = constellations[currentConstellationIndex];
    
    // Check if click is within any orb
    let clickedOrb = false;
    constellation.orbs.forEach((orb, index) => {
      const orbX = orb.x * 6;
      const orbY = orb.y * 4;
      const orbRadius = 70; // Much larger click detection radius
      
      const distance = Math.sqrt((x - orbX) ** 2 + (y - orbY) ** 2);
      
      console.log(`Orb ${index}: position (${orbX}, ${orbY}), distance: ${distance}, radius: ${orbRadius}`);
      
      if (distance <= orbRadius && !clickedOrb) {
        clickedOrb = true;
        console.log(`Orb ${index} clicked!`);
        
        // Get characters for this orb from character pool
        const currentPool = characterPools[constellation.id] || { legendary: [], epic: [], rare: [], normal: [] };
        const allCharacters = [
          ...currentPool.legendary,
          ...currentPool.epic,
          ...currentPool.rare,
          ...currentPool.normal
        ];
        
        // Better character distribution - ensure each orb gets characters
        let orbCharacters = [];
        if (allCharacters.length > 0) {
          // Distribute characters more evenly across orbs
          const charactersPerOrb = Math.max(1, Math.floor(allCharacters.length / constellation.orbs.length));
          const startIndex = (index * charactersPerOrb) % allCharacters.length;
          
          // Get characters for this orb, wrap around if needed
          for (let i = 0; i < Math.min(3, charactersPerOrb); i++) {
            const charIndex = (startIndex + i) % allCharacters.length;
            if (allCharacters[charIndex] && !orbCharacters.includes(allCharacters[charIndex])) {
              orbCharacters.push(allCharacters[charIndex]);
            }
          }
          
          // Ensure we always have at least one character if any are available
          if (orbCharacters.length === 0 && allCharacters.length > 0) {
            orbCharacters.push(allCharacters[index % allCharacters.length]);
          }
        }
        
        console.log('Setting orb characters:', orbCharacters.length > 0 ? orbCharacters : 'No characters available');
        setSelectedOrbCharacters(orbCharacters);
      }
    });
    
    if (!clickedOrb) {
      console.log('No orb clicked');
    }
  };

  const handlePlatformBonusToggle = (platform) => {
    const newBonuses = { ...platformBonuses, [platform]: !platformBonuses[platform] };
    setPlatformBonuses(newBonuses);
    
    // Refetch drop rates with new bonuses
    if (constellations.length > 0) {
      const currentConstellation = constellations[currentConstellationIndex];
      fetchConstellationData(currentConstellation.id);
    }
  };

  const handleGachaPull = async (pullCount = 1) => {
    if (!user) {
      toast.error('Please log in to pull characters');
      return;
    }

    const currentConstellation = constellations[currentConstellationIndex];
    const cost = pullCount * 5;
    
    if (user.kizuna_stars < cost) {
      toast.error(`Not enough Kizuna Stars! Need ${cost}, have ${user.kizuna_stars}`);
      return;
    }

    setIsPulling(true);
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/constellations/pull`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          constellation_id: currentConstellation.id,
          pull_count: pullCount,
          platform_bonuses: platformBonuses
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Update user's Kizuna Stars
        updateUser({ ...user, kizuna_stars: result.kizuna_stars_remaining });
        
        // Show pull results
        const rarityColors = {
          legendary: 'text-red-400',
          epic: 'text-purple-400', 
          rare: 'text-blue-400',
          normal: 'text-gray-400'
        };
        
        result.characters_obtained.forEach((character, index) => {
          setTimeout(() => {
            toast.success(
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span>Pulled <span className={rarityColors[character.base_rarity.toLowerCase()]}>{character.name}</span>!</span>
              </div>,
              { duration: 3000 }
            );
          }, index * 500);
        });
        
        toast.success(`Spent ${result.kizuna_stars_spent} Kizuna Stars. ${result.kizuna_stars_remaining} remaining.`);
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to pull characters');
      }
    } catch (error) {
      console.error('Error pulling gacha:', error);
      toast.error('Failed to pull characters');
    } finally {
      setIsPulling(false);
    }
  };

  const navigateConstellation = (direction) => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    setCurrentConstellationIndex(prev => {
      if (direction === 'next') {
        return (prev + 1) % constellations.length;
      } else {
        return prev === 0 ? constellations.length - 1 : prev - 1;
      }
    });
  };

  const getRarityColor = (rarity) => {
    const colors = {
      legendary: 'bg-gradient-to-br from-red-500 to-red-700 border-red-400',
      epic: 'bg-gradient-to-br from-purple-500 to-purple-700 border-purple-400',
      rare: 'bg-gradient-to-br from-blue-500 to-blue-700 border-blue-400',
      normal: 'bg-gradient-to-br from-gray-500 to-gray-700 border-gray-400'
    };
    return colors[rarity?.toLowerCase()] || colors.normal;
  };

  const formatDropRate = (rate) => {
    return rate ? `${rate.toFixed(1)}%` : '0.0%';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-800 to-orange-900">
        <Navigation />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Stars className="h-12 w-12 text-orange-400 mx-auto mb-4 animate-spin" />
            <p className="text-white text-lg">Loading Constellations...</p>
          </div>
        </div>
      </div>
    );
  }

  if (constellations.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-800 to-orange-900">
        <Navigation />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Stars className="h-12 w-12 text-orange-400 mx-auto mb-4" />
            <p className="text-white text-lg">No constellations available</p>
          </div>
        </div>
      </div>
    );
  }

  const currentConstellation = constellations[currentConstellationIndex];
  const currentPool = characterPools[currentConstellation?.id] || { legendary: [], epic: [], rare: [], normal: [] };
  const currentRates = dropRates[currentConstellation?.id]?.final_rates || { legendary: 0.5, epic: 4.5, rare: 25.0, normal: 70.0 };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-800 to-orange-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <Stars className="h-8 w-8 text-orange-400" />
            Constellation Gacha
          </h1>
          <p className="text-orange-300 text-lg">Pull legendary characters from the cosmic constellations</p>
          
          {user && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="bg-black/30 backdrop-blur-lg border border-orange-400/20 rounded-lg px-4 py-2">
                <span className="text-orange-400 font-medium">Kizuna Stars: </span>
                <span className="text-white font-bold text-lg">{user.kizuna_stars}</span>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Constellation Visualization */}
          <div className="lg:col-span-2">
            <Card className="bg-black/30 backdrop-blur-lg border-orange-400/20 text-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-orange-400" />
                    {currentConstellation?.name}
                  </CardTitle>
                  <Badge variant="outline" className="border-orange-400/30 text-orange-400">
                    {currentConstellation?.element}
                  </Badge>
                </div>
                <p className="text-gray-300 text-sm">{currentConstellation?.description}</p>
              </CardHeader>
              <CardContent>
                {/* Constellation Canvas */}
                <div className="relative mb-6 bg-black/50 rounded-lg overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    className="w-full h-auto cursor-pointer"
                    style={{ aspectRatio: '3/2' }}
                    onClick={handleCanvasClick}
                  />
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mb-6">
                  <Button
                    variant="outline"
                    onClick={() => navigateConstellation('prev')}
                    className="border-orange-400/30 text-white hover:bg-orange-700/30"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  
                  <span className="text-orange-400 font-medium">
                    {currentConstellationIndex + 1} / {constellations.length}
                  </span>
                  
                  <Button
                    variant="outline"
                    onClick={() => navigateConstellation('next')}
                    className="border-orange-400/30 text-white hover:bg-orange-700/30"
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>

                {/* Platform Bonuses */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Gamepad2 className="h-5 w-5 text-orange-400" />
                    Platform Bonuses
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      variant={platformBonuses.nintendo ? "default" : "outline"}
                      onClick={() => handlePlatformBonusToggle('nintendo')}
                      className={`${platformBonuses.nintendo 
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : 'border-orange-400/30 text-white hover:bg-orange-700/30'}`}
                    >
                      <Gamepad2 className="h-4 w-4 mr-2" />
                      Nintendo
                    </Button>
                    <Button
                      variant={platformBonuses.playstation ? "default" : "outline"}
                      onClick={() => handlePlatformBonusToggle('playstation')}
                      className={`${platformBonuses.playstation 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'border-orange-400/30 text-white hover:bg-orange-700/30'}`}
                    >
                      <Monitor className="h-4 w-4 mr-2" />
                      PlayStation
                    </Button>
                    <Button
                      variant={platformBonuses.pc ? "default" : "outline"}
                      onClick={() => handlePlatformBonusToggle('pc')}
                      className={`${platformBonuses.pc 
                        ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                        : 'border-orange-400/30 text-white hover:bg-orange-700/30'}`}
                    >
                      <Smartphone className="h-4 w-4 mr-2" />
                      PC
                    </Button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Each platform bonus increases legendary drop rate by +0.2%
                  </p>
                </div>

                {/* Gacha Pull Buttons */}
                {user && (
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleGachaPull(1)}
                      disabled={isPulling || user.kizuna_stars < 5}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                    >
                      {isPulling ? (
                        <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4 mr-2" />
                      )}
                      Pull x1 (5 ⭐)
                    </Button>
                    <Button
                      onClick={() => handleGachaPull(10)}
                      disabled={isPulling || user.kizuna_stars < 50}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
                    >
                      {isPulling ? (
                        <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4 mr-2" />
                      )}
                      Pull x10 (50 ⭐)
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Character Pool & Drop Rates OR Orb Character Details */}
          <div className="space-y-6">
            {selectedOrbCharacters.length > 0 ? (
              // Show selected orb characters
              <Card className="bg-black/30 backdrop-blur-lg border-orange-400/20 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stars className="h-5 w-5 text-orange-400" />
                    Orb Characters
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedOrbCharacters([])}
                    className="border-orange-400/30 text-white hover:bg-orange-700/30 w-fit"
                  >
                    ← Back to Pool
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedOrbCharacters.map((character) => (
                      <div
                        key={character.id}
                        className="relative bg-gradient-to-br from-orange-900/30 to-red-900/30 border border-orange-400/20 rounded-lg p-4"
                      >
                        {/* Character Profile Picture in Circle */}
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                              {character.profile_picture ? (
                                <img 
                                  src={character.profile_picture} 
                                  alt={character.name}
                                  className="w-14 h-14 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-white font-bold text-lg">
                                  {character.name.charAt(0)}
                                </span>
                              )}
                            </div>
                            
                            {/* Position in left low corner */}
                            <div className="absolute -bottom-1 -left-1 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                              {character.position}
                            </div>
                            
                            {/* Element in right low corner */}
                            <div className="absolute -bottom-1 -right-1 bg-yellow-600 text-white text-xs font-bold px-2 py-1 rounded">
                              {character.element?.charAt(0).toUpperCase() || 'N'}
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-white mb-1">{character.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                              <span className="bg-blue-600/20 px-2 py-1 rounded text-blue-300">
                                {character.position}
                              </span>
                              <span className="bg-yellow-600/20 px-2 py-1 rounded text-yellow-300">
                                {character.element}
                              </span>
                            </div>
                            <div className="mt-2 text-sm text-gray-400">
                              <span className={`px-2 py-1 rounded text-xs ${getRarityColor(character.rarity)}`}>
                                {character.rarity?.toUpperCase() || 'NORMAL'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {selectedOrbCharacters.length === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        <Stars className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No characters found for this orb</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Drop Rates */}
                <Card className="bg-black/30 backdrop-blur-lg border-orange-400/20 text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Info className="h-5 w-5 text-orange-400" />
                      Drop Rates
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-red-600/20 border border-red-400/30">
                        <span className="text-red-400 font-medium">Legendary</span>
                        <span className="text-white font-bold">{formatDropRate(currentRates.legendary)}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-purple-600/20 border border-purple-400/30">
                        <span className="text-purple-400 font-medium">Epic</span>
                        <span className="text-white font-bold">{formatDropRate(currentRates.epic)}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-blue-600/20 border border-blue-400/30">
                        <span className="text-blue-400 font-medium">Rare</span>
                        <span className="text-white font-bold">{formatDropRate(currentRates.rare)}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-gray-600/20 border border-gray-400/30">
                        <span className="text-gray-400 font-medium">Normal</span>
                        <span className="text-white font-bold">{formatDropRate(currentRates.normal)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Character Pool */}
                <Card className="bg-black/30 backdrop-blur-lg border-orange-400/20 text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Stars className="h-5 w-5 text-orange-400" />
                      Character Pool
                      <span className="text-xs text-gray-400 ml-2">(Click orbs to inspect)</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Legendary */}
                      {currentPool.legendary.length > 0 && (
                        <div>
                          <h4 className="text-red-400 font-medium mb-2 flex items-center gap-2">
                            <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                            Legendary ({currentPool.legendary.length})
                          </h4>
                          <div className="grid grid-cols-2 gap-2">
                            {currentPool.legendary.map((character) => (
                              <div
                                key={character.id}
                                className={`p-2 rounded-lg border ${getRarityColor('legendary')} text-white text-xs text-center`}
                              >
                                <div className="font-medium truncate">{character.name}</div>
                                <div className="text-xs opacity-80">{character.position} • {character.element}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Epic */}
                      {currentPool.epic.length > 0 && (
                        <div>
                          <h4 className="text-purple-400 font-medium mb-2 flex items-center gap-2">
                            <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                            Epic ({currentPool.epic.length})
                          </h4>
                          <div className="grid grid-cols-2 gap-2">
                            {currentPool.epic.slice(0, 4).map((character) => (
                              <div
                                key={character.id}
                                className={`p-2 rounded-lg border ${getRarityColor('epic')} text-white text-xs text-center`}
                              >
                                <div className="font-medium truncate">{character.name}</div>
                                <div className="text-xs opacity-80">{character.position} • {character.element}</div>
                              </div>
                            ))}
                          </div>
                          {currentPool.epic.length > 4 && (
                            <p className="text-xs text-gray-400 text-center mt-2">
                              +{currentPool.epic.length - 4} more...
                            </p>
                          )}
                        </div>
                      )}

                      {/* Rare */}
                      {currentPool.rare.length > 0 && (
                        <div>
                          <h4 className="text-blue-400 font-medium mb-2 flex items-center gap-2">
                            <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                            Rare ({currentPool.rare.length})
                          </h4>
                          <div className="grid grid-cols-2 gap-2">
                            {currentPool.rare.slice(0, 6).map((character) => (
                              <div
                                key={character.id}
                                className={`p-2 rounded-lg border ${getRarityColor('rare')} text-white text-xs text-center`}
                              >
                                <div className="font-medium truncate">{character.name}</div>
                                <div className="text-xs opacity-80">{character.position} • {character.element}</div>
                              </div>
                            ))}
                          </div>
                          {currentPool.rare.length > 6 && (
                            <p className="text-xs text-gray-400 text-center mt-2">
                              +{currentPool.rare.length - 6} more...
                            </p>
                          )}
                        </div>
                      )}

                      {/* Normal */}
                      {currentPool.normal.length > 0 && (
                        <div>
                          <h4 className="text-gray-400 font-medium mb-2 flex items-center gap-2">
                            <span className="w-3 h-3 bg-gray-500 rounded-full"></span>
                            Normal ({currentPool.normal.length})
                          </h4>
                          <p className="text-xs text-gray-400">
                            {currentPool.normal.length} characters available
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConstellationsPage;