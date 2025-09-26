import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';  // Your User type
import { authAPI, setAuthToken } from '../services/api';
import api from '../services/api';  // For logout

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;  // Reverted to void (no TS mismatch)
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser ] = useState<User | null>(null);  // FIXED: No space
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      setAuthToken(token);
    }
    setLoading(false);
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      console.log('🔥 DEBUG: AuthContext - Starting API call to /api/auth/login with email:', email);
      const res = await authAPI.login({ email, password });
      console.log('🔥 DEBUG: AuthContext - Response data:', res.data);
      
      if (res.data && res.data.success) {
        console.log('🔥 DEBUG: AuthContext - Login success, extracting data...');
        const { token: newToken, user: backendUser  } = res.data.data!;
        console.log('🔥 DEBUG: AuthContext - Extracted token:', !!newToken, 'user:', backendUser );
        
        setToken(newToken);
        setUser (backendUser  || { _id: 'temp', email, username: email.split('@')[0] });
        localStorage.setItem('token', newToken);
        setAuthToken(newToken);
        console.log('🔥 DEBUG: AuthContext - Login complete - states & storage updated');
      } else {
        console.log('🔥 DEBUG: AuthContext - API response not successful:', res.data);
        throw new Error(res.data?.error || 'Login failed - no success flag');
      }
    } catch (err: any) {
      console.error('🔥 DEBUG: AuthContext - Login error occurred:');
      console.error('🔥 DEBUG: AuthContext - Error message:', err.message);
      console.error('🔥 DEBUG: AuthContext - Error response:', err.response?.data);
      console.error('🔥 DEBUG: AuthContext - Full error:', err);
      throw err;  // Re-throw for Login.tsx to handle (e.g., alert)
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const res = await authAPI.register({ username, email, password });
      if (res.data.success) {
        const { token: newToken, user: backendUser  } = res.data.data!;
        setToken(newToken);
        setUser (backendUser  || { _id: 'temp', username, email });
        localStorage.setItem('token', newToken);
        setAuthToken(newToken);
      } else {
        throw new Error(res.data.error || 'Register failed');
      }
    } catch (err: any) {
      console.error('Register error:', err.response?.data?.error || err.message);
      throw err;
    }
  };

  const logout = () => {
    setUser (null);
    setToken(null);
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};