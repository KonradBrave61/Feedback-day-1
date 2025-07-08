import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Plus, Eye } from 'lucide-react';

const CharacterCard = ({ character, onClick, viewMode = 'grid', onAddToTeam }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getPositionColor = (position) => {
    switch (position) {
      case 'FW': return 'bg-red-500 text-white';
      case 'MF': return 'bg-orange-500 text-white';
      case 'DF': return 'bg-sky-400 text-white';
      case 'GK': return 'bg-white text-black';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'Legendary': return 'bg-gradient-to-r from-yellow-400 to-orange-500';
      case 'Epic': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'Rare': return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      case 'Common': return 'bg-gradient-to-r from-gray-400 to-gray-600';
      default: return 'bg-gray-500';
    }
  };

  const getElementColor = (element) => {
    switch (element) {
      case 'Fire': return 'text-red-400';
      case 'Water': return 'text-blue-400';
      case 'Earth': return 'text-green-400';
      case 'Wind': return 'text-cyan-400';
      case 'Wood': return 'text-emerald-400';
      case 'Void': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  // Use base values for display (user will control level/rarity in modal)
  const displayLevel = character.baseLevel;
  const displayRarity = character.baseRarity;

  const StatPreview = () => (
    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm rounded-lg flex flex-col justify-center items-center p-4 opacity-0 group-hover:opacity-100 transition-all duration-200">
      <div className="text-center">
        <h3 className="text-white font-bold mb-2">{character.name}</h3>
        <Badge className={`${getRarityColor(displayRarity)} mb-2`}>
          {displayRarity}
        </Badge>
        <div className="grid grid-cols-2 gap-1 text-xs">
          <div className="text-red-400">Kick: {character.baseStats.kick.main}</div>
          <div className="text-orange-400">Control: {character.baseStats.control.main}</div>
          <div className="text-yellow-400">Tech: {character.baseStats.technique.main}</div>
          <div className="text-blue-400">Intel: {character.baseStats.intelligence.main}</div>
        </div>
      </div>
    </div>
  );

  if (viewMode === 'list') {
    return (
      <Card 
        className="bg-black/20 backdrop-blur-md border-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer group"
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <img 
                  src={character.portrait} 
                  alt={character.name}
                  className="w-14 h-14 rounded-full object-cover"
                />
              </div>
              <Badge className={`${getPositionColor(character.position)} absolute -bottom-1 -right-1 text-xs px-1`}>
                {character.position}
              </Badge>
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold">{character.name}</h3>
              <p className="text-gray-300 text-sm">{character.nickname}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-sm ${getElementColor(character.element)}`}>
                  {character.element}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onClick(); }}>
                <Eye className="h-4 w-4" />
              </Button>
              {onAddToTeam && (
                <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onAddToTeam(character); }}>
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className="bg-black/20 backdrop-blur-md border-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer group relative overflow-hidden"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-3">
        <div className="relative">
          {/* Character Portrait */}
          <div className={`w-full aspect-square ${displayRarity === 'Legendary' ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 'bg-gradient-to-br from-blue-500 to-purple-600'} rounded-lg mb-2 flex items-center justify-center overflow-hidden`}>
            <img 
              src={character.portrait} 
              alt={character.name}
              className="w-full h-full object-cover"
            />
            {displayRarity === 'Legendary' && (
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-lg">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTAgMGwzIDdsNyAwLTUuNSA0IDIgNi41LTYuNS00LjUtNi41IDQuNSAyLTYuNS01LjUtNCA3IDB6IiBmaWxsPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMSkiLz48L3N2Zz4=')] opacity-20"></div>
              </div>
            )}
          </div>

          {/* Position Badge */}
          <Badge className={`${getPositionColor(character.position)} absolute top-1 right-1 text-xs px-1`}>
            {character.position}
          </Badge>

          {/* Team Logo */}
          <div className="absolute top-1 left-1 w-6 h-6 bg-white/10 rounded-full flex items-center justify-center">
            <img 
              src={character.teamLogo} 
              alt="Team Logo"
              className="w-4 h-4"
            />
          </div>

          {/* Hover Preview */}
          {isHovered && <StatPreview />}
        </div>

        {/* Character Info */}
        <div className="space-y-2">
          <h3 className="text-white font-bold text-sm truncate">{character.name}</h3>
          
          <div className="flex items-center justify-center">
            <span className={`text-xs ${getElementColor(character.element)}`}>
              {character.element}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CharacterCard;