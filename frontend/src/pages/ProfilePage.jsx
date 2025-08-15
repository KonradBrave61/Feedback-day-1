import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navigation from '../components/Navigation';
import TeamPreviewModal from '../components/TeamPreviewModal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  User, 
  Mail, 
  Trophy, 
  Users, 
  Target, 
  Star, 
  Edit3, 
  Save, 
  Camera, 
  Award,
  UserPlus,
  UserCheck,
  Heart,
  MessageSquare,
  TrendingUp,
  Eye,
  Lock,
  Unlock,
  Edit,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { logoColors, componentColors } from '../styles/colors';
import { showSessionExpiredNotification } from '../components/Notification';

const ProfilePage = () => {
  const { user, loading: authLoading, updateProfile, loadTeams, loadFollowers, loadFollowing, updateTeam } = useAuth();
  const navigate = useNavigate();
  
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    username: user?.username || '',
    email: user?.email || '',
    coachLevel: user?.coach_level || 1,
    favoritePosition: user?.favorite_position || 'FW',
    favoriteElement: user?.favorite_element || 'Fire',
    favoriteTeam: user?.favourite_team || ''
  });
  const [teams, setTeams] = useState([]);
  const [stats, setStats] = useState({
    teamsCreated: 0,
    totalMatches: 0,
    winRate: 0,
    currentRank: 'Rookie Coach'
  });
  const [followData, setFollowData] = useState({
    followers: [],
    following: [],
    followerCount: 0,
    followingCount: 0
  });
  const [loading, setLoading] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showTeamPreview, setShowTeamPreview] = useState(false);

  const positions = ['FW', 'MF', 'DF', 'GK'];
  const elements = ['Fire', 'Earth', 'Wind', 'Wood', 'Void'];

  useEffect(() => {
    fetchUserData();
  }, []);

  // Add effect to watch for user becoming null (session expired)
  useEffect(() => {
    if (!user && !authLoading) {
      console.log('ProfilePage: User session expired, redirecting to login');
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const fetchUserData = async () => {
    console.log('ProfilePage: Fetching user data...');
    
    try {
      // Load user teams with better error handling
      const teamsResult = await loadTeams();
      console.log('ProfilePage: Teams result:', teamsResult);
      
      if (teamsResult.success && teamsResult.teams && Array.isArray(teamsResult.teams)) {
        setTeams(teamsResult.teams);
        setStats(prev => ({
          ...prev,
          teamsCreated: teamsResult.teams.length
        }));
        console.log('ProfilePage: Successfully loaded teams:', teamsResult.teams.length);
      } else {
        console.error('ProfilePage: Failed to load teams:', teamsResult.error);
        
        // Check if this is an authentication error
        if (teamsResult.authError && teamsResult.error && teamsResult.error.includes('Session expired')) {
          // Silent redirect without popup, as requested
          navigate('/login');
          return; // Exit early to avoid loading other data
        } else {
          toast.error(`Failed to load teams: ${teamsResult.error || 'Unknown error'}`);
        }
        
        // Set empty array as fallback
        setTeams([]);
        setStats(prev => ({
          ...prev,
          teamsCreated: 0
        }));
      }

      // Load followers data
      const followersResult = await loadFollowers();
      console.log('ProfilePage: Followers result:', followersResult);
      
      let followersCount = 0;
      let followingCount = 0;
      
      if (followersResult.success && followersResult.followers) {
        followersCount = followersResult.followers.length;
        console.log('ProfilePage: Successfully loaded followers data:', followersCount);
      } else {
        console.error('ProfilePage: Failed to load followers:', followersResult.error);
        // Don't show error for followers as it's less critical
      }

      // Load following data
      const followingResult = await loadFollowing();
      if (followingResult.success && followingResult.following) {
        followingCount = followingResult.following.length;
        console.log('ProfilePage: Successfully loaded following data:', followingCount);
      } else {
        console.error('ProfilePage: Failed to load following:', followingResult.error);
      }
      
      // Update stats with both counts
      setStats(prev => ({
        ...prev,
        followers: followersCount,
        following: followingCount
      }));
      
    } catch (error) {
      console.error('ProfilePage: Unexpected error in fetchUserData:', error);
      toast.error('An unexpected error occurred while loading your profile data');
      // Set fallback data
      setTeams([]);
      setStats(prev => ({
        ...prev,
        teamsCreated: 0,
        followers: 0,
        following: 0
      }));
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // Convert frontend camelCase to backend snake_case
      const profilePayload = {
        username: profile.username,
        email: profile.email,
        coach_level: profile.coachLevel,
        favorite_position: profile.favoritePosition,
        favorite_element: profile.favoriteElement,
        favourite_team: profile.favoriteTeam
      };
      
      const result = await updateProfile(profilePayload);
      console.log('Profile update result:', result); // Debug log
      
      if (result && result.success) {
        // Update the local profile state with the saved data
        if (result.user) {
          setProfile(prev => ({
            ...prev,
            username: result.user.username || prev.username,
            email: result.user.email || prev.email,
            coachLevel: result.user.coach_level || prev.coachLevel,
            favoritePosition: result.user.favorite_position || prev.favoritePosition,
            favoriteElement: result.user.favorite_element || prev.favoriteElement,
            favoriteTeam: result.user.favourite_team || prev.favoriteTeam
          }));
        }
        toast.success('Profile updated successfully!');
        setEditing(false); // Exit editing mode
      } else {
        console.error('Profile update failed:', result);
        toast.error(result?.error || 'Failed to update profile');
        // Still exit editing mode even if update failed
        setEditing(false);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('An error occurred while updating profile');
      // Still exit editing mode even if there was an error
      setEditing(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset profile to original user data
    setProfile({
      username: user?.username || '',
      email: user?.email || '',
      coachLevel: user?.coach_level || 1,
      favoritePosition: user?.favorite_position || 'FW',
      favoriteElement: user?.favorite_element || 'Fire',
      favoriteTeam: user?.favourite_team || ''
    });
    setEditing(false);
  };

  const handleInputChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getRankByLevel = (level) => {
    if (level >= 50) return 'Legendary Coach';
    if (level >= 30) return 'Elite Coach';
    if (level >= 20) return 'Professional Coach';
    if (level >= 10) return 'Experienced Coach';
    return 'Rookie Coach';
  };

  const handleTeamClick = (team) => {
    setSelectedTeam(team);
    setShowTeamPreview(true);
  };

  const handleEditTeamInBuilder = (team) => {
    // Store team data in localStorage for team builder to pick up
    localStorage.setItem('loadTeamData', JSON.stringify({
      teamId: team.id,
      loadOnOpen: true
    }));
    
    // Navigate to team builder
    navigate('/team-builder');
  };

  const handleTeamPrivacyToggle = async (teamId, isPublic) => {
    try {
      const result = await updateTeam(teamId, { is_public: isPublic });
      if (result.success) {
        toast.success(`Team ${isPublic ? 'made public' : 'made private'} successfully!`);
        // Update the team in the local state
        setTeams(prevTeams => prevTeams.map(team => 
          team.id === teamId ? { ...team, is_public: isPublic } : team
        ));
        // Update selectedTeam if it's the one being modified
        if (selectedTeam?.id === teamId) {
          setSelectedTeam(prev => ({ ...prev, is_public: isPublic }));
        }
      } else {
        toast.error(result.error || 'Failed to update team privacy');
      }
    } catch (error) {
      toast.error('An error occurred while updating team privacy');
    }
  };

  const handleQuickPrivacyToggle = async (team) => {
    await handleTeamPrivacyToggle(team.id, !team.is_public);
  };

  return (
    <div className="min-h-screen" style={{ background: logoColors.backgroundGradient }}>
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Coach Profile
          </h1>

          <p className="text-gray-300">Manage your Inazuma Eleven journey</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info Card */}
          <div className="lg:col-span-1">
            <Card className="backdrop-blur-lg text-white border" style={{ 
              backgroundColor: logoColors.blackAlpha(0.3),
              borderColor: logoColors.primaryBlueAlpha(0.2)
            }}>
              <CardHeader className="text-center">
                <div className="relative inline-block">
                  <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center relative" 
                       style={{ background: logoColors.yellowOrangeGradient }}>
                    <User className="h-12 w-12 text-black" />
                    <Button
                      size="sm"
                      className="absolute -bottom-1 -right-1 w-8 h-8 p-0 rounded-full border-2 border-black"
                      style={{ backgroundColor: logoColors.primaryBlue }}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-xl">{profile.username}</CardTitle>
                <p className="text-sm" style={{ color: logoColors.lightBlue }}>
                  Level {profile.coachLevel} • {getRankByLevel(profile.coachLevel)}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {editing ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium" style={{ color: logoColors.lightBlue }}>
                        Username
                      </label>
                      <Input
                        value={profile.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        className="text-white border"
                        style={{ 
                          backgroundColor: logoColors.blackAlpha(0.5),
                          borderColor: logoColors.primaryBlueAlpha(0.3)
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium" style={{ color: logoColors.lightBlue }}>
                        Favorite Team
                      </label>
                      <Input
                        value={profile.favoriteTeam}
                        onChange={(e) => handleInputChange('favoriteTeam', e.target.value)}
                        placeholder="e.g., Raimon Eleven"
                        className="text-white border"
                        style={{ 
                          backgroundColor: logoColors.blackAlpha(0.5),
                          borderColor: logoColors.primaryBlueAlpha(0.3)
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium" style={{ color: logoColors.lightBlue }}>
                        Favorite Position
                      </label>
                      <Select value={profile.favoritePosition} onValueChange={(value) => handleInputChange('favoritePosition', value)}>
                        <SelectTrigger className="text-white border" style={{ 
                          backgroundColor: logoColors.blackAlpha(0.5),
                          borderColor: logoColors.primaryBlueAlpha(0.3)
                        }}>
                          <SelectValue />
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
                              {position}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium" style={{ color: logoColors.lightBlue }}>
                        Favorite Element
                      </label>
                      <Select value={profile.favoriteElement} onValueChange={(value) => handleInputChange('favoriteElement', value)}>
                        <SelectTrigger className="text-white border" style={{ 
                          backgroundColor: logoColors.blackAlpha(0.5),
                          borderColor: logoColors.primaryBlueAlpha(0.3)
                        }}>
                          <SelectValue />
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
                              {element}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSaveProfile}
                        disabled={loading}
                        className="flex-1 text-black font-bold hover:opacity-80 disabled:opacity-50"
                        style={{ background: logoColors.yellowOrangeGradient }}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button
                        onClick={handleCancelEdit}
                        className="text-white border hover:opacity-80 hover:text-white"
                        style={{ 
                          backgroundColor: logoColors.primaryBlueAlpha(0.4),
                          borderColor: logoColors.primaryBlueAlpha(0.3)
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" style={{ color: logoColors.primaryBlue }} />
                        <span className="text-sm text-gray-300">{profile.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4" style={{ color: logoColors.primaryYellow }} />
                        <span className="text-sm text-gray-300">{profile.favoriteTeam || 'No team set'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4" style={{ color: logoColors.secondaryBlue }} />
                        <span className="text-sm text-gray-300">{profile.favoritePosition}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4" style={{ color: logoColors.primaryOrange }} />
                        <span className="text-sm text-gray-300">{profile.favoriteElement}</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => setEditing(true)}
                      className="w-full text-white border hover:opacity-80 hover:text-white"
                      style={{ 
                        backgroundColor: logoColors.primaryBlueAlpha(0.4),
                        borderColor: logoColors.primaryBlueAlpha(0.3)
                      }}
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Follow Stats */}
            <Card className="mt-6 backdrop-blur-lg text-white border" style={{ 
              backgroundColor: logoColors.blackAlpha(0.3),
              borderColor: logoColors.primaryBlueAlpha(0.2)
            }}>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-white">{followData.followerCount}</div>
                    <div className="text-sm text-gray-300">Followers</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{followData.followingCount}</div>
                    <div className="text-sm text-gray-300">Following</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats and Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="backdrop-blur-lg text-white border text-center" style={{ 
                backgroundColor: logoColors.blackAlpha(0.3),
                borderColor: logoColors.primaryBlueAlpha(0.2)
              }}>
                <CardContent className="p-4">
                  <Users className="h-8 w-8 mx-auto mb-2" style={{ color: logoColors.primaryBlue }} />
                  <div className="text-xl font-bold">{stats.teamsCreated}</div>
                  <div className="text-xs text-gray-300">Teams</div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-lg text-white border text-center" style={{ 
                backgroundColor: logoColors.blackAlpha(0.3),
                borderColor: logoColors.primaryBlueAlpha(0.2)
              }}>
                <CardContent className="p-4">
                  <Trophy className="h-8 w-8 mx-auto mb-2" style={{ color: logoColors.primaryYellow }} />
                  <div className="text-xl font-bold">{stats.totalMatches}</div>
                  <div className="text-xs text-gray-300">Matches</div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-lg text-white border text-center" style={{ 
                backgroundColor: logoColors.blackAlpha(0.3),
                borderColor: logoColors.primaryBlueAlpha(0.2)
              }}>
                <CardContent className="p-4">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2" style={{ color: logoColors.secondaryBlue }} />
                  <div className="text-xl font-bold">{stats.winRate}%</div>
                  <div className="text-xs text-gray-300">Win Rate</div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-lg text-white border text-center" style={{ 
                backgroundColor: logoColors.blackAlpha(0.3),
                borderColor: logoColors.primaryBlueAlpha(0.2)
              }}>
                <CardContent className="p-4">
                  <Award className="h-8 w-8 mx-auto mb-2" style={{ color: logoColors.primaryOrange }} />
                  <div className="text-sm font-bold">{getRankByLevel(profile.coachLevel)}</div>
                  <div className="text-xs text-gray-300">Rank</div>
                </CardContent>
              </Card>
            </div>

            {/* Teams Section */}
            <Card className="backdrop-blur-lg text-white border" style={{ 
              backgroundColor: logoColors.blackAlpha(0.3),
              borderColor: logoColors.primaryBlueAlpha(0.2)
            }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" style={{ color: logoColors.primaryBlue }} />
                  My Teams ({Array.isArray(teams) ? teams.length : 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Array.isArray(teams) && teams.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {teams.map((team) => (
                      <div key={team.id} className="p-4 rounded-lg border cursor-pointer hover:opacity-80 transition-opacity" style={{ 
                        backgroundColor: logoColors.blackAlpha(0.3),
                        borderColor: logoColors.primaryBlueAlpha(0.3)
                      }}>
                        <div className="flex justify-between items-start mb-2">
                          <div 
                            className="flex-1"
                            onClick={() => handleTeamClick(team)}
                          >
                            <h3 className="font-bold text-white mb-1 hover:underline">{team.name}</h3>
                            <p className="text-sm text-gray-300 mb-2">{team.formation_name}</p>
                          </div>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickPrivacyToggle(team);
                            }}
                            className="ml-2 p-2 hover:opacity-80 hover:text-white"
                            style={{ 
                              backgroundColor: team.is_public ? logoColors.primaryBlueAlpha(0.3) : logoColors.blackAlpha(0.5),
                              color: logoColors.white
                            }}
                          >
                            {team.is_public ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Heart className="h-4 w-4" style={{ color: logoColors.primaryYellow }} />
                              <span className="text-xs text-gray-300">{team.likes || 0}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageSquare className="h-4 w-4" style={{ color: logoColors.primaryBlue }} />
                              <span className="text-xs text-gray-300">{Array.isArray(team.comments) ? team.comments.length : (team.comments_count || 0)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="h-4 w-4" style={{ color: logoColors.secondaryBlue }} />
                              <span className="text-xs text-gray-300">{team.views || 0}</span>
                            </div>
                          </div>
                          <Badge className="text-xs" style={{ 
                            backgroundColor: team.is_public ? logoColors.primaryBlueAlpha(0.2) : logoColors.blackAlpha(0.5),
                            color: logoColors.white
                          }}>
                            {team.is_public ? 'Public' : 'Private'}
                          </Badge>
                        </div>
                        <div className="mt-3 flex gap-2 justify-center">
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTeamClick(team);
                            }}
                            className="text-white hover:opacity-80 text-xs flex-1"
                            style={{ backgroundColor: logoColors.primaryBlueAlpha(0.4) }}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View Details
                          </Button>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditTeamInBuilder(team);
                            }}
                            className="text-black hover:opacity-80 text-xs flex-1 font-bold"
                            style={{ background: logoColors.yellowOrangeGradient }}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit in Builder
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto mb-4" style={{ color: logoColors.primaryBlue }} />
                    <h3 className="text-lg font-bold text-white mb-2">No Teams Created</h3>
                    <p className="text-gray-300 mb-4">Start building your first team!</p>
                    <Button
                      className="text-black font-bold hover:opacity-80"
                      style={{ background: logoColors.yellowOrangeGradient }}
                      onClick={() => navigate('/team-builder')}
                    >
                      Create Your First Team
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Team Preview Modal */}
      {showTeamPreview && selectedTeam && (
        <TeamPreviewModal
          isOpen={showTeamPreview}
          onClose={() => {
            setShowTeamPreview(false);
            setSelectedTeam(null);
          }}
          team={selectedTeam}
          onPrivacyToggle={handleTeamPrivacyToggle}
        />
      )}
    </div>
  );
};

export default ProfilePage;