import React, { useState } from 'react';
import { mockCharacters } from '../data/mock';
import CharacterCard from '../components/CharacterCard';
import CharacterModal from '../components/CharacterModal';
import Navigation from '../components/Navigation';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Search, Grid, List } from 'lucide-react';

const MainPage = () => {
  const [characters] = useState(mockCharacters);
  const [filteredCharacters, setFilteredCharacters] = useState(characters);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPosition, setFilterPosition] = useState('all');
  const [filterElement, setFilterElement] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');

  const positions = ['all', 'FW', 'MF', 'DF', 'GK'];
  const elements = ['all', 'Fire', 'Earth', 'Wind', 'Wood', 'Void'];

  const handleSearch = (query) => {
    setSearchQuery(query);
    applyFilters(query, filterPosition, filterElement, sortBy);
  };

  const handlePositionFilter = (position) => {
    setFilterPosition(position);
    applyFilters(searchQuery, position, filterElement, sortBy);
  };

  const handleElementFilter = (element) => {
    setFilterElement(element);
    applyFilters(searchQuery, filterPosition, element, sortBy);
  };

  const handleSort = (sortType) => {
    setSortBy(sortType);
    applyFilters(searchQuery, filterPosition, filterElement, sortType);
  };

  const applyFilters = (query, position, element, sort) => {
    let filtered = [...characters];

    if (query) {
      filtered = filtered.filter(char => 
        char.name.toLowerCase().includes(query.toLowerCase()) ||
        char.nickname.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (position !== 'all') {
      filtered = filtered.filter(char => char.position === position);
    }

    if (element !== 'all') {
      filtered = filtered.filter(char => char.element === element);
    }

    // Sort
    switch (sort) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'position':
        filtered.sort((a, b) => a.position.localeCompare(b.position));
        break;
      case 'element':
        filtered.sort((a, b) => a.element.localeCompare(b.element));
        break;
      default:
        break;
    }

    setFilteredCharacters(filtered);
  };

  const openCharacterModal = (character) => {
    setSelectedCharacter(character);
  };

  const closeCharacterModal = () => {
    setSelectedCharacter(null);
  };

  const getPositionColor = (position) => {
    switch (position) {
      case 'FW': return 'bg-red-500';
      case 'MF': return 'bg-orange-500';
      case 'DF': return 'bg-sky-400';
      case 'GK': return 'bg-white text-black';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Inazuma Eleven Victory Road
          </h1>
          <p className="text-xl text-gray-300">
            Character Gallery & Team Management
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-black/20 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search characters..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400"
              />
            </div>
            
            <Select value={filterPosition} onValueChange={handlePositionFilter}>
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

            <Select value={filterElement} onValueChange={handleElementFilter}>
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

            <Select value={sortBy} onValueChange={handleSort}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="position">Position</SelectItem>
                <SelectItem value="element">Element</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="flex-1"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="flex-1"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-white">
              {filteredCharacters.length} characters
            </Badge>
            {searchQuery && (
              <Badge variant="outline" className="text-blue-400 border-blue-400">
                Search: {searchQuery}
              </Badge>
            )}
            {filterPosition !== 'all' && (
              <Badge variant="outline" className={`${getPositionColor(filterPosition)} border-none`}>
                {filterPosition}
              </Badge>
            )}
            {filterElement !== 'all' && (
              <Badge variant="outline" className="text-green-400 border-green-400">
                {filterElement}
              </Badge>
            )}
          </div>
        </div>

        {/* Character Grid */}
        <div className={`grid ${viewMode === 'grid' 
          ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8' 
          : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
        } gap-4`}>
          {filteredCharacters.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              onClick={() => openCharacterModal(character)}
              viewMode={viewMode}
            />
          ))}
        </div>

        {/* Character Modal */}
        {selectedCharacter && (
          <CharacterModal
            character={selectedCharacter}
            isOpen={!!selectedCharacter}
            onClose={closeCharacterModal}
            allCharacters={characters}
          />
        )}
      </div>
    </div>
  );
};

export default MainPage;