import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Home, Users, User, Settings, Trophy, Target, LogOut, UserCircle, LayoutDashboard, MessageSquare, UserPlus, Globe, Stars, Menu, X, Package, Zap, HelpCircle, Headphones, GitBranch } from 'lucide-react';
import { logoColors, componentColors } from '../styles/colors';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    
    { path: '/team-builder', label: 'Team Builder', icon: Users },
    { path: '/characters', label: 'Characters', icon: User },
    { path: '/constellations', label: 'Constellations', icon: Stars },
    { path: '/community', label: 'Community Hub', icon: MessageSquare },
    { path: '/items', label: 'Items', icon: Package },
    { path: '/techniques', label: 'Techniques', icon: Zap },
    { path: '/ability-tree', label: 'Ability Tree', icon: GitBranch },
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
      <nav className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 shadow-lg backdrop-blur-lg border-b border-blue-400/20" style={{ background: logoColors.backgroundGradient }}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Hamburger Menu + Logo */}
            <div className="flex items-center gap-4">
              {/* Hamburger Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-blue-700/30 p-2"
                onClick={() => setShowHamburgerMenu(!showHamburgerMenu)}
              >
                {showHamburgerMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              
              {/* Logo */}
              <div 
                className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => navigate('/')}
              >
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: logoColors.yellowOrangeGradient }}>
                  <Trophy className="h-6 w-6 text-black" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Inazuma Eleven</h1>
                  <p className="text-sm" style={{ color: logoColors.lightBlue }}>Victory Road</p>
                </div>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-blue-700/30"
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
                    <div className="text-xs" style={{ color: logoColors.lightBlue }}>Techniques {user.coach_level || 1}</div>
                  </div>
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                    style={{ background: logoColors.yellowOrangeGradient }}
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                  >
                    <UserCircle className="h-5 w-5 text-black" />
                  </div>
                  
                  {/* Profile Dropdown */}
                  {showProfileMenu && (
                    <div className="absolute top-full right-0 mt-2 w-48 rounded-lg shadow-lg z-50" style={{ 
                      backgroundColor: logoColors.blackAlpha(0.9), 
                      border: `1px solid ${logoColors.primaryBlueAlpha(0.3)}` 
                    }}>
                      <div className="p-2">
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-white hover:bg-blue-700/30"
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
                  style={{ background: logoColors.yellowOrangeGradient }}
                  className="text-black hover:opacity-80"
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
                className="hover:bg-blue-700/30"
                style={{ color: logoColors.lightBlue }}
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
          <div className="absolute left-0 top-0 h-full w-80 shadow-2xl" style={{ background: `linear-gradient(180deg, ${logoColors.backgroundGradient}, ${logoColors.blackAlpha(0.9)})` }}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: logoColors.primaryBlueAlpha(0.2) }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: logoColors.yellowOrangeGradient }}>
                  <Trophy className="h-5 w-5 text-black" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Menu</h2>
                  <p className="text-xs" style={{ color: logoColors.lightBlue }}>Navigation</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-blue-700/30 p-2"
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
                          ? 'text-white hover:opacity-80 border-l-4' 
                          : 'text-white hover:border-l-4 hover:bg-blue-900/20'
                      }`}
                      style={isActive(item.path) ? {
                        background: logoColors.blueGradient,
                        borderLeftColor: logoColors.primaryYellow
                      } : {
                        borderLeftColor: `${logoColors.primaryBlueAlpha(0.5)}`
                      }}
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
              <div className="mt-auto p-4 border-t" style={{ borderColor: logoColors.primaryBlueAlpha(0.2) }}>
                {user ? (
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2" style={{ background: logoColors.yellowOrangeGradient }}>
                      <UserCircle className="h-6 w-6 text-black" />
                    </div>
                    <div className="text-sm font-medium text-white">{user.username}</div>
                    <div className="text-xs" style={{ color: logoColors.lightBlue }}>Techniques {user.coach_level || 1}</div>
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
                    className="w-full text-black hover:opacity-80"
                    style={{ background: logoColors.yellowOrangeGradient }}
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