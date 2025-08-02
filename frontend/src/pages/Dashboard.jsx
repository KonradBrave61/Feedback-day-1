import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navigation from '../components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Users, Trophy, Target, Star, TrendingUp, Calendar, Award, User, Plus, Settings, Clock, Globe } from 'lucide-react';
import { logoColors, componentColors } from '../styles/colors';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    teamsCreated: 3,
    totalMatches: 45,
    winRate: 72,
    currentRank: 'Elite Coach',
    weeklyGoal: 5,
    weeklyProgress: 3
  });

  const recentActivity = [
    { action: 'Team "Lightning Strikers" updated', time: '2 hours ago', type: 'team' },
    { action: 'Defeated "Fire Dragons" 3-1', time: '1 day ago', type: 'match' },
    { action: 'New player unlocked: Jude Sharp', time: '2 days ago', type: 'unlock' },
    { action: 'Reached Coach Level 25', time: '3 days ago', type: 'level' }
  ];

  const quickActions = [
    { title: 'Team Builder', icon: Users, path: '/team-builder', color: logoColors.primaryBlue },
    { title: 'Browse Characters', icon: Star, path: '/characters', color: logoColors.primaryYellow },
    { title: 'Community Hub', icon: Globe, path: '/community', color: logoColors.secondaryBlue },
    { title: 'Profile Settings', icon: Settings, path: '/profile', color: logoColors.primaryOrange }
  ];

  return (
    <div className="min-h-screen" style={{ background: logoColors.backgroundGradient }}>
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, <span style={{ color: logoColors.primaryYellow }}>{user?.username}</span>!
          </h1>
          <p className="text-gray-300">Ready to build your ultimate team?</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="backdrop-blur-lg text-white border" style={{ 
            backgroundColor: logoColors.blackAlpha(0.3),
            borderColor: logoColors.primaryBlueAlpha(0.2)
          }}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" 
                     style={{ backgroundColor: logoColors.primaryBlueAlpha(0.2) }}>
                  <Users className="h-6 w-6" style={{ color: logoColors.primaryBlue }} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{stats.teamsCreated}</div>
                  <div className="text-sm text-gray-300">Teams Created</div>
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
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" 
                     style={{ backgroundColor: logoColors.primaryBlueAlpha(0.2) }}>
                  <Trophy className="h-6 w-6" style={{ color: logoColors.primaryYellow }} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{stats.totalMatches}</div>
                  <div className="text-sm text-gray-300">Total Matches</div>
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
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" 
                     style={{ backgroundColor: logoColors.primaryBlueAlpha(0.2) }}>
                  <TrendingUp className="h-6 w-6" style={{ color: logoColors.secondaryBlue }} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{stats.winRate}%</div>
                  <div className="text-sm text-gray-300">Win Rate</div>
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
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" 
                     style={{ backgroundColor: logoColors.primaryBlueAlpha(0.2) }}>
                  <Award className="h-6 w-6" style={{ color: logoColors.primaryOrange }} />
                </div>
                <div>
                  <div className="text-lg font-bold text-white">{stats.currentRank}</div>
                  <div className="text-sm text-gray-300">Current Rank</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card className="backdrop-blur-lg text-white border" style={{ 
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
                <div className="grid grid-cols-2 gap-4">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <Button
                        key={index}
                        onClick={() => navigate(action.path)}
                        className="h-20 flex flex-col items-center justify-center gap-2 text-white hover:opacity-80 border"
                        style={{ 
                          backgroundColor: logoColors.blackAlpha(0.3),
                          borderColor: logoColors.primaryBlueAlpha(0.3)
                        }}
                      >
                        <Icon className="h-6 w-6" style={{ color: action.color }} />
                        <span className="text-sm font-medium">{action.title}</span>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Weekly Progress */}
            <Card className="mt-6 backdrop-blur-lg text-white border" style={{ 
              backgroundColor: logoColors.blackAlpha(0.3),
              borderColor: logoColors.primaryBlueAlpha(0.2)
            }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" style={{ color: logoColors.primaryYellow }} />
                  Weekly Goal Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Teams Built This Week</span>
                    <span className="font-bold">{stats.weeklyProgress}/{stats.weeklyGoal}</span>
                  </div>
                  <div className="w-full rounded-full h-2" style={{ backgroundColor: logoColors.blackAlpha(0.5) }}>
                    <div 
                      className="h-2 rounded-full transition-all duration-300" 
                      style={{ 
                        background: logoColors.yellowOrangeGradient,
                        width: `${(stats.weeklyProgress / stats.weeklyGoal) * 100}%` 
                      }}
                    />
                  </div>
                  <p className="text-sm text-gray-400">
                    {stats.weeklyGoal - stats.weeklyProgress} more teams to reach your weekly goal!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card className="backdrop-blur-lg text-white border" style={{ 
              backgroundColor: logoColors.blackAlpha(0.3),
              borderColor: logoColors.primaryBlueAlpha(0.2)
            }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" style={{ color: logoColors.primaryBlue }} />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full mt-2" 
                           style={{ backgroundColor: logoColors.primaryYellow }} />
                      <div>
                        <div className="text-sm font-medium text-white">
                          {activity.action}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {activity.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;