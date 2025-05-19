import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userApi } from '../services/api';
import type { User } from '@/types';

// Define authentication context type
export type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (user: Omit<User, 'id'>, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
};

// Create the auth context
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  token: null,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  error: null
});

// Create auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Check if user is already logged in using AsyncStorage
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      
      try {
        const storedToken = await AsyncStorage.getItem('logbook_token');
        const storedUser = await AsyncStorage.getItem('logbook_user');
        
        if (storedToken && storedUser) {
          // Set token and user from AsyncStorage
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Optionally, verify token with the server
          try {
            await userApi.getProfile(storedToken);
            // If no error is thrown, the token is valid
          } catch (err) {
            // If there's an error, the token might be invalid or expired
            console.error('Token validation error:', err);
            await AsyncStorage.removeItem('logbook_token');
            await AsyncStorage.removeItem('logbook_user');
            setToken(null);
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Failed to authenticate user', err);
        await AsyncStorage.removeItem('logbook_token');
        await AsyncStorage.removeItem('logbook_user');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Login handler
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await userApi.login(email, password);
      
      // Store token in AsyncStorage
      await AsyncStorage.setItem('logbook_token', response.token);
      
      // Map API response to our User type
      const loggedInUser: User = {
        user_id: response.user.user_id ?? response.user.id,
        username: response.user.username,
        email: response.user.email,
        currency_id: response.user.currency_id,
        // Add other fields as needed
      };
      
      // Store user in AsyncStorage
      await AsyncStorage.setItem('logbook_user', JSON.stringify(loggedInUser));
      
      // Update state
      setToken(response.token);
      setUser(loggedInUser);
      console.log('User logged in:', loggedInUser.username);
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Failed to login');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Signup handler
  const signup = async (newUser: Omit<User, 'id'>, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await userApi.register({
        username: newUser.username,
        email: newUser.email,
        password: password
      });
      
      // Store token in AsyncStorage
      await AsyncStorage.setItem('logbook_token', response.token);
      
      // Map API response to our User type
      const createdUser: User = {
        user_id: response.user.user_id ?? response.user.id,
        username: response.user.username,
        email: response.user.email,
        currency_id: response.user.currency_id,
        // Add other fields as needed
      };
      
      // Store user in AsyncStorage
      await AsyncStorage.setItem('logbook_user', JSON.stringify(createdUser));
      
      // Update state
      setToken(response.token);
      setUser(createdUser);
      console.log('User created:', createdUser.username);
    } catch (err) {
      console.error('Signup error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create account');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout handler
  const logout = async () => {
    setIsLoading(true);
    
    try {
      // Remove user and token from AsyncStorage
      await AsyncStorage.removeItem('logbook_token');
      await AsyncStorage.removeItem('logbook_user');
      
      // Update state
      setToken(null);
      setUser(null);
      console.log('User logged out');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    token,
    login,
    signup,
    logout,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

export default AuthContext; 