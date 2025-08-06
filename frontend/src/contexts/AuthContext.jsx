import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setUser({ ...JSON.parse(storedUser), token: storedToken });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      const userWithToken = { ...data.user, token: data.access_token };
      setUser(userWithToken);
      localStorage.setItem('authToken', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return { success: true, user: userWithToken };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const register = async (username, email, password) => {
    try {
      const userData = {
        username,
        email, 
        password,
        coach_level: 1,
        favorite_position: "MF",
        favorite_element: "Fire",
        favourite_team: "Default Team",
        bio: "",
        kizuna_stars: 50
      };

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }

      const data = await response.json();
      const userWithToken = { ...data.user, token: data.access_token };
      setUser(userWithToken);
      localStorage.setItem('authToken', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return { success: true, user: userWithToken };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  };

  const updateProfile = async (profileData) => {
    try {
      const token = localStorage.getItem('authToken') || user?.token;
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error('Profile update failed');
      }

      const updatedUser = await response.json();
      const userWithToken = { ...updatedUser, token: token };
      setUser(userWithToken);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return { success: true, user: userWithToken };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: error.message };
    }
  };

  const saveTeam = async (teamData) => {
    try {
      const token = localStorage.getItem('authToken') || user?.token;
      if (!token) {
        console.error('SaveTeam: No authentication token found');
        throw new Error('No authentication token found. Please log in again.');
      }

      console.log('SaveTeam: Sending team data:', {
        name: teamData.name,
        playersCount: teamData.players?.length || 0,
        benchCount: teamData.bench?.length || 0
      });

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(teamData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('SaveTeam: API error response:', {
          status: response.status,
          statusText: response.statusText,
          data: errorData
        });
        throw new Error(`Team save failed: ${response.status} ${response.statusText}`);
      }

      const savedTeam = await response.json();
      console.log('SaveTeam: Successfully saved team:', savedTeam.id);
      return { success: true, team: savedTeam };
    } catch (error) {
      console.error('SaveTeam: Full error details:', error);
      return { success: false, error: error.message };
    }
  };

  const updateTeam = async (teamId, teamData) => {
    try {
      const token = localStorage.getItem('authToken') || user?.token;
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/teams/${teamId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(teamData),
      });

      if (!response.ok) {
        throw new Error('Team update failed');
      }

      const updatedTeam = await response.json();
      return { success: true, team: updatedTeam };
    } catch (error) {
      console.error('Team update error:', error);
      return { success: false, error: error.message };
    }
  };

  const deleteTeam = async (teamId) => {
    try {
      const token = localStorage.getItem('authToken') || user?.token;
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/teams/${teamId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Team deletion failed');
      }

      return { success: true };
    } catch (error) {
      console.error('Team deletion error:', error);
      return { success: false, error: error.message };
    }
  };

  const loadTeams = async () => {
    try {
      const token = localStorage.getItem('authToken') || user?.token;
      if (!token) {
        console.error('LoadTeams: No authentication token found');
        throw new Error('No authentication token found. Please log in again.');
      }

      console.log('LoadTeams: Fetching user teams...');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/teams`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('LoadTeams: API error response:', {
          status: response.status,
          statusText: response.statusText,
          data: errorData
        });
        if (response.status === 401 || response.status === 403) {
          throw new Error('Authentication failed. Please log in again.');
        }
        throw new Error(`Failed to load teams: ${response.status} ${response.statusText}`);
      }

      const teams = await response.json();
      console.log('LoadTeams: Successfully loaded teams:', teams.length);
      return { success: true, teams };
    } catch (error) {
      console.error('LoadTeams: Full error details:', error);
      return { success: false, error: error.message };
    }
  };

  const loadCommunityTeams = async (filters = {}) => {
    try {
      const token = localStorage.getItem('authToken') || user?.token;
      if (!token) {
        throw new Error('No authentication token found');
      }

      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.formation) params.append('formation', filters.formation);
      if (filters.sort_by) params.append('sort_by', filters.sort_by);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.offset) params.append('offset', filters.offset);

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/community/teams?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Community teams load failed');
      }

      const teams = await response.json();
      return { success: true, teams };
    } catch (error) {
      console.error('Community teams load error:', error);
      return { success: false, error: error.message };
    }
  };

  const likeTeam = async (teamId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/teams/${teamId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Like action failed');
      }

      const result = await response.json();
      return { success: true, liked: result.liked };
    } catch (error) {
      console.error('Like action error:', error);
      return { success: false, error: error.message };
    }
  };

  const commentOnTeam = async (teamId, content) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/teams/${teamId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error('Comment action failed');
      }

      const result = await response.json();
      return { success: true, comment: result.comment };
    } catch (error) {
      console.error('Comment action error:', error);
      return { success: false, error: error.message };
    }
  };

  const followUser = async (userId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/community/follow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!response.ok) {
        throw new Error('Follow action failed');
      }

      const result = await response.json();
      return { success: true, following: result.following };
    } catch (error) {
      console.error('Follow action error:', error);
      return { success: false, error: error.message };
    }
  };

  const loadFeaturedContent = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/community/featured`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Featured content load failed');
      }

      const data = await response.json();
      return { success: true, ...data };
    } catch (error) {
      console.error('Featured content load error:', error);
      return { success: false, error: error.message };
    }
  };

  const loadCommunityStats = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/community/stats`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Community stats load failed');
      }

      const data = await response.json();
      return { success: true, stats: data };
    } catch (error) {
      console.error('Community stats load error:', error);
      return { success: false, error: error.message };
    }
  };

  const loadFollowers = async (userId = null) => {
    try {
      const endpoint = userId 
        ? `/api/community/users/${userId}/followers` 
        : `/api/community/followers`;
      
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Followers load failed');
      }

      const data = await response.json();
      return { success: true, followers: data.followers };
    } catch (error) {
      console.error('Followers load error:', error);
      return { success: false, error: error.message };
    }
  };

  const loadFollowing = async (userId = null) => {
    try {
      const endpoint = userId 
        ? `/api/community/users/${userId}/following` 
        : `/api/community/following`;
      
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Following load failed');
      }

      const data = await response.json();
      return { success: true, following: data.following };
    } catch (error) {
      console.error('Following load error:', error);
      return { success: false, error: error.message };
    }
  };

  const loadSaveSlots = async () => {
    try {
      const token = localStorage.getItem('authToken') || user?.token;
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/save-slots`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Save slots load failed');
      }

      const data = await response.json();
      return { success: true, saveSlots: data.save_slots };
    } catch (error) {
      console.error('Save slots load error:', error);
      return { success: false, error: error.message };
    }
  };

  const createSaveSlot = async (slotData) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/save-slots`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify(slotData),
      });

      if (!response.ok) {
        throw new Error('Save slot creation failed');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Save slot creation error:', error);
      return { success: false, error: error.message };
    }
  };

  const clearSaveSlot = async (slotNumber) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/save-slots/${slotNumber}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Save slot clearing failed');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Save slot clearing error:', error);
      return { success: false, error: error.message };
    }
  };

  const rateTeam = async (teamId, ratingData) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/teams/${teamId}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify(ratingData),
      });

      if (!response.ok) {
        throw new Error('Team rating failed');
      }

      const data = await response.json();
      return { success: true, rating: data.rating };
    } catch (error) {
      console.error('Team rating error:', error);
      return { success: false, error: error.message };
    }
  };

  const loadTeamDetails = async (teamId) => {
    try {
      const token = localStorage.getItem('authToken') || user?.token;
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/teams/${teamId}/details`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Team details load failed');
      }

      const data = await response.json();
      return { success: true, ...data };
    } catch (error) {
      console.error('Team details load error:', error);
      return { success: false, error: error.message };
    }
  };

  const loadPublicTeamDetails = async (teamId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/teams/${teamId}/public`);

      if (!response.ok) {
        throw new Error('Public team details load failed');
      }

      const data = await response.json();
      return { success: true, ...data };
    } catch (error) {
      console.error('Public team details load error:', error);
      return { success: false, error: error.message };
    }
  };

  const saveTeamToSlot = async (teamId, slotData) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/teams/${teamId}/save-to-slot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify(slotData),
      });

      if (!response.ok) {
        throw new Error('Team save to slot failed');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Team save to slot error:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    saveTeam,
    updateTeam,
    deleteTeam,
    loadTeams,
    loadCommunityTeams,
    likeTeam,
    commentOnTeam,
    followUser,
    loadFeaturedContent,
    loadCommunityStats,
    loadFollowers,
    loadFollowing,
    loadSaveSlots,
    createSaveSlot,
    clearSaveSlot,
    rateTeam,
    loadTeamDetails,
    loadPublicTeamDetails,
    saveTeamToSlot,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};