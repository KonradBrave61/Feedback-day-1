import React from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Users, Scale } from 'lucide-react';
import { logoColors } from '../styles/colors';
import { useComparison } from '../contexts/ComparisonContext';

const CharacterCard = ({ character, onClick, viewMode = 'grid' }) => {
  const { addToComparison, isInComparison } = useComparison();

  const handleCompareClick = (e) => {
    e.stopPropagation(); // Prevent card click from triggering
    addToComparison(character);
  };
  const getPositionColor = (position) => {
    switch (position) {
      case 'FW': return 'bg-red-500 text-white';
      case 'MF': return 'bg-orange-500 text-white';
      case 'DF': return 'bg-blue-500 text-white';
      case 'GK': return 'bg-white text-black';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getElementColor = (element) => {
    switch (element) {
      case 'Fire': return 'text-red-400';
      case 'Earth': return 'text-orange-400';
      case 'Wind': return `text-[${logoColors.lightBlue}]`;
      case 'Wood': return 'text-green-400';
      case 'Lightning': return `text-[${logoColors.primaryBlue}]`;
      default: return 'text-gray-400';
    }
  };

  const getElementBackgroundColor = (element) => {
    switch (element) {
      case 'Fire': return 'bg-gradient-to-br from-pink-500/30 to-rose-600/30 border-white/40';
      case 'Earth': return 'bg-gradient-to-br from-amber-500/30 to-yellow-600/30 border-white/40';
      case 'Wind': return `bg-gradient-to-br from-sky-400/30 to-blue-600/30 border-white/40`;
      case 'Wood': return 'bg-gradient-to-br from-emerald-500/30 to-green-600/30 border-white/40';
      case 'Lightning': return `bg-gradient-to-br from-[${logoColors.primaryBlue}]/30 to-[${logoColors.secondaryBlue}]/30 border-white/40`;
      default: return 'bg-gradient-to-br from-slate-500/30 to-gray-600/30 border-white/40';
    }
  };

  if (viewMode === 'grid') {
    return (
      <Card 
        className={`cursor-pointer hover:scale-105 transition-all duration-200 ${getElementBackgroundColor(character.element)} backdrop-blur-lg text-white`}
        onClick={onClick}
      >
        <CardContent className="p-2">
          <div className="relative">
            <img
              src={character.portrait}
              alt={character.name}
              className="w-full aspect-square object-cover rounded-lg mb-2"
            />
          </div>
          
          <div className="space-y-1">
            <h3 className="font-medium text-sm truncate">{character.name}</h3>
            <div className="flex items-center justify-between text-xs">
              <span className={getElementColor(character.element)}>
                {character.element}
              </span>
              <Badge className={`${getPositionColor(character.position)} text-xs`}>
                {character.position}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={`cursor-pointer hover:opacity-80 transition-colors ${getElementBackgroundColor(character.element)} backdrop-blur-lg text-white`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={character.portrait}
              alt={character.name}
              className="w-16 h-16 rounded-lg object-cover"
            />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-medium">{character.name}</h3>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className={getElementColor(character.element)}>
                {character.element}
              </span>
              <Badge className={`${getPositionColor(character.position)} text-xs`}>
                {character.position}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3 text-orange-400" />
                <span className="text-xs text-gray-400">
                  {character.teamPassives?.length || 0} passives
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CharacterCard;