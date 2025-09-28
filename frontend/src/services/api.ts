const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

import { Budget, Expense, Transaction, User, DashboardMetrics, Category } from '../types';

interface LoginResponse {
  user: User;
  token: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'manager' | 'user';
  department?: string;
}

interface ApiParams {
  [key: string]: string | number;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string>[];
  pagination?: {
    page: number;
    pages: number;
    total: number;
  };
}

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  async register(userData: RegisterData) {
    return this.request<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getProfile() {
    return this.request<User>('/auth/profile');
  }

  // Dashboard endpoints
  async getDashboardMetrics() {
    return this.request<DashboardMetrics>('/dashboard/metrics');
  }

  async getBudgetAlerts() {
    return this.request('/dashboard/alerts');
  }

  async getRecentTransactions(limit?: number) {
    const query = limit ? `?limit=${limit}` : '';
    return this.request<Transaction[]>(`/dashboard/recent-transactions${query}`);
  }

  async getPendingExpenses(limit?: number) {
    const query = limit ? `?limit=${limit}` : '';
    return this.request<Expense[]>(`/dashboard/pending-expenses${query}`);
  }

  // Budget endpoints
  async getBudgets(params?: ApiParams) {
    const query = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    return this.request<Budget[]>(`/budgets${query}`);
  }

  async getBudget(id: string) {
    return this.request<Budget>(`/budgets/${id}`);
  }

  async createBudget(budgetData: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) {
    return this.request<Budget>('/budgets', {
      method: 'POST',
      body: JSON.stringify(budgetData),
    });
  }

  async updateBudget(id: string, budgetData: Partial<Budget>) {
    return this.request<Budget>(`/budgets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(budgetData),
    });
  }

  async deleteBudget(id: string) {
    return this.request(`/budgets/${id}`, {
      method: 'DELETE',
    });
  }

  // Expense endpoints
  async getExpenses(params?: ApiParams) {
    const query = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    return this.request<Expense[]>(`/expenses${query}`);
  }

  async getExpense(id: string) {
    return this.request<Expense>(`/expenses/${id}`);
  }

  async createExpense(expenseData: Omit<Expense, 'id'>) {
    return this.request<Expense>('/expenses', {
      method: 'POST',
      body: JSON.stringify(expenseData),
    });
  }

  async updateExpense(id: string, expenseData: Partial<Expense>) {
    return this.request<Expense>(`/expenses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(expenseData),
    });
  }

  async approveExpense(id: string) {
    return this.request<Expense>(`/expenses/${id}/approve`, {
      method: 'PATCH',
    });
  }

  async rejectExpense(id: string) {
    return this.request<Expense>(`/expenses/${id}/reject`, {
      method: 'PATCH',
    });
  }

  async deleteExpense(id: string) {
    return this.request(`/expenses/${id}`, {
      method: 'DELETE',
    });
  }

  // Transaction endpoints
  async getTransactions(params?: ApiParams) {
    const query = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    return this.request<Transaction[]>(`/transactions${query}`);
  }

  // User endpoints
  async getUsers(params?: ApiParams) {
    const query = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    return this.request<User[]>(`/users${query}`);
  }

  // Category endpoints
  async getCategories(params?: ApiParams) {
    const query = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    return this.request<Category[]>(`/categories${query}`);
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export const apiService = new ApiService();
export default apiService;