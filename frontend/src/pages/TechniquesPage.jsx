import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import { Search, Filter, Star, Zap, Shield, Target, Eye, Book, Award } from 'lucide-react';
import { logoColors } from '../styles/colors';

const TechniquesPage = () => {
  const [techniques, setTechniques] = useState([]);
  const [filteredTechniques, setFilteredTechniques] = useState([]);
  const [selectedTechnique, setSelectedTechnique] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter states
  const [filters, setFilters] = useState({
    technique_type: '',
    category: '',
    element: '',
    rarity: '',
    min_power: '',
    max_power: ''
  });

  const [stats, setStats] = useState({
    total_techniques: 0,
    by_type: [],
    by_category: [],
    by_element: [],
    by_rarity: [],
    avg_power: 0,
    max_power: 0,
    min_power: 0
  });

  // Updated color schemes using logoColors
  const typeColors = {
    avatar: logoColors.blueGradient,
    totem: 'linear-gradient(135deg, #32CD32 0%, #228B22 100%)', // Green gradient
    'mix-max': logoColors.yellowOrangeGradient
  };

  const elementColors = {
    fire: `text-red-500 bg-red-500/10 border border-red-500/20`,
    earth: `text-amber-600 bg-amber-600/10 border border-amber-600/20`,
    wind: `text-cyan-400 bg-cyan-400/10 border border-cyan-400/20`,
    wood: `text-green-500 bg-green-500/10 border border-green-500/20`,
    void: `text-purple-500 bg-purple-500/10 border border-purple-500/20`
  };

  const rarityColors = {
    Common: `text-gray-400 bg-gray-400/10 border border-gray-400/20`,
    Rare: `border border-blue-500/30`,
    Epic: `border border-purple-500/30`,
    Legendary: `border border-yellow-500/30`
  };

  const categoryIcons = {
    Shot: Target,
    Dribble: Zap,
    Block: Shield,
    Save: Eye
  };

  useEffect(() => {
    fetchTechniques();
    fetchStats();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [techniques, searchTerm, filters]);

  const getBackendUrl = () => {
    // In production, use the environment variable from .env file
    // process.env.REACT_APP_BACKEND_URL is available in React apps
    return process.env.REACT_APP_BACKEND_URL || 'https://b3e3436d-c812-4c23-b551-100bb3ccca03.preview.emergentagent.com';
  };

  const fetchTechniques = async () => {
    try {
      const backendUrl = getBackendUrl();
      console.log('Fetching techniques from:', `${backendUrl}/api/techniques/`);
      const response = await fetch(`${backendUrl}/api/techniques/`);
      console.log('Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Techniques data received:', data.length, 'techniques');
        setTechniques(data);
      } else {
        console.error('Failed to fetch techniques:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching techniques:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const backendUrl = getBackendUrl();
      console.log('Fetching stats from:', `${backendUrl}/api/techniques/categories/stats`);
      const response = await fetch(`${backendUrl}/api/techniques/categories/stats`);
      console.log('Stats response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Stats data received:', data);
        setStats(data);
      } else {
        console.error('Failed to fetch technique stats:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching technique stats:', error);
    }
  };

  const applyFilters = () => {
    let filtered = techniques.filter(technique => {
      // Search filter
      const matchesSearch = !searchTerm || 
        technique.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        technique.description.toLowerCase().includes(searchTerm.toLowerCase());

      // Type filter
      const matchesType = !filters.technique_type || technique.technique_type === filters.technique_type;
      
      // Category filter
      const matchesCategory = !filters.category || technique.category === filters.category;
      
      // Element filter
      const matchesElement = !filters.element || technique.element === filters.element;
      
      // Rarity filter
      const matchesRarity = !filters.rarity || technique.rarity === filters.rarity;
      
      // Power filters
      const matchesMinPower = !filters.min_power || technique.power >= parseInt(filters.min_power);
      const matchesMaxPower = !filters.max_power || technique.power <= parseInt(filters.max_power);

      return matchesSearch && matchesType && matchesCategory && matchesElement && 
             matchesRarity && matchesMinPower && matchesMaxPower;
    });

    setFilteredTechniques(filtered);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      technique_type: '',
      category: '',
      element: '',
      rarity: '',
      min_power: '',
      max_power: ''
    });
    setSearchTerm('');
  };

  const getPowerColor = (power) => {
    if (power >= 200) return `font-bold`;
    if (power >= 150) return `font-semibold`;
    if (power >= 100) return `font-medium`;
    return `font-normal`;
  };

  const getPowerTextColor = (power) => {
    if (power >= 200) return logoColors.primaryOrange;
    if (power >= 150) return logoColors.primaryYellow;
    if (power >= 100) return logoColors.lightBlue;
    return logoColors.gray;
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: logoColors.backgroundGradient }}>
        <Navigation />
        <div className="pt-16">
          <div className="flex items-center justify-center h-96">
            <div className="text-white text-xl">Loading techniques...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: logoColors.backgroundGradient }}>
      <Navigation />
      <div className="pt-16 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Technique Database</h1>
            <p style={{ color: logoColors.lightBlue }}>Master the ancient arts of Inazuma Eleven</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="rounded-lg p-4 backdrop-blur-sm" 
                 style={{ 
                   backgroundColor: logoColors.blackAlpha(0.3),
                   border: `1px solid ${logoColors.primaryBlueAlpha(0.2)}`
                 }}>
              <div className="flex items-center space-x-2">
                <Book style={{ color: logoColors.primaryBlue }} size={20} />
                <span className="text-white font-medium">Total Techniques</span>
              </div>
              <div className="text-2xl font-bold text-white mt-1">{stats.total_techniques}</div>
            </div>
            <div className="rounded-lg p-4 backdrop-blur-sm"
                 style={{ 
                   backgroundColor: logoColors.blackAlpha(0.3),
                   border: `1px solid ${logoColors.primaryBlueAlpha(0.2)}`
                 }}>
              <div className="flex items-center space-x-2">
                <Zap style={{ color: logoColors.primaryYellow }} size={20} />
                <span className="text-white font-medium">Average Power</span>
              </div>
              <div className="text-2xl font-bold text-white mt-1">{Math.round(stats.avg_power)}</div>
            </div>
            <div className="rounded-lg p-4 backdrop-blur-sm"
                 style={{ 
                   backgroundColor: logoColors.blackAlpha(0.3),
                   border: `1px solid ${logoColors.primaryBlueAlpha(0.2)}`
                 }}>
              <div className="flex items-center space-x-2">
                <Award style={{ color: logoColors.primaryOrange }} size={20} />
                <span className="text-white font-medium">Max Power</span>
              </div>
              <div className="text-2xl font-bold text-white mt-1">{stats.max_power}</div>
            </div>
            <div className="rounded-lg p-4 backdrop-blur-sm"
                 style={{ 
                   backgroundColor: logoColors.blackAlpha(0.3),
                   border: `1px solid ${logoColors.primaryBlueAlpha(0.2)}`
                 }}>
              <div className="flex items-center space-x-2">
                <Star style={{ color: logoColors.secondaryBlue }} size={20} />
                <span className="text-white font-medium">Elements</span>
              </div>
              <div className="text-2xl font-bold text-white mt-1">{stats.by_element?.length || 0}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filters Panel */}
            <div className="lg:col-span-1">
              <div className="rounded-lg p-4 backdrop-blur-sm sticky top-20"
                   style={{ 
                     backgroundColor: logoColors.blackAlpha(0.3),
                     border: `1px solid ${logoColors.primaryBlueAlpha(0.2)}`
                   }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold flex items-center">
                    <Filter size={18} className="mr-2" style={{ color: logoColors.primaryBlue }} />
                    Filters
                  </h3>
                  <button 
                    onClick={clearFilters}
                    className="text-sm hover:opacity-80 transition-opacity"
                    style={{ color: logoColors.lightBlue }}
                  >
                    Clear All
                  </button>
                </div>

                {/* Search */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search techniques..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: logoColors.blackAlpha(0.5),
                        border: `1px solid ${logoColors.primaryBlueAlpha(0.3)}`,
                        '--tw-ring-color': logoColors.secondaryBlue
                      }}
                    />
                  </div>
                </div>

                {/* Filter Controls */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Technique Type</label>
                    <select
                      value={filters.technique_type}
                      onChange={(e) => handleFilterChange('technique_type', e.target.value)}
                      className="w-full rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: logoColors.blackAlpha(0.5),
                        border: `1px solid ${logoColors.primaryBlueAlpha(0.3)}`,
                        '--tw-ring-color': logoColors.secondaryBlue
                      }}
                    >
                      <option value="">All Types</option>
                      <option value="avatar">Avatar</option>
                      <option value="totem">Totem</option>
                      <option value="mix-max">Mix-Max</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Category</label>
                    <select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="w-full rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: logoColors.blackAlpha(0.5),
                        border: `1px solid ${logoColors.primaryBlueAlpha(0.3)}`,
                        '--tw-ring-color': logoColors.secondaryBlue
                      }}
                    >
                      <option value="">All Categories</option>
                      <option value="Shot">Shot</option>
                      <option value="Dribble">Dribble</option>
                      <option value="Block">Block</option>
                      <option value="Save">Save</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Element</label>
                    <select
                      value={filters.element}
                      onChange={(e) => handleFilterChange('element', e.target.value)}
                      className="w-full rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: logoColors.blackAlpha(0.5),
                        border: `1px solid ${logoColors.primaryBlueAlpha(0.3)}`,
                        '--tw-ring-color': logoColors.secondaryBlue
                      }}
                    >
                      <option value="">All Elements</option>
                      <option value="fire">Fire</option>
                      <option value="earth">Earth</option>
                      <option value="wind">Wind</option>
                      <option value="wood">Wood</option>
                      <option value="void">Void</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Rarity</label>
                    <select
                      value={filters.rarity}
                      onChange={(e) => handleFilterChange('rarity', e.target.value)}
                      className="w-full rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: logoColors.blackAlpha(0.5),
                        border: `1px solid ${logoColors.primaryBlueAlpha(0.3)}`,
                        '--tw-ring-color': logoColors.secondaryBlue
                      }}
                    >
                      <option value="">All Rarities</option>
                      <option value="Common">Common</option>
                      <option value="Rare">Rare</option>
                      <option value="Epic">Epic</option>
                      <option value="Legendary">Legendary</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Min Power</label>
                      <input
                        type="number"
                        value={filters.min_power}
                        onChange={(e) => handleFilterChange('min_power', e.target.value)}
                        className="w-full rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2"
                        placeholder="0"
                        style={{
                          backgroundColor: logoColors.blackAlpha(0.5),
                          border: `1px solid ${logoColors.primaryBlueAlpha(0.3)}`,
                          '--tw-ring-color': logoColors.secondaryBlue
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Max Power</label>
                      <input
                        type="number"
                        value={filters.max_power}
                        onChange={(e) => handleFilterChange('max_power', e.target.value)}
                        className="w-full rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2"
                        placeholder="999"
                        style={{
                          backgroundColor: logoColors.blackAlpha(0.5),
                          border: `1px solid ${logoColors.primaryBlueAlpha(0.3)}`,
                          '--tw-ring-color': logoColors.secondaryBlue
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Techniques List */}
            <div className="lg:col-span-2">
              <div className="mb-4 flex justify-between items-center">
                <h3 className="text-white font-semibold">
                  Techniques ({filteredTechniques.length})
                </h3>
              </div>

              <div className="space-y-3 max-h-[800px] overflow-y-auto">
                {filteredTechniques.map((technique) => {
                  const CategoryIcon = categoryIcons[technique.category] || Zap;
                  return (
                    <div
                      key={technique.id}
                      onClick={() => setSelectedTechnique(technique)}
                      className="rounded-lg p-4 backdrop-blur-sm cursor-pointer transition-all hover:scale-[1.02] transform"
                      style={{
                        backgroundColor: selectedTechnique?.id === technique.id 
                          ? logoColors.blackAlpha(0.5) 
                          : logoColors.blackAlpha(0.3),
                        border: selectedTechnique?.id === technique.id 
                          ? `2px solid ${logoColors.secondaryBlue}` 
                          : `1px solid ${logoColors.primaryBlueAlpha(0.2)}`,
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <CategoryIcon style={{ color: logoColors.primaryBlue }} size={18} />
                            <h4 className="text-white font-semibold">{technique.name}</h4>
                            <span 
                              className={`text-xl ${getPowerColor(technique.power)}`}
                              style={{ color: getPowerTextColor(technique.power) }}
                            >
                              {technique.power}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2 mb-2">
                            <div 
                              className="text-white px-2 py-1 rounded text-xs font-medium"
                              style={{ background: typeColors[technique.technique_type] }}
                            >
                              {technique.technique_type.charAt(0).toUpperCase() + technique.technique_type.slice(1)}
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${elementColors[technique.element]}`}>
                              {technique.element.charAt(0).toUpperCase() + technique.element.slice(1)}
                            </span>
                            <span 
                              className={`px-2 py-1 rounded text-xs font-medium text-white ${rarityColors[technique.rarity]}`}
                              style={technique.rarity === 'Rare' ? { borderColor: logoColors.primaryBlue } :
                                     technique.rarity === 'Epic' ? { borderColor: logoColors.secondaryBlue } :
                                     technique.rarity === 'Legendary' ? { borderColor: logoColors.primaryYellow } : {}}
                            >
                              {technique.rarity}
                            </span>
                          </div>
                          
                          <p className="text-gray-300 text-sm line-clamp-2">{technique.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Technique Details Panel */}
            <div className="lg:col-span-1">
              <div className="rounded-lg p-4 backdrop-blur-sm sticky top-20"
                   style={{ 
                     backgroundColor: logoColors.blackAlpha(0.3),
                     border: `1px solid ${logoColors.primaryBlueAlpha(0.2)}`
                   }}>
                {selectedTechnique ? (
                  <div>
                    <h3 className="text-white font-semibold mb-4">Technique Details</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xl font-bold text-white mb-2">{selectedTechnique.name}</h4>
                        <p className="text-gray-300 text-sm mb-3">{selectedTechnique.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg p-3"
                             style={{ backgroundColor: logoColors.blackAlpha(0.5) }}>
                          <div className="text-gray-400 text-xs mb-1">Power</div>
                          <div 
                            className={`text-2xl ${getPowerColor(selectedTechnique.power)}`}
                            style={{ color: getPowerTextColor(selectedTechnique.power) }}
                          >
                            {selectedTechnique.power}
                          </div>
                        </div>
                        <div className="rounded-lg p-3"
                             style={{ backgroundColor: logoColors.blackAlpha(0.5) }}>
                          <div className="text-gray-400 text-xs mb-1">Min Level</div>
                          <div className="text-white font-semibold">{selectedTechnique.min_level}</div>
                        </div>
                      </div>

                      <div>
                        <div className="text-gray-400 text-xs mb-2">Type & Element</div>
                        <div className="flex flex-wrap gap-2">
                          <div 
                            className="text-white px-3 py-1 rounded-full text-sm font-medium"
                            style={{ background: typeColors[selectedTechnique.technique_type] }}
                          >
                            {selectedTechnique.technique_type.charAt(0).toUpperCase() + selectedTechnique.technique_type.slice(1)}
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${elementColors[selectedTechnique.element]}`}>
                            {selectedTechnique.element.charAt(0).toUpperCase() + selectedTechnique.element.slice(1)}
                          </span>
                        </div>
                      </div>

                      <div>
                        <div className="text-gray-400 text-xs mb-1">Rarity</div>
                        <span 
                          className={`px-3 py-1 rounded-full text-sm font-medium text-white ${rarityColors[selectedTechnique.rarity]}`}
                          style={selectedTechnique.rarity === 'Rare' ? { borderColor: logoColors.primaryBlue } :
                                 selectedTechnique.rarity === 'Epic' ? { borderColor: logoColors.secondaryBlue } :
                                 selectedTechnique.rarity === 'Legendary' ? { borderColor: logoColors.primaryYellow } : {}}
                        >
                          {selectedTechnique.rarity}
                        </span>
                      </div>

                      {selectedTechnique.shot_type && (
                        <div>
                          <div className="text-gray-400 text-xs mb-1">Shot Type</div>
                          <div className="text-white font-semibold capitalize">{selectedTechnique.shot_type} Shot</div>
                        </div>
                      )}

                      {selectedTechnique.allowed_positions?.length > 0 && (
                        <div>
                          <div className="text-gray-400 text-xs mb-1">Position Restriction</div>
                          <div className="text-white font-semibold">{selectedTechnique.allowed_positions.join(', ')}</div>
                        </div>
                      )}

                      {selectedTechnique.animation_description && (
                        <div>
                          <div className="text-gray-400 text-xs mb-1">Animation</div>
                          <div className="text-gray-300 text-sm">{selectedTechnique.animation_description}</div>
                        </div>
                      )}

                      {Object.keys(selectedTechnique.stat_requirements || {}).length > 0 && (
                        <div>
                          <div className="text-gray-400 text-xs mb-2">Stat Requirements</div>
                          <div className="space-y-1">
                            {Object.entries(selectedTechnique.stat_requirements).map(([stat, value]) => (
                              <div key={stat} className="flex justify-between text-sm">
                                <span className="text-gray-300 capitalize">{stat}</span>
                                <span className="text-white font-semibold">{value}+</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {Object.keys(selectedTechnique.stat_bonuses || {}).length > 0 && (
                        <div>
                          <div className="text-gray-400 text-xs mb-2">Stat Bonuses</div>
                          <div className="space-y-1">
                            {Object.entries(selectedTechnique.stat_bonuses).map(([stat, value]) => (
                              <div key={stat} className="flex justify-between text-sm">
                                <span className="text-gray-300 capitalize">{stat}</span>
                                <span style={{ color: logoColors.lightBlue }} className="font-semibold">+{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedTechnique.learning_cost > 0 && (
                        <div>
                          <div className="text-gray-400 text-xs mb-1">Learning Cost</div>
                          <div style={{ color: logoColors.primaryYellow }} className="font-semibold">
                            {selectedTechnique.learning_cost} Points
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-400">
                    <Book size={48} className="mx-auto mb-3 opacity-50" />
                    <p>Select a technique to view details</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechniquesPage;