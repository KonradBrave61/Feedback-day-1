import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import { Search, Filter, Star, Zap, Shield, Target, Eye, Book, Award } from 'lucide-react';

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

  // Color schemes for different attributes
  const typeColors = {
    avatar: 'from-purple-500 to-indigo-600',
    totem: 'from-green-500 to-emerald-600', 
    'mix-max': 'from-red-500 to-pink-600'
  };

  const elementColors = {
    fire: 'text-red-500 bg-red-100',
    earth: 'text-amber-700 bg-amber-100',
    wind: 'text-cyan-600 bg-cyan-100',
    wood: 'text-green-600 bg-green-100',
    void: 'text-purple-600 bg-purple-100'
  };

  const rarityColors = {
    Common: 'text-gray-600 bg-gray-100',
    Rare: 'text-blue-600 bg-blue-100',
    Epic: 'text-purple-600 bg-purple-100',
    Legendary: 'text-yellow-600 bg-yellow-100'
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

  const fetchTechniques = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL}/api/techniques/`);
      if (response.ok) {
        const data = await response.json();
        setTechniques(data);
      }
    } catch (error) {
      console.error('Error fetching techniques:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL}/api/techniques/categories/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
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
    if (power >= 200) return 'text-red-600 font-bold';
    if (power >= 150) return 'text-orange-600 font-semibold';
    if (power >= 100) return 'text-yellow-600 font-medium';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black">
      <Navigation />
      <div className="pt-16 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Technique Database</h1>
            <p className="text-blue-200">Master the ancient arts of Inazuma Eleven</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center space-x-2">
                <Book className="text-blue-400" size={20} />
                <span className="text-white font-medium">Total Techniques</span>
              </div>
              <div className="text-2xl font-bold text-white mt-1">{stats.total_techniques}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center space-x-2">
                <Zap className="text-yellow-400" size={20} />
                <span className="text-white font-medium">Average Power</span>
              </div>
              <div className="text-2xl font-bold text-white mt-1">{Math.round(stats.avg_power)}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center space-x-2">
                <Award className="text-red-400" size={20} />
                <span className="text-white font-medium">Max Power</span>
              </div>
              <div className="text-2xl font-bold text-white mt-1">{stats.max_power}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center space-x-2">
                <Star className="text-purple-400" size={20} />
                <span className="text-white font-medium">Elements</span>
              </div>
              <div className="text-2xl font-bold text-white mt-1">{stats.by_element?.length || 0}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filters Panel */}
            <div className="lg:col-span-1">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 sticky top-20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold flex items-center">
                    <Filter size={18} className="mr-2" />
                    Filters
                  </h3>
                  <button 
                    onClick={clearFilters}
                    className="text-blue-400 hover:text-blue-300 text-sm"
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
                      className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Max Power</label>
                      <input
                        type="number"
                        value={filters.max_power}
                        onChange={(e) => handleFilterChange('max_power', e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="999"
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
                      className={`bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 cursor-pointer transition-all hover:bg-white/20 ${
                        selectedTechnique?.id === technique.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <CategoryIcon className="text-blue-400" size={18} />
                            <h4 className="text-white font-semibold">{technique.name}</h4>
                            <span className={`text-xl font-bold ${getPowerColor(technique.power)}`}>
                              {technique.power}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2 mb-2">
                            <div className={`bg-gradient-to-r ${typeColors[technique.technique_type]} text-white px-2 py-1 rounded text-xs font-medium`}>
                              {technique.technique_type.charAt(0).toUpperCase() + technique.technique_type.slice(1)}
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${elementColors[technique.element]}`}>
                              {technique.element.charAt(0).toUpperCase() + technique.element.slice(1)}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${rarityColors[technique.rarity]}`}>
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
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 sticky top-20">
                {selectedTechnique ? (
                  <div>
                    <h3 className="text-white font-semibold mb-4">Technique Details</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xl font-bold text-white mb-2">{selectedTechnique.name}</h4>
                        <p className="text-gray-300 text-sm mb-3">{selectedTechnique.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/5 rounded-lg p-3">
                          <div className="text-gray-400 text-xs mb-1">Power</div>
                          <div className={`text-2xl font-bold ${getPowerColor(selectedTechnique.power)}`}>
                            {selectedTechnique.power}
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                          <div className="text-gray-400 text-xs mb-1">Min Level</div>
                          <div className="text-white font-semibold">{selectedTechnique.min_level}</div>
                        </div>
                      </div>

                      <div>
                        <div className="text-gray-400 text-xs mb-2">Type & Category</div>
                        <div className="flex flex-wrap gap-2">
                          <div className={`bg-gradient-to-r ${typeColors[selectedTechnique.technique_type]} text-white px-3 py-1 rounded-full text-sm font-medium`}>
                            {selectedTechnique.technique_type.charAt(0).toUpperCase() + selectedTechnique.technique_type.slice(1)}
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${elementColors[selectedTechnique.element]}`}>
                            {selectedTechnique.element.charAt(0).toUpperCase() + selectedTechnique.element.slice(1)}
                          </span>
                        </div>
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
                                <span className="text-green-400 font-semibold">+{value}</span>
                              </div>
                            ))}
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