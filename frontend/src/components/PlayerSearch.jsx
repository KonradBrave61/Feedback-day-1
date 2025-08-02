import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search, X, Users, Check, Plus, Target, Trophy } from 'lucide-react';
import { mockCharacters, mockFormations } from '../data/mock';
import CharacterCard from './CharacterCard';
import CharacterModal from './CharacterModal';

const PlayerSearch = ({ isOpen, onClose, onPlayerSelect, position, selectedPlayerIds = [], teamBuildingMode = false, currentFormation = null, onTeamBuilt }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPosition, setFilterPosition] = useState('all'); // Changed from position to 'all'
  const [filterElement, setFilterElement] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [filteredPlayers, setFilteredPlayers] = useState(mockCharacters);

  const positions = ['all', 'FW', 'MF', 'DF', 'GK'];
  const elements = ['all', 'Fire', 'Earth', 'Wind', 'Wood'];
  const sortOptions = [
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'name_desc', label: 'Name (Z-A)' },
    { value: 'position', label: 'Position' }
  ];

  useEffect(() => {
    applyFilters();
  }, [searchQuery, filterPosition, filterElement, sortBy]);

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

    // Sort the filtered results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        case 'position':
          return a.position.localeCompare(b.position);
        default:
          return 0;
      }
    });

    setFilteredPlayers(filtered);
  };

  const handlePlayerSelect = (player) => {
    // Open character modal instead of direct selection
    if (onPlayerSelect) {
      onPlayerSelect(player);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterPosition('all');
    setFilterElement('all');
    setSortBy('name');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] bg-gradient-to-br from-orange-900 via-red-800 to-orange-900 text-white border-orange-400/20">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-orange-400" />
              {position ? `Add Player for ${position}` : 'Browse Players'}
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          {position && (
            <div className="text-sm text-gray-400 mt-2">
              Searching for players suitable for the {position} position
            </div>
          )}
          {!position && (
            <div className="text-sm text-gray-400 mt-2">
              Browse all available players - click on a player to configure and add to your team
            </div>
          )}
        </DialogHeader>

        {/* Search and Filters */}
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-orange-400" />
              <Input
                placeholder="Search players by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-orange-900/30 border-orange-400/30 text-white placeholder-orange-300"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={filterPosition} onValueChange={setFilterPosition}>
                <SelectTrigger className="bg-orange-900/30 border-orange-400/30 text-white min-w-[100px]">
                  <SelectValue placeholder="Position" />
                </SelectTrigger>
                <SelectContent className="bg-orange-900 border-orange-400/30">
                  {positions.map(pos => (
                    <SelectItem key={pos} value={pos} className="text-white hover:bg-orange-800">
                      {pos === 'all' ? 'All' : pos}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterElement} onValueChange={setFilterElement}>
                <SelectTrigger className="bg-orange-900/30 border-orange-400/30 text-white min-w-[100px]">
                  <SelectValue placeholder="Element" />
                </SelectTrigger>
                <SelectContent className="bg-orange-900 border-orange-400/30">
                  {elements.map(elem => (
                    <SelectItem key={elem} value={elem} className="text-white hover:bg-orange-800">
                      {elem === 'all' ? 'All' : elem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-orange-900/30 border-orange-400/30 text-white min-w-[140px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-orange-900 border-orange-400/30">
                  {sortOptions.map(option => (
                    <SelectItem key={option.value} value={option.value} className="text-white hover:bg-orange-800">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button 
                onClick={clearFilters} 
                className="bg-orange-600/40 hover:bg-orange-600/60 text-white border border-orange-500/50 px-4"
                title="Clear Filters"
              >
                Clear
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3 max-h-[400px] overflow-y-auto pr-2">
          {filteredPlayers.map((player) => {
            const isAlreadySelected = selectedPlayerIds.includes(player.id);
            return (
              <div key={player.id} className="flex-shrink-0">
                <div className={`${isAlreadySelected ? 'opacity-40 cursor-not-allowed' : ''}`}>
                  <CharacterCard
                    character={player}
                    onClick={() => !isAlreadySelected && handlePlayerSelect(player)}
                    viewMode="grid"
                  />
                  {isAlreadySelected && (
                    <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center rounded-lg">
                      <span className="text-red-400 font-bold text-xs bg-red-900/70 px-2 py-1 rounded">
                        SELECTED
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
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