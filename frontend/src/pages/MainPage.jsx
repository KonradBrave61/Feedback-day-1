import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navigation from '../components/Navigation';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { mockCharacters } from '../data/mock';
import CharacterCard from '../components/CharacterCard';
import CharacterModal from '../components/CharacterModal';
import { Play, Users, Trophy, Target, Star, TrendingUp, Clock, Award, LogIn } from 'lucide-react';
import { logoColors, componentColors } from '../styles/colors';

const MainPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [showCharacterModal, setShowCharacterModal] = useState(false);

  const featuredCharacters = mockCharacters.slice(0, 4);
  const recentActivity = [
    { type: 'team', message: 'Team updated with new formation', time: '2 minutes ago' },
    { type: 'character', message: 'New character unlocked: Axel Blaze', time: '1 hour ago' },
    { type: 'match', message: 'Victory against Royal Academy', time: '3 hours ago' },
    { type: 'level', message: 'Reached coach level 50', time: '1 day ago' },
  ];

  const handleCharacterClick = (character) => {
    setSelectedCharacter(character);
    setShowCharacterModal(true);
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'team': return <Users className="h-4 w-4" />;
      case 'character': return <Star className="h-4 w-4" />;
      case 'match': return <Trophy className="h-4 w-4" />;
      case 'level': return <TrendingUp className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'team': return { color: logoColors.primaryBlue };
      case 'character': return { color: logoColors.primaryYellow };
      case 'match': return { color: logoColors.secondaryBlue };
      case 'level': return { color: logoColors.primaryOrange };
      default: return { color: logoColors.lightGray };
    }
  };

  return (
    <div className="min-h-screen" style={{ background: logoColors.backgroundGradient }}>
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <h1 className="text-6xl font-bold text-white mb-4 bg-clip-text text-transparent" 
                style={{ background: logoColors.yellowOrangeGradient, WebkitBackgroundClip: 'text' }}>
              Inazuma Eleven
            </h1>
            <h2 className="text-3xl font-semibold mb-2" style={{ color: logoColors.lightBlue }}>
              Victory Road
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Build your ultimate team, master powerful techniques, and lead your squad to victory in the most intense football battles!
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <>
                <Button
                  size="lg"
                  className="text-black px-8 py-4 text-lg font-bold hover:opacity-80"
                  style={{ background: logoColors.yellowOrangeGradient }}
                  onClick={() => navigate('/team-builder')}
                >
                  <Play className="mr-2 h-5 w-5" />
                  Start Building Team
                </Button>
                <Button
                  size="lg"
                  className="text-white px-8 py-4 text-lg border hover:opacity-80"
                  style={{ 
                    backgroundColor: logoColors.primaryBlueAlpha(0.6),
                    borderColor: logoColors.primaryBlueAlpha(0.3)
                  }}
                  onClick={() => navigate('/characters')}
                >
                  <Users className="mr-2 h-5 w-5" />
                  View Characters
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="lg"
                  className="text-black px-8 py-4 text-lg font-bold hover:opacity-80"
                  style={{ background: logoColors.yellowOrangeGradient }}
                  onClick={() => navigate('/login')}
                >
                  <LogIn className="mr-2 h-5 w-5" />
                  Sign In to Start
                </Button>
                <Button
                  size="lg"
                  className="text-white px-8 py-4 text-lg border hover:opacity-80"
                  style={{ 
                    backgroundColor: logoColors.primaryBlueAlpha(0.6),
                    borderColor: logoColors.primaryBlueAlpha(0.3)
                  }}
                  onClick={() => navigate('/characters')}
                >
                  <Users className="mr-2 h-5 w-5" />
                  Browse Characters
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="backdrop-blur-lg text-white border" style={{ 
            backgroundColor: logoColors.blackAlpha(0.3),
            borderColor: logoColors.primaryBlueAlpha(0.2)
          }}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: logoColors.primaryBlueAlpha(0.2) }}>
                  <Users className="h-6 w-6" style={{ color: logoColors.primaryBlue }} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{mockCharacters.length}</div>
                  <div className="text-sm text-gray-300">Characters</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-lg text-white border" style={{ 
            backgroundColor: logoColors.blackAlpha(0.3),
            borderColor: logoColors.primaryBlueAlpha(0.2)
          }}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: logoColors.primaryBlueAlpha(0.2) }}>
                  <Target className="h-6 w-6" style={{ color: logoColors.secondaryBlue }} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">15</div>
                  <div className="text-sm text-gray-300">Tactics</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-lg text-white border" style={{ 
            backgroundColor: logoColors.blackAlpha(0.3),
            borderColor: logoColors.primaryBlueAlpha(0.2)
          }}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: logoColors.primaryBlueAlpha(0.2) }}>
                  <Trophy className="h-6 w-6" style={{ color: logoColors.primaryOrange }} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{user ? 8 : '?'}</div>
                  <div className="text-sm text-gray-300">Items</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-lg text-white border" style={{ 
            backgroundColor: logoColors.blackAlpha(0.3),
            borderColor: logoColors.primaryBlueAlpha(0.2)
          }}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: logoColors.primaryBlueAlpha(0.2) }}>
                  <Award className="h-6 w-6" style={{ color: logoColors.primaryYellow }} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{user ? user.coachLevel || 1 : '?'}</div>
                  <div className="text-sm text-gray-300">Techniques</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Featured Characters */}
          <div className="lg:col-span-2">
            <Card className="backdrop-blur-lg text-white border" style={{ 
              backgroundColor: logoColors.blackAlpha(0.3),
              borderColor: logoColors.primaryBlueAlpha(0.2)
            }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" style={{ color: logoColors.primaryYellow }} />
                  Featured Characters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {featuredCharacters.map((character) => (
                    <CharacterCard
                      key={character.id}
                      character={character}
                      onClick={() => handleCharacterClick(character)}
                      viewMode="grid"
                    />
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <Button
                    className="text-white border hover:opacity-80"
                    style={{ 
                      backgroundColor: logoColors.primaryBlueAlpha(0.6),
                      borderColor: logoColors.primaryBlueAlpha(0.3)
                    }}
                    onClick={() => navigate('/characters')}
                  >
                    View All Characters
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <Card className="backdrop-blur-lg text-white border" style={{ 
              backgroundColor: logoColors.blackAlpha(0.3),
              borderColor: logoColors.primaryBlueAlpha(0.2)
            }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" style={{ color: logoColors.primaryBlue }} />
                  {user ? 'Recent Activity' : 'Getting Started'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user ? (
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center" 
                             style={{ 
                               backgroundColor: logoColors.primaryBlueAlpha(0.2),
                               ...getActivityColor(activity.type) 
                             }}>
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-white">
                            {activity.message}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {activity.time}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center py-4">
                      <LogIn className="h-12 w-12 mx-auto mb-4" style={{ color: logoColors.primaryYellow }} />
                      <p className="text-white font-medium mb-2">Welcome to Inazuma Eleven!</p>
                      <p className="text-sm text-gray-300 mb-4">Sign in to save teams, track progress, and unlock features.</p>
                      <Button
                        className="text-black font-bold hover:opacity-80"
                        style={{ background: logoColors.yellowOrangeGradient }}
                        onClick={() => navigate('/login')}
                      >
                        <LogIn className="h-4 w-4 mr-2" />
                        Sign In Now
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="mt-6 backdrop-blur-lg text-white border" style={{ 
              backgroundColor: logoColors.blackAlpha(0.3),
              borderColor: logoColors.primaryBlueAlpha(0.2)
            }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" style={{ color: logoColors.primaryBlue }} />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    className="w-full text-white border justify-start hover:opacity-80"
                    style={{ 
                      backgroundColor: logoColors.primaryBlueAlpha(0.4),
                      borderColor: logoColors.primaryBlueAlpha(0.5)
                    }}
                    onClick={() => user ? navigate('/team-builder') : navigate('/login')}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Team Builder
                  </Button>
                  <Button
                    className="w-full text-white border justify-start hover:opacity-80"
                    style={{ 
                      backgroundColor: logoColors.primaryBlueAlpha(0.4),
                      borderColor: logoColors.primaryBlueAlpha(0.5)
                    }}
                    onClick={() => navigate('/characters')}
                  >
                    <Star className="mr-2 h-4 w-4" />
                    Characters
                  </Button>
                  {user && (
                    <Button
                      className="w-full bg-orange-600/40 hover:bg-orange-600/60 text-white border border-orange-500/50 justify-start"
                      onClick={() => navigate('/profile')}
                    >
                      <Award className="mr-2 h-4 w-4" />
                      Profile
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
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
        />
      )}
    </div>
  );
};

export default MainPage;