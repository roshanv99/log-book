import axios from 'axios';
import config from '../config';

// API base URL from environment config
const API_BASE_URL = config.apiUrl;

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Helper to handle API responses
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || response.statusText || 'Something went wrong';
    throw new Error(errorMessage);
  }
  return response.json();
}

/**
 * User API related functions
 */
export const userApi = {
  /**
   * Register a new user
   */
  async register(userData: {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) {
    const response = await apiClient.post('/users/register', {
      username: userData.username,
      email: userData.email,
      password: userData.password,
      first_name: userData.firstName,
      last_name: userData.lastName,
    });
    
    return response.data;
  },

  /**
   * Login a user
   */
  async login(email: string, password: string) {
    const response = await apiClient.post('/users/login', { 
      email, 
      password 
    });
    
    return response.data;
  },

  /**
   * Get user profile
   */
  async getProfile(token: string) {
    const response = await apiClient.get('/users/profile', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    return response.data;
  },

  /**
   * Update user profile
   */
  async updateProfile(
    token: string,
    userData: {
      username?: string;
      email?: string;
      password?: string;
      firstName?: string;
      lastName?: string;
    }
  ) {
    const response = await apiClient.put('/users/profile', 
      {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        first_name: userData.firstName,
        last_name: userData.lastName,
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
    
    return response.data;
  },
}; 