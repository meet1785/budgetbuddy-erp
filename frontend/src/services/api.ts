import { User, Budget, Expense, Transaction, Category, DashboardMetrics } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

interface ApiError {
  field?: string;
  message: string;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ApiError[];
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
    const response = await this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    role?: string;
    department: string;
  }) {
    return this.request<User>('/auth/register', {
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
    return this.request<{ alerts: Array<{ type: string; title: string; message: string }> }>('/dashboard/alerts');
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
  async getBudgets(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/budgets${query}`);
  }

  async getBudget(id: string) {
    return this.request<Budget>(`/budgets/${id}`);
  }

  async createBudget(budgetData: Partial<Budget>) {
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
    return this.request<{ success: boolean }>(`/budgets/${id}`, {
      method: 'DELETE',
    });
  }

  // Expense endpoints
  async getExpenses(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<Expense[]>(`/expenses${query}`);
  }

  async getExpense(id: string) {
    return this.request<Expense>(`/expenses/${id}`);
  }

  async createExpense(expenseData: Partial<Expense>) {
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
  async getTransactions(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<Transaction[]>(`/transactions${query}`);
  }

  // User endpoints
  async getUsers(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<User[]>(`/users${query}`);
  }

  // Category endpoints
  async getCategories(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<Category[]>(`/categories${query}`);
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export const apiService = new ApiService();
export default apiService;