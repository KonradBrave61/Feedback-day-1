import React, { useState } from 'react';
import Navigation from '../components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { 
  Search, 
  Package, 
  Star, 
  Shield, 
  Zap, 
  Award,
  Coins,
  Gem,
  Trophy,
  Target,
  Info,
  Filter
} from 'lucide-react';
import { logoColors, componentColors } from '../styles/colors';

const ItemsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', name: 'All Items', icon: Package, count: 45 },
    { id: 'boots', name: 'Boots', icon: Shield, count: 12 },
    { id: 'bracelets', name: 'Bracelets', icon: Star, count: 10 },
    { id: 'pendants', name: 'Pendants', icon: Award, count: 8 },
    { id: 'special', name: 'Special Items', icon: Zap, count: 6 },
    { id: 'consumables', name: 'Consumables', icon: Target, count: 9 }
  ];

  const currencies = [
    { 
      name: 'Kizuna Stars', 
      icon: Star, 
      amount: 1250, 
      color: logoColors.primaryYellow,
      description: 'Earned through matches and daily login. Used for gacha pulls and special purchases.' 
    },
    { 
      name: 'Training Points', 
      icon: Trophy, 
      amount: 850, 
      color: logoColors.primaryBlue,
      description: 'Gained from training sessions. Used to upgrade player stats and abilities.' 
    },
    { 
      name: 'Victory Coins', 
      icon: Coins, 
      amount: 2340, 
      color: logoColors.primaryOrange,
      description: 'Earned from winning matches. Used to purchase equipment and items.' 
    },
    { 
      name: 'Premium Gems', 
      icon: Gem, 
      amount: 45, 
      color: logoColors.secondaryBlue,
      description: 'Premium currency. Purchase with real money or earn from special events.' 
    }
  ];

  const mockItems = [
    {
      id: 1,
      name: 'Lightning Boots',
      category: 'boots',
      rarity: 'Legendary',
      stats: { speed: +15, technique: +10, kick: +8 },
      cost: { type: 'Victory Coins', amount: 500 },
      description: 'These legendary boots crackle with electric energy, dramatically increasing your speed and agility on the field.',
      image: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=200&h=200&fit=crop'
    },
    {
      id: 2,
      name: 'Phoenix Pendant',
      category: 'pendants',
      rarity: 'Epic',
      stats: { spirit: +20, catch: +12, technique: +5 },
      cost: { type: 'Kizuna Stars', amount: 75 },
      description: 'A mystical pendant that burns with the spirit of the phoenix, enhancing your spiritual power.',
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&h=200&fit=crop'
    },
    {
      id: 3,
      name: 'Iron Defense Bracelet',
      category: 'bracelets',
      rarity: 'Rare',
      stats: { defense: +18, physical: +10, block: +8 },
      cost: { type: 'Training Points', amount: 200 },
      description: 'Forged from the strongest materials, this bracelet provides excellent defensive capabilities.',
      image: 'https://images.unsplash.com/photo-1611955167811-4711904bb9f8?w=200&h=200&fit=crop'
    },
    {
      id: 4,
      name: 'Energy Drink',
      category: 'consumables',
      rarity: 'Common',
      stats: { stamina: '+50% for 1 match' },
      cost: { type: 'Victory Coins', amount: 25 },
      description: 'A refreshing energy drink that temporarily boosts your stamina during matches.',
      image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=200&h=200&fit=crop'
    },
    {
      id: 5,
      name: 'Mystic Orb',
      category: 'special',
      rarity: 'Legendary',
      stats: { all_stats: +5, special_move_power: +25 },
      cost: { type: 'Premium Gems', amount: 15 },
      description: 'A rare orb containing ancient power that enhances all abilities and special move effectiveness.',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop'
    }
  ];

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'Legendary': return logoColors.primaryYellow;
      case 'Epic': return logoColors.primaryOrange;
      case 'Rare': return logoColors.primaryBlue;
      case 'Common': return logoColors.lightGray;
      default: return logoColors.white;
    }
  };

  const getCurrencyColor = (currencyType) => {
    const currency = currencies.find(c => c.name === currencyType);
    return currency ? currency.color : logoColors.white;
  };

  const filteredItems = mockItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen" style={{ background: logoColors.backgroundGradient }}>
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4 bg-clip-text text-transparent" 
              style={{ background: logoColors.yellowOrangeGradient, WebkitBackgroundClip: 'text' }}>
            Items Database
          </h1>
          <p className="text-xl text-gray-300">
            Discover powerful equipment and consumables for your team
          </p>
        </div>

        {/* Currency Display */}
        <Card className="mb-8 backdrop-blur-lg text-white border" style={{ 
          backgroundColor: logoColors.blackAlpha(0.3),
          borderColor: logoColors.primaryBlueAlpha(0.2)
        }}>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {currencies.map((currency) => {
                const Icon = currency.icon;
                return (
                  <div 
                    key={currency.name} 
                    className="flex items-center gap-2 p-2 rounded-lg cursor-pointer group" 
                    style={{ backgroundColor: logoColors.blackAlpha(0.3) }}
                    title={currency.description}
                  >
                    <Icon className="h-5 w-5" style={{ color: currency.color }} />
                    <div>
                      <div className="font-bold text-white">{currency.amount.toLocaleString()}</div>
                      <div className="text-xs text-gray-300">{currency.name}</div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
                      <Info className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories Panel */}
          <div className="lg:col-span-1">
            <Card className="backdrop-blur-lg text-white border sticky top-4" style={{ 
              backgroundColor: logoColors.blackAlpha(0.3),
              borderColor: logoColors.primaryBlueAlpha(0.2)
            }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" style={{ color: logoColors.primaryBlue }} />
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" 
                          style={{ color: logoColors.primaryBlue }} />
                  <Input
                    placeholder="Search items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 text-white border"
                    style={{ 
                      backgroundColor: logoColors.blackAlpha(0.5),
                      borderColor: logoColors.primaryBlueAlpha(0.3)
                    }}
                  />
                </div>

                {categories.map((category) => {
                  const Icon = category.icon;
                  const isSelected = selectedCategory === category.id;
                  return (
                    <Button
                      key={category.id}
                      variant="ghost"
                      className={`w-full justify-start gap-3 h-12 ${
                        isSelected 
                          ? 'text-black hover:opacity-80' 
                          : 'text-white hover:bg-blue-700/30'
                      }`}
                      style={isSelected ? { background: logoColors.yellowOrangeGradient } : {}}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="flex-1 text-left">{category.name}</span>
                      <Badge 
                        className="text-xs"
                        style={{ 
                          backgroundColor: isSelected ? logoColors.blackAlpha(0.2) : logoColors.primaryBlueAlpha(0.2),
                          color: logoColors.white
                        }}
                      >
                        {category.count}
                      </Badge>
                    </Button>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Items List */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <Card 
                  key={item.id} 
                  className="backdrop-blur-lg text-white border cursor-pointer hover:opacity-80 transition-all" 
                  style={{ 
                    backgroundColor: logoColors.blackAlpha(0.3),
                    borderColor: selectedItem?.id === item.id ? logoColors.primaryYellow : logoColors.primaryBlueAlpha(0.2)
                  }}
                  onClick={() => setSelectedItem(item)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0" 
                           style={{ backgroundColor: logoColors.primaryBlueAlpha(0.2) }}>
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-white">{item.name}</h3>
                          <Badge 
                            className="text-xs"
                            style={{ 
                              backgroundColor: getRarityColor(item.rarity), 
                              color: item.rarity === 'Common' ? logoColors.black : logoColors.white 
                            }}
                          >
                            {item.rarity}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-300 mb-3">{item.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs">
                            {Object.entries(item.stats).map(([stat, value]) => (
                              <span key={stat} className="text-gray-300">
                                <span className="capitalize">{stat.replace('_', ' ')}</span>: 
                                <span className="font-bold ml-1" style={{ color: logoColors.primaryYellow }}>
                                  {value}
                                </span>
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-bold" style={{ color: getCurrencyColor(item.cost.type) }}>
                              {item.cost.amount}
                            </span>
                            <span className="text-xs text-gray-300">{item.cost.type}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredItems.length === 0 && (
                <div className="text-center py-16">
                  <Package className="h-16 w-16 mx-auto mb-4" style={{ color: logoColors.primaryBlue }} />
                  <h3 className="text-xl font-bold text-white mb-2">No Items Found</h3>
                  <p className="text-gray-300 mb-4">Try adjusting your search or category filter.</p>
                  <Button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                    }}
                    className="text-black font-bold hover:opacity-80"
                    style={{ background: logoColors.yellowOrangeGradient }}
                  >
                    Reset Filters
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Item Details */}
          <div className="lg:col-span-1">
            <Card className="backdrop-blur-lg text-white border sticky top-4" style={{ 
              backgroundColor: logoColors.blackAlpha(0.3),
              borderColor: logoColors.primaryBlueAlpha(0.2)
            }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" style={{ color: logoColors.primaryBlue }} />
                  {selectedItem ? 'Item Details' : 'Select an Item'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedItem ? (
                  <div className="space-y-4">
                    <div className="w-full h-32 rounded-lg overflow-hidden" 
                         style={{ backgroundColor: logoColors.primaryBlueAlpha(0.2) }}>
                      <img 
                        src={selectedItem.image} 
                        alt={selectedItem.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-xl text-white">{selectedItem.name}</h3>
                        <Badge 
                          style={{ 
                            backgroundColor: getRarityColor(selectedItem.rarity), 
                            color: selectedItem.rarity === 'Common' ? logoColors.black : logoColors.white 
                          }}
                        >
                          {selectedItem.rarity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-300 mb-4">{selectedItem.description}</p>
                    </div>

                    <div>
                      <h4 className="font-bold text-white mb-2">Stats</h4>
                      <div className="space-y-2">
                        {Object.entries(selectedItem.stats).map(([stat, value]) => (
                          <div key={stat} className="flex justify-between">
                            <span className="text-gray-300 capitalize">{stat.replace('_', ' ')}</span>
                            <span className="font-bold" style={{ color: logoColors.primaryYellow }}>
                              {value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 rounded-lg border" style={{ 
                      backgroundColor: logoColors.blackAlpha(0.3),
                      borderColor: logoColors.primaryBlueAlpha(0.3)
                    }}>
                      <div className="text-sm text-gray-300 mb-1">Cost</div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg" style={{ color: getCurrencyColor(selectedItem.cost.type) }}>
                          {selectedItem.cost.amount}
                        </span>
                        <span className="text-gray-300">{selectedItem.cost.type}</span>
                      </div>
                    </div>

                    <div className="text-center text-xs text-gray-400 p-2 rounded" 
                         style={{ backgroundColor: logoColors.blackAlpha(0.2) }}>
                      This is a research database for informational purposes
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 mx-auto mb-4" style={{ color: logoColors.primaryBlue }} />
                    <p className="text-gray-300">Click on an item to view detailed information</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemsPage;