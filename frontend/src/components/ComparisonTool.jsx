import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { X, Plus, Scale, Search, Filter } from 'lucide-react';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { logoColors } from '../styles/colors';
import { calculateStats } from '../data/mock';
import { useAuth } from '../contexts/AuthContext';

const ComparisonTool = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [compareItems, setCompareItems] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('characters');
  const [loading, setLoading] = useState(false);

  const categories = [
    { value: 'characters', label: 'Characters', icon: '👤' },
    { value: 'items', label: 'Items', icon: '🎒' },
    { value: 'techniques', label: 'Techniques', icon: '⚡' },
    { value: 'coaches', label: 'Coaches', icon: '👨‍💼' },
    { value: 'managers', label: 'Managers', icon: '👩‍💼' }
  ];

  // Direct API calls without authentication for comparison tool (public access)
  const loadComparisonData = async (category, filters = {}) => {
    const backendUrl = import.meta.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL;
    
    try {
      let url;
      const params = new URLSearchParams();
      
      switch (category) {
        case 'characters':
          if (filters.position) params.append('position', filters.position);
          if (filters.element) params.append('element', filters.element);
          if (filters.search) params.append('search', filters.search);
          url = `${backendUrl}/api/characters${params.toString() ? '?' + params.toString() : ''}`;
          break;
        case 'items':
          if (filters.category) params.append('category', filters.category);
          if (filters.rarity) params.append('rarity', filters.rarity);
          if (filters.search) params.append('search', filters.search);
          url = `${backendUrl}/api/equipment${params.toString() ? '?' + params.toString() : ''}`;
          break;
        case 'techniques':
          if (filters.technique_type) params.append('technique_type', filters.technique_type);
          if (filters.category) params.append('category', filters.category);
          if (filters.element) params.append('element', filters.element);
          if (filters.search) params.append('search', filters.search);
          url = `${backendUrl}/api/techniques${params.toString() ? '?' + params.toString() : ''}`;
          break;
        case 'coaches':
        case 'managers':
          url = `${backendUrl}/api/coaches`;
          break;
        default:
          return { success: false, data: [] };
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error(`Error loading ${category}:`, error);
      return { success: false, data: [] };
    }
  };

  const loadData = async (category) => {
    setLoading(true);
    try {
      const result = await loadComparisonData(category);
      if (result.success) {
        setAvailableItems(result.data || []);
      } else {
        setAvailableItems([]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setAvailableItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData(selectedCategory);
    }
  }, [selectedCategory, isOpen]);

  const handleCategoryChange = (newCategory) => {
    setSelectedCategory(newCategory);
    setCompareItems([]);
    setSearchTerm('');
  };

  const addToComparison = (item) => {
    if (compareItems.find(i => i.id === item.id)) return;
    
    // Limit to maximum 6 items for comparison
    if (compareItems.length >= 6) {
      // Remove the first item and add the new one
      setCompareItems([...compareItems.slice(1), item]);
    } else {
      setCompareItems([...compareItems, item]);
    }
  };

  const removeFromComparison = (itemId) => {
    setCompareItems(compareItems.filter(i => i.id !== itemId));
  };

  const clearComparison = () => {
    setCompareItems([]);
  };

  const filteredItems = availableItems.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.name?.toLowerCase().includes(searchLower) ||
      item.description?.toLowerCase().includes(searchLower) ||
      item.position?.toLowerCase().includes(searchLower) ||
      item.element?.toLowerCase().includes(searchLower)
    );
  });

  const renderCharacterComparison = (character) => {
    const stats = calculateStats(character, {}, character.level || 99, character.rarity || 'Legendary');
    return (
      <Card className="flex-1 min-w-[250px]" style={{ backgroundColor: logoColors.blackAlpha(0.3), borderColor: logoColors.primaryBlueAlpha(0.3) }}>
        <CardContent className="p-4">
          <div className="text-center mb-3">
            <img src={character.image} alt={character.name} className="w-16 h-16 rounded-full mx-auto mb-2" />
            <h4 className="font-bold text-white">{character.name}</h4>
            <div className="flex justify-center gap-2 mt-1">
              <Badge className={`${getPositionColor(character.position)} text-xs px-1`}>
                {character.position}
              </Badge>
              <Badge variant="outline" style={{ color: logoColors.primaryBlue, borderColor: logoColors.primaryBlue }}>
                {character.element}
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-1 text-xs">
            <div className="text-gray-300">Kick: <span className="text-white font-bold">{stats.kick?.main || 0}</span></div>
            <div className="text-gray-300">Control: <span className="text-white font-bold">{stats.control?.main || 0}</span></div>
            <div className="text-gray-300">Technique: <span className="text-white font-bold">{stats.technique?.main || 0}</span></div>
            <div className="text-gray-300">Intelligence: <span className="text-white font-bold">{stats.intelligence?.main || 0}</span></div>
            <div className="text-gray-300">Pressure: <span className="text-white font-bold">{stats.pressure?.main || 0}</span></div>
            <div className="text-gray-300">Agility: <span className="text-white font-bold">{stats.agility?.main || 0}</span></div>
            <div className="text-gray-300">Physical: <span className="text-white font-bold">{stats.physical?.main || 0}</span></div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderItemComparison = (item) => (
    <Card className="flex-1 min-w-[250px]" style={{ backgroundColor: logoColors.blackAlpha(0.3), borderColor: logoColors.primaryBlueAlpha(0.3) }}>
      <CardContent className="p-4">
        <div className="text-center mb-3">
          <img src={item.icon} alt={item.name} className="w-12 h-12 mx-auto mb-2" />
          <h4 className="font-bold text-white">{item.name}</h4>
          <Badge className={getRarityColor(item.rarity)} variant="outline">
            {item.rarity}
          </Badge>
        </div>
        
        <div className="text-xs">
          <div className="text-gray-300 mb-2">Category: <span className="text-white">{item.category}</span></div>
          {item.stats && (
            <div className="grid grid-cols-2 gap-1">
              {Object.entries(item.stats).map(([stat, value]) => (
                <div key={stat} className="text-gray-300">
                  {stat}: <span className="text-white font-bold">+{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderTechniqueComparison = (technique) => (
    <Card className="flex-1 min-w-[250px]" style={{ backgroundColor: logoColors.blackAlpha(0.3), borderColor: logoColors.primaryBlueAlpha(0.3) }}>
      <CardContent className="p-4">
        <div className="text-center mb-3">
          <img src={technique.icon} alt={technique.name} className="w-12 h-12 mx-auto mb-2" />
          <h4 className="font-bold text-white">{technique.name}</h4>
          <Badge variant="outline" style={{ color: logoColors.primaryBlue, borderColor: logoColors.primaryBlue }}>
            {technique.type}
          </Badge>
        </div>
        
        <div className="text-xs space-y-1">
          <div className="text-gray-300">{technique.description}</div>
          {technique.power && (
            <div className="text-gray-300">Power: <span className="text-white font-bold">{technique.power}</span></div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderCoachComparison = (coach) => (
    <Card className="flex-1 min-w-[250px]" style={{ backgroundColor: logoColors.blackAlpha(0.3), borderColor: logoColors.primaryBlueAlpha(0.3) }}>
      <CardContent className="p-4">
        <div className="text-center mb-3">
          <img src={coach.portrait} alt={coach.name} className="w-16 h-16 rounded-full mx-auto mb-2" />
          <h4 className="font-bold text-white">{coach.name}</h4>
          <div className="text-sm text-gray-300">{coach.title}</div>
        </div>
        
        <div className="text-xs">
          {coach.bonuses?.teamStats && (
            <div className="mb-2">
              <div className="text-gray-300 font-medium mb-1">Team Bonuses:</div>
              <div className="grid grid-cols-2 gap-1">
                {Object.entries(coach.bonuses.teamStats).map(([stat, value]) => (
                  <div key={stat} className="text-gray-300">
                    {stat}: <span className="text-white font-bold">+{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {coach.specialties && coach.specialties.length > 0 && (
            <div>
              <div className="text-gray-300 font-medium mb-1">Specialties:</div>
              <div className="flex flex-wrap gap-1">
                {coach.specialties.map((specialty, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs" 
                         style={{ color: logoColors.primaryYellow, borderColor: logoColors.primaryYellow }}>
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderComparison = () => {
    if (compareItems.length === 0) {
      return (
        <div className="text-center py-8 text-gray-400">
          <Scale className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Add up to 6 items to start comparing</p>
        </div>
      );
    }

    return (
      <div className="flex gap-4 overflow-x-auto pb-4 flex-wrap">
        {compareItems.map(item => {
          switch (selectedCategory) {
            case 'characters':
              return <div key={item.id}>{renderCharacterComparison(item)}</div>;
            case 'items':
              return <div key={item.id}>{renderItemComparison(item)}</div>;
            case 'techniques':
              return <div key={item.id}>{renderTechniqueComparison(item)}</div>;
            case 'coaches':
            case 'managers':
              return <div key={item.id}>{renderCoachComparison(item)}</div>;
            default:
              return null;
          }
        })}
      </div>
    );
  };

  const getPositionColor = (position) => {
    switch (position) {
      case 'FW': return 'bg-red-500 text-white';
      case 'MF': return 'bg-orange-500 text-white';
      case 'DF': return 'bg-blue-500 text-white';
      case 'GK': return 'bg-green-600 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'Legendary': return 'border-yellow-400 text-yellow-400';
      case 'Epic': return 'border-purple-400 text-purple-400';
      case 'Rare': return 'border-blue-400 text-blue-400';
      case 'Common': return 'border-gray-400 text-gray-400';
      default: return 'border-gray-400 text-gray-400';
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Floating Comparison Button - Fixed positioning and visibility */}
      <div className="fixed bottom-4 right-20 z-50 select-none">
        <Button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 rounded-full shadow-2xl hover:scale-110 transition-all duration-200 border-2 flex items-center justify-center"
          style={{ 
            background: logoColors.primaryOrangeGradient,
            color: 'white',
            borderColor: logoColors.primaryBlue,
            boxShadow: '0 8px 32px rgba(214, 84, 42, 0.6)'
          }}
          title="Comparison Tool"
        >
          <Scale className="h-6 w-6" />
        </Button>
      </div>

      {/* Comparison Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-6xl h-[90vh] flex flex-col text-white" 
                       style={{ backgroundColor: logoColors.blackAlpha(0.95), borderColor: logoColors.primaryBlueAlpha(0.3) }}>
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Scale className="h-6 w-6" style={{ color: logoColors.primaryBlue }} />
              Comparison Tool
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            {/* Controls */}
            <div className="flex gap-4 items-center flex-wrap">
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-[180px]" style={{ backgroundColor: logoColors.blackAlpha(0.5), borderColor: logoColors.primaryBlueAlpha(0.3) }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: logoColors.blackAlpha(0.9), borderColor: logoColors.primaryBlueAlpha(0.3) }}>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value} className="text-white hover:bg-blue-700/30">
                      {cat.icon} {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={`Search ${selectedCategory}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-white"
                  style={{ backgroundColor: logoColors.blackAlpha(0.5), borderColor: logoColors.primaryBlueAlpha(0.3) }}
                />
              </div>

              {compareItems.length > 0 && (
                <Button onClick={clearComparison} variant="outline" size="sm"
                        style={{ borderColor: logoColors.primaryRed, color: logoColors.primaryRed }}>
                  Clear All
                </Button>
              )}

              <div className="text-sm text-gray-400">
                {compareItems.length}/6 items selected
              </div>
            </div>

            {/* Comparison View */}
            <div className="flex-1 border rounded-lg p-4 overflow-hidden" 
                 style={{ borderColor: logoColors.primaryBlueAlpha(0.3), backgroundColor: logoColors.blackAlpha(0.1) }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-center">Comparison</h3>
                <div className="text-sm text-gray-400">Max 6 items</div>
              </div>
              <div className="h-full overflow-y-auto">
                {renderComparison()}
              </div>
            </div>

            {/* Available Items */}
            <div className="flex-1 border rounded-lg p-4 overflow-hidden" 
                 style={{ borderColor: logoColors.primaryBlueAlpha(0.3), backgroundColor: logoColors.blackAlpha(0.1) }}>
              <h3 className="text-lg font-bold mb-4">Available {categories.find(c => c.value === selectedCategory)?.label}</h3>
              
              {loading ? (
                <div className="text-center py-8 text-gray-400">Loading...</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 h-full overflow-y-auto">
                  {filteredItems.map(item => {
                    const isSelected = compareItems.find(i => i.id === item.id);
                    const canAdd = !isSelected && compareItems.length < 6;
                    
                    return (
                      <div key={item.id} 
                           className={`p-3 rounded-lg border transition-all ${canAdd || isSelected ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed opacity-60'}`}
                           style={{ 
                             backgroundColor: isSelected
                               ? logoColors.primaryBlueAlpha(0.2) 
                               : logoColors.blackAlpha(0.2),
                             borderColor: isSelected
                               ? logoColors.primaryBlue
                               : logoColors.primaryBlueAlpha(0.3)
                           }}
                           onClick={() => {
                             if (isSelected) {
                               removeFromComparison(item.id);
                             } else if (canAdd) {
                               addToComparison(item);
                             }
                           }}>
                        
                        <div className="flex items-center gap-2">
                          <img src={item.image || item.icon || item.portrait || '/api/placeholder/40/40'} 
                               alt={item.name} className="w-8 h-8 rounded" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-white truncate">{item.name}</div>
                            <div className="text-xs text-gray-400 truncate">
                              {selectedCategory === 'characters' && item.position}
                              {selectedCategory === 'items' && item.category}
                              {selectedCategory === 'techniques' && item.type}
                              {(selectedCategory === 'coaches' || selectedCategory === 'managers') && item.title}
                            </div>
                          </div>
                          
                          {isSelected ? (
                            <X className="h-4 w-4 text-red-400" 
                               onClick={(e) => { e.stopPropagation(); removeFromComparison(item.id); }} />
                          ) : canAdd ? (
                            <Plus className="h-4 w-4 text-green-400" />
                          ) : (
                            <div className="h-4 w-4 text-gray-600" title="Comparison limit reached (6 items max)">
                              <Scale className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ComparisonTool;