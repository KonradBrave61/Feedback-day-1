import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navigation from '../components/Navigation';
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
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { logoColors, componentColors } from '../styles/colors';

const ProfilePage = () => {
  const { user, updateProfile, loadTeams, loadUserFollowData } = useAuth();
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

  const positions = ['FW', 'MF', 'DF', 'GK'];
  const elements = ['Fire', 'Earth', 'Wind', 'Wood', 'Void'];

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    // Load user teams
    const teamsResult = await loadTeams();
    if (teamsResult.success) {
      setTeams(teamsResult.teams);
      setStats(prev => ({
        ...prev,
        teamsCreated: teamsResult.teams.length
      }));
    }

    // Load follow data
    const followResult = await loadUserFollowData();
    if (followResult.success) {
      setFollowData(followResult.data);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const result = await updateProfile(profile);
      if (result.success) {
        toast.success('Profile updated successfully!');
        setEditing(false);
      } else {
        toast.error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('An error occurred while updating profile');
    } finally {
      setLoading(false);
    }
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
                  <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center" 
                       style={{ background: logoColors.yellowOrangeGradient }}>
                    <User className="h-12 w-12 text-black" />
                  </div>
                  <Button
                    size="sm"
                    className="absolute bottom-2 right-2 w-8 h-8 p-0 rounded-full"
                    style={{ backgroundColor: logoColors.primaryBlue }}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
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
                        onClick={() => setEditing(false)}
                        className="text-white border hover:opacity-80"
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
                      className="w-full text-white border hover:opacity-80"
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
                  My Teams ({teams.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {teams.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {teams.map((team) => (
                      <div key={team.id} className="p-4 rounded-lg border" style={{ 
                        backgroundColor: logoColors.blackAlpha(0.3),
                        borderColor: logoColors.primaryBlueAlpha(0.3)
                      }}>
                        <h3 className="font-bold text-white mb-1">{team.name}</h3>
                        <p className="text-sm text-gray-300 mb-2">{team.formation_name}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Heart className="h-4 w-4" style={{ color: logoColors.primaryYellow }} />
                            <span className="text-xs">{team.likes || 0}</span>
                            <MessageSquare className="h-4 w-4" style={{ color: logoColors.primaryBlue }} />
                            <span className="text-xs">{team.comments || 0}</span>
                          </div>
                          <Badge className="text-xs" style={{ 
                            backgroundColor: team.is_public ? logoColors.primaryBlueAlpha(0.2) : logoColors.blackAlpha(0.5),
                            color: logoColors.white
                          }}>
                            {team.is_public ? 'Public' : 'Private'}
                          </Badge>
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
    </div>
  );
};

export default ProfilePage;