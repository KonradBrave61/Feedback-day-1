import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { User, Mail, Trophy, Users, Target, Save, LogOut, Calendar, Star } from 'lucide-react';
import { toast } from 'sonner';

const ProfilePage = () => {
  const { user, logout, updateProfile, loadTeams } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    coachLevel: 1,
    favoritePosition: 'MF',
    favoriteElement: 'Fire',
    favouriteTeam: ''
  });
  const [teams, setTeams] = useState([]);
  const [stats, setStats] = useState({
    teamsCreated: 0,
    totalMatches: 0,
    victories: 0,
    favoriteFormation: '4-4-2'
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    setFormData({
      username: user.username || '',
      email: user.email || '',
      coachLevel: user.coachLevel || 1,
      favoritePosition: user.favoritePosition || 'MF',
      favoriteElement: user.favoriteElement || 'Fire'
    });

    // Load user teams
    const fetchTeams = async () => {
      const result = await loadTeams();
      if (result.success) {
        setTeams(result.teams);
        setStats(prev => ({
          ...prev,
          teamsCreated: result.teams.length
        }));
      }
    };

    fetchTeams();
  }, [user, navigate, loadTeams]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    const result = await updateProfile(formData);
    if (result.success) {
      toast.success('Profile updated successfully!');
      setEditing(false);
    } else {
      toast.error('Failed to update profile');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-800 to-orange-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
            Coach Profile
          </h1>
          <p className="text-xl text-gray-300">
            Manage your coaching career
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-black/30 backdrop-blur-lg border-orange-400/20 text-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-orange-400" />
                    Profile Information
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditing(!editing)}
                    className="text-white border-orange-400/30 hover:bg-orange-700"
                  >
                    {editing ? 'Cancel' : 'Edit'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Username</label>
                    {editing ? (
                      <Input
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="bg-orange-900/30 border-orange-400/30 text-white"
                      />
                    ) : (
                      <p className="text-lg">{user.username}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    {editing ? (
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="bg-orange-900/30 border-orange-400/30 text-white"
                      />
                    ) : (
                      <p className="text-lg">{user.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Coach Level</label>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-orange-600 text-white">
                        Level {user.coachLevel || 1}
                      </Badge>
                      <Trophy className="h-4 w-4 text-yellow-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Member Since</label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-orange-400" />
                      <span>{new Date(user.createdAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Favorite Position</label>
                    {editing ? (
                      <select
                        name="favoritePosition"
                        value={formData.favoritePosition}
                        onChange={handleChange}
                        className="w-full p-2 rounded bg-orange-900/30 border border-orange-400/30 text-white"
                      >
                        <option value="FW">Forward (FW)</option>
                        <option value="MF">Midfielder (MF)</option>
                        <option value="DF">Defender (DF)</option>
                        <option value="GK">Goalkeeper (GK)</option>
                      </select>
                    ) : (
                      <Badge className="bg-blue-600 text-white">
                        {user.favoritePosition || 'MF'}
                      </Badge>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Favourite Team</label>
                    {editing ? (
                      <Input
                        name="favouriteTeam"
                        value={formData.favouriteTeam}
                        onChange={handleChange}
                        className="bg-orange-900/30 border-orange-400/30 text-white"
                        placeholder="Enter your favourite team name"
                      />
                    ) : (
                      <Badge className="bg-purple-600 text-white">
                        {user.favourite_team || 'Not set'}
                      </Badge>
                    )}
                  </div>
                        <option value="Fire">Fire</option>
                        <option value="Earth">Earth</option>
                        <option value="Wind">Wind</option>
                        <option value="Wood">Wood</option>
                        <option value="Void">Void</option>
                      </select>
                    ) : (
                      <Badge className="bg-red-600 text-white">
                        {user.favoriteElement || 'Fire'}
                      </Badge>
                    )}
                  </div>
                </div>

                {editing && (
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleSave}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* My Teams */}
            <Card className="bg-black/30 backdrop-blur-lg border-orange-400/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-orange-400" />
                  My Teams ({teams.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {teams.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {teams.map((team, index) => (
                      <div key={index} className="p-4 bg-orange-600/20 rounded-lg border border-orange-500/30">
                        <h3 className="font-medium mb-2">{team.name || `Team ${index + 1}`}</h3>
                        <div className="text-sm text-gray-300">
                          <p>Formation: {team.formation}</p>
                          <p>Players: {team.players?.length || 0}/11</p>
                          <p>Created: {new Date(team.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No teams created yet</p>
                    <Button
                      variant="outline"
                      className="mt-4 text-white border-orange-400/30 hover:bg-orange-700"
                      onClick={() => navigate('/team-builder')}
                    >
                      Create Your First Team
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Stats & Actions */}
          <div className="space-y-6">
            {/* Stats Card */}
            <Card className="bg-black/30 backdrop-blur-lg border-orange-400/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-orange-400" />
                  Coach Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Teams Created</span>
                  <Badge variant="outline" className="text-white border-orange-400/30">
                    {stats.teamsCreated}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Total Matches</span>
                  <Badge variant="outline" className="text-white border-orange-400/30">
                    {stats.totalMatches}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Victories</span>
                  <Badge variant="outline" className="text-green-400 border-green-400">
                    {stats.victories}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Win Rate</span>
                  <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                    {stats.totalMatches > 0 ? Math.round((stats.victories / stats.totalMatches) * 100) : 0}%
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-black/30 backdrop-blur-lg border-orange-400/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-orange-400" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full text-white border-orange-400/30 hover:bg-orange-700/30 justify-start"
                  onClick={() => navigate('/team-builder')}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Team Builder
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-white border-orange-400/30 hover:bg-orange-700/30 justify-start"
                  onClick={() => navigate('/characters')}
                >
                  <Star className="mr-2 h-4 w-4" />
                  View Characters
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-red-400 border-red-400/30 hover:bg-red-700/30 justify-start"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;