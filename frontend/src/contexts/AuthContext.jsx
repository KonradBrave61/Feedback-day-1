import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { showNotification, showSessionExpiredNotification } from '../components/Notification';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const refreshTimerRef = useRef(null);

  const backendUrl = process.env.REACT_APP_BACKEND_URL; // All endpoints must use /api prefix per ingress rules

  const scheduleProactiveRefresh = (accessToken) => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    const payload = parseJwt(accessToken);
    if (!payload || !payload.exp) return;
    const expMs = payload.exp * 1000;
    // Refresh 5 minutes before expiry, but not sooner than in 15 seconds
    const refreshAt = Math.max(15000, expMs - Date.now() - 5 * 60 * 1000);
    refreshTimerRef.current = setTimeout(async () => {
      try {
        const ok = await refreshAccessToken();
        if (ok) {
          // Reschedule with new token
          const newToken = localStorage.getItem('authToken');
          if (newToken) scheduleProactiveRefresh(newToken);
        }
      } catch (e) {
        // Fail silently; request path will handle auth errors
      }
    }, refreshAt);
  };

  useEffect(() => {
    // Load user from storage
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      const u = { ...JSON.parse(storedUser), token: storedToken };
      setUser(u);
      scheduleProactiveRefresh(storedToken);
    }
    setLoading(false);

    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, []);

  const refreshAccessToken = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include'
      });
      if (!res.ok) return false;
      const data = await res.json();
      if (data && data.access_token) {
        localStorage.setItem('authToken', data.access_token);
        setUser(prev => prev ? { ...prev, token: data.access_token } : prev);
        scheduleProactiveRefresh(data.access_token);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const login = async (email, password, rememberMe = true) => {
    try {
      const response = await fetch(`${backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, remember_me: rememberMe }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      const userWithToken = { ...data.user, token: data.access_token };
      setUser(userWithToken);
      localStorage.setItem('authToken', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      scheduleProactiveRefresh(data.access_token);
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

      const response = await fetch(`${backendUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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
      scheduleProactiveRefresh(data.access_token);
      return { success: true, user: userWithToken };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await fetch(`${backendUrl}/api/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch (_) {}
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
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

      const response = await fetch(`${backendUrl}/api/auth/profile`, {
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

  // Core fetch with silent refresh + retry
  const makeAuthenticatedRequest = async (url, options = {}) => {
    const attempt = async () => {
      const token = localStorage.getItem('authToken') || user?.token;
      if (!token) {
        handleAuthenticationError('No authentication token found');
        throw new Error('Session expired. Please log in again.');
      }
      return await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
        },
        // Keep default credentials for same-origin; no cookie needed except for refresh
      });
    };

    let response = await attempt();
    if (response.status === 401 || response.status === 403) {
      // Try to refresh once silently
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        response = await attempt();
      }
      if (response.status === 401 || response.status === 403) {
        handleAuthenticationError(`Authentication failed: ${response.status} ${response.statusText}`);
        throw new Error('Session expired. Please log in again.');
      }
    }
    return response;
  };

  const handleAuthenticationError = (error) => {
    console.error('Authentication error detected:', error);
    showSessionExpiredNotification();
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  };

  const saveTeam = async (teamData) => {
    try {
      const token = localStorage.getItem('authToken') || user?.token;
      if (!token) {
        console.error('SaveTeam: No authentication token found');
        throw new Error('No authentication token found. Please log in again.');
      }

      const response = await fetch(`${backendUrl}/api/teams`, {
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
      const teamObject = savedTeam?.team || savedTeam;
      return { success: true, team: teamObject };
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

      const response = await fetch(`${backendUrl}/api/teams/${teamId}`, {
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

      const response = await fetch(`${backendUrl}/api/teams/${teamId}`, {
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
      const response = await makeAuthenticatedRequest(`${backendUrl}/api/teams`);
      if (!response.ok) {
        const errorData = await response.text();
        console.error('LoadTeams: API error response:', {
          status: response.status,
          statusText: response.statusText,
          data: errorData
        });
        throw new Error(`Failed to load teams: ${response.status} ${response.statusText}`);
      }
      const teams = await response.json();
      return { success: true, teams };
    } catch (error) {
      console.error('LoadTeams: Full error details:', error);
      if (error.message.includes('Session expired')) {
        return { success: false, error: error.message, authError: true };
      }
      return { success: false, error: error.message };
    }
  };

  const loadCommunityTeams = async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.formation) params.append('formation', filters.formation);
      if (filters.sort_by) params.append('sort_by', filters.sort_by);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.offset) params.append('offset', filters.offset);

      const response = await makeAuthenticatedRequest(`${backendUrl}/api/community/teams?${params}`);
      if (!response.ok) {
        throw new Error('Community teams load failed');
      }
      const teams = await response.json();
      return { success: true, teams };
    } catch (error) {
      console.error('Community teams load error:', error);
      if (error.message.includes('Session expired')) {
        return { success: false, error: error.message, authError: true };
      }
      return { success: false, error: error.message };
    }
  };

  const likeTeam = async (teamId) => {
    try {
      const response = await makeAuthenticatedRequest(`${backendUrl}/api/teams/${teamId}/like`, { method: 'POST' });
      if (!response.ok) {
        throw new Error('Like action failed');
      }
      const result = await response.json();
      return { success: true, liked: result.liked };
    } catch (error) {
      console.error('Like action error:', error);
      if (error.message.includes('Session expired')) {
        return { success: false, error: error.message, authError: true };
      }
      return { success: false, error: error.message };
    }
  };

  const commentOnTeam = async (teamId, content, parentId = null) => {
    try {
      const response = await makeAuthenticatedRequest(`${backendUrl}/api/teams/${teamId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parentId ? { content, parent_id: parentId } : { content }),
      });
      if (!response.ok) {
        throw new Error('Comment action failed');
      }
      const result = await response.json();
      return { success: true, comment: result.comment };
    } catch (error) {
      console.error('Comment action error:', error);
      if (error.message.includes('Session expired')) {
        return { success: false, error: error.message, authError: true };
      }
      return { success: false, error: error.message };
    }
  };

  const followUser = async (userId) => {
    try {
      const response = await fetch(`${backendUrl}/api/community/follow`, {
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
      const response = await fetch(`${backendUrl}/api/community/featured`, {
        headers: { 'Authorization': `Bearer ${user.token}` },
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
      const response = await fetch(`${backendUrl}/api/community/stats`, {
        headers: { 'Authorization': `Bearer ${user.token}` },
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
      const endpoint = userId ? `/api/community/users/${userId}/followers` : `/api/community/followers`;
      const response = await fetch(`${backendUrl}${endpoint}`, {
        headers: { 'Authorization': `Bearer ${user.token}` },
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
      const endpoint = userId ? `/api/community/users/${userId}/following` : `/api/community/following`;
      const response = await fetch(`${backendUrl}${endpoint}`, {
        headers: { 'Authorization': `Bearer ${user.token}` },
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
      const response = await makeAuthenticatedRequest(`${backendUrl}/api/save-slots`);
      if (!response.ok) {
        const errorData = await response.text();
        console.error('LoadSaveSlots: API error response:', {
          status: response.status,
          statusText: response.statusText,
          data: errorData
        });
        throw new Error(`Failed to load save slots: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      return { success: true, saveSlots: data.save_slots || [] };
    } catch (error) {
      console.error('LoadSaveSlots: Full error details:', error);
      if (error.message.includes('Session expired')) {
        return { success: false, error: error.message, authError: true };
      }
      return { success: false, error: error.message };
    }
  };

  const createSaveSlot = async (slotData) => {
    try {
      const response = await fetch(`${backendUrl}/api/save-slots`, {
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
      const response = await fetch(`${backendUrl}/api/save-slots/${slotNumber}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` },
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
      const response = await fetch(`${backendUrl}/api/teams/${teamId}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}` },
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

  // Explicit view endpoint to increment views deterministically
  const viewTeam = async (teamId) => {
    try {
      const response = await makeAuthenticatedRequest(`${backendUrl}/api/teams/${teamId}/view`);
      if (!response.ok) {
        return { success: false };
      }
      const data = await response.json();
      return { success: true, team: data };
    } catch (error) {
      return { success: false };
    }
  };

  const loadTeamDetails = async (teamId) => {
    try {
      const response = await makeAuthenticatedRequest(`${backendUrl}/api/teams/${teamId}/details`);
      if (!response.ok) {
        const errorData = await response.text();
        console.error('LoadTeamDetails: API error response:', {
          status: response.status,
          statusText: response.statusText,
          data: errorData
        });
        throw new Error(`Failed to load team details: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      return { success: true, ...data };
    } catch (error) {
      console.error('LoadTeamDetails: Full error details:', error);
      if (error.message.includes('Session expired')) {
        return { success: false, error: error.message, authError: true };
      }
      return { success: false, error: error.message };
    }
  };

  const loadPublicTeamDetails = async (teamId) => {
    try {
      const response = await fetch(`${backendUrl}/api/teams/${teamId}/public`);
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
      const response = await fetch(`${backendUrl}/api/teams/${teamId}/save-to-slot`, {
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
    viewTeam,
    loadTeamDetails,
    loadPublicTeamDetails,
    saveTeamToSlot,
    saveTeamToSlot,
    // Characters API
    loadCharacters: async (filters = {}) => {
      try {
        const params = new URLSearchParams();
        if (filters.position) params.append('position', filters.position);
        if (filters.element) params.append('element', filters.element);
        if (filters.search) params.append('search', filters.search);
        if (filters.limit) params.append('limit', String(filters.limit));
        const response = await makeAuthenticatedRequest(`${backendUrl}/api/characters?${params.toString()}`);
        if (!response.ok) return { success: false };
        const data = await response.json();
        return { success: true, characters: data };
      } catch (e) {
        console.error('Load characters error', e);
        return { success: false };
      }
    },
    // Characters detail by ID
    loadCharacter: async (characterId) => {
      try {
        const response = await makeAuthenticatedRequest(`${backendUrl}/api/characters/${characterId}`);
        if (!response.ok) return { success: false };
        const data = await response.json();
        return { success: true, character: data };
      } catch (e) {
        console.error('Load character error', e);
        return { success: false };
      }
    },
    // Chat APIs
    startConversation: async (partnerId) => {
      try {
        const url = `${backendUrl}/api/chat/start?partner_id=${encodeURIComponent(partnerId)}`;
        const response = await makeAuthenticatedRequest(url, {
          method: 'POST'
        });
        if (!response.ok) return { success: false };
        const data = await response.json();
        return data;
      } catch (e) { return { success: false }; }
    },
    listConversations: async () => {
      try {
        const response = await makeAuthenticatedRequest(`${backendUrl}/api/chat/conversations`);
        if (!response.ok) return { success: false };
        return await response.json();
      } catch (e) { return { success: false }; }
    },
    getMessages: async (conversationId, after = null) => {
      try {
        const params = new URLSearchParams();
        if (after) params.append('after', after);
        const response = await makeAuthenticatedRequest(`${backendUrl}/api/chat/conversations/${conversationId}/messages?${params}`);
        if (!response.ok) return { success: false };
        return await response.json();
      } catch (e) { return { success: false }; }
    },
    sendMessage: async (conversationId, content) => {
      try {
        const response = await makeAuthenticatedRequest(`${backendUrl}/api/chat/conversations/${conversationId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content }),
        });
        if (!response.ok) return { success: false };
        return await response.json();
      } catch (e) { return { success: false }; }
    },
    blockUser: async (userId) => {
      try {
        const response = await makeAuthenticatedRequest(`${backendUrl}/api/chat/block`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId }),
        });
        if (!response.ok) return { success: false };
        return await response.json();
      } catch (e) { return { success: false }; }
    },
    unblockUser: async (userId) => {
      try {
        const response = await makeAuthenticatedRequest(`${backendUrl}/api/chat/unblock`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId }),
        });
        if (!response.ok) return { success: false };
        return await response.json();
      } catch (e) { return { success: false }; }
    },
    getChatSettings: async () => {
      try {
        const response = await makeAuthenticatedRequest(`${backendUrl}/api/chat/settings`);
        if (!response.ok) return { success: false };
        return await response.json();
      } catch (e) { return { success: false }; }
    },
    updateChatSettings: async (settings) => {
      try {
        const response = await makeAuthenticatedRequest(`${backendUrl}/api/chat/settings`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settings),
        });
        if (!response.ok) return { success: false };
        return await response.json();
      } catch (e) { return { success: false }; }
    },
    // Techniques API
    loadTechniques: async (filters = {}) => {
      try {
        const params = new URLSearchParams();
        if (filters.technique_type) params.append('technique_type', filters.technique_type);
        if (filters.category) params.append('category', filters.category);
        if (filters.element) params.append('element', filters.element);
        if (filters.search) params.append('search', filters.search);
        const response = await makeAuthenticatedRequest(`${backendUrl}/api/techniques?${params.toString()}`);
        if (!response.ok) return { success: false };
        const data = await response.json();
        return { success: true, techniques: data };
      } catch (e) {
        console.error('Load techniques error', e);
        return { success: false };
      }
    },
    // Coaches API
    loadCoaches: async () => {
      try {
        const response = await makeAuthenticatedRequest(`${backendUrl}/api/teams/coaches/`);
        if (!response.ok) return { success: false };
        const data = await response.json();
        return { success: true, coaches: data };
      } catch (e) {
        console.error('Load coaches error', e);
        return { success: false };
      }
    },
    // Equipment API
    loadEquipment: async (filters = {}) => {
      try {
        const params = new URLSearchParams();
        if (filters.category) params.append('category', filters.category);
        if (filters.rarity) params.append('rarity', filters.rarity);
        if (filters.search) params.append('search', filters.search);
        const response = await makeAuthenticatedRequest(`${backendUrl}/api/equipment?${params.toString()}`);
        if (!response.ok) return { success: false };
        const data = await response.json();
        return { success: true, equipment: data };
      } catch (e) {
        console.error('Load equipment error', e);
        return { success: false };
      }
    },
    // User Profile API
    loadUserProfile: async (userId) => {
      try {
        const response = await makeAuthenticatedRequest(`${backendUrl}/api/community/users/${userId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return { success: true, user: data };
      } catch (error) {
        console.error('Load user profile error:', error);
        return { success: false, error: error.message };
      }
    },
    loadUserTeams: async (userId) => {
      try {
        const response = await makeAuthenticatedRequest(`${backendUrl}/api/community/users/${userId}/teams`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return { success: true, teams: data };
      } catch (error) {
        console.error('Load user teams error:', error);
        return { success: false, error: error.message };
      }
    },
    checkFollowStatus: async (userId) => {
      try {
        const response = await makeAuthenticatedRequest(`${backendUrl}/api/community/users/${userId}/follow-status`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return { success: true, ...data };
      } catch (error) {
        console.error('Check follow status error:', error);
        return { success: false, error: error.message };
      }
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};