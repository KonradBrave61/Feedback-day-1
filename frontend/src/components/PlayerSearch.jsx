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
      <DialogContent className="max-w-5xl max-h-[90vh] bg-gradient-to-br from-orange-900 via-red-800 to-orange-900 text-white border-orange-400/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Select Player {position && `for ${position} position`}
          </DialogTitle>
        </DialogHeader>

        {/* Search and Filters */}
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-orange-400" />
              <Input
                placeholder="Search players..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-orange-900/30 border-orange-400/30 text-white placeholder-orange-300"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={filterPosition} onValueChange={setFilterPosition}>
                <SelectTrigger className="bg-orange-900/30 border-orange-400/30 text-white min-w-[120px]">
                  <SelectValue placeholder="Position" />
                </SelectTrigger>
                <SelectContent className="bg-orange-900 border-orange-400/30">
                  {positions.map(pos => (
                    <SelectItem key={pos} value={pos} className="text-white hover:bg-orange-800">
                      {pos === 'all' ? 'All Positions' : pos}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterElement} onValueChange={setFilterElement}>
                <SelectTrigger className="bg-orange-900/30 border-orange-400/30 text-white min-w-[120px]">
                  <SelectValue placeholder="Element" />
                </SelectTrigger>
                <SelectContent className="bg-orange-900 border-orange-400/30">
                  {elements.map(elem => (
                    <SelectItem key={elem} value={elem} className="text-white hover:bg-orange-800">
                      {elem === 'all' ? 'All Elements' : elem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={onClose} className="text-white border-orange-400/30 hover:bg-orange-700">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-4">
          <Badge variant="secondary" className="bg-orange-700 text-white">
            {filteredPlayers.length} players found
          </Badge>
        </div>

        {/* Player Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 max-h-[400px] overflow-y-auto pr-2">
          {filteredPlayers.map((player) => (
            <div key={player.id} className="flex-shrink-0">
              <CharacterCard
                character={player}
                onClick={() => handlePlayerSelect(player)}
                viewMode="grid"
              />
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredPlayers.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <p>No players found matching your criteria</p>
            <p className="text-sm">Try adjusting your search filters</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PlayerSearch;