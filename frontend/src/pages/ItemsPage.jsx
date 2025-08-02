import React, { useState } from 'react';
import Navigation from '../components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { mockEquipment } from '../data/mock';
import { Package, Info, Coins, Gem, Star, Award } from 'lucide-react';

const ItemsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('boots');
  const [selectedItem, setSelectedItem] = useState(null);
  const [hoveredCurrency, setHoveredCurrency] = useState(null);

  // Enhanced mock data for different item categories matching the image
  const itemCategories = {
    boots: {
      name: 'Boots',
      items: [
        { ...mockEquipment.boots[0], cost: 250, currency: 'gold', description: 'Professional football boots with enhanced kick power' },
        { ...mockEquipment.boots[1], cost: 180, currency: 'gold', description: 'High-quality boots with good agility boost' },
        { ...mockEquipment.boots[2], cost: 120, currency: 'gold', description: 'Standard boots with fire element boost' },
        { ...mockEquipment.boots[3], cost: 50, currency: 'gold', description: 'Basic training boots for beginners' },
        { id: 17, name: "Gale Boots", rarity: "Epic", category: "Boots", icon: "https://images.unsplash.com/photo-1612387049695-637b743f80ad?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwzfHxzb2NjZXIlMjBib290c3xlbnwwfHx8fDE3NTQxMDcxNjF8MA&ixlib=rb-4.1.0&q=85", stats: { agility: 18, technique: 8 }, cost: 300, currency: 'gold', description: 'Wind-powered boots with incredible speed enhancement' },
        { id: 18, name: "Verdant Boots", rarity: "Rare", category: "Boots", icon: "https://images.unsplash.com/photo-1511426463457-0571e247d816?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwxfHxzb2NjZXIlMjBib290c3xlbnwwfHx8fDE3NTQxMDcxNjF8MA&ixlib=rb-4.1.0&q=85", stats: { control: 12, technique: 10 }, cost: 150, currency: 'gold', description: 'Nature-infused boots with enhanced ball control' },
        { id: 19, name: "Raimon Boots", rarity: "Legendary", category: "Boots", icon: "https://images.unsplash.com/photo-1612387048732-1840c48c0976?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwyfHxzb2NjZXIlMjBib290c3xlbnwwfHx8fDE3NTQxMDcxNjF8MA&ixlib=rb-4.1.0&q=85", stats: { kick: 20, agility: 15 }, cost: 500, currency: 'gems', description: 'Legendary boots worn by Raimon champions' },
        { id: 20, name: "Raimon Boots of Revolution", rarity: "Legendary", category: "Boots", icon: "https://images.unsplash.com/photo-1653681498612-37ec55093e29?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwyfHxzcG9ydHMlMjBlcXVpcG1lbnR8ZW58MHx8fHwxNzU0MTA3MTc4fDA&ixlib=rb-4.1.0&q=85", stats: { kick: 25, control: 12, technique: 15 }, cost: 1000, currency: 'diamonds', description: 'Ultimate boots that revolutionized football tactics' },
        { id: 21, name: "Backwater Raimon Boots", rarity: "Epic", category: "Boots", icon: "https://images.pexels.com/photos/358042/pexels-photo-358042.jpeg", stats: { kick: 15, pressure: 10 }, cost: 220, currency: 'gold', description: 'Weathered boots with mysterious power' }
      ]
    },
    bracelets: mockEquipment.bracelets.map(item => ({ ...item, cost: Math.floor(Math.random() * 200) + 100, currency: 'gold' })),
    pendants: mockEquipment.pendants.map(item => ({ ...item, cost: Math.floor(Math.random() * 150) + 80, currency: 'gold' })),
    special: mockEquipment.special.map(item => ({ ...item, cost: Math.floor(Math.random() * 300) + 200, currency: 'gems' }))
  };

  // Currency data with hover explanations
  const currencies = [
    { 
      name: 'Gold', 
      amount: 1250, 
      icon: 'https://images.unsplash.com/photo-1653590501805-cce7dec267e0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwyfHxnYW1lJTIwY29pbnN8ZW58MHx8fHwxNzU0MTA3MjA5fDA&ixlib=rb-4.1.0&q=85',
      color: 'text-yellow-400',
      description: 'Earned by winning matches, completing training sessions, and daily challenges'
    },
    { 
      name: 'Gems', 
      amount: 42, 
      icon: 'https://images.unsplash.com/photo-1521133573892-e44906baee46?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwzfHxnZW1zfGVufDB8fHx8MTc1NDEwNzIxNXww&ixlib=rb-4.1.0&q=85',
      color: 'text-purple-400',
      description: 'Premium currency obtained through tournaments, achievements, and special events'
    },
    { 
      name: 'Diamonds', 
      amount: 10, 
      icon: 'https://images.pexels.com/photos/1147946/pexels-photo-1147946.jpeg',
      color: 'text-blue-400',
      description: 'Ultra-rare currency earned only through major championship victories'
    },
    { 
      name: 'Stars', 
      amount: 182, 
      icon: 'https://images.unsplash.com/photo-1637597384601-61e937e8bc15?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwyfHxjdXJyZW5jeSUyMHRva2Vuc3xlbnwwfHx8fDE3NTQxMDcyMjF8MA&ixlib=rb-4.1.0&q=85',
      color: 'text-green-400',
      description: 'Earned through constellation gacha pulls and character development'
    }
  ];

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'Legendary': return 'bg-gradient-to-r from-yellow-500 to-orange-500 border-yellow-400';
      case 'Epic': return 'bg-gradient-to-r from-purple-500 to-pink-500 border-purple-400';
      case 'Rare': return 'bg-gradient-to-r from-blue-500 to-cyan-500 border-blue-400';
      case 'Common': return 'bg-gradient-to-r from-gray-500 to-gray-600 border-gray-400';
      default: return 'bg-gradient-to-r from-orange-500 to-red-600 border-orange-400';
    }
  };

  const getRarityTextColor = (rarity) => {
    switch (rarity) {
      case 'Legendary': return 'text-yellow-400';
      case 'Epic': return 'text-purple-400';
      case 'Rare': return 'text-blue-400';
      case 'Common': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getCurrencyIcon = (currencyType) => {
    const currency = currencies.find(c => c.name.toLowerCase() === currencyType);
    return currency?.icon || currencies[0].icon;
  };

  const getCurrencyColor = (currencyType) => {
    const currency = currencies.find(c => c.name.toLowerCase() === currencyType);
    return currency?.color || 'text-yellow-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-800 to-green-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header with Title and Currency Display */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Items Database</h1>
            <p className="text-gray-300">Research equipment stats, costs, and availability</p>
          </div>
          
          {/* Currency Display */}
          <Card className="bg-black/40 backdrop-blur-lg border-green-400/20 text-white">
            <CardContent className="p-4">
              <div className="text-sm font-bold text-green-400 mb-2">CURRENCIES</div>
              <div className="grid grid-cols-2 gap-3">
                {currencies.map((currency) => (
                  <div 
                    key={currency.name}
                    className="relative flex items-center gap-2 cursor-pointer hover:bg-green-700/20 p-1 rounded"
                    onMouseEnter={() => setHoveredCurrency(currency.name)}
                    onMouseLeave={() => setHoveredCurrency(null)}
                  >
                    <img src={currency.icon} alt={currency.name} className="w-6 h-6 rounded" />
                    <span className={`font-bold ${currency.color}`}>{currency.amount}</span>
                    
                    {/* Hover Tooltip */}
                    {hoveredCurrency === currency.name && (
                      <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-black/90 border border-green-400/30 rounded-lg text-sm z-10">
                        <div className="font-bold text-green-400 mb-1">{currency.name}</div>
                        <div className="text-gray-300">{currency.description}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel - Categories */}
          <div className="lg:col-span-1">
            <Card className="bg-black/30 backdrop-blur-lg border-green-400/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-green-400" />
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(itemCategories).map(([key, category]) => (
                    <button
                      key={key}
                      className={`w-full p-3 rounded-lg text-left transition-all ${
                        selectedCategory === key
                          ? 'bg-green-600/40 border-green-400/50 text-white'
                          : 'bg-green-800/20 border-green-400/20 text-gray-300 hover:bg-green-700/30'
                      } border`}
                      onClick={() => {
                        setSelectedCategory(key);
                        setSelectedItem(null);
                      }}
                    >
                      <div className="font-medium">{category.name}</div>
                      <div className="text-xs text-gray-400">{category.items ? category.items.length : category.length} items</div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle Panel - Items List */}
          <div className="lg:col-span-2">
            <Card className="bg-black/30 backdrop-blur-lg border-green-400/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-green-400" />
                  {itemCategories[selectedCategory]?.name || 'Items'}
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-[600px] overflow-y-auto">
                <div className="space-y-3">
                  {(itemCategories[selectedCategory]?.items || itemCategories[selectedCategory] || []).map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover:scale-[1.02] ${
                        selectedItem?.id === item.id
                          ? 'bg-green-600/30 border-green-400/60'
                          : 'bg-green-800/20 border-green-400/20 hover:bg-green-700/30'
                      }`}
                      onClick={() => setSelectedItem(item)}
                    >
                      <div className="flex items-center gap-4">
                        <img src={item.icon} alt={item.name} className="w-12 h-12 rounded-lg bg-gray-800/50 p-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{item.name}</span>
                            <Badge className={`${getRarityTextColor(item.rarity)} border-current bg-transparent text-xs`}>
                              {item.rarity}
                            </Badge>
                          </div>
                          {item.cost && (
                            <div className="flex items-center gap-2 text-sm">
                              <img src={getCurrencyIcon(item.currency)} alt={item.currency} className="w-4 h-4 rounded" />
                              <span className={getCurrencyColor(item.currency)}>{item.cost}</span>
                            </div>
                          )}
                        </div>
                        {item.stats && (
                          <div className="text-xs text-gray-400">
                            {Object.entries(item.stats).slice(0, 2).map(([stat, value]) => 
                              `${stat}: +${value}`
                            ).join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Item Details */}
          <div className="lg:col-span-1">
            <Card className="bg-black/30 backdrop-blur-lg border-green-400/20 text-white min-h-[400px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-green-400" />
                  {selectedItem ? 'Item Details' : 'Select Item'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedItem ? (
                  <div className="space-y-4">
                    {/* Item Image and Basic Info */}
                    <div className="text-center">
                      <div className={`inline-block p-4 rounded-lg ${getRarityColor(selectedItem.rarity)} border-2`}>
                        <img src={selectedItem.icon} alt={selectedItem.name} className="w-16 h-16 mx-auto" />
                      </div>
                      <h3 className="font-bold text-lg mt-2">{selectedItem.name}</h3>
                      <Badge className={`${getRarityTextColor(selectedItem.rarity)} border-current bg-transparent mt-1`}>
                        {selectedItem.rarity}
                      </Badge>
                    </div>

                    {/* Cost */}
                    {selectedItem.cost && (
                      <div className="bg-green-800/30 rounded-lg p-3 border border-green-400/20">
                        <div className="text-sm text-gray-300 mb-1">Cost</div>
                        <div className="flex items-center gap-2">
                          <img src={getCurrencyIcon(selectedItem.currency)} alt={selectedItem.currency} className="w-6 h-6 rounded" />
                          <span className={`font-bold text-lg ${getCurrencyColor(selectedItem.currency)}`}>
                            {selectedItem.cost}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Stats */}
                    {selectedItem.stats && Object.keys(selectedItem.stats).length > 0 && (
                      <div className="bg-green-800/30 rounded-lg p-3 border border-green-400/20">
                        <div className="text-sm text-gray-300 mb-2">Stat Bonuses</div>
                        <div className="space-y-1">
                          {Object.entries(selectedItem.stats).map(([stat, value]) => (
                            <div key={stat} className="flex justify-between items-center">
                              <span className="capitalize text-sm">{stat}</span>
                              <span className="text-green-400 font-bold">+{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    {selectedItem.description && (
                      <div className="bg-green-800/30 rounded-lg p-3 border border-green-400/20">
                        <div className="text-sm text-gray-300 mb-1">Description</div>
                        <p className="text-sm text-white">{selectedItem.description}</p>
                      </div>
                    )}

                    {/* Research Note */}
                    <div className="bg-blue-900/30 rounded-lg p-3 border border-blue-400/20">
                      <div className="flex items-center gap-2 text-blue-400 text-sm font-medium mb-1">
                        <Info className="h-4 w-4" />
                        Research Database
                      </div>
                      <p className="text-xs text-gray-300">
                        This is a research interface. Item stats and costs are for reference only.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-400 mt-8">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select an item from the list to view its details, stats, and cost information.</p>
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