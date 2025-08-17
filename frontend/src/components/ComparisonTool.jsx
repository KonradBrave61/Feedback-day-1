import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { X, Scale, Search, Filter } from 'lucide-react';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { logoColors } from '../styles/colors';
import { calculateStats } from '../data/mock';
import { useAuth } from '../contexts/AuthContext';
import { useComparison } from '../contexts/ComparisonContext';

const ComparisonTool = () => {
  const { user } = useAuth();
  const { comparisonData, addToComparison, removeFromComparison, clearComparison, isInComparison, getCompareItems, canAddMore } = useComparison();
  const [isOpen, setIsOpen] = useState(false);
  const [availableItems, setAvailableItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('characters');
  const [loading, setLoading] = useState(false);

  // Get current category's comparison items
  const compareItems = getCompareItems(selectedCategory);

  const categories = [
    { value: 'characters', label: 'Characters', icon: '👤' },
    { value: 'items', label: 'Items', icon: '🎒' },
    { value: 'techniques', label: 'Techniques', icon: '⚡' },
    { value: 'coaches', label: 'Coaches', icon: '👨‍💼' }
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
          url = `${backendUrl}/api/teams/coaches/`;
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
    setSearchTerm('');
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

  // New table-based comparison renderers for columns and rows layout
  const renderCharacterComparisonTable = () => {
    const allStats = ['kick', 'control', 'technique', 'intelligence', 'pressure', 'agility', 'physical'];
    
    return (
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse">
          {/* Header Row */}
          <thead>
            <tr>
              <th className="p-2 border border-gray-600 bg-gray-800 text-white font-bold text-left">Attribute</th>
              {compareItems.map(character => (
                <th key={character.id} className="p-2 border border-gray-600 bg-gray-800 text-white font-bold text-center min-w-[120px]">
                  <div className="flex flex-col items-center gap-1">
                    <img src={character.image} alt={character.name} className="w-10 h-10 rounded-full" />
                    <div className="text-xs">{character.name}</div>
                    <div className="flex gap-1">
                      <Badge className={`${getPositionColor(character.position)} text-xs px-1`}>
                        {character.position}
                      </Badge>
                      <Badge variant="outline" className="text-xs" style={{ color: logoColors.primaryBlue, borderColor: logoColors.primaryBlue }}>
                        {character.element}
                      </Badge>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Basic Info Row */}
            <tr>
              <td className="p-2 border border-gray-600 bg-gray-700 text-white font-medium">Position</td>
              {compareItems.map(character => (
                <td key={character.id} className="p-2 border border-gray-600 text-center text-white">
                  {character.position}
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-2 border border-gray-600 bg-gray-700 text-white font-medium">Element</td>
              {compareItems.map(character => (
                <td key={character.id} className="p-2 border border-gray-600 text-center text-white">
                  {character.element}
                </td>
              ))}
            </tr>
            
            {/* Stats Rows */}
            {allStats.map(statName => (
              <tr key={statName}>
                <td className="p-2 border border-gray-600 bg-gray-700 text-white font-medium capitalize">
                  {statName}
                </td>
                {compareItems.map(character => {
                  const stats = calculateStats(character, {}, character.level || 99, character.rarity || 'Legendary');
                  const statValue = stats[statName]?.main || character.base_stats?.[statName] || 0;
                  return (
                    <td key={character.id} className="p-2 border border-gray-600 text-center text-white font-bold">
                      {statValue}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderItemComparisonTable = () => {
    const allCategories = [...new Set(compareItems.map(item => item.category))];
    const allRarities = [...new Set(compareItems.map(item => item.rarity))];
    const allStats = [...new Set(compareItems.flatMap(item => Object.keys(item.stats || {})))];

    return (
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-2 border border-gray-600 bg-gray-800 text-white font-bold text-left">Attribute</th>
              {compareItems.map(item => (
                <th key={item.id} className="p-2 border border-gray-600 bg-gray-800 text-white font-bold text-center min-w-[120px]">
                  <div className="flex flex-col items-center gap-1">
                    <img src={item.icon} alt={item.name} className="w-10 h-10" />
                    <div className="text-xs">{item.name}</div>
                    <Badge className={getRarityColor(item.rarity)} variant="outline" className="text-xs">
                      {item.rarity}
                    </Badge>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border border-gray-600 bg-gray-700 text-white font-medium">Category</td>
              {compareItems.map(item => (
                <td key={item.id} className="p-2 border border-gray-600 text-center text-white">
                  {item.category}
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-2 border border-gray-600 bg-gray-700 text-white font-medium">Rarity</td>
              {compareItems.map(item => (
                <td key={item.id} className="p-2 border border-gray-600 text-center text-white">
                  {item.rarity}
                </td>
              ))}
            </tr>
            
            {allStats.map(statName => (
              <tr key={statName}>
                <td className="p-2 border border-gray-600 bg-gray-700 text-white font-medium capitalize">
                  {statName}
                </td>
                {compareItems.map(item => (
                  <td key={item.id} className="p-2 border border-gray-600 text-center text-white font-bold">
                    {item.stats?.[statName] ? `+${item.stats[statName]}` : '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderTechniqueComparisonTable = () => {
    return (
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-2 border border-gray-600 bg-gray-800 text-white font-bold text-left">Attribute</th>
              {compareItems.map(technique => (
                <th key={technique.id} className="p-2 border border-gray-600 bg-gray-800 text-white font-bold text-center min-w-[120px]">
                  <div className="flex flex-col items-center gap-1">
                    <img src={technique.icon || '/api/placeholder/40/40'} alt={technique.name} className="w-10 h-10" />
                    <div className="text-xs">{technique.name}</div>
                    <Badge variant="outline" className="text-xs" style={{ color: logoColors.primaryBlue, borderColor: logoColors.primaryBlue }}>
                      {technique.type || technique.technique_type}
                    </Badge>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border border-gray-600 bg-gray-700 text-white font-medium">Type</td>
              {compareItems.map(technique => (
                <td key={technique.id} className="p-2 border border-gray-600 text-center text-white">
                  {technique.type || technique.technique_type}
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-2 border border-gray-600 bg-gray-700 text-white font-medium">Element</td>
              {compareItems.map(technique => (
                <td key={technique.id} className="p-2 border border-gray-600 text-center text-white">
                  {technique.element || '-'}
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-2 border border-gray-600 bg-gray-700 text-white font-medium">Power</td>
              {compareItems.map(technique => (
                <td key={technique.id} className="p-2 border border-gray-600 text-center text-white font-bold">
                  {technique.power || '-'}
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-2 border border-gray-600 bg-gray-700 text-white font-medium">Category</td>
              {compareItems.map(technique => (
                <td key={technique.id} className="p-2 border border-gray-600 text-center text-white">
                  {technique.category || '-'}
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-2 border border-gray-600 bg-gray-700 text-white font-medium">Description</td>
              {compareItems.map(technique => (
                <td key={technique.id} className="p-2 border border-gray-600 text-center text-white text-xs">
                  {technique.description || '-'}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const renderCoachComparisonTable = () => {
    const allBonusStats = [...new Set(compareItems.flatMap(coach => Object.keys(coach.bonuses?.teamStats || {})))];
    
    return (
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-2 border border-gray-600 bg-gray-800 text-white font-bold text-left">Attribute</th>
              {compareItems.map(coach => (
                <th key={coach.id} className="p-2 border border-gray-600 bg-gray-800 text-white font-bold text-center min-w-[120px]">
                  <div className="flex flex-col items-center gap-1">
                    <img src={coach.portrait || '/api/placeholder/40/40'} alt={coach.name} className="w-10 h-10 rounded-full" />
                    <div className="text-xs">{coach.name}</div>
                    <div className="text-xs text-gray-300">{coach.title}</div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border border-gray-600 bg-gray-700 text-white font-medium">Title</td>
              {compareItems.map(coach => (
                <td key={coach.id} className="p-2 border border-gray-600 text-center text-white">
                  {coach.title}
                </td>
              ))}
            </tr>
            
            {allBonusStats.map(statName => (
              <tr key={statName}>
                <td className="p-2 border border-gray-600 bg-gray-700 text-white font-medium capitalize">
                  {statName} Bonus
                </td>
                {compareItems.map(coach => (
                  <td key={coach.id} className="p-2 border border-gray-600 text-center text-white font-bold">
                    {coach.bonuses?.teamStats?.[statName] ? `+${coach.bonuses.teamStats[statName]}` : '-'}
                  </td>
                ))}
              </tr>
            ))}
            
            <tr>
              <td className="p-2 border border-gray-600 bg-gray-700 text-white font-medium">Specialties</td>
              {compareItems.map(coach => (
                <td key={coach.id} className="p-2 border border-gray-600 text-center text-white text-xs">
                  <div className="flex flex-wrap gap-1 justify-center">
                    {coach.specialties?.map((specialty, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs"
                             style={{ color: logoColors.primaryYellow, borderColor: logoColors.primaryYellow }}>
                        {specialty}
                      </Badge>
                    )) || '-'}
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const renderComparison = () => {
    if (compareItems.length === 0) {
      return (
        <div className="text-center py-8 text-gray-400">
          <Scale className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Add up to 6 items to start comparing</p>
        </div>
      );
    }

    // Render comparison in columns and rows format
    return (
      <div className="w-full">
        {selectedCategory === 'characters' && renderCharacterComparisonTable()}
        {selectedCategory === 'items' && renderItemComparisonTable()}
        {selectedCategory === 'techniques' && renderTechniqueComparisonTable()}
        {selectedCategory === 'coaches' && renderCoachComparisonTable()}
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

  return (
    <Dialog>
      {/* Floating Comparison Button - Fixed positioning and visibility */}
      <div className="fixed bottom-4 left-4 z-50 select-none">
        <DialogTrigger asChild>
          <Button
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
        </DialogTrigger>
      </div>

      {/* Comparison Modal */}
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
              <Button onClick={() => clearComparison(selectedCategory)} variant="outline" size="sm"
                      style={{ borderColor: logoColors.primaryRed, color: logoColors.primaryRed }}>
                Clear {categories.find(c => c.value === selectedCategory)?.label}
              </Button>
            )}

            <div className="text-sm text-gray-400">
              {compareItems.length}/6 {categories.find(c => c.value === selectedCategory)?.label.toLowerCase()} selected
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
                  const isSelected = isInComparison(item.id);
                  const canAdd = !isSelected && canAddMore;
                  
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
                            {selectedCategory === 'coaches' && item.title}
                          </div>
                        </div>
                        
                        {isSelected ? (
                          <X className="h-4 w-4 text-red-400" 
                             onClick={(e) => { e.stopPropagation(); removeFromComparison(item.id); }} />
                        ) : canAdd ? (
                          <Scale className="h-4 w-4 text-green-400" />
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
  );
};

export default ComparisonTool;