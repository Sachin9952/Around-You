import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // Initialize user from localStorage immediately to prevent flash on refresh.
  // This ensures the user object is available synchronously before the /auth/me
  // call completes, so ProtectedRoute doesn't redirect to /login momentarily.
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // On mount, if token exists, validate it with the server and refresh user data
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await API.get('/auth/me');
          const freshUser = res.data.user;
          setUser(freshUser);
          // Keep localStorage in sync with latest server data
          localStorage.setItem('user', JSON.stringify(freshUser));
        } catch {
          // Token invalid/expired — clear auth state
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  const login = async (credentials) => {
    const res = await API.post('/auth/login', credentials);
    const { token: newToken, user: newUser } = res.data;

    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);

    return newUser;
  };

  const register = async (userData) => {
    const res = await API.post('/auth/register', userData);
    const { token: newToken, user: newUser } = res.data;

    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);

    return newUser;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  // Allow components to update user state + localStorage after server-confirmed changes
  // (e.g., role upgrade, profile update) without requiring a full re-login
  const updateUser = (newUser, newToken) => {
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    if (newToken) {
      setToken(newToken);
      localStorage.setItem('token', newToken);
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!token && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
