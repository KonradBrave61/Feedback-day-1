import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Users, 
  Trophy, 
  Calendar, 
  Heart, 
  MessageCircle, 
  UserPlus,
  Search,
  Filter,
  TrendingUp,
  Star,
  Target,
  Eye,
  Crown
} from 'lucide-react';

const CommunityHub = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFormation, setFilterFormation] = useState('all');
  const [filterRating, setFilterRating] = useState('all');
  const [communityTeams, setCommunityTeams] = useState([]);
  const [featuredTeams, setFeaturedTeams] = useState([]);
  const [popularFormations, setPopularFormations] = useState([]);

  // Mock data
  useEffect(() => {
    const mockCommunityTeams = [
      {
        id: 1,
        name: "Lightning Strike",
        formation: "4-4-2 Diamond",
        author: "ProPlayer99",
        authorAvatar: "/api/placeholder/40/40",
        likes: 245,
        comments: 38,
        views: 1250,
        rating: 4.8,
        createdDate: "2024-07-10",
        description: "Aggressive attacking formation with strong midfield control",
        tags: ["Attacking", "Midfield", "Fast-paced"],
        isFollowing: false
      },
      {
        id: 2,
        name: "Defensive Wall",
        formation: "4-3-3",
        author: "TacticalMaster",
        authorAvatar: "/api/placeholder/40/40",
        likes: 189,
        comments: 24,
        views: 890,
        rating: 4.6,
        createdDate: "2024-07-08",
        description: "Solid defensive setup with quick counter-attacks",
        tags: ["Defensive", "Counter-attack", "Solid"],
        isFollowing: true
      },
      {
        id: 3,
        name: "Chaos Control",
        formation: "3-5-2",
        author: "StrategyGenius",
        authorAvatar: "/api/placeholder/40/40",
        likes: 412,
        comments: 67,
        views: 2100,
        rating: 4.9,
        createdDate: "2024-07-05",
        description: "Unpredictable tactical approach with versatile players",
        tags: ["Versatile", "Unpredictable", "Advanced"],
        isFollowing: false
      }
    ];

    const mockFeaturedTeams = [
      {
        id: 4,
        name: "Weekly Champion",
        formation: "4-4-2 Diamond",
        author: "ChampionBuilder",
        likes: 567,
        rating: 4.9,
        badge: "Team of the Week"
      },
      {
        id: 5,
        name: "Rising Star",
        formation: "4-3-3",
        author: "NewTactician",
        likes: 234,
        rating: 4.7,
        badge: "Rising Star"
      }
    ];

    const mockPopularFormations = [
      { formation: "4-4-2 Diamond", count: 234, percentage: 35 },
      { formation: "4-3-3", count: 189, percentage: 28 },
      { formation: "3-5-2", count: 145, percentage: 22 },
      { formation: "4-2-3-1", count: 98, percentage: 15 }
    ];

    setCommunityTeams(mockCommunityTeams);
    setFeaturedTeams(mockFeaturedTeams);
    setPopularFormations(mockPopularFormations);
  }, []);

  const handleLikeTeam = (teamId) => {
    setCommunityTeams(prev => prev.map(team => 
      team.id === teamId 
        ? { ...team, likes: team.likes + 1 }
        : team
    ));
  };

  const handleFollowUser = (teamId) => {
    setCommunityTeams(prev => prev.map(team => 
      team.id === teamId 
        ? { ...team, isFollowing: !team.isFollowing }
        : team
    ));
  };

  const filteredTeams = communityTeams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFormation = filterFormation === 'all' || team.formation === filterFormation;
    const matchesRating = filterRating === 'all' || 
                         (filterRating === 'high' && team.rating >= 4.5) ||
                         (filterRating === 'medium' && team.rating >= 4.0 && team.rating < 4.5) ||
                         (filterRating === 'low' && team.rating < 4.0);
    
    return matchesSearch && matchesFormation && matchesRating;
  });

  const getFormationColor = (formation) => {
    switch (formation) {
      case '4-4-2 Diamond': return 'bg-orange-500';
      case '4-3-3': return 'bg-blue-500';
      case '3-5-2': return 'bg-green-500';
      case '4-2-3-1': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-800 to-orange-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
            Community Hub
          </h1>
          <p className="text-xl text-gray-300">
            Discover, share, and discuss the best team strategies
          </p>
        </div>

        <Tabs defaultValue="browse" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-black/30 border-orange-400/20">
            <TabsTrigger value="browse" className="text-white data-[state=active]:bg-orange-600">
              Browse Teams
            </TabsTrigger>
            <TabsTrigger value="featured" className="text-white data-[state=active]:bg-orange-600">
              Featured
            </TabsTrigger>
            <TabsTrigger value="stats" className="text-white data-[state=active]:bg-orange-600">
              Statistics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            {/* Search and Filter */}
            <Card className="bg-black/30 backdrop-blur-lg border-orange-400/20 text-white">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search teams or authors..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-orange-900/30 border-orange-400/30 text-white"
                    />
                  </div>
                  
                  <Select value={filterFormation} onValueChange={setFilterFormation}>
                    <SelectTrigger className="bg-orange-900/30 border-orange-400/30 text-white">
                      <SelectValue placeholder="Filter by formation" />
                    </SelectTrigger>
                    <SelectContent className="bg-orange-900 border-orange-400/30">
                      <SelectItem value="all">All Formations</SelectItem>
                      <SelectItem value="4-4-2 Diamond">4-4-2 Diamond</SelectItem>
                      <SelectItem value="4-3-3">4-3-3</SelectItem>
                      <SelectItem value="3-5-2">3-5-2</SelectItem>
                      <SelectItem value="4-2-3-1">4-2-3-1</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterRating} onValueChange={setFilterRating}>
                    <SelectTrigger className="bg-orange-900/30 border-orange-400/30 text-white">
                      <SelectValue placeholder="Filter by rating" />
                    </SelectTrigger>
                    <SelectContent className="bg-orange-900 border-orange-400/30">
                      <SelectItem value="all">All Ratings</SelectItem>
                      <SelectItem value="high">4.5+ Stars</SelectItem>
                      <SelectItem value="medium">4.0-4.5 Stars</SelectItem>
                      <SelectItem value="low">Below 4.0 Stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Community Teams */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTeams.map((team) => (
                <Card key={team.id} className="bg-black/30 backdrop-blur-lg border-orange-400/20 text-white hover:bg-orange-900/20 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{team.name}</CardTitle>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-yellow-400">{team.rating}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={team.authorAvatar} alt={team.author} />
                        <AvatarFallback className="bg-orange-600 text-white text-xs">
                          {team.author.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>by {team.author}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        className={`ml-auto h-6 px-2 text-xs ${
                          team.isFollowing 
                            ? 'bg-orange-600 text-white border-orange-600' 
                            : 'text-white border-orange-400/50 hover:bg-orange-700'
                        }`}
                        onClick={() => handleFollowUser(team.id)}
                      >
                        <UserPlus className="h-3 w-3 mr-1" />
                        {team.isFollowing ? 'Following' : 'Follow'}
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-orange-400" />
                      <Badge className={`${getFormationColor(team.formation)} text-white`}>
                        {team.formation}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-300 line-clamp-2">{team.description}</p>
                    
                    <div className="flex flex-wrap gap-1">
                      {team.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs border-orange-400/50">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{team.views}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          <span>{team.comments}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(team.createdDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-white border-orange-400/50 hover:bg-orange-700"
                        onClick={() => navigate(`/team-details/${team.id}`)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-400 border-red-400/50 hover:bg-red-700"
                        onClick={() => handleLikeTeam(team.id)}
                      >
                        <Heart className="h-3 w-3 mr-1" />
                        {team.likes}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="featured" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Teams of the Week */}
              <Card className="bg-black/30 backdrop-blur-lg border-orange-400/20 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-yellow-400" />
                    Teams of the Week
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {featuredTeams.map((team) => (
                    <div key={team.id} className="p-4 bg-orange-900/30 rounded-lg border border-orange-400/30">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{team.name}</h3>
                        <Badge className="bg-yellow-600 text-white">
                          {team.badge}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                        <span>by {team.author}</span>
                        <Badge className={`${getFormationColor(team.formation)} text-white`}>
                          {team.formation}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-yellow-400">{team.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="h-4 w-4 text-red-400" />
                          <span className="text-sm">{team.likes}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Most Popular Formations */}
              <Card className="bg-black/30 backdrop-blur-lg border-orange-400/20 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-orange-400" />
                    Most Popular Formations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {popularFormations.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={`${getFormationColor(item.formation)} text-white`}>
                            {item.formation}
                          </Badge>
                          <span className="text-sm text-gray-300">{item.count} teams</span>
                        </div>
                        <span className="text-sm text-orange-400">{item.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-black/30 backdrop-blur-lg border-orange-400/20 text-white">
                <CardHeader>
                  <CardTitle className="text-center">Total Teams</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-400 mb-2">1,247</div>
                    <p className="text-sm text-gray-300">Community teams shared</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/30 backdrop-blur-lg border-orange-400/20 text-white">
                <CardHeader>
                  <CardTitle className="text-center">Active Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-400 mb-2">8,923</div>
                    <p className="text-sm text-gray-300">Community members</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/30 backdrop-blur-lg border-orange-400/20 text-white">
                <CardHeader>
                  <CardTitle className="text-center">Total Likes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-400 mb-2">45,678</div>
                    <p className="text-sm text-gray-300">Likes given to teams</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CommunityHub;