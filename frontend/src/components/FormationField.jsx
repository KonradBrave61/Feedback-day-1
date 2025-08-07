import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Plus, X, Settings } from 'lucide-react';
import { logoColors } from '../styles/colors';

const FormationField = ({ formation, players, benchPlayers, onAddPlayer, onRemovePlayer, onMovePlayer, onEditPlayer, onAddBenchPlayer, onRemoveBenchPlayer, onMoveToBench, onMoveFromBench }) => {
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
      case 'Legendary': return `bg-gradient-to-r from-yellow-400 to-orange-500`;
      case 'Epic': return `bg-gradient-to-r from-purple-500 to-pink-500`;
      case 'Rare': return `bg-gradient-to-r from-blue-500 to-[${logoColors.secondaryBlue}]`;
      case 'Common': return 'bg-gradient-to-r from-gray-400 to-gray-600';
      default: return 'bg-gray-500';
    }
  };

  const PlayerSlot = ({ position, player }) => {
    const isOccupied = !!player;

    const [{ isDragging }, drag] = useDrag({
      type: 'PLAYER',
      item: { player, fromPosition: position.id, fromType: 'formation' },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      canDrag: isOccupied,
    });

    const [{ isOver }, drop] = useDrop({
      accept: 'PLAYER',
      drop: (draggedItem) => {
        if (draggedItem.fromPosition !== position.id) {
          if (draggedItem.fromType === 'bench') {
            // Moving from bench to formation
            onMoveFromBench(draggedItem.fromPosition, position.id);
          } else {
            // Moving within formation
            onMovePlayer(draggedItem.fromPosition, position.id);
          }
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    });

    return (
      <div 
        ref={drop}
        className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group ${
          isOver ? 'z-10' : ''
        }`}
        style={{ left: `${position.x}%`, top: `${position.y}%` }}
      >
        {isOccupied ? (
          <div 
            ref={drag}
            className={`relative ${isDragging ? 'opacity-50' : ''}`}
          >
            <Card className={`w-16 h-20 bg-black/30 backdrop-blur-md border-orange-400/30 hover:border-orange-400/60 transition-all ${
              isOver ? 'ring-2 ring-orange-400' : ''
            }`}>
              <CardContent className="p-1">
                <div className="relative">
                  <div 
                    className={`w-12 h-12 rounded-lg overflow-hidden ${getRarityColor(player.baseRarity)} cursor-pointer`}
                    onClick={() => onEditPlayer && onEditPlayer(player)}
                  >
                    <img 
                      src={player.portrait} 
                      alt={player.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Badge className={`${getPositionColor(player.position)} absolute -bottom-1 -right-1 text-xs px-1`}>
                    {player.position}
                  </Badge>
                </div>
                <div className="text-xs text-white text-center mt-1 truncate">
                  {player.nickname}
                </div>
                <div className="text-xs text-gray-300 text-center">
                  Lv.{player.baseLevel}
                </div>
              </CardContent>
            </Card>
            
            {/* Edit Player Button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute -top-1 -left-1 w-6 h-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              style={{ 
                backgroundColor: logoColors.primaryBlueAlpha(0.8), 
                color: logoColors.white 
              }}
              onClick={(e) => {
                e.stopPropagation();
                onEditPlayer && onEditPlayer(player);
              }}
            >
              <Settings className="h-3 w-3" />
            </Button>
            
            {/* Remove Player Button */}
            <Button
              variant="destructive"
              size="sm"
              className="absolute -top-1 -right-1 w-6 h-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              onClick={(e) => {
                e.stopPropagation();
                onRemovePlayer(position.id);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div 
            className={`w-16 h-20 bg-black/30 backdrop-blur-md border-2 border-dashed border-orange-400/50 hover:border-orange-400 rounded-lg flex flex-col items-center justify-center transition-all hover:scale-110 cursor-pointer group ${
              isOver ? 'border-orange-400 bg-orange-400/20' : ''
            }`}
            onClick={() => onAddPlayer(position.id)}
          >
            <Plus className="h-8 w-8 text-orange-400 mb-1 group-hover:text-white transition-colors" />
            <Badge className={`${getPositionColor(position.position)} text-xs group-hover:scale-105 transition-transform`}>
              {position.position}
            </Badge>
            <div className="text-xs text-orange-300 text-center mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
              Add Player
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative w-full h-[600px] bg-gradient-to-b from-green-600 to-green-800 rounded-lg overflow-hidden">
      {/* Field Background */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJhIiB4MT0iMCIgeTE9IjAiIHgyPSIwIiB5Mj0iMTAwIj48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiMxNmE0NGIiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMxNTgwM2QiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0idXJsKCNhKSIvPjxsaW5lIHgxPSI1MCIgeTE9IjAiIHgyPSI1MCIgeTI9IjEwMCIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMykiIHN0cm9rZS13aWR0aD0iMSIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjE1IiBzdHJva2U9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4zKSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIi8+PC9zdmc+')] opacity-30"></div>
      
      {/* Field Lines */}
      <div className="absolute inset-0">
        {/* Outer boundary */}
        <div className="absolute inset-2 border-2 border-white/40 rounded-sm"></div>
        
        {/* Center Line - Horizontal */}
        <div className="absolute left-0 top-1/2 w-full h-0.5 bg-white/40 transform -translate-y-1/2"></div>
        
        {/* Center Circle */}
        <div className="absolute top-1/2 left-1/2 w-32 h-32 border-2 border-white/40 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
        
        {/* Center spot */}
        <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white/60 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
        
        {/* Top Goal Area (6-yard box) */}
        <div className="absolute top-2 left-1/2 w-20 h-8 border-2 border-white/40 border-t-0 transform -translate-x-1/2"></div>
        
        {/* Top Penalty Area (18-yard box) */}
        <div className="absolute top-2 left-1/2 w-44 h-20 border-2 border-white/40 border-t-0 transform -translate-x-1/2"></div>
        
        {/* Top penalty spot */}
        <div className="absolute top-16 left-1/2 w-1.5 h-1.5 bg-white/60 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
        
        {/* Top penalty arc */}
        <div className="absolute top-8 left-1/2 w-20 h-20 border-2 border-white/40 border-t-0 border-l-0 border-r-0 rounded-b-full transform -translate-x-1/2"></div>
        
        {/* Bottom Goal Area (6-yard box) */}
        <div className="absolute bottom-2 left-1/2 w-20 h-8 border-2 border-white/40 border-b-0 transform -translate-x-1/2"></div>
        
        {/* Bottom Penalty Area (18-yard box) */}
        <div className="absolute bottom-2 left-1/2 w-44 h-20 border-2 border-white/40 border-b-0 transform -translate-x-1/2"></div>
        
        {/* Bottom penalty spot */}
        <div className="absolute bottom-16 left-1/2 w-1.5 h-1.5 bg-white/60 rounded-full transform -translate-x-1/2 translate-y-1/2"></div>
        
        {/* Bottom penalty arc */}
        <div className="absolute bottom-8 left-1/2 w-20 h-20 border-2 border-white/40 border-b-0 border-l-0 border-r-0 rounded-t-full transform -translate-x-1/2"></div>
        
        {/* Corner arcs */}
        <div className="absolute top-2 left-2 w-4 h-4 border-2 border-white/40 border-t-0 border-l-0 rounded-br-full"></div>
        <div className="absolute top-2 right-2 w-4 h-4 border-2 border-white/40 border-t-0 border-r-0 rounded-bl-full"></div>
        <div className="absolute bottom-2 left-2 w-4 h-4 border-2 border-white/40 border-b-0 border-l-0 rounded-tr-full"></div>
        <div className="absolute bottom-2 right-2 w-4 h-4 border-2 border-white/40 border-b-0 border-r-0 rounded-tl-full"></div>
        
        {/* Goals */}
        <div className="absolute top-0 left-1/2 w-12 h-2 bg-white/60 transform -translate-x-1/2"></div>
        <div className="absolute bottom-0 left-1/2 w-12 h-2 bg-white/60 transform -translate-x-1/2"></div>
      </div>

      {/* Player Positions */}
      {formation.positions.map((position) => (
        <PlayerSlot
          key={position.id}
          position={position}
          player={players[position.id]}
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

// BenchSlot component for drag & drop with formation
const BenchSlot = ({ slotIndex, player, onAddBenchPlayer, onRemoveBenchPlayer, onMoveToBench, onMoveFromBench, onEditPlayer }) => {
  const isOccupied = !!player;

  const [{ isDragging }, drag] = useDrag({
    type: 'PLAYER',
    item: { player, fromPosition: slotIndex, fromType: 'bench' },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: isOccupied,
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'PLAYER',
    drop: (draggedItem) => {
      if (draggedItem.fromPosition !== slotIndex) {
        if (draggedItem.fromType === 'formation') {
          // Moving from formation to bench
          onMoveToBench(draggedItem.fromPosition, slotIndex);
        } else {
          // Moving within bench (swap)
          if (player) {
            // Swap bench players
            onMoveFromBench(slotIndex, draggedItem.fromPosition, true); // true for swap
          } else {
            // Moving to empty bench slot
            onMoveFromBench(draggedItem.fromPosition, slotIndex);
          }
        }
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const attachDragDrop = (el) => {
    drag(drop(el));
  };

  return (
    <div key={slotIndex} className="w-16 h-[calc(20%-0.5rem)]">
      {isOccupied ? (
        <div 
          ref={attachDragDrop}
          className={`relative group h-full w-full ${isDragging ? 'opacity-50' : ''}`}
        >
          <div className={`w-full h-full bg-orange-800/30 rounded-lg border border-orange-400/30 p-1 flex flex-col items-center justify-center cursor-pointer hover:bg-orange-700/30 transition-colors ${
            isOver ? 'border-orange-400 bg-orange-400/20' : ''
          }`}
          onClick={() => onEditPlayer && onEditPlayer(player)}
          >
            <img
              src={player.portrait}
              alt={player.name}
              className="w-8 h-8 rounded-full mb-1"
            />
            <div className="text-xs text-center font-medium truncate w-full leading-tight">{player.name}</div>
            <div className="text-xs text-gray-400 text-center">{player.position}</div>
          </div>
          <button
            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
            onClick={(e) => {
              e.stopPropagation();
              onRemoveBenchPlayer(slotIndex);
            }}
          >
            <X className="h-2 w-2" />
          </button>
        </div>
      ) : (
        <div
          ref={drop}
          className={`w-full h-full bg-orange-800/20 rounded-lg border-2 border-dashed border-orange-400/30 flex items-center justify-center cursor-pointer hover:bg-orange-700/20 transition-colors ${
            isOver ? 'border-orange-400 bg-orange-400/20' : ''
          }`}
          onClick={() => onAddBenchPlayer(slotIndex)}
        >
          <Plus className="h-4 w-4 text-orange-400" />
        </div>
      )}
    </div>
  );
};

export default FormationField;
export { BenchSlot };