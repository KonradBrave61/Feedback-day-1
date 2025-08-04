import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navigation from '../components/Navigation';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { toast } from 'sonner';
import { logoColors } from '../styles/colors';
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
    const orbRadius = 100; // Click detection radius
    
    // Find the closest orb to the click
    let closestOrb = null;
    let closestDistance = Infinity;
    
    constellation.orbs.forEach((orb, index) => {
      const orbX = orb.x * 6;
      const orbY = orb.y * 4;
      const distance = Math.sqrt((x - orbX) ** 2 + (y - orbY) ** 2);
      
      console.log(`Orb ${index}: position (${orbX}, ${orbY}), distance: ${distance}, radius: ${orbRadius}`);
      
      if (distance <= orbRadius && distance < closestDistance) {
        closestDistance = distance;
        closestOrb = { orb, index, distance };
      }
    });
    
    if (closestOrb) {
      const index = closestOrb.index;
      console.log(`Closest orb ${index} clicked! Distance: ${closestOrb.distance}`);
      
      // Get characters for this orb from character pool
      const currentPool = characterPools[constellation.id] || { legendary: [], epic: [], rare: [], normal: [] };
      const allCharacters = [
        ...currentPool.legendary,
        ...currentPool.epic,
        ...currentPool.rare,
        ...currentPool.normal
      ];
      
      // Better character distribution - ensure ALL orbs get characters
      let orbCharacters = [];
      if (allCharacters.length > 0) {
        // Simple round-robin distribution to ensure all orbs get characters
        const baseCharactersPerOrb = Math.floor(allCharacters.length / constellation.orbs.length);
        const extraCharacters = allCharacters.length % constellation.orbs.length;
        
        // Calculate how many characters this orb should get
        const charactersForThisOrb = baseCharactersPerOrb + (index < extraCharacters ? 1 : 0);
        
        // Calculate starting index for this orb
        let startIndex = 0;
        for (let i = 0; i < index; i++) {
          startIndex += baseCharactersPerOrb + (i < extraCharacters ? 1 : 0);
        }
        
        // Get characters for this orb
        for (let i = 0; i < Math.min(charactersForThisOrb, 3); i++) {
          if (startIndex + i < allCharacters.length) {
            orbCharacters.push(allCharacters[startIndex + i]);
          }
        }
        
        // If we still don't have characters, just assign some (fallback)
        if (orbCharacters.length === 0) {
          const fallbackIndex = index % allCharacters.length;
          orbCharacters.push(allCharacters[fallbackIndex]);
        }
      }
      
      console.log(`Orb ${index} characters (${orbCharacters.length}):`, orbCharacters.map(c => c.name).join(', '));
      setSelectedOrbCharacters(orbCharacters);
    } else {
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
    
    // Enhanced pull animation sequence
    toast.info(
      <div className="flex items-center gap-2">
        <div className="animate-pulse">⭐</div>
        <span>Initiating pull sequence...</span>
      </div>,
      { duration: 1500 }
    );
    
    // Add constellation animation enhancement
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.filter = 'contrast(1.5) brightness(1.3)';
      setTimeout(() => {
        canvas.style.filter = '';
      }, 2000);
    }
    
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
        
        // Enhanced pull results animation
        const rarityColors = {
          legendary: 'text-red-400',
          epic: 'text-purple-400', 
          rare: 'text-blue-400',
          normal: 'text-gray-400'
        };
        
        const rarityEmojis = {
          legendary: '🌟',
          epic: '💜', 
          rare: '💙',
          normal: '⚪'
        };
        
        // Show pull results with enhanced animation
        setTimeout(() => {
          toast.info(
            <div className="flex items-center gap-2">
              <div className="animate-bounce">🎁</div>
              <span>Characters obtained!</span>
            </div>,
            { duration: 1000 }
          );
        }, 800);
        
        result.characters_obtained.forEach((character, index) => {
          setTimeout(() => {
            const rarity = character.base_rarity.toLowerCase();
            toast.success(
              <div className="flex items-center gap-2">
                <div className="animate-spin">{rarityEmojis[rarity]}</div>
                <span>Pulled <span className={rarityColors[rarity]}>{character.name}</span>!</span>
                <div className="text-xs bg-black/20 px-2 py-1 rounded">
                  {character.base_rarity}
                </div>
              </div>,
              { duration: 4000 }
            );
          }, 1200 + (index * 600));
        });
        
        // Final summary toast
        setTimeout(() => {
          toast.success(
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 animate-pulse" />
              <span>Spent {result.kizuna_stars_spent} ⭐ Kizuna Stars</span>
              <br />
              <span>{result.kizuna_stars_remaining} ⭐ remaining</span>
            </div>,
            { duration: 3000 }
          );
        }, 1200 + (result.characters_obtained.length * 600));
        
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
      rare: `bg-gradient-to-br from-blue-500 to-[${logoColors.secondaryBlue}] border-blue-400`,
      normal: 'bg-gradient-to-br from-gray-500 to-gray-700 border-gray-400'
    };
    return colors[rarity?.toLowerCase()] || colors.normal;
  };

  const formatDropRate = (rate) => {
    return rate ? `${rate.toFixed(1)}%` : '0.0%';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ background: logoColors.backgroundGradient }}>
        <Navigation />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Stars className="h-12 w-12 mx-auto mb-4 animate-spin" style={{ color: logoColors.primaryBlue }} />
            <p className="text-white text-lg">Loading Constellations...</p>
          </div>
        </div>
      </div>
    );
  }

  if (constellations.length === 0) {
    return (
      <div className="min-h-screen" style={{ background: logoColors.backgroundGradient }}>
        <Navigation />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Stars className="h-12 w-12 mx-auto mb-4" style={{ color: logoColors.primaryBlue }} />
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
    <div className="min-h-screen" style={{ background: logoColors.backgroundGradient }}>
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <Stars className="h-8 w-8" style={{ color: logoColors.primaryBlue }} />
            Constellation Gacha
          </h1>
          <p className="text-lg" style={{ color: logoColors.lightBlue }}>Pull legendary characters from the cosmic constellations</p>
          
          {user && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="backdrop-blur-lg rounded-lg px-4 py-2 border text-white"
                   style={{ 
                     backgroundColor: logoColors.blackAlpha(0.3),
                     borderColor: logoColors.primaryBlueAlpha(0.2)
                   }}>
                <span style={{ color: logoColors.primaryYellow }} className="font-medium">Kizuna Stars: </span>
                <span className="text-white font-bold text-lg">{user.kizuna_stars}</span>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Constellation Visualization */}
          <div className="lg:col-span-2">
            <Card className="backdrop-blur-lg text-white border"
                  style={{ 
                    backgroundColor: logoColors.blackAlpha(0.3),
                    borderColor: logoColors.primaryBlueAlpha(0.2)
                  }}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" style={{ color: logoColors.primaryBlue }} />
                    {currentConstellation?.name}
                  </CardTitle>
                  <Badge variant="outline" className="border text-white"
                         style={{ borderColor: logoColors.primaryBlueAlpha(0.3), color: logoColors.primaryBlue }}>
                    {currentConstellation?.element}
                  </Badge>
                </div>
                <p className="text-gray-300 text-sm">{currentConstellation?.description}</p>
              </CardHeader>
              <CardContent>
                {/* Constellation Canvas */}
                <div className="relative mb-6 rounded-lg overflow-hidden" 
                     style={{ backgroundColor: logoColors.blackAlpha(0.5) }}>
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
                    className="text-white hover:opacity-80"
                    style={{ 
                      borderColor: logoColors.primaryBlueAlpha(0.3),
                      backgroundColor: logoColors.blackAlpha(0.2)
                    }}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  
                  <span className="font-medium" style={{ color: logoColors.primaryBlue }}>
                    {currentConstellationIndex + 1} / {constellations.length}
                  </span>
                  
                  <Button
                    variant="outline"
                    onClick={() => navigateConstellation('next')}
                    className="text-white hover:opacity-80"
                    style={{ 
                      borderColor: logoColors.primaryBlueAlpha(0.3),
                      backgroundColor: logoColors.blackAlpha(0.2)
                    }}
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>

                {/* Platform Bonuses */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Gamepad2 className="h-5 w-5" style={{ color: logoColors.primaryBlue }} />
                    Platform Bonuses
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      variant={platformBonuses.nintendo ? "default" : "outline"}
                      onClick={() => handlePlatformBonusToggle('nintendo')}
                      className={`${platformBonuses.nintendo 
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : 'text-white hover:opacity-80'}`}
                      style={!platformBonuses.nintendo ? {
                        borderColor: logoColors.primaryBlueAlpha(0.3),
                        backgroundColor: logoColors.blackAlpha(0.2)
                      } : {}}
                    >
                      <Gamepad2 className="h-4 w-4 mr-2" />
                      Nintendo
                    </Button>
                    <Button
                      variant={platformBonuses.playstation ? "default" : "outline"}
                      onClick={() => handlePlatformBonusToggle('playstation')}
                      className={`${platformBonuses.playstation 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'text-white hover:opacity-80'}`}
                      style={!platformBonuses.playstation ? {
                        borderColor: logoColors.primaryBlueAlpha(0.3),
                        backgroundColor: logoColors.blackAlpha(0.2)
                      } : {}}
                    >
                      <Monitor className="h-4 w-4 mr-2" />
                      PlayStation
                    </Button>
                    <Button
                      variant={platformBonuses.pc ? "default" : "outline"}
                      onClick={() => handlePlatformBonusToggle('pc')}
                      className={`${platformBonuses.pc 
                        ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                        : 'text-white hover:opacity-80'}`}
                      style={!platformBonuses.pc ? {
                        borderColor: logoColors.primaryBlueAlpha(0.3),
                        backgroundColor: logoColors.blackAlpha(0.2)
                      } : {}}
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
                      className="flex-1 text-white hover:opacity-80"
                      style={{ background: logoColors.yellowOrangeGradient, color: logoColors.black }}
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
                      className="flex-1 text-white hover:opacity-80"
                      style={{ background: logoColors.blueGradient }}
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
              <Card className="backdrop-blur-lg text-white border"
                    style={{ 
                      backgroundColor: logoColors.blackAlpha(0.3),
                      borderColor: logoColors.primaryBlueAlpha(0.2)
                    }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stars className="h-5 w-5" style={{ color: logoColors.primaryBlue }} />
                    Orb Characters
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedOrbCharacters([])}
                    className="text-yellow-300 hover:text-white hover:bg-yellow-600/20 border-yellow-400/50 w-fit transition-all duration-300"
                    style={{ 
                      borderColor: logoColors.primaryYellow,
                      backgroundColor: logoColors.yellowAlpha(0.1),
                      color: logoColors.primaryYellow
                    }}
                  >
                    ← Back to Pool
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedOrbCharacters.map((character) => (
                      <div
                        key={character.id}
                        className="relative rounded-lg p-4 border"
                        style={{ 
                          background: `linear-gradient(to bottom right, ${logoColors.blackAlpha(0.3)}, ${logoColors.primaryBlueAlpha(0.3)})`,
                          borderColor: logoColors.primaryBlueAlpha(0.2)
                        }}
                      >
                        {/* Character Profile Picture in Circle */}
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center"
                                 style={{ background: logoColors.yellowOrangeGradient }}>
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
                            <div className="absolute -bottom-1 -left-1 text-white text-xs font-bold px-2 py-1 rounded"
                                 style={{ backgroundColor: logoColors.primaryBlue }}>
                              {character.position}
                            </div>
                            
                            {/* Element in right low corner */}
                            <div className="absolute -bottom-1 -right-1 text-white text-xs font-bold px-2 py-1 rounded"
                                 style={{ backgroundColor: logoColors.primaryYellow, color: logoColors.black }}>
                              {character.element?.charAt(0).toUpperCase() || 'N'}
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-white mb-1">{character.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                              <span className="px-2 py-1 rounded text-white"
                                    style={{ backgroundColor: logoColors.primaryBlueAlpha(0.2), color: logoColors.lightBlue }}>
                                {character.position}
                              </span>
                              <span className="px-2 py-1 rounded"
                                    style={{ backgroundColor: logoColors.yellowAlpha(0.2), color: logoColors.primaryYellow }}>
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
                <Card className="backdrop-blur-lg text-white border"
                      style={{ 
                        backgroundColor: logoColors.blackAlpha(0.3),
                        borderColor: logoColors.primaryBlueAlpha(0.2)
                      }}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Info className="h-5 w-5" style={{ color: logoColors.primaryBlue }} />
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
                      <div className="flex items-center justify-between p-2 rounded-lg border"
                           style={{ 
                             backgroundColor: logoColors.primaryBlueAlpha(0.2),
                             borderColor: logoColors.primaryBlueAlpha(0.3)
                           }}>
                        <span className="font-medium" style={{ color: logoColors.lightBlue }}>Rare</span>
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
                <Card className="backdrop-blur-lg text-white border"
                      style={{ 
                        backgroundColor: logoColors.blackAlpha(0.3),
                        borderColor: logoColors.primaryBlueAlpha(0.2)
                      }}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Stars className="h-5 w-5" style={{ color: logoColors.primaryBlue }} />
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
                          <h4 className="font-medium mb-2 flex items-center gap-2" style={{ color: logoColors.lightBlue }}>
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: logoColors.primaryBlue }}></span>
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