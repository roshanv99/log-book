// API base URL
const API_BASE_URL = 'http://localhost:3001/api';

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
    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: userData.username,
        email: userData.email,
        password: userData.password,
        first_name: userData.firstName,
        last_name: userData.lastName,
      }),
    });

    return handleResponse<{
      message: string;
      user: {
        id: string;
        username: string;
        email: string;
        first_name?: string;
        last_name?: string;
      };
      token: string;
    }>(response);
  },

  /**
   * Login a user
   */
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    return handleResponse<{
      message: string;
      user: {
        id: string;
        username: string;
        email: string;
        first_name?: string;
        last_name?: string;
      };
      token: string;
    }>(response);
  },

  /**
   * Get user profile
   */
  async getProfile(token: string) {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    return handleResponse<{
      message: string;
      user: {
        id: string;
        username: string;
        email: string;
        first_name?: string;
        last_name?: string;
      };
    }>(response);
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
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        username: userData.username,
        email: userData.email,
        password: userData.password,
        first_name: userData.firstName,
        last_name: userData.lastName,
      }),
    });

    return handleResponse<{
      message: string;
      user: {
        id: string;
        username: string;
        email: string;
        first_name?: string;
        last_name?: string;
      };
    }>(response);
  },
}; 