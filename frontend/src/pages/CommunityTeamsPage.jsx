import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navigation from '../components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Slider } from '../components/ui/slider';
import { Users, Heart, Eye, MessageCircle, Star, Filter, Search, TrendingUp, Trophy, UserPlus, Send, ThumbsUp, Calendar } from 'lucide-react';

const CommunityTeamsPage = () => {
  const { user, loadCommunityTeams, likeTeam, commentOnTeam, followUser, rateTeam, loadTeamDetails } = useAuth();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    formation: '',
    sort_by: 'created_at'
  });
  const [ratings, setRatings] = useState({
    tension_usage: 3,
    difficulty: 3,
    fun: 3,
    creativity: 3,
    effectiveness: 3,
    balance: 3
  });
  const [comment, setComment] = useState('');
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    loadTeams();
  }, [filters]);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const result = await loadCommunityTeams({
        ...filters,
        limit: 20,
        offset: 0
      });
      if (result.success) {
        setTeams(result.teams);
      }
    } catch (error) {
      console.error('Failed to load teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (teamId) => {
    try {
      setActionLoading(prev => ({ ...prev, [`like_${teamId}`]: true }));
      const result = await likeTeam(teamId);
      if (result.success) {
        // Update the team in the list
        setTeams(prev => prev.map(team => 
          team.id === teamId 
            ? { 
                ...team, 
                likes: result.liked ? team.likes + 1 : team.likes - 1,
                liked_by: result.liked 
                  ? [...team.liked_by, user.id]
                  : team.liked_by.filter(id => id !== user.id)
              }
            : team
        ));
      }
    } catch (error) {
      console.error('Failed to like team:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [`like_${teamId}`]: false }));
    }
  };

  const handleComment = async (teamId) => {
    try {
      setActionLoading(prev => ({ ...prev, [`comment_${teamId}`]: true }));
      const result = await commentOnTeam(teamId, comment);
      if (result.success) {
        // Update the team in the list
        setTeams(prev => prev.map(team => 
          team.id === teamId 
            ? { 
                ...team, 
                comments: [...team.comments, result.comment]
              }
            : team
        ));
        setComment('');
        setShowCommentModal(false);
      }
    } catch (error) {
      console.error('Failed to comment on team:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [`comment_${teamId}`]: false }));
    }
  };

  const handleRate = async (teamId) => {
    try {
      setActionLoading(prev => ({ ...prev, [`rate_${teamId}`]: true }));
      const result = await rateTeam(teamId, ratings);
      if (result.success) {
        // Update the team in the list
        setTeams(prev => prev.map(team => 
          team.id === teamId 
            ? { 
                ...team, 
                rating: result.rating.average_rating,
                detailed_rating: result.rating
              }
            : team
        ));
        setShowRatingModal(false);
      }
    } catch (error) {
      console.error('Failed to rate team:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [`rate_${teamId}`]: false }));
    }
  };

  const handleFollow = async (userId) => {
    try {
      setActionLoading(prev => ({ ...prev, [`follow_${userId}`]: true }));
      const result = await followUser(userId);
      if (result.success) {
        // Update following status in teams
        setTeams(prev => prev.map(team => 
          team.user_id === userId 
            ? { ...team, is_following: result.following }
            : team
        ));
      }
    } catch (error) {
      console.error('Failed to follow user:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [`follow_${userId}`]: false }));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-400';
    if (rating >= 3) return 'text-yellow-400';
    if (rating >= 2) return 'text-orange-400';
    return 'text-red-400';
  };

  const TeamCard = ({ team }) => (
    <Card className="bg-black/30 backdrop-blur-lg border-orange-400/20 text-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-900/30 flex items-center justify-center">
              {team.user_avatar ? (
                <img 
                  src={team.user_avatar} 
                  alt={team.username}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <Users className="h-5 w-5 text-orange-400" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-white">{team.name}</h3>
              <p className="text-sm text-gray-400">by {team.username}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-orange-400 border-orange-400">
              {team.formation}
            </Badge>
            {team.user_id !== user.id && (
              <Button
                onClick={() => handleFollow(team.user_id)}
                disabled={actionLoading[`follow_${team.user_id}`]}
                size="sm"
                variant="outline"
                className="text-white border-orange-400/30 hover:bg-orange-700/30"
              >
                {actionLoading[`follow_${team.user_id}`] ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-1" />
                    Follow
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {team.description && (
          <p className="text-gray-300 text-sm">{team.description}</p>
        )}
        
        {team.tags && team.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {team.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              <span>{team.likes}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{team.views}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              <span>{team.comments?.length || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className={`h-4 w-4 ${getRatingColor(team.rating)}`} />
              <span className={getRatingColor(team.rating)}>{team.rating.toFixed(1)}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="h-3 w-3" />
            {formatDate(team.created_at)}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={() => handleLike(team.id)}
            disabled={actionLoading[`like_${team.id}`]}
            size="sm"
            variant="outline"
            className={`flex-1 ${
              team.liked_by?.includes(user.id)
                ? 'bg-red-600/20 border-red-500 text-red-400'
                : 'text-white border-orange-400/30 hover:bg-orange-700/30'
            }`}
          >
            {actionLoading[`like_${team.id}`] ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
            ) : (
              <Heart className={`h-4 w-4 mr-1 ${team.liked_by?.includes(user.id) ? 'fill-current' : ''}`} />
            )}
            {team.liked_by?.includes(user.id) ? 'Liked' : 'Like'}
          </Button>
          
          <Button
            onClick={() => {
              setSelectedTeam(team);
              setShowCommentModal(true);
            }}
            size="sm"
            variant="outline"
            className="flex-1 text-white border-orange-400/30 hover:bg-orange-700/30"
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            Comment
          </Button>
          
          {team.user_id !== user.id && (
            <Button
              onClick={() => {
                setSelectedTeam(team);
                setShowRatingModal(true);
              }}
              size="sm"
              variant="outline"
              className="flex-1 text-white border-orange-400/30 hover:bg-orange-700/30"
            >
              <Star className="h-4 w-4 mr-1" />
              Rate
            </Button>
          )}
        </div>
        
        {team.comments && team.comments.length > 0 && (
          <div className="border-t border-orange-400/20 pt-3">
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {team.comments.slice(-3).map((comment, index) => (
                <div key={index} className="text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-orange-400">{comment.username}</span>
                    <span className="text-gray-500 text-xs">{formatDate(comment.created_at)}</span>
                  </div>
                  <p className="text-gray-300 mt-1">{comment.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const LoadingCard = () => (
    <Card className="bg-black/30 backdrop-blur-lg border-orange-400/20 text-white">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-900/30 animate-pulse" />
          <div className="flex-1">
            <div className="h-4 bg-orange-900/30 rounded animate-pulse mb-2" />
            <div className="h-3 bg-orange-900/30 rounded animate-pulse w-2/3" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="h-3 bg-orange-900/30 rounded animate-pulse" />
          <div className="h-3 bg-orange-900/30 rounded animate-pulse w-3/4" />
          <div className="h-8 bg-orange-900/30 rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );

  const ratingCategories = [
    { key: 'tension_usage', label: 'Tension Usage', description: 'How well the team uses tension mechanics' },
    { key: 'difficulty', label: 'Difficulty', description: 'How challenging the team is to play against' },
    { key: 'fun', label: 'Fun Factor', description: 'How enjoyable the team is to play' },
    { key: 'creativity', label: 'Creativity', description: 'How creative and unique the team composition is' },
    { key: 'effectiveness', label: 'Effectiveness', description: 'How effective the team is in matches' },
    { key: 'balance', label: 'Balance', description: 'How well balanced the team composition is' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-800 to-orange-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
            Community Teams
          </h1>
          <p className="text-xl text-gray-300">
            Discover and rate amazing teams from the community
          </p>
        </div>

        {/* Filters */}
        <div className="max-w-4xl mx-auto mb-8">
          <Card className="bg-black/30 backdrop-blur-lg border-orange-400/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-orange-400" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="search" className="text-white">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search teams, users, formations..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-10 bg-orange-900/30 border-orange-400/30 text-white placeholder-gray-400"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="formation" className="text-white">Formation</Label>
                  <Select value={filters.formation} onValueChange={(value) => setFilters(prev => ({ ...prev, formation: value }))}>
                    <SelectTrigger className="bg-orange-900/30 border-orange-400/30 text-white">
                      <SelectValue placeholder="All formations" />
                    </SelectTrigger>
                    <SelectContent className="bg-orange-900 border-orange-400/30">
                      <SelectItem value="" className="text-white">All formations</SelectItem>
                      <SelectItem value="4-3-3" className="text-white">4-3-3</SelectItem>
                      <SelectItem value="4-4-2" className="text-white">4-4-2</SelectItem>
                      <SelectItem value="3-5-2" className="text-white">3-5-2</SelectItem>
                      <SelectItem value="5-3-2" className="text-white">5-3-2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="sort" className="text-white">Sort by</Label>
                  <Select value={filters.sort_by} onValueChange={(value) => setFilters(prev => ({ ...prev, sort_by: value }))}>
                    <SelectTrigger className="bg-orange-900/30 border-orange-400/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-orange-900 border-orange-400/30">
                      <SelectItem value="created_at" className="text-white">Latest</SelectItem>
                      <SelectItem value="likes" className="text-white">Most Liked</SelectItem>
                      <SelectItem value="views" className="text-white">Most Viewed</SelectItem>
                      <SelectItem value="rating" className="text-white">Highest Rated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Teams Grid */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <LoadingCard key={index} />
              ))
            ) : teams.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No teams found</p>
                <p className="text-gray-500 text-sm mt-2">Try adjusting your filters or check back later</p>
              </div>
            ) : (
              teams.map((team) => (
                <TeamCard key={team.id} team={team} />
              ))
            )}
          </div>
        </div>

        {/* Rating Modal */}
        {showRatingModal && selectedTeam && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-orange-900 via-red-800 to-orange-900 p-1 rounded-lg max-w-md w-full mx-4">
              <Card className="bg-black/30 backdrop-blur-lg border-orange-400/20 text-white">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-orange-400" />
                      Rate Team: {selectedTeam.name}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowRatingModal(false)}
                      className="text-white hover:bg-orange-700/30"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {ratingCategories.map((category) => (
                      <div key={category.key}>
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <Label className="text-white font-medium">{category.label}</Label>
                            <p className="text-xs text-gray-400">{category.description}</p>
                          </div>
                          <Badge variant="outline" className="text-orange-400 border-orange-400">
                            {ratings[category.key]}/5
                          </Badge>
                        </div>
                        <Slider
                          value={[ratings[category.key]]}
                          onValueChange={(value) => setRatings(prev => ({ ...prev, [category.key]: value[0] }))}
                          max={5}
                          min={1}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    ))}
                    
                    <div className="flex gap-2 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setShowRatingModal(false)}
                        className="flex-1 text-white border-orange-400/30 hover:bg-orange-700/30"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => handleRate(selectedTeam.id)}
                        disabled={actionLoading[`rate_${selectedTeam.id}`]}
                        className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
                      >
                        {actionLoading[`rate_${selectedTeam.id}`] ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                            Rating...
                          </>
                        ) : (
                          <>
                            <Star className="h-4 w-4 mr-2" />
                            Submit Rating
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Comment Modal */}
        {showCommentModal && selectedTeam && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-orange-900 via-red-800 to-orange-900 p-1 rounded-lg max-w-md w-full mx-4">
              <Card className="bg-black/30 backdrop-blur-lg border-orange-400/20 text-white">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5 text-orange-400" />
                      Comment on: {selectedTeam.name}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCommentModal(false)}
                      className="text-white hover:bg-orange-700/30"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="comment" className="text-white">Your Comment</Label>
                      <Textarea
                        id="comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your thoughts about this team..."
                        className="bg-orange-900/30 border-orange-400/30 text-white placeholder-gray-400 resize-none"
                        rows={4}
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowCommentModal(false)}
                        className="flex-1 text-white border-orange-400/30 hover:bg-orange-700/30"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => handleComment(selectedTeam.id)}
                        disabled={actionLoading[`comment_${selectedTeam.id}`] || !comment.trim()}
                        className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
                      >
                        {actionLoading[`comment_${selectedTeam.id}`] ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                            Commenting...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Post Comment
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityTeamsPage;