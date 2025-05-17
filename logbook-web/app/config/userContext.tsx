import React, { createContext, useState, useContext, useEffect } from 'react';
import { userApi } from '../services/api';

// Define user type
export type User = {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
};

// Define authentication context type
type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
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

  // Check if user is already logged in using localStorage
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      
      try {
        const storedToken = localStorage.getItem('logbook_token');
        const storedUser = localStorage.getItem('logbook_user');
        
        if (storedToken && storedUser) {
          // Set token and user from localStorage
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Optionally, verify token with the server
          // This could be done by calling the profile endpoint
          try {
            await userApi.getProfile(storedToken);
            // If no error is thrown, the token is valid
          } catch (err) {
            // If there's an error, the token might be invalid or expired
            console.error('Token validation error:', err);
            localStorage.removeItem('logbook_token');
            localStorage.removeItem('logbook_user');
            setToken(null);
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Failed to authenticate user', err);
        localStorage.removeItem('logbook_token');
        localStorage.removeItem('logbook_user');
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
      
      // Store token in localStorage
      localStorage.setItem('logbook_token', response.token);
      
      // Map API response to our User type
      const loggedInUser: User = {
        id: response.user.id,
        username: response.user.username,
        email: response.user.email,
        firstName: response.user.first_name,
        lastName: response.user.last_name
      };
      
      // Store user in localStorage
      localStorage.setItem('logbook_user', JSON.stringify(loggedInUser));
      
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
        password: password,
        firstName: newUser.firstName,
        lastName: newUser.lastName
      });
      
      // Store token in localStorage
      localStorage.setItem('logbook_token', response.token);
      
      // Map API response to our User type
      const createdUser: User = {
        id: response.user.id,
        username: response.user.username,
        email: response.user.email,
        firstName: response.user.first_name,
        lastName: response.user.last_name
      };
      
      // Store user in localStorage
      localStorage.setItem('logbook_user', JSON.stringify(createdUser));
      
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
      // In a real app, you might want to invalidate the token on the server
      // For now, we'll just remove it from localStorage
      
      // Remove user and token from localStorage
      localStorage.removeItem('logbook_token');
      localStorage.removeItem('logbook_user');
      
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