import React, { useState, useEffect, useMemo } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { X, Scale, Search, Crown } from 'lucide-react';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './ui/tooltip';
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
    // Use proper environment variable for HTTPS backend URL
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    try {
      let url;
      const params = new URLSearchParams();
      switch (category) {
        case 'characters':
          if (filters.position) params.append('position', filters.position);
          if (filters.element) params.append('element', filters.element);
          if (filters.search) params.append('search', filters.search);
          url = `${backendUrl}/api/characters/${params.toString() ? '?' + params.toString() : ''}`;
          break;
        case 'items':
          if (filters.category) params.append('category', filters.category);
          if (filters.rarity) params.append('rarity', filters.rarity);
          if (filters.search) params.append('search', filters.search);
          url = `${backendUrl}/api/equipment/${params.toString() ? '?' + params.toString() : ''}`;
          break;
        case 'techniques':
          if (filters.technique_type) params.append('technique_type', filters.technique_type);
          if (filters.category) params.append('category', filters.category);
          if (filters.element) params.append('element', filters.element);
          if (filters.search) params.append('search', filters.search);
          url = `${backendUrl}/api/techniques/${params.toString() ? '?' + params.toString() : ''}`;
          break;
        case 'coaches':
          url = `${backendUrl}/api/teams/coaches/`;
          break;
        default:
          return { success: false, data: [] };
      }

      // Enforce https to avoid mixed content in some browser redirect edge-cases
      const httpsUrl = url.replace(/^http:\/\//, 'https://');
      const response = await fetch(httpsUrl, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
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
      setAvailableItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) loadData(selectedCategory);
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

  // ===== Visual helpers =====
  const StatBar = ({ value = 0, max = 0, color = logoColors.primaryBlue, showValue = true }) => {
    const pct = Math.min(100, Math.round(max > 0 ? (value / max) * 100 : 0));
    return (
      <div className="w-full h-5 rounded bg-gray-700/60 overflow-hidden">
        <div
          className="h-full transition-all"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${logoColors.primaryBlueAlpha(0.7)} 0%, ${logoColors.primaryBlue} 100%)`
          }}
        />
      </div>
    );
  };

  const CellWithBest = ({ value, isBest }) => (
    <div className="flex items-center justify-center gap-1 text-white">
      <span className="font-semibold">{value}</span>
      {isBest && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Crown className="h-4 w-4 text-yellow-400 drop-shadow" />
          </TooltipTrigger>
          <TooltipContent className="bg-black/80">Best in row</TooltipContent>
        </Tooltip>
      )}
    </div>
  );

  // ===== Character Comparison Table (with bars + best) =====
  const renderCharacterComparisonTable = () => {
    const allStats = ['kick', 'control', 'technique', 'intelligence', 'pressure', 'agility', 'physical'];

    // Precompute values and max per stat
    const valueByChar = compareItems.map(character => {
      const stats = calculateStats(character, {}, character.level || 99, character.rarity || 'Legendary');
      const map = {};
      allStats.forEach(s => {
        map[s] = stats[s]?.main || character.base_stats?.[s]?.main || 0;
      });
      return { id: character.id, data: map };
    });
    const maxByStat = allStats.reduce((acc, s) => {
      acc[s] = Math.max(0, ...valueByChar.map(v => v.data[s] || 0));
      return acc;
    }, {});

    return (
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-2 border border-gray-700 sticky top-0 z-10" style={{ background: logoColors.blackAlpha(0.7) }}>Attribute</th>
              {compareItems.map(character => (
                <th key={character.id} className="p-3 border border-gray-700 text-center min-w-[140px] sticky top-0 z-10" style={{ background: `linear-gradient(180deg, ${logoColors.blackAlpha(0.8)} 0%, ${logoColors.blackAlpha(0.6)} 100%)` }}>
                  <div className="flex flex-col items-center gap-1">
                    <img src={character.image} alt={character.name} className="w-10 h-10 rounded-full ring-2" style={{ borderColor: logoColors.primaryBlue }} />
                    <div className="text-xs text-white font-semibold truncate max-w-[120px]" title={character.name}>{character.name}</div>
                    <div className="flex gap-1">
                      <Badge className={`${getPositionColor(character.position)} text-[10px] px-1 py-0.5`}>{character.position}</Badge>
                      <Badge variant="outline" className="text-[10px] px-1 py-0.5" style={{ color: logoColors.primaryBlue, borderColor: logoColors.primaryBlue }}>{character.element}</Badge>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {['Position', 'Element'].map((label, idx) => (
              <tr key={label} className="bg-gray-800/40">
                <td className="p-2 border border-gray-700 text-white font-medium">{label}</td>
                {compareItems.map((ch) => (
                  <td key={ch.id} className="p-2 border border-gray-700 text-center text-white">
                    {idx === 0 ? ch.position : ch.element}
                  </td>
                ))}
              </tr>
            ))}

            {allStats.map(statName => (
              <tr key={statName} className="odd:bg-gray-800/40">
                <td className="p-2 border border-gray-700 text-white font-medium capitalize">
                  <div className="flex items-center gap-2">
                    {statName}
                  </div>
                </td>
                {compareItems.map(ch => {
                  const v = valueByChar.find(x => x.id === ch.id)?.data?.[statName] || 0;
                  const isBest = v === maxByStat[statName] && v > 0;
                  return (
                    <td key={ch.id} className="p-2 border border-gray-700">
                      <div className="flex flex-col gap-1">
                        <StatBar value={v} max={maxByStat[statName]} />
                        <CellWithBest value={v} isBest={isBest} />
                      </div>
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

  // ===== Items Comparison Table =====
  const renderItemComparisonTable = () => {
    const allStats = [...new Set(compareItems.flatMap(item => Object.keys(item.stats || {})))];

    const valueByItem = compareItems.map(item => ({ id: item.id, data: item.stats || {} }));
    const maxByStat = allStats.reduce((acc, s) => {
      acc[s] = Math.max(0, ...valueByItem.map(v => v.data?.[s] || 0));
      return acc;
    }, {});

    return (
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-2 border border-gray-700 sticky top-0 z-10" style={{ background: logoColors.blackAlpha(0.7) }}>Attribute</th>
              {compareItems.map(item => (
                <th key={item.id} className="p-3 border border-gray-700 text-center min-w-[140px] sticky top-0 z-10" style={{ background: `linear-gradient(180deg, ${logoColors.blackAlpha(0.8)} 0%, ${logoColors.blackAlpha(0.6)} 100%)` }}>
                  <div className="flex flex-col items-center gap-1">
                    <img src={item.icon} alt={item.name} className="w-10 h-10" />
                    <div className="text-xs text-white font-semibold truncate max-w-[120px]" title={item.name}>{item.name}</div>
                    <Badge className={getRarityColor(item.rarity)} variant="outline">{item.rarity}</Badge>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {['Category', 'Rarity'].map((label, idx) => (
              <tr key={label} className="bg-gray-800/40">
                <td className="p-2 border border-gray-700 text-white font-medium">{label}</td>
                {compareItems.map((it) => (
                  <td key={it.id} className="p-2 border border-gray-700 text-center text-white">
                    {idx === 0 ? it.category : it.rarity}
                  </td>
                ))}
              </tr>
            ))}

            {allStats.map(statName => (
              <tr key={statName} className="odd:bg-gray-800/40">
                <td className="p-2 border border-gray-700 text-white font-medium capitalize">{statName}</td>
                {compareItems.map(it => {
                  const v = valueByItem.find(x => x.id === it.id)?.data?.[statName] || 0;
                  const isBest = v === maxByStat[statName] && v > 0;
                  return (
                    <td key={it.id} className="p-2 border border-gray-700">
                      <div className="flex flex-col gap-1">
                        <StatBar value={v} max={maxByStat[statName]} />
                        <CellWithBest value={v ? `+${v}` : '-'} isBest={isBest} />
                      </div>
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

  // ===== Techniques Comparison Table =====
  const renderTechniqueComparisonTable = () => {
    const maxPower = Math.max(0, ...compareItems.map(t => t.power || 0));
    return (
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-2 border border-gray-700 sticky top-0 z-10" style={{ background: logoColors.blackAlpha(0.7) }}>Attribute</th>
              {compareItems.map(technique => (
                <th key={technique.id} className="p-3 border border-gray-700 text-center min-w-[140px] sticky top-0 z-10" style={{ background: `linear-gradient(180deg, ${logoColors.blackAlpha(0.8)} 0%, ${logoColors.blackAlpha(0.6)} 100%)` }}>
                  <div className="flex flex-col items-center gap-1">
                    <img src={technique.icon || '/api/placeholder/40/40'} alt={technique.name} className="w-10 h-10" />
                    <div className="text-xs text-white font-semibold truncate max-w-[120px]" title={technique.name}>{technique.name}</div>
                    <Badge variant="outline" className="text-xs" style={{ color: logoColors.primaryBlue, borderColor: logoColors.primaryBlue }}>
                      {technique.type || technique.technique_type}
                    </Badge>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {['Type', 'Element', 'Category', 'Description'].map((label) => (
              <tr key={label} className="bg-gray-800/40">
                <td className="p-2 border border-gray-700 text-white font-medium">{label}</td>
                {compareItems.map((t) => (
                  <td key={t.id} className="p-2 border border-gray-700 text-center text-white text-xs">
                    {label === 'Type' && (t.type || t.technique_type)}
                    {label === 'Element' && (t.element || '-')}
                    {label === 'Category' && (t.category || '-')}
                    {label === 'Description' && (t.description || '-')}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="odd:bg-gray-800/40">
              <td className="p-2 border border-gray-700 text-white font-medium">Power</td>
              {compareItems.map(t => {
                const v = t.power || 0;
                const isBest = v === maxPower && v > 0;
                return (
                  <td key={t.id} className="p-2 border border-gray-700">
                    <div className="flex flex-col gap-1">
                      <StatBar value={v} max={maxPower} />
                      <CellWithBest value={v || '-'} isBest={isBest} />
                    </div>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  // ===== Coaches Comparison Table =====
  const renderCoachComparisonTable = () => {
    const allBonusStats = [...new Set(compareItems.flatMap(coach => Object.keys(coach.bonuses?.teamStats || {})))];
    const valueByCoach = compareItems.map(coach => ({ id: coach.id, data: coach.bonuses?.teamStats || {} }));
    const maxByStat = allBonusStats.reduce((acc, s) => {
      acc[s] = Math.max(0, ...valueByCoach.map(v => v.data?.[s] || 0));
      return acc;
    }, {});

    return (
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-2 border border-gray-700 sticky top-0 z-10" style={{ background: logoColors.blackAlpha(0.7) }}>Attribute</th>
              {compareItems.map(coach => (
                <th key={coach.id} className="p-3 border border-gray-700 text-center min-w-[140px] sticky top-0 z-10" style={{ background: `linear-gradient(180deg, ${logoColors.blackAlpha(0.8)} 0%, ${logoColors.blackAlpha(0.6)} 100%)` }}>
                  <div className="flex flex-col items-center gap-1">
                    <img src={coach.portrait || '/api/placeholder/40/40'} alt={coach.name} className="w-10 h-10 rounded-full ring-2" style={{ borderColor: logoColors.primaryBlue }} />
                    <div className="text-xs text-white font-semibold truncate max-w-[120px]" title={coach.name}>{coach.name}</div>
                    <div className="text-[10px] text-gray-300">{coach.title}</div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="bg-gray-800/40">
              <td className="p-2 border border-gray-700 text-white font-medium">Title</td>
              {compareItems.map(coach => (
                <td key={coach.id} className="p-2 border border-gray-700 text-center text-white">{coach.title}</td>
              ))}
            </tr>

            {allBonusStats.map(statName => (
              <tr key={statName} className="odd:bg-gray-800/40">
                <td className="p-2 border border-gray-700 text-white font-medium capitalize">{statName} Bonus</td>
                {compareItems.map(coach => {
                  const v = valueByCoach.find(x => x.id === coach.id)?.data?.[statName] || 0;
                  const isBest = v === maxByStat[statName] && v > 0;
                  return (
                    <td key={coach.id} className="p-2 border border-gray-700">
                      <div className="flex flex-col gap-1">
                        <StatBar value={v} max={maxByStat[statName]} />
                        <CellWithBest value={v ? `+${v}` : '-'} isBest={isBest} />
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}

            <tr>
              <td className="p-2 border border-gray-700 text-white font-medium">Specialties</td>
              {compareItems.map(coach => (
                <td key={coach.id} className="p-2 border border-gray-700 text-center text-white text-xs">
                  <div className="flex flex-wrap gap-1 justify-center">
                    {coach.specialties?.map((specialty, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs" style={{ color: logoColors.primaryYellow, borderColor: logoColors.primaryYellow }}>
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
      const categoryLabel = categories.find(c => c.value === selectedCategory)?.label.toLowerCase() || 'items';
      return (
        <div className="text-center py-8 text-gray-400">
          <Scale className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Add up to 6 {categoryLabel} to start comparing</p>
          <p className="text-sm mt-2">Select {categoryLabel} from the list below to compare their stats and attributes</p>
        </div>
      );
    }

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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* Floating Comparison Button */}
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
            onClick={() => setIsOpen(true)}
          >
            <Scale className="h-6 w-6" />
          </Button>
        </DialogTrigger>
      </div>

      {/* Comparison Modal */}
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col text-white" 
                     style={{ backgroundColor: logoColors.blackAlpha(0.95), borderColor: logoColors.primaryBlueAlpha(0.3) }}>
        <TooltipProvider>
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
                <h3 className="text-lg font-bold text-center">
                  {categories.find(c => c.value === selectedCategory)?.icon} {categories.find(c => c.value === selectedCategory)?.label} Comparison
                </h3>
                <div className="text-sm text-gray-400">
                  {compareItems.length} selected (Max 6)
                </div>
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
              ) : availableItems.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No {categories.find(c => c.value === selectedCategory)?.label.toLowerCase()} available
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 h-full overflow-y-auto">
                  {filteredItems.map(item => {
                    const isSelected = isInComparison(item.id, selectedCategory);
                    const canAdd = !isSelected && canAddMore(selectedCategory);
                    return (
                      <div key={item.id}
                           className={`p-3 rounded-lg border transition-all ${canAdd || isSelected ? 'cursor-pointer hover:scale-[1.02]' : 'cursor-not-allowed opacity-60'}`}
                           style={{
                             background: isSelected
                               ? `linear-gradient(180deg, ${logoColors.primaryBlueAlpha(0.18)} 0%, ${logoColors.primaryBlueAlpha(0.08)} 100%)`
                               : logoColors.blackAlpha(0.2),
                             borderColor: isSelected ? logoColors.primaryBlue : logoColors.primaryBlueAlpha(0.3),
                             boxShadow: isSelected ? '0 0 0 2px rgba(59,130,246,0.3)' : 'none'
                           }}
                           onClick={() => {
                             if (isSelected) {
                               removeFromComparison(item.id, selectedCategory);
                             } else if (canAdd) {
                               addToComparison(item, selectedCategory);
                             }
                           }}>

                        <div className="flex items-center gap-3">
                          <img src={item.image || item.icon || item.portrait || '/api/placeholder/40/40'}
                               alt={item.name} className="w-10 h-10 rounded" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-white truncate" title={item.name}>{item.name}</div>
                            <div className="text-xs text-gray-400 truncate">
                              {selectedCategory === 'characters' && (
                                <span>{item.position} • {item.element}</span>
                              )}
                              {selectedCategory === 'items' &amp;&amp; (
                                <span>{item.category} • {item.rarity}</span>
                              )}
                              {selectedCategory === 'techniques' &amp;&amp; (
                                <span>{item.type || item.technique_type}{item.power ? ` • ${item.power} Power` : ''}</span>
                              )}
                              {selectedCategory === 'coaches' &amp;&amp; (
                                <span>{item.title}</span>
                              )}
                            </div>
                          </div>
                          {isSelected ? (
                            <X className="h-4 w-4 text-red-400" onClick={(e) => { e.stopPropagation(); removeFromComparison(item.id, selectedCategory); }} />
                          ) : canAdd ? (
                            <Scale className="h-4 w-4 text-green-400" />
                          ) : (
                            <div className="h-4 w-4 text-gray-600" title="Comparison limit reached (6 items max)"><Scale className="h-4 w-4" /></div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </TooltipProvider>
      </DialogContent>
    </Dialog>
  );
};

export default ComparisonTool;