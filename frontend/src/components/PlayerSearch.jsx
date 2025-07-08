import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search, X } from 'lucide-react';
import { mockCharacters } from '../data/mock';
import CharacterCard from './CharacterCard';

const PlayerSearch = ({ isOpen, onClose, onPlayerSelect, position }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPosition, setFilterPosition] = useState(position || 'all');
  const [filterElement, setFilterElement] = useState('all');
  const [filteredPlayers, setFilteredPlayers] = useState(mockCharacters);

  const positions = ['all', 'FW', 'MF', 'DF', 'GK'];
  const elements = ['all', 'Fire', 'Earth', 'Wind', 'Wood', 'Void'];

  useEffect(() => {
    applyFilters();
  }, [searchQuery, filterPosition, filterElement]);

  const applyFilters = () => {
    let filtered = [...mockCharacters];

    if (searchQuery) {
      filtered = filtered.filter(player => 
        player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.nickname.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterPosition !== 'all') {
      filtered = filtered.filter(player => player.position === filterPosition);
    }

    if (filterElement !== 'all') {
      filtered = filtered.filter(player => player.element === filterElement);
    }

    setFilteredPlayers(filtered);
  };

  const handlePlayerSelect = (player) => {
    onPlayerSelect(player);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white border-white/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Select Player {position && `for ${position} position`}
          </DialogTitle>
        </DialogHeader>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400"
            />
          </div>
          
          <Select value={filterPosition} onValueChange={setFilterPosition}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Position" />
            </SelectTrigger>
            <SelectContent>
              {positions.map(pos => (
                <SelectItem key={pos} value={pos}>
                  {pos === 'all' ? 'All Positions' : pos}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterElement} onValueChange={setFilterElement}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Element" />
            </SelectTrigger>
            <SelectContent>
              {elements.map(elem => (
                <SelectItem key={elem} value={elem}>
                  {elem === 'all' ? 'All Elements' : elem}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={onClose} className="text-white border-white/20">
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>

        {/* Results Info */}
        <div className="mb-4">
          <Badge variant="secondary" className="text-white">
            {filteredPlayers.length} players found
          </Badge>
        </div>

        {/* Player Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-96 overflow-y-auto">
          {filteredPlayers.map((player) => (
            <CharacterCard
              key={player.id}
              character={player}
              onClick={() => handlePlayerSelect(player)}
              viewMode="grid"
            />
          ))}
        </div>

        {/* No Results */}
        {filteredPlayers.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <p>No players found matching your criteria</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PlayerSearch;