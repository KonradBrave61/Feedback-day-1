import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navigation from '../components/Navigation';
import TeamCard from '../components/TeamCard';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  Search, 
  TrendingUp, 
  Clock, 
  Star, 
  Users, 
  Trophy, 
  Heart,
  MessageSquare,
  Eye,
  Filter,
  Globe,
  UserPlus,
  Award
} from 'lucide-react';
import { logoColors, componentColors } from '../styles/colors';

const CommunityHub = () => {
  const { user, loadCommunityTeams, loadCommunityStats } = useAuth();
  const [teams, setTeams] = useState([]);
  const [stats, setStats] = useState({
    totalTeams: 0,
    totalUsers: 0,
    totalLikes: 0,
    popularFormations: []
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [filterBy, setFilterBy] = useState('all');

  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'liked', label: 'Most Liked' },
    { value: 'viewed', label: 'Most Viewed' },
    { value: 'rated', label: 'Highest Rated' }
  ];

  const filterOptions = [
    { value: 'all', label: 'All Teams' },
    { value: 'public', label: 'Public Only' },
    { value: 'featured', label: 'Featured Teams' },
    { value: 'recent', label: 'Recent Teams' }
  ];

  useEffect(() => {
    fetchCommunityData();
  }, [sortBy, filterBy, searchQuery]);

  const fetchCommunityData = async () => {
    setLoading(true);
    try {
      const teamsResult = await loadCommunityTeams({
        search: searchQuery,
        sort_by: sortBy,
        filter_by: filterBy
      });
      
      if (teamsResult.success) {
        setTeams(teamsResult.teams);
      }

      const statsResult = await loadCommunityStats();
      if (statsResult.success) {
        setStats(statsResult.stats);
      }
    } catch (error) {
      console.error('Failed to load community data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: logoColors.backgroundGradient }}>
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4 bg-clip-text text-transparent" 
              style={{ background: logoColors.yellowOrangeGradient, WebkitBackgroundClip: 'text' }}>
            Community Hub
          </h1>
          <p className="text-xl text-gray-300">
            Discover amazing teams from coaches around the world
          </p>
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="backdrop-blur-lg text-white border text-center" style={{ 
            backgroundColor: logoColors.blackAlpha(0.3),
            borderColor: logoColors.primaryBlueAlpha(0.2)
          }}>
            <CardContent className="p-6">
              <Users className="h-8 w-8 mx-auto mb-2" style={{ color: logoColors.primaryBlue }} />
              <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
              <div className="text-sm text-gray-300">Active Coaches</div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-lg text-white border text-center" style={{ 
            backgroundColor: logoColors.blackAlpha(0.3),
            borderColor: logoColors.primaryBlueAlpha(0.2)
          }}>
            <CardContent className="p-6">
              <Trophy className="h-8 w-8 mx-auto mb-2" style={{ color: logoColors.primaryYellow }} />
              <div className="text-2xl font-bold text-white">{stats.totalTeams}</div>
              <div className="text-sm text-gray-300">Teams Shared</div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-lg text-white border text-center" style={{ 
            backgroundColor: logoColors.blackAlpha(0.3),
            borderColor: logoColors.primaryBlueAlpha(0.2)
          }}>
            <CardContent className="p-6">
              <Heart className="h-8 w-8 mx-auto mb-2" style={{ color: logoColors.primaryOrange }} />
              <div className="text-2xl font-bold text-white">{stats.totalLikes}</div>
              <div className="text-sm text-gray-300">Total Likes</div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-lg text-white border text-center" style={{ 
            backgroundColor: logoColors.blackAlpha(0.3),
            borderColor: logoColors.primaryBlueAlpha(0.2)
          }}>
            <CardContent className="p-6">
              <Star className="h-8 w-8 mx-auto mb-2" style={{ color: logoColors.secondaryBlue }} />
              <div className="text-2xl font-bold text-white">{stats.averageRating || '4.5'}</div>
              <div className="text-sm text-gray-300">Avg Rating</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" 
                        style={{ color: logoColors.primaryBlue }} />
                <Input
                  placeholder="Search teams..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 text-white border"
                  style={{ 
                    backgroundColor: logoColors.blackAlpha(0.5),
                    borderColor: logoColors.primaryBlueAlpha(0.3)
                  }}
                />
              </div>

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

              {/* Filter By */}
              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="text-white border" style={{ 
                  backgroundColor: logoColors.blackAlpha(0.5),
                  borderColor: logoColors.primaryBlueAlpha(0.3)
                }}>
                  <SelectValue placeholder="Filter by" />
                </SelectTrigger>
                <SelectContent style={{ 
                  backgroundColor: logoColors.blackAlpha(0.9),
                  borderColor: logoColors.primaryBlueAlpha(0.3)
                }}>
                  {filterOptions.map(option => (
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
                  setSortBy('recent');
                  setFilterBy('all');
                }}
                className="text-white border hover:opacity-80"
                style={{ 
                  backgroundColor: logoColors.primaryBlueAlpha(0.4),
                  borderColor: logoColors.primaryBlueAlpha(0.3)
                }}
              >
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Teams Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 rounded-full mx-auto mb-4 animate-spin border-4 border-t-transparent" 
                 style={{ borderColor: logoColors.primaryBlue, borderTopColor: 'transparent' }} />
            <p className="text-gray-300">Loading community teams...</p>
          </div>
        ) : teams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                showAuthor={true}
                showStats={true}
                onLike={() => {}}
                onComment={() => {}}
                onView={() => {}}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Globe className="h-16 w-16 mx-auto mb-4" style={{ color: logoColors.primaryBlue }} />
            <h3 className="text-xl font-bold text-white mb-2">No Teams Found</h3>
            <p className="text-gray-300 mb-4">Try adjusting your search criteria.</p>
            <Button
              onClick={() => {
                setSearchQuery('');
                setSortBy('recent');
                setFilterBy('all');
              }}
              className="text-black font-bold hover:opacity-80"
              style={{ background: logoColors.yellowOrangeGradient }}
            >
              Reset Filters
            </Button>
          </div>
        )}

        {/* Popular Formations */}
        {stats.popularFormations && stats.popularFormations.length > 0 && (
          <Card className="mt-8 backdrop-blur-lg text-white border" style={{ 
            backgroundColor: logoColors.blackAlpha(0.3),
            borderColor: logoColors.primaryBlueAlpha(0.2)
          }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" style={{ color: logoColors.primaryYellow }} />
                Popular Formations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.popularFormations.map((formation, index) => (
                  <div key={index} className="p-4 rounded-lg border" style={{ 
                    backgroundColor: logoColors.blackAlpha(0.3),
                    borderColor: logoColors.primaryBlueAlpha(0.3)
                  }}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" 
                           style={{ backgroundColor: logoColors.primaryBlueAlpha(0.2) }}>
                        <Trophy className="h-4 w-4" style={{ color: logoColors.primaryYellow }} />
                      </div>
                      <div>
                        <div className="font-bold text-white">{formation.name}</div>
                        <div className="text-sm text-gray-300">{formation.usage_count} teams</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Community Actions */}
        <Card className="mt-8 backdrop-blur-lg text-white border" style={{ 
          backgroundColor: logoColors.blackAlpha(0.3),
          borderColor: logoColors.primaryBlueAlpha(0.2)
        }}>
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-bold text-white mb-2">Join the Community!</h3>
            <p className="text-gray-300 mb-4">
              Share your amazing teams and connect with fellow coaches
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate('/team-builder')}
                className="text-black font-bold hover:opacity-80"
                style={{ background: logoColors.yellowOrangeGradient }}
              >
                <Users className="h-4 w-4 mr-2" />
                Create Team
              </Button>
              {!user && (
                <Button
                  onClick={() => navigate('/login')}
                  className="text-white border hover:opacity-80"
                  style={{ 
                    backgroundColor: logoColors.primaryBlueAlpha(0.4),
                    borderColor: logoColors.primaryBlueAlpha(0.3)
                  }}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Join Now
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CommunityHub;