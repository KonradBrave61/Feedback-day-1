import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Home, Users, User, Settings, Trophy, Target, LogOut, UserCircle, LayoutDashboard, MessageSquare, UserPlus, Globe, Stars, Menu, X, Package, Zap, HelpCircle, Headphones } from 'lucide-react';
import { logoColors, componentColors } from '../styles/colors';

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
    <>
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

            {/* Desktop Navigation Items - REMOVED since everything is in hamburger menu */}

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
                    <div className="text-xs text-orange-300">Techniques {user.coach_level || 1}</div>
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

          {/* Mobile Navigation - Simplified */}
          <div className="md:hidden mt-4">
            <div className="text-center">
              <Button
                variant="ghost"
                size="sm"
                className="text-orange-300 hover:bg-orange-700/30"
                onClick={() => setShowHamburgerMenu(!showHamburgerMenu)}
              >
                {showHamburgerMenu ? 'Close Menu' : 'Open Menu'}
              </Button>
            </div>
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

      {/* Hamburger Menu Dropdown - Full Height Overlay - MOVED OUTSIDE CONTAINER */}
      {showHamburgerMenu && (
        <div className="fixed inset-0 z-[9999]">
          {/* Background Overlay */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowHamburgerMenu(false)} />
          
          {/* Sidebar Menu */}
          <div className="absolute left-0 top-0 h-full w-80 bg-gradient-to-b from-orange-900 via-red-900 to-orange-900 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-orange-400/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Menu</h2>
                  <p className="text-xs text-orange-300">Navigation</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-orange-700/30 p-2"
                onClick={() => setShowHamburgerMenu(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Menu Items */}
            <div className="flex flex-col h-[calc(100%-5rem)] overflow-y-auto">
              <div className="flex flex-col space-y-1 p-4">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.path}
                      variant={isActive(item.path) ? "default" : "ghost"}
                      className={`flex items-center gap-4 justify-start w-full h-14 text-left px-4 ${
                        isActive(item.path) 
                          ? 'bg-orange-600 text-white hover:bg-orange-700 border-l-4 border-orange-400' 
                          : 'text-white hover:bg-orange-700/30 hover:border-l-4 hover:border-orange-400/50'
                      }`}
                      onClick={() => {
                        navigate(item.path);
                        setShowHamburgerMenu(false);
                      }}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span className="font-medium">{item.label}</span>
                    </Button>
                  );
                })}
              </div>
              
              {/* Bottom Section */}
              <div className="mt-auto p-4 border-t border-orange-400/20">
                {user ? (
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <UserCircle className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-sm font-medium text-white">{user.username}</div>
                    <div className="text-xs text-orange-300">Techniques {user.coach_level || 1}</div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 text-red-400 hover:bg-red-700/30 w-full"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => {
                      navigate('/login');
                      setShowHamburgerMenu(false);
                    }}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;