import axios from 'axios';
import config from '../config';
import { API_URL } from '@/config';
import type { Transaction, Investment, Category, SubCategory, Currency, TransactionFormData, InvestmentFormData } from '@/types';

// API base URL from environment config
const API_BASE_URL = config.apiUrl;

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
  timeoutErrorMessage: 'Request timed out. Please check your internet connection.',
});

// Add request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging and error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout:', error.config.url);
      throw new Error('Request timed out. Please check your internet connection.');
    } else if (error.response) {
      console.error('API Error Response:', error.response.status, error.response.data);
      throw new Error(error.response.data.message || 'Something went wrong');
    } else if (error.request) {
      console.error('No response received:', error.request);
      throw new Error('No response received from server');
    } else {
      console.error('API Error:', error.message);
      throw error;
    }
  }
);

/**
 * Helper to handle API responses
 */
const handleResponse = async (response: Response) => {
  // Handle 204 No Content responses first
  if (response.status === 204) {
    return null;
  }

  // For all other responses, check if they're ok
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Something went wrong');
  }

  return response.json();
};

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

export const transactionApi = {
  getCurrentPeriodTransactions: async (token: string): Promise<Transaction[]> => {
    const response = await fetch(`${API_URL}/transactions/current-period`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await handleResponse(response);
    return data.transactions || [];
  },

  addTransaction: async (token: string, data: TransactionFormData): Promise<Transaction> => {
    console.log('Adding transaction:', data);
    const response = await fetch(`${API_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  updateTransaction: async (token: string, id: number, data: Partial<TransactionFormData>): Promise<Transaction> => {
    const response = await fetch(`${API_URL}/transactions/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  deleteTransaction: async (token: string, id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/transactions/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  getCategoryAggregates: async (token: string): Promise<{ category_id: number; category_name: string; total_amount: number }[]> => {
    const response = await fetch(`${API_URL}/transactions/category-aggregates`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await handleResponse(response);
    return data.aggregates || [];
  },

  upsertIncome: async (token: string, amount: number): Promise<void> => {
    const response = await fetch(`${API_URL}/transactions/income`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to save income');
    }
  },

  updateTransactionsCategory: async (token: string, oldCategoryId: number, newCategoryId: number): Promise<void> => {
    const response = await fetch(`${API_URL}/transactions/update-category`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ oldCategoryId, newCategoryId }),
    });
    return handleResponse(response);
  },

  updateTransactionsSubCategory: async (token: string, subCategoryId: number): Promise<void> => {
    const response = await fetch(`${API_URL}/transactions/update-subcategory`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subCategoryId }),
    });
    return handleResponse(response);
  },
};

export const investmentApi = {
  getInvestments: async (token: string): Promise<Investment[]> => {
    const response = await fetch(`${API_URL}/investments`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  addInvestment: async (token: string, data: InvestmentFormData): Promise<Investment> => {
    const response = await fetch(`${API_URL}/investments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  updateInvestment: async (token: string, id: number, data: Partial<InvestmentFormData>): Promise<Investment> => {
    const response = await fetch(`${API_URL}/investments/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  deleteInvestment: async (token: string, id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/investments/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },
};

export const categoryApi = {
  getCategories: async (token: string): Promise<Category[]> => {
    const response = await apiClient.get('/categories', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  },

  getSubCategories: async (token: string, categoryId: number): Promise<SubCategory[]> => {
    const response = await apiClient.get(`/categories/subcategories/${categoryId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  },

  addCategory: async (token: string, categoryName: string): Promise<Category> => {
    const response = await apiClient.post('/categories', 
      { category_name: categoryName },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  addSubCategory: async (token: string, categoryId: number, subCategoryName: string): Promise<SubCategory> => {
    const response = await apiClient.post(`/categories/${categoryId}/subcategories`,
      { sub_category_name: subCategoryName },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  deleteSubCategory: async (token: string, subCategoryId: number): Promise<void> => {
    await apiClient.delete(`/categories/subcategories/${subCategoryId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  deleteCategory: async (token: string, categoryId: number): Promise<void> => {
    await apiClient.delete(`/categories/${categoryId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },
};

export const currencyApi = {
  getCurrencies: async (token: string): Promise<Currency[]> => {
    const response = await fetch(`${API_URL}/currencies`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },
}; 