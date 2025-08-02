import React, { useState } from 'react';
import { mockCharacters } from '../data/mock';
import Navigation from '../components/Navigation';
import CharacterCard from '../components/CharacterCard';
import CharacterModal from '../components/CharacterModal';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Search, Filter, Users, Star } from 'lucide-react';
import { logoColors, componentColors } from '../styles/colors';

const CharactersPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPosition, setFilterPosition] = useState('all');
  const [filterElement, setFilterElement] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [showCharacterModal, setShowCharacterModal] = useState(false);
  const [filteredCharacters, setFilteredCharacters] = useState(mockCharacters);

  const positions = ['all', 'FW', 'MF', 'DF', 'GK'];
  const elements = ['all', 'Fire', 'Earth', 'Wind', 'Wood', 'Void'];
  const sortOptions = [
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'name_desc', label: 'Name (Z-A)' },
    { value: 'position', label: 'Position' },
    { value: 'element', label: 'Element' },
    { value: 'level', label: 'Level' }
  ];

  React.useEffect(() => {
    applyFilters();
  }, [searchQuery, filterPosition, filterElement, sortBy]);

  const applyFilters = () => {
    let filtered = [...mockCharacters];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(character => 
        character.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        character.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        character.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        character.element.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Position filter
    if (filterPosition !== 'all') {
      filtered = filtered.filter(character => character.position === filterPosition);
    }

    // Element filter
    if (filterElement !== 'all') {
      filtered = filtered.filter(character => character.element === filterElement);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        case 'position':
          return a.position.localeCompare(b.position);
        case 'element':
          return a.element.localeCompare(b.element);
        case 'level':
          return b.baseLevel - a.baseLevel;
        default:
          return 0;
      }
    });

    setFilteredCharacters(filtered);
  };

  const handleCharacterClick = (character) => {
    setSelectedCharacter(character);
    setShowCharacterModal(true);
  };

  return (
    <div className="min-h-screen" style={{ background: logoColors.backgroundGradient }}>
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4 bg-clip-text text-transparent" 
              style={{ background: logoColors.yellowOrangeGradient, WebkitBackgroundClip: 'text' }}>
            Characters
          </h1>
          <p className="text-xl text-gray-300">
            Discover the ultimate Inazuma Eleven players
          </p>
        </div>

        {/* Filters Section */}
        <Card className="mb-8 backdrop-blur-lg text-white border" style={{ 
          backgroundColor: logoColors.blackAlpha(0.3),
          borderColor: logoColors.primaryBlueAlpha(0.2)
        }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" style={{ color: logoColors.primaryBlue }} />
              Search & Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" 
                        style={{ color: logoColors.primaryBlue }} />
                <Input
                  placeholder="Search characters..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 text-white border"
                  style={{ 
                    backgroundColor: logoColors.blackAlpha(0.5),
                    borderColor: logoColors.primaryBlueAlpha(0.3)
                  }}
                />
              </div>

              {/* Position Filter */}
              <Select value={filterPosition} onValueChange={setFilterPosition}>
                <SelectTrigger className="text-white border" style={{ 
                  backgroundColor: logoColors.blackAlpha(0.5),
                  borderColor: logoColors.primaryBlueAlpha(0.3)
                }}>
                  <SelectValue placeholder="Position" />
                </SelectTrigger>
                <SelectContent style={{ 
                  backgroundColor: logoColors.blackAlpha(0.9),
                  borderColor: logoColors.primaryBlueAlpha(0.3)
                }}>
                  {positions.map(position => (
                    <SelectItem 
                      key={position} 
                      value={position}
                      className="text-white hover:opacity-80"
                      style={{ backgroundColor: logoColors.primaryBlueAlpha(0.1) }}
                    >
                      {position === 'all' ? 'All Positions' : position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Element Filter */}
              <Select value={filterElement} onValueChange={setFilterElement}>
                <SelectTrigger className="text-white border" style={{ 
                  backgroundColor: logoColors.blackAlpha(0.5),
                  borderColor: logoColors.primaryBlueAlpha(0.3)
                }}>
                  <SelectValue placeholder="Element" />
                </SelectTrigger>
                <SelectContent style={{ 
                  backgroundColor: logoColors.blackAlpha(0.9),
                  borderColor: logoColors.primaryBlueAlpha(0.3)
                }}>
                  {elements.map(element => (
                    <SelectItem 
                      key={element} 
                      value={element}
                      className="text-white hover:opacity-80"
                      style={{ backgroundColor: logoColors.primaryBlueAlpha(0.1) }}
                    >
                      {element === 'all' ? 'All Elements' : element}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort By */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="text-white border" style={{ 
                  backgroundColor: logoColors.blackAlpha(0.5),
                  borderColor: logoColors.primaryBlueAlpha(0.3)
                }}>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent style={{ 
                  backgroundColor: logoColors.blackAlpha(0.9),
                  borderColor: logoColors.primaryBlueAlpha(0.3)
                }}>
                  {sortOptions.map(option => (
                    <SelectItem 
                      key={option.value} 
                      value={option.value}
                      className="text-white hover:opacity-80"
                      style={{ backgroundColor: logoColors.primaryBlueAlpha(0.1) }}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              <Button
                onClick={() => {
                  setSearchQuery('');
                  setFilterPosition('all');
                  setFilterElement('all');
                  setSortBy('name');
                }}
                className="text-white border hover:opacity-80"
                style={{ 
                  backgroundColor: logoColors.primaryBlueAlpha(0.4),
                  borderColor: logoColors.primaryBlueAlpha(0.3)
                }}
              >
                Clear Filters
              </Button>
            </div>

            <div className="mt-4 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" style={{ color: logoColors.primaryYellow }} />
                <span className="text-gray-300">
                  Showing {filteredCharacters.length} of {mockCharacters.length} characters
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Characters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredCharacters.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              onClick={() => handleCharacterClick(character)}
              viewMode="grid"
              showStats={true}
            />
          ))}
        </div>

        {/* No Results */}
        {filteredCharacters.length === 0 && (
          <div className="text-center py-16">
            <Star className="h-16 w-16 mx-auto mb-4" style={{ color: logoColors.primaryYellow }} />
            <h3 className="text-xl font-bold text-white mb-2">No Characters Found</h3>
            <p className="text-gray-300 mb-4">Try adjusting your search criteria or filters.</p>
            <Button
              onClick={() => {
                setSearchQuery('');
                setFilterPosition('all');
                setFilterElement('all');
                setSortBy('name');
              }}
              className="text-black font-bold hover:opacity-80"
              style={{ background: logoColors.yellowOrangeGradient }}
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>

      {/* Character Modal */}
      {selectedCharacter && (
        <CharacterModal
          character={selectedCharacter}
          isOpen={showCharacterModal}
          onClose={() => {
            setShowCharacterModal(false);
            setSelectedCharacter(null);
          }}
          allCharacters={mockCharacters}
          teamBuildingMode={false}
        />
      )}
    </div>
  );
};

export default CharactersPage;