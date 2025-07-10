import React, { useState } from 'react';
import { mockCharacters } from '../data/mock';
import Navigation from '../components/Navigation';
import CharacterCard from '../components/CharacterCard';
import CharacterModal from '../components/CharacterModal';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Search, Filter, Users, Star } from 'lucide-react';

const CharactersPage = () => {
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [showCharacterModal, setShowCharacterModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPosition, setFilterPosition] = useState('all');
  const [filterElement, setFilterElement] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const positions = ['all', 'FW', 'MF', 'DF', 'GK'];
  const elements = ['all', 'Fire', 'Earth', 'Wind', 'Wood', 'Void'];
  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'position', label: 'Position' },
    { value: 'element', label: 'Element' }
  ];

  const filteredCharacters = mockCharacters
    .filter(character => {
      const matchesSearch = character.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           character.nickname.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPosition = filterPosition === 'all' || character.position === filterPosition;
      const matchesElement = filterElement === 'all' || character.element === filterElement;
      
      return matchesSearch && matchesPosition && matchesElement;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'position':
          return a.position.localeCompare(b.position);
        case 'element':
          return a.element.localeCompare(b.element);
        default:
          return 0;
      }
    });

  const handleCharacterClick = (character) => {
    setSelectedCharacter(character);
    setShowCharacterModal(true);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterPosition('all');
    setFilterElement('all');
    setSortBy('name');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-800 to-orange-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
            Characters Collection
          </h1>
          <p className="text-xl text-gray-300">
            Discover and manage your Inazuma Eleven characters
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8 bg-black/30 backdrop-blur-lg border-orange-400/20 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-orange-400" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* Search */}
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-3 h-4 w-4 text-orange-400" />
                <Input
                  placeholder="Search characters..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-orange-900/30 border-orange-400/30 text-white placeholder-orange-300"
                />
              </div>

              {/* Position Filter */}
              <Select value={filterPosition} onValueChange={setFilterPosition}>
                <SelectTrigger className="bg-orange-900/30 border-orange-400/30 text-white">
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

              {/* Element Filter */}
              <Select value={filterElement} onValueChange={setFilterElement}>
                <SelectTrigger className="bg-orange-900/30 border-orange-400/30 text-white">
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

              {/* Rarity Filter */}
              <Select value={filterRarity} onValueChange={setFilterRarity}>
                <SelectTrigger className="bg-orange-900/30 border-orange-400/30 text-white">
                  <SelectValue placeholder="Rarity" />
                </SelectTrigger>
                <SelectContent className="bg-orange-900 border-orange-400/30">
                  {rarities.map(rarity => (
                    <SelectItem key={rarity} value={rarity} className="text-white hover:bg-orange-800">
                      {rarity === 'all' ? 'All Rarities' : rarity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-orange-900/30 border-orange-400/30 text-white">
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
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="bg-orange-700 text-white">
                  {filteredCharacters.length} characters found
                </Badge>
                {(searchQuery || filterPosition !== 'all' || filterElement !== 'all' || filterRarity !== 'all') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="text-white border-orange-400/30 hover:bg-orange-700"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Characters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
          {filteredCharacters.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              onClick={() => handleCharacterClick(character)}
              viewMode="grid"
            />
          ))}
        </div>

        {/* No Results */}
        {filteredCharacters.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Characters Found</h3>
            <p className="text-gray-300 mb-4">
              No characters match your current search criteria.
            </p>
            <Button
              variant="outline"
              onClick={clearFilters}
              className="text-white border-orange-400/30 hover:bg-orange-700"
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </div>

      {/* Character Modal */}
      {selectedCharacter && (
        <CharacterModal
          character={selectedCharacter}
          isOpen={showCharacterModal}
          onClose={() => setShowCharacterModal(false)}
          allCharacters={mockCharacters}
        />
      )}
    </div>
  );
};

export default CharactersPage;