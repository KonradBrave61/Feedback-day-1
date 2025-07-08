import React from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Plus, X } from 'lucide-react';

const FormationField = ({ formation, teamPlayers, onAddPlayer, onRemovePlayer }) => {
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

  const PlayerSlot = ({ position, player }) => {
    const isOccupied = !!player;

    return (
      <div 
        className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
        style={{ left: `${position.x}%`, top: `${position.y}%` }}
      >
        {isOccupied ? (
          <div className="relative">
            <Card className="w-16 h-20 bg-black/30 backdrop-blur-md border-white/20 hover:border-white/40 transition-all">
              <CardContent className="p-1">
                <div className="relative">
                  <div className={`w-12 h-12 rounded-lg overflow-hidden ${getRarityColor(player.rarity)}`}>
                    <img 
                      src={player.portrait} 
                      alt={player.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Badge className={`${getPositionColor(player.position)} absolute -top-1 -right-1 text-xs px-1`}>
                    {player.position}
                  </Badge>
                </div>
                <div className="text-xs text-white text-center mt-1 truncate">
                  {player.nickname}
                </div>
                <div className="text-xs text-gray-300 text-center">
                  Lv.{player.level}
                </div>
              </CardContent>
            </Card>
            
            {/* Remove Player Button */}
            <Button
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onRemovePlayer(position.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div 
            className="w-16 h-20 bg-black/20 backdrop-blur-md border-2 border-dashed border-white/30 hover:border-white/50 rounded-lg flex flex-col items-center justify-center transition-all hover:scale-105"
            onClick={() => onAddPlayer(position.id)}
          >
            <Plus className="h-6 w-6 text-white/60 mb-1" />
            <Badge className={`${getPositionColor(position.position)} text-xs`}>
              {position.position}
            </Badge>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative w-full h-96 bg-gradient-to-b from-green-600 to-green-800 rounded-lg overflow-hidden">
      {/* Field Background */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJhIiB4MT0iMCIgeTE9IjAiIHgyPSIwIiB5Mj0iMTAwIj48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiMxNmE0NGIiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMxNTgwM2QiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0idXJsKCNhKSIvPjxsaW5lIHgxPSI1MCIgeTE9IjAiIHgyPSI1MCIgeTI9IjEwMCIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMykiIHN0cm9rZS13aWR0aD0iMSIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjE1IiBzdHJva2U9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4zKSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIi8+PC9zdmc+')] opacity-30"></div>
      
      {/* Field Lines */}
      <div className="absolute inset-0">
        {/* Center Line */}
        <div className="absolute top-0 left-1/2 w-px h-full bg-white/30 transform -translate-x-1/2"></div>
        
        {/* Center Circle */}
        <div className="absolute top-1/2 left-1/2 w-24 h-24 border border-white/30 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
        
        {/* Goal Areas */}
        <div className="absolute bottom-0 left-1/2 w-32 h-12 border border-white/30 transform -translate-x-1/2"></div>
        <div className="absolute top-0 left-1/2 w-32 h-12 border border-white/30 transform -translate-x-1/2"></div>
        
        {/* Penalty Areas */}
        <div className="absolute bottom-0 left-1/2 w-48 h-20 border border-white/30 transform -translate-x-1/2"></div>
        <div className="absolute top-0 left-1/2 w-48 h-20 border border-white/30 transform -translate-x-1/2"></div>
      </div>

      {/* Player Positions */}
      {formation.positions.map((position) => (
        <PlayerSlot
          key={position.id}
          position={position}
          player={teamPlayers[position.id]}
        />
      ))}

      {/* Formation Info */}
      <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md rounded-lg p-2">
        <div className="text-white font-bold text-sm">{formation.name}</div>
        <div className="text-gray-300 text-xs">
          {Object.keys(teamPlayers).length}/11 players
        </div>
      </div>
    </div>
  );
};

export default FormationField;