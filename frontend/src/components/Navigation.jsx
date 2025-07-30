import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Home, Users, User, Settings, Trophy, Target, LogOut, UserCircle, LayoutDashboard, MessageSquare, UserPlus, Globe, Stars, Menu, X, Package, Zap, HelpCircle, Headphones } from 'lucide-react';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/team-builder', label: 'Team Builder', icon: Users },
    { path: '/characters', label: 'Characters', icon: User },
    { path: '/constellations', label: 'Constellations', icon: Stars },
    { path: '/community', label: 'Community Hub', icon: MessageSquare },
    { path: '/items', label: 'Items', icon: Package },
    { path: '/techniques', label: 'Techniques', icon: Zap },
    { path: '/helper', label: 'Helper', icon: HelpCircle },
    { path: '/support', label: 'Support', icon: Headphones },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowProfileMenu(false);
  };

  return (
    <nav className="bg-gradient-to-r from-orange-900 via-red-800 to-orange-900 shadow-lg backdrop-blur-lg border-b border-orange-400/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Hamburger Menu + Logo */}
          <div className="flex items-center gap-4">
            {/* Hamburger Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-orange-700/30 p-2"
              onClick={() => setShowHamburgerMenu(!showHamburgerMenu)}
            >
              {showHamburgerMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            
            {/* Logo */}
            <div 
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate('/')}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Inazuma Eleven</h1>
                <p className="text-sm text-orange-300">Victory Road</p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Items (hidden on mobile) */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.slice(0, 6).map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.path}
                  variant={isActive(item.path) ? "default" : "ghost"}
                  className={`flex items-center gap-2 ${
                    isActive(item.path) 
                      ? 'bg-orange-600 text-white hover:bg-orange-700' 
                      : 'text-white hover:bg-orange-700/30'
                  }`}
                  onClick={() => navigate(item.path)}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-orange-700/30"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>

          {/* User Profile */}
          <div className="hidden lg:flex items-center gap-3 relative">
            {user ? (
              <>
                <div className="text-right">
                  <div className="text-sm font-medium text-white">{user.username}</div>
                  <div className="text-xs text-orange-300">Coach Level {user.coach_level || 1}</div>
                </div>
                <div 
                  className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                  <UserCircle className="h-5 w-5 text-white" />
                </div>
                
                {/* Profile Dropdown */}
                {showProfileMenu && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-orange-900 border border-orange-400/30 rounded-lg shadow-lg z-50">
                    <div className="p-2">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-white hover:bg-orange-700/30"
                        onClick={() => {
                          navigate('/dashboard');
                          setShowProfileMenu(false);
                        }}
                      >
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Dashboard
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-white hover:bg-orange-700/30"
                        onClick={() => {
                          navigate('/profile');
                          setShowProfileMenu(false);
                        }}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-red-400 hover:bg-red-700/30"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Button
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                <User className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden mt-4 flex flex-wrap gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.path}
                variant={isActive(item.path) ? "default" : "ghost"}
                size="sm"
                className={`flex items-center gap-2 ${
                  isActive(item.path) 
                    ? 'bg-orange-600 text-white hover:bg-orange-700' 
                    : 'text-white hover:bg-orange-700/30'
                }`}
                onClick={() => navigate(item.path)}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Button>
            );
          })}
          
          {/* Mobile Profile Button */}
          {user ? (
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-orange-700/30"
              onClick={() => navigate('/dashboard')}
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-orange-700/30"
              onClick={() => navigate('/login')}
            >
              <User className="h-4 w-4 mr-2" />
              Sign In
            </Button>
          )}
        </div>
      </div>
      
      {/* Click outside to close profile menu */}
      {showProfileMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowProfileMenu(false)}
        />
      )}
    </nav>
  );
};

export default Navigation;