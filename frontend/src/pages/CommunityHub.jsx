import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navigation from '../components/Navigation';
import TeamCard from '../components/TeamCard';
import TeamPreviewModal from '../components/TeamPreviewModal';
import CommentsModal from '../components/CommentsModal';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  Search, 
  TrendingUp, 
  Star, 
  Users, 
  Trophy, 
  Heart,
  Globe,
  UserPlus,
} from 'lucide-react';
import { logoColors } from '../styles/colors';

const CommunityHub = () => {
  const navigate = useNavigate();
  const { user, loadCommunityTeams, loadCommunityStats, likeTeam, loadTeamDetails, viewTeam } = useAuth();
  const [teams, setTeams] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTeams: 0,
    totalPublicTeams: 0,
    totalLikes: 0,
    totalViews: 0,
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [filterBy, setFilterBy] = useState('all');

  // Modals
  const [previewOpen, setPreviewOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);

  const sortOptions = [
    { value: 'created_at', label: 'Most Recent' },
    { value: 'likes', label: 'Most Liked' },
    { value: 'views', label: 'Most Viewed' },
    { value: 'rating', label: 'Highest Rated' }
  ];

  useEffect(() => {
    fetchCommunityData();
    // Including dependencies for correct re-fetch on change
  }, [sortBy, filterBy, searchQuery]);

  const fetchCommunityData = async () => {
    setLoading(true);
    try {
      const teamsResult = await loadCommunityTeams({
        search: searchQuery,
        sort_by: sortBy,
      });
      if (teamsResult.success) {
        setTeams(teamsResult.teams);
      }

      const statsResult = await loadCommunityStats();
      if (statsResult.success) {
        const s = statsResult.stats || statsResult; // backend returns snake_case keys
        setStats({
          totalUsers: s.total_users ?? 0,
          totalTeams: s.total_teams ?? 0,
          totalPublicTeams: s.total_public_teams ?? 0,
          totalLikes: s.total_likes ?? 0,
          totalViews: s.total_views ?? 0,
        });
      }
    } catch (error) {
      console.error('Failed to load community data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (teamId) => {
    // Optimistic toggle
    setTeams((prev) => prev.map((t) => {
      if (t.id !== teamId) return t;
      const liked = !t.__liked; // local marker
      return { ...t, __liked: liked, likes: (t.likes || 0) + (liked ? 1 : -1) };
    }));

    const res = await likeTeam(teamId);
    if (!res?.success) {
      // revert on failure
      setTeams((prev) => prev.map((t) => {
        if (t.id !== teamId) return t;
        const liked = !t.__liked; // revert
        return { ...t, __liked: liked, likes: (t.likes || 0) + (liked ? 1 : -1) };
      }));
    }
  };

  const handleComment = (teamId) => {
    const team = teams.find((t) => t.id === teamId);
    setSelectedTeam(team);
    setCommentsOpen(true);
  };

  const handleView = async (teamId) => {
    const team = teams.find((t) => t.id === teamId);
    setSelectedTeam(team);
    setPreviewOpen(true);
    // Optimistic + backend increment
    setTeams((prev) => prev.map((t) => t.id === teamId ? { ...t, views: (t.views || 0) + 1 } : t));
    try {
      // Try dedicated view endpoint if available
      if (viewTeam) await viewTeam(teamId);
      else await loadTeamDetails(teamId); // this will increment for non-owners
    } catch (_) {}
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
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
              <div className="text-2xl font-bold text-white">{(teams[0]?.rating ?? 4.5).toFixed ? (teams[0]?.rating ?? 4.5).toFixed(1) : teams[0]?.rating || '4.5'}</div>
              <div className="text-sm text-gray-300">Sample Rating</div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-lg text-white border text-center" style={{ 
            backgroundColor: logoColors.blackAlpha(0.3),
            borderColor: logoColors.primaryBlueAlpha(0.2)
          }}>
            <CardContent className="p-6">
              <TrendingUp className="h-8 w-8 mx-auto mb-2" style={{ color: logoColors.primaryYellow }} />
              <div className="text-2xl font-bold text-white">{stats.totalViews}</div>
              <div className="text-sm text-gray-300">Total Views</div>
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

              {/* Spacer for future filter */}
              <div />

              {/* Clear Filters */}
              <Button
                onClick={() => {
                  setSearchQuery('');
                  setSortBy('created_at');
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
                onLike={handleLike}
                onComment={handleComment}
                onView={handleView}
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
                setSortBy('created_at');
                setFilterBy('all');
              }}
              className="text-black font-bold hover:opacity-80"
              style={{ background: logoColors.yellowOrangeGradient }}
            >
              Reset Filters
            </Button>
          </div>
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
                  Join Now
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <TeamPreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        team={selectedTeam}
        onPrivacyToggle={null}
      />

      <CommentsModal
        isOpen={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        team={selectedTeam}
      />
    </div>
  );
};

export default CommunityHub;