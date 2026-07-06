import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

// Defines the structure of the logged-in User
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

// Defines the context API shape
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync token state with LocalStorage and fetch actual user details from API
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (token) {
        localStorage.setItem('token', token);
        try {
          setIsLoading(true);
          const response = await api.get('/users/me');
          setUser(response.data);
        } catch (error) {
          // Token might be invalid or expired, clear it
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        } finally {
          setIsLoading(false);
        }
      } else {
        localStorage.removeItem('token');
        setUser(null);
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [token]);

  const login = (newToken: string) => {
    setToken(newToken);
  };

  const logout = () => {
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to consume the AuthContext safely
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
