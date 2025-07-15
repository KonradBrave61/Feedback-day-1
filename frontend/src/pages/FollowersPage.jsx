import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navigation from '../components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Users, UserPlus, UserMinus, Trophy, Heart, Eye } from 'lucide-react';

const FollowersPage = () => {
  const { user, loadFollowers, loadFollowing, followUser } = useAuth();
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loadingFollowers, setLoadingFollowers] = useState(true);
  const [loadingFollowing, setLoadingFollowing] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    loadFollowersData();
    loadFollowingData();
  }, []);

  const loadFollowersData = async () => {
    try {
      setLoadingFollowers(true);
      const result = await loadFollowers();
      if (result.success) {
        setFollowers(result.followers);
      }
    } catch (error) {
      console.error('Failed to load followers:', error);
    } finally {
      setLoadingFollowers(false);
    }
  };

  const loadFollowingData = async () => {
    try {
      setLoadingFollowing(true);
      const result = await loadFollowing();
      if (result.success) {
        setFollowing(result.following);
      }
    } catch (error) {
      console.error('Failed to load following:', error);
    } finally {
      setLoadingFollowing(false);
    }
  };

  const handleFollowToggle = async (userId) => {
    try {
      setActionLoading(prev => ({ ...prev, [userId]: true }));
      const result = await followUser(userId);
      if (result.success) {
        // Refresh the data
        loadFollowersData();
        loadFollowingData();
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const isFollowing = (userId) => {
    return following.some(user => user.id === userId);
  };

  const UserCard = ({ user: profileUser, showFollowButton = true }) => (
    <Card className="bg-black/30 backdrop-blur-lg border-orange-400/20 text-white">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-orange-900/30 flex items-center justify-center">
              {profileUser.profile_picture ? (
                <img 
                  src={profileUser.profile_picture} 
                  alt={profileUser.username}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <Users className="h-6 w-6 text-orange-400" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-white">{profileUser.username}</h3>
              <p className="text-sm text-gray-400">Coach Level {profileUser.coach_level}</p>
              <p className="text-xs text-gray-400">{profileUser.favourite_team}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right text-sm">
              <div className="flex items-center gap-1 text-gray-400">
                <Trophy className="h-3 w-3" />
                <span>{profileUser.total_teams}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-400">
                <Heart className="h-3 w-3" />
                <span>{profileUser.total_likes_received}</span>
              </div>
            </div>
            
            {showFollowButton && profileUser.id !== user.id && (
              <Button
                onClick={() => handleFollowToggle(profileUser.id)}
                disabled={actionLoading[profileUser.id]}
                size="sm"
                className={`${
                  isFollowing(profileUser.id)
                    ? 'bg-gray-600 hover:bg-gray-700'
                    : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700'
                } text-white`}
              >
                {actionLoading[profileUser.id] ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : isFollowing(profileUser.id) ? (
                  <>
                    <UserMinus className="h-4 w-4 mr-1" />
                    Unfollow
                  </>
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
        
        {profileUser.bio && (
          <p className="mt-2 text-sm text-gray-300">{profileUser.bio}</p>
        )}
      </CardContent>
    </Card>
  );

  const LoadingCard = () => (
    <Card className="bg-black/30 backdrop-blur-lg border-orange-400/20 text-white">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-orange-900/30 animate-pulse" />
          <div className="flex-1">
            <div className="h-4 bg-orange-900/30 rounded animate-pulse mb-2" />
            <div className="h-3 bg-orange-900/30 rounded animate-pulse w-2/3" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-800 to-orange-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
            Social Network
          </h1>
          <p className="text-xl text-gray-300">
            Connect with other coaches and team builders
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="followers" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-black/30 backdrop-blur-lg">
              <TabsTrigger value="followers" className="text-white data-[state=active]:bg-orange-600">
                Followers ({followers.length})
              </TabsTrigger>
              <TabsTrigger value="following" className="text-white data-[state=active]:bg-orange-600">
                Following ({following.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="followers" className="mt-6">
              <Card className="bg-black/30 backdrop-blur-lg border-orange-400/20 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-orange-400" />
                    Your Followers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {loadingFollowers ? (
                      Array.from({ length: 3 }).map((_, index) => (
                        <LoadingCard key={index} />
                      ))
                    ) : followers.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-400">No followers yet</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Create public teams to attract followers!
                        </p>
                      </div>
                    ) : (
                      followers.map((follower) => (
                        <UserCard key={follower.id} user={follower} showFollowButton={false} />
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="following" className="mt-6">
              <Card className="bg-black/30 backdrop-blur-lg border-orange-400/20 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-orange-400" />
                    You're Following
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {loadingFollowing ? (
                      Array.from({ length: 3 }).map((_, index) => (
                        <LoadingCard key={index} />
                      ))
                    ) : following.length === 0 ? (
                      <div className="text-center py-8">
                        <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-400">Not following anyone yet</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Explore the community to find coaches to follow!
                        </p>
                      </div>
                    ) : (
                      following.map((followedUser) => (
                        <UserCard key={followedUser.id} user={followedUser} />
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default FollowersPage;