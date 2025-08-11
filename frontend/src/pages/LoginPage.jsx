import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { User, Mail, Lock, Trophy, UserPlus, LogIn, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { logoColors, componentColors } from '../styles/colors';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    rememberMe: true
  });
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!isLogin && formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      let result;
      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        result = await register(formData.username, formData.email, formData.password);
      }

      if (result.success) {
        toast.success(isLogin ? 'Welcome back!' : 'Account created successfully!');
        navigate('/');
      } else {
        toast.error(result.error || 'Authentication failed');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: logoColors.backgroundGradient }}>
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 text-white hover:bg-blue-700/30"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Home
      </Button>
      
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" 
               style={{ background: logoColors.yellowOrangeGradient }}>
            <Trophy className="h-8 w-8 text-black" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Inazuma Eleven
          </h1>
          <p className="text-sm" style={{ color: logoColors.lightBlue }}>
            Victory Road
          </p>
        </div>

        {/* Login/Register Card */}
        <Card className="backdrop-blur-lg text-white border shadow-2xl" style={{ 
          backgroundColor: logoColors.blackAlpha(0.4),
          borderColor: logoColors.primaryBlueAlpha(0.3)
        }}>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              {isLogin ? 'Welcome Back' : 'Join the Team'}
            </CardTitle>
            <p className="text-gray-300">
              {isLogin 
                ? 'Sign in to continue your football journey' 
                : 'Create your account to start building teams'
              }
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-sm font-medium" style={{ color: logoColors.lightBlue }}>
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" 
                          style={{ color: logoColors.primaryBlue }} />
                    <Input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Enter your username"
                      className="pl-10 text-white border focus:ring-2"
                      style={{ 
                        backgroundColor: logoColors.blackAlpha(0.5),
                        borderColor: logoColors.primaryBlueAlpha(0.3),
                        focusRingColor: logoColors.secondaryBlue
                      }}
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: logoColors.lightBlue }}>
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" 
                        style={{ color: logoColors.primaryBlue }} />
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="pl-10 text-white border focus:ring-2"
                    style={{ 
                      backgroundColor: logoColors.blackAlpha(0.5),
                      borderColor: logoColors.primaryBlueAlpha(0.3),
                      focusRingColor: logoColors.secondaryBlue
                    }}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: logoColors.lightBlue }}>
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" 
                        style={{ color: logoColors.primaryBlue }} />
                  <Input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="pl-10 text-white border focus:ring-2"
                    style={{ 
                      backgroundColor: logoColors.blackAlpha(0.5),
                      borderColor: logoColors.primaryBlueAlpha(0.3),
                      focusRingColor: logoColors.secondaryBlue
                    }}
                    required
                  />
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-sm font-medium" style={{ color: logoColors.lightBlue }}>
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" 
                          style={{ color: logoColors.primaryBlue }} />
                    <Input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      className="pl-10 text-white border focus:ring-2"
                      style={{ 
                        backgroundColor: logoColors.blackAlpha(0.5),
                        borderColor: logoColors.primaryBlueAlpha(0.3),
                        focusRingColor: logoColors.secondaryBlue
                      }}
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full text-black font-bold hover:opacity-80 disabled:opacity-50"
                style={{ background: logoColors.yellowOrangeGradient }}
              >
                {loading ? (
                  'Processing...'
                ) : isLogin ? (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create Account
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm hover:opacity-80 underline"
                style={{ color: logoColors.lightBlue }}
              >
                {isLogin 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Sign in"
                }
              </button>
            </div>

            {/* Demo Account */}
            <div className="mt-4 p-3 rounded-lg border" style={{ 
              backgroundColor: logoColors.primaryBlueAlpha(0.1),
              borderColor: logoColors.primaryBlueAlpha(0.3)
            }}>
              <p className="text-xs text-center mb-2" style={{ color: logoColors.lightBlue }}>
                Demo Account
              </p>
              <p className="text-xs text-center text-gray-300">
                Email: demo@inazuma.com | Password: demo123
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;