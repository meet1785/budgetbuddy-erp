import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  ReactNode
} from 'react';
import apiService from '@/services/api';
import { Budget, Category, DashboardMetrics, Expense, Transaction, User } from '@/types';

interface AppState {
  budgets: Budget[];
  expenses: Expense[];
  transactions: Transaction[];
  users: User[];
  categories: Category[];
  currentUser: User | null;
  metrics: DashboardMetrics;
  loading: boolean;
  authLoading: boolean;
  selectedPeriod: 'monthly' | 'quarterly' | 'yearly';
  isOnline: boolean;
  error: string | null;
}

type AppAction =
  | { type: 'SET_BUDGETS'; payload: Budget[] }
  | { type: 'ADD_BUDGET'; payload: Budget }
  | { type: 'UPDATE_BUDGET'; payload: Budget }
  | { type: 'DELETE_BUDGET'; payload: string }
  | { type: 'SET_EXPENSES'; payload: Expense[] }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'UPDATE_EXPENSE'; payload: Expense }
  | { type: 'DELETE_EXPENSE'; payload: string }
  | { type: 'SET_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'SET_CATEGORIES'; payload: Category[] }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'SET_CURRENT_USER'; payload: User | null }
  | { type: 'SET_METRICS'; payload: DashboardMetrics }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_AUTH_LOADING'; payload: boolean }
  | { type: 'SET_PERIOD'; payload: 'monthly' | 'quarterly' | 'yearly' }
  | { type: 'SET_ONLINE'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_STATE' };

const defaultMetrics: DashboardMetrics = {
  totalBudget: 0,
  totalExpenses: 0,
  remainingBudget: 0,
  savingsGoal: 0,
  monthlyBurnRate: 0,
  budgetUtilization: 0,
  expenseGrowth: 0,
  categoryBreakdown: []
};

const toDate = (value: unknown): Date => {
  const date = value ? new Date(value as string | number | Date) : new Date();
  return Number.isNaN(date.getTime()) ? new Date() : date;
};

const ensureNumber = (value: unknown, fallback = 0): number => {
  const num = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const normalizeBudget = (data: any): Budget => {
  const allocated = ensureNumber(data?.allocated);
  const spent = ensureNumber(data?.spent);
  const id = String(data?.id ?? data?._id ?? crypto.randomUUID());

  return {
    id,
    name: data?.name ?? '',
    category: data?.category ?? '',
    allocated,
    spent,
    remaining: ensureNumber(data?.remaining, allocated - spent),
    period: (data?.period ?? 'monthly') as Budget['period'],
    status: (data?.status ?? 'on-track') as Budget['status'],
    createdAt: toDate(data?.createdAt),
    updatedAt: toDate(data?.updatedAt)
  };
};

const normalizeBudgets = (items: any[] | undefined): Budget[] =>
  Array.isArray(items) ? items.map(normalizeBudget) : [];

const normalizeExpense = (data: any): Expense => ({
  id: String(data?.id ?? data?._id ?? crypto.randomUUID()),
  description: data?.description ?? '',
  amount: ensureNumber(data?.amount),
  category: data?.category ?? '',
  budgetId: data?.budgetId ?? data?.budget?._id ?? undefined,
  date: toDate(data?.date),
  vendor: data?.vendor ?? '',
  receiptUrl: data?.receiptUrl ?? undefined,
  status: (data?.status ?? 'pending') as Expense['status'],
  approvedBy: data?.approvedBy ?? undefined,
  tags: Array.isArray(data?.tags) ? data.tags : [],
  department: data?.department ?? ''
});

const normalizeExpenses = (items: any[] | undefined): Expense[] =>
  Array.isArray(items) ? items.map(normalizeExpense) : [];

const normalizeTransaction = (data: any): Transaction => ({
  id: String(data?.id ?? data?._id ?? crypto.randomUUID()),
  type: (data?.type ?? 'expense') as Transaction['type'],
  amount: ensureNumber(data?.amount),
  description: data?.description ?? '',
  category: data?.category ?? '',
  date: toDate(data?.date),
  account: data?.account ?? '',
  reference: data?.reference ?? undefined,
  status: (data?.status ?? 'pending') as Transaction['status']
});

const normalizeTransactions = (items: any[] | undefined): Transaction[] =>
  Array.isArray(items) ? items.map(normalizeTransaction) : [];

const normalizeUser = (data: any): User => ({
  id: String(data?.id ?? data?._id ?? crypto.randomUUID()),
  name: data?.name ?? '',
  email: data?.email ?? '',
  role: (data?.role ?? 'user') as User['role'],
  department: data?.department ?? '',
  avatar: data?.avatar ?? undefined,
  permissions: Array.isArray(data?.permissions) ? data.permissions : [],
  createdAt: toDate(data?.createdAt),
  lastLogin: data?.lastLogin ? toDate(data?.lastLogin) : undefined,
  isActive: data?.isActive ?? true
});

const normalizeUsers = (items: any[] | undefined): User[] =>
  Array.isArray(items) ? items.map(normalizeUser) : [];

const normalizeCategory = (data: any): Category => ({
  id: String(data?.id ?? data?._id ?? crypto.randomUUID()),
  name: data?.name ?? '',
  description: data?.description ?? undefined,
  budget: data?.budget !== undefined ? ensureNumber(data?.budget) : undefined,
  color: data?.color ?? '#3B82F6',
  parentId: data?.parentId ?? undefined,
  isActive: data?.isActive ?? true
});

const normalizeCategories = (items: any[] | undefined): Category[] =>
  Array.isArray(items) ? items.map(normalizeCategory) : [];

const normalizeMetrics = (data: any | undefined): DashboardMetrics => ({
  totalBudget: ensureNumber(data?.totalBudget),
  totalExpenses: ensureNumber(data?.totalExpenses),
  remainingBudget: ensureNumber(data?.remainingBudget),
  savingsGoal: ensureNumber(data?.savingsGoal),
  monthlyBurnRate: ensureNumber(data?.monthlyBurnRate),
  budgetUtilization: ensureNumber(data?.budgetUtilization),
  expenseGrowth: ensureNumber(data?.expenseGrowth),
  categoryBreakdown: Array.isArray(data?.categoryBreakdown)
    ? data.categoryBreakdown.map((item: any) => ({
        category: item?.category ?? 'Unknown',
        amount: ensureNumber(item?.amount),
        percentage: ensureNumber(item?.percentage)
      }))
    : []
});

const calculateMetrics = (state: AppState): DashboardMetrics => {
  const totalBudget = state.budgets.reduce((sum, budget) => sum + budget.allocated, 0);
  const approvedExpenses = state.expenses.filter(expense => expense.status === 'approved');
  const totalExpenses = approvedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remainingBudget = totalBudget - totalExpenses;
  const budgetUtilization = totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0;

  const categoryBreakdown = state.categories.map(category => {
    const categoryExpenses = approvedExpenses
      .filter(expense => expense.category === category.name)
      .reduce((sum, expense) => sum + expense.amount, 0);
    const percentage = totalExpenses > 0 ? (categoryExpenses / totalExpenses) * 100 : 0;

    return {
      category: category.name,
      amount: categoryExpenses,
      percentage: Math.round(percentage * 10) / 10
    };
  }).filter(item => item.amount > 0);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const monthlyBurnRate = approvedExpenses
    .filter(expense => new Date(expense.date) >= thirtyDaysAgo)
    .reduce((sum, expense) => sum + expense.amount, 0);

  return {
    totalBudget,
    totalExpenses,
    remainingBudget,
    savingsGoal: remainingBudget,
    monthlyBurnRate,
    budgetUtilization,
    expenseGrowth: 0,
    categoryBreakdown
  };
};

const loadInitialState = (): AppState => ({
  budgets: [],
  expenses: [],
  transactions: [],
  users: [],
  categories: [],
  currentUser: null,
  metrics: defaultMetrics,
  loading: false,
  authLoading: false,
  selectedPeriod: 'monthly',
  isOnline: false,
  error: null
});

const initialState: AppState = loadInitialState();

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_BUDGETS':
      return { ...state, budgets: action.payload };
    case 'ADD_BUDGET':
      return { ...state, budgets: [...state.budgets, action.payload] };
    case 'UPDATE_BUDGET':
      return {
        ...state,
        budgets: state.budgets.map(budget =>
          budget.id === action.payload.id ? action.payload : budget
        )
      };
    case 'DELETE_BUDGET':
      return {
        ...state,
        budgets: state.budgets.filter(budget => budget.id !== action.payload)
      };
    case 'SET_EXPENSES':
      return { ...state, expenses: action.payload };
    case 'ADD_EXPENSE':
      return { ...state, expenses: [...state.expenses, action.payload] };
    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map(expense =>
          expense.id === action.payload.id ? action.payload : expense
        )
      };
    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter(expense => expense.id !== action.payload)
      };
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload };
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [...state.transactions, action.payload] };
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(transaction =>
          transaction.id === action.payload.id ? action.payload : transaction
        )
      };
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter(transaction => transaction.id !== action.payload)
      };
    case 'SET_USERS':
      return { ...state, users: action.payload };
    case 'ADD_USER':
      return { ...state, users: [...state.users, action.payload] };
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload.id ? action.payload : user
        )
      };
    case 'DELETE_USER':
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.payload)
      };
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] };
    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map(category =>
          category.id === action.payload.id ? action.payload : category
        )
      };
    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter(category => category.id !== action.payload)
      };
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };
    case 'SET_METRICS':
      return { ...state, metrics: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_AUTH_LOADING':
      return { ...state, authLoading: action.payload };
    case 'SET_PERIOD':
      return { ...state, selectedPeriod: action.payload };
    case 'SET_ONLINE':
      return { ...state, isOnline: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'RESET_STATE':
      return {
        ...initialState,
        selectedPeriod: state.selectedPeriod
      };
    default:
      return state;
  }
}

const AppContext = createContext<AppContextValue | null>(null);

const useAppContextInternal = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

const hasValidToken = () => typeof window !== 'undefined' && !!localStorage.getItem('auth_token');

const requireAuth = () => {
  if (!hasValidToken()) {
    throw new Error('Authentication required');
  }
};

interface BudgetPayload {
  name: string;
  category: string;
  allocated: number;
  period: Budget['period'];
}

interface ExpensePayload {
  description: string;
  amount: number;
  category: string;
  vendor: string;
  department: string;
  date: Date;
  tags?: string[];
  budgetId?: string;
  receiptUrl?: string;
  status?: Expense['status'];
}

interface TransactionPayload {
  type: Transaction['type'];
  amount: number;
  description: string;
  category: string;
  account: string;
  date: Date;
  reference?: string;
  status?: Transaction['status'];
}

export interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    department: string;
    role?: User['role'];
  }) => Promise<User>;
  refreshData: (options?: { silent?: boolean }) => Promise<void>;
  createBudget: (payload: BudgetPayload) => Promise<Budget>;
  updateBudget: (id: string, payload: BudgetPayload) => Promise<Budget>;
  deleteBudget: (id: string) => Promise<void>;
  createExpense: (payload: ExpensePayload) => Promise<Expense>;
  updateExpense: (id: string, payload: Partial<ExpensePayload>) => Promise<Expense>;
  approveExpense: (id: string) => Promise<Expense>;
  rejectExpense: (id: string) => Promise<Expense>;
  deleteExpense: (id: string) => Promise<void>;
  createCategory: (payload: Partial<Category>) => Promise<Category>;
  updateCategory: (id: string, payload: Partial<Category>) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
  createTransaction: (payload: TransactionPayload) => Promise<Transaction>;
  updateTransaction: (id: string, payload: Partial<TransactionPayload>) => Promise<Transaction>;
  deleteTransaction: (id: string) => Promise<void>;
  createUser: (payload: Partial<User> & { password: string }) => Promise<User>;
  updateUser: (id: string, payload: Partial<User>) => Promise<User>;
  changeUserPassword: (id: string, newPassword: string) => Promise<void>;
  deactivateUser: (id: string) => Promise<void>;
  reactivateUser: (id: string) => Promise<void>;
}

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const refreshData = useCallback(async ({ silent = false }: { silent?: boolean } = {}) => {
    if (!hasValidToken()) {
      return;
    }

    if (!silent) {
      dispatch({ type: 'SET_LOADING', payload: true });
    }

    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const [
        budgetsResult,
        expensesResult,
        transactionsResult,
        usersResult,
        categoriesResult,
        metricsResult
      ] = await Promise.allSettled([
        apiService.getBudgets(),
        apiService.getExpenses(),
        apiService.getTransactions(),
        apiService.getUsers(),
        apiService.getCategories(),
        apiService.getDashboardMetrics()
      ]);

      const failedResources: string[] = [];

      let latestBudgets = state.budgets;
      if (budgetsResult.status === 'fulfilled' && budgetsResult.value.success) {
        const normalized = normalizeBudgets(budgetsResult.value.data as any[] | undefined);
        latestBudgets = normalized;
        dispatch({ type: 'SET_BUDGETS', payload: normalized });
      } else {
        failedResources.push('budgets');
      }

      let latestExpenses = state.expenses;
      if (expensesResult.status === 'fulfilled' && expensesResult.value.success) {
        const normalized = normalizeExpenses(expensesResult.value.data as any[] | undefined);
        latestExpenses = normalized;
        dispatch({ type: 'SET_EXPENSES', payload: normalized });
      } else {
        failedResources.push('expenses');
      }

      if (transactionsResult.status === 'fulfilled' && transactionsResult.value.success) {
        dispatch({
          type: 'SET_TRANSACTIONS',
          payload: normalizeTransactions(transactionsResult.value.data as any[] | undefined)
        });
      } else {
        failedResources.push('transactions');
      }

      if (usersResult.status === 'fulfilled' && usersResult.value.success) {
        dispatch({ type: 'SET_USERS', payload: normalizeUsers(usersResult.value.data as any[] | undefined) });
      } else {
        failedResources.push('users');
      }

      let latestCategories = state.categories;
      if (categoriesResult.status === 'fulfilled' && categoriesResult.value.success) {
        const normalized = normalizeCategories(categoriesResult.value.data as any[] | undefined);
        latestCategories = normalized;
        dispatch({ type: 'SET_CATEGORIES', payload: normalized });
      } else {
        failedResources.push('categories');
      }

      if (metricsResult.status === 'fulfilled' && metricsResult.value.success) {
        dispatch({ type: 'SET_METRICS', payload: normalizeMetrics(metricsResult.value.data) });
      } else {
        const metricsFallback = calculateMetrics({
          ...state,
          budgets: latestBudgets,
          expenses: latestExpenses,
          categories: latestCategories
        });
        dispatch({ type: 'SET_METRICS', payload: metricsFallback });
      }

      dispatch({ type: 'SET_ONLINE', payload: true });

      if (failedResources.length > 0) {
        dispatch({
          type: 'SET_ERROR',
          payload: `Some data failed to refresh: ${failedResources.join(', ')}`
        });
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to refresh data from server' });
      dispatch({ type: 'SET_ONLINE', payload: false });
    } finally {
      if (!silent) {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }
  }, [dispatch, state]);

  useEffect(() => {
    const restoreSession = async () => {
      if (!hasValidToken()) {
        return;
      }

      dispatch({ type: 'SET_AUTH_LOADING', payload: true });
      try {
        const profile = await apiService.getProfile();
        if (profile.success && profile.data) {
          const user = normalizeUser(profile.data);
          dispatch({ type: 'SET_CURRENT_USER', payload: user });
          dispatch({ type: 'SET_ONLINE', payload: true });
          await refreshData({ silent: true });
        } else {
          apiService.clearToken();
          dispatch({ type: 'SET_CURRENT_USER', payload: null });
          dispatch({ type: 'SET_ONLINE', payload: false });
        }
      } catch (error) {
        console.warn('Session restore failed:', error);
        apiService.clearToken();
        dispatch({ type: 'SET_CURRENT_USER', payload: null });
        dispatch({ type: 'SET_ONLINE', payload: false });
      } finally {
        dispatch({ type: 'SET_AUTH_LOADING', payload: false });
      }
    };

    restoreSession();

    const interval = window.setInterval(async () => {
      if (!hasValidToken()) {
        dispatch({ type: 'SET_ONLINE', payload: false });
        return;
      }

      try {
        const health = await apiService.healthCheck();
        dispatch({ type: 'SET_ONLINE', payload: !!health?.success });
      } catch (error) {
        dispatch({ type: 'SET_ONLINE', payload: false });
      }
    }, 60000);

    return () => window.clearInterval(interval);
  }, [refreshData]);

  const login = async (email: string, password: string) => {
    dispatch({ type: 'SET_AUTH_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await apiService.login(email, password);
      if (!response.success || !response.data?.user) {
        throw new Error(response.message || 'Login failed');
      }

      const user = normalizeUser(response.data.user);
      dispatch({ type: 'SET_CURRENT_USER', payload: user });
      dispatch({ type: 'SET_ONLINE', payload: true });
      await refreshData({ silent: true });
    } catch (error: any) {
      console.error('Login error:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Unable to login' });
      throw error;
    } finally {
      dispatch({ type: 'SET_AUTH_LOADING', payload: false });
    }
  };

  const logout = async () => {
    try {
      if (hasValidToken()) {
        await apiService.logout();
      }
    } catch (error) {
      console.warn('Logout error:', error);
    } finally {
      apiService.clearToken();
      dispatch({ type: 'RESET_STATE' });
      dispatch({ type: 'SET_CURRENT_USER', payload: null });
      dispatch({ type: 'SET_ONLINE', payload: false });
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    department: string;
    role?: User['role'];
  }) => {
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      const response = await apiService.register(data);
      if (!response.success || !response.data?.user) {
        throw new Error(response.message || 'Registration failed');
      }

      const user = normalizeUser(response.data.user);
      dispatch({ type: 'SET_CURRENT_USER', payload: user });
      dispatch({ type: 'SET_ONLINE', payload: true });
      await refreshData({ silent: true });
      return user;
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Registration failed' });
      throw error;
    }
  };

  const createBudget = async (payload: BudgetPayload) => {
    dispatch({ type: 'SET_ERROR', payload: null });
    requireAuth();
    const response = await apiService.createBudget(payload as Partial<Budget>);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to create budget');
    }

    const budget = normalizeBudget(response.data);
    dispatch({ type: 'ADD_BUDGET', payload: budget });
    await refreshData({ silent: true });
    return budget;
  };

  const updateBudget = async (id: string, payload: BudgetPayload) => {
    dispatch({ type: 'SET_ERROR', payload: null });
    requireAuth();
    const response = await apiService.updateBudget(id, payload as Partial<Budget>);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update budget');
    }

    const budget = normalizeBudget(response.data);
    dispatch({ type: 'UPDATE_BUDGET', payload: budget });
    await refreshData({ silent: true });
    return budget;
  };

  const deleteBudget = async (id: string) => {
    dispatch({ type: 'SET_ERROR', payload: null });
    requireAuth();
    const response = await apiService.deleteBudget(id);
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete budget');
    }
    dispatch({ type: 'DELETE_BUDGET', payload: id });
    await refreshData({ silent: true });
  };

  const createExpense = async (payload: ExpensePayload) => {
    dispatch({ type: 'SET_ERROR', payload: null });
    requireAuth();
    const response = await apiService.createExpense(payload);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to create expense');
    }

    const expense = normalizeExpense(response.data);
    dispatch({ type: 'ADD_EXPENSE', payload: expense });
    await refreshData({ silent: true });
    return expense;
  };

  const updateExpense = async (id: string, payload: Partial<ExpensePayload>) => {
    dispatch({ type: 'SET_ERROR', payload: null });
    requireAuth();
    const response = await apiService.updateExpense(id, payload);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update expense');
    }

    const expense = normalizeExpense(response.data);
    dispatch({ type: 'UPDATE_EXPENSE', payload: expense });
    await refreshData({ silent: true });
    return expense;
  };

  const approveExpense = async (id: string) => {
    dispatch({ type: 'SET_ERROR', payload: null });
    requireAuth();
    const response = await apiService.approveExpense(id);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to approve expense');
    }

    const expense = normalizeExpense(response.data);
    dispatch({ type: 'UPDATE_EXPENSE', payload: expense });
    await refreshData({ silent: true });
    return expense;
  };

  const rejectExpense = async (id: string) => {
    dispatch({ type: 'SET_ERROR', payload: null });
    requireAuth();
    const response = await apiService.rejectExpense(id);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to reject expense');
    }

    const expense = normalizeExpense(response.data);
    dispatch({ type: 'UPDATE_EXPENSE', payload: expense });
    await refreshData({ silent: true });
    return expense;
  };

  const deleteExpense = async (id: string) => {
    dispatch({ type: 'SET_ERROR', payload: null });
    requireAuth();
    const response = await apiService.deleteExpense(id);
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete expense');
    }
    dispatch({ type: 'DELETE_EXPENSE', payload: id });
    await refreshData({ silent: true });
  };

  const createCategory = async (payload: Partial<Category>) => {
    dispatch({ type: 'SET_ERROR', payload: null });
    requireAuth();
    const response = await apiService.createCategory(payload);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to create category');
    }

    const category = normalizeCategory(response.data);
    dispatch({ type: 'ADD_CATEGORY', payload: category });
    return category;
  };

  const updateCategory = async (id: string, payload: Partial<Category>) => {
    dispatch({ type: 'SET_ERROR', payload: null });
    requireAuth();
    const response = await apiService.updateCategory(id, payload);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update category');
    }

    const category = normalizeCategory(response.data);
    dispatch({ type: 'UPDATE_CATEGORY', payload: category });
    return category;
  };

  const deleteCategory = async (id: string) => {
    dispatch({ type: 'SET_ERROR', payload: null });
    requireAuth();
    const response = await apiService.deleteCategory(id);
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete category');
    }
    dispatch({ type: 'DELETE_CATEGORY', payload: id });
  };

  const createTransaction = async (payload: TransactionPayload) => {
    dispatch({ type: 'SET_ERROR', payload: null });
    requireAuth();
    const response = await apiService.createTransaction(payload);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to create transaction');
    }

    const transaction = normalizeTransaction(response.data);
    dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
    return transaction;
  };

  const updateTransaction = async (id: string, payload: Partial<TransactionPayload>) => {
    dispatch({ type: 'SET_ERROR', payload: null });
    requireAuth();
    const response = await apiService.updateTransaction(id, payload);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update transaction');
    }

    const transaction = normalizeTransaction(response.data);
    dispatch({ type: 'UPDATE_TRANSACTION', payload: transaction });
    return transaction;
  };

  const deleteTransaction = async (id: string) => {
    dispatch({ type: 'SET_ERROR', payload: null });
    requireAuth();
    const response = await apiService.deleteTransaction(id);
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete transaction');
    }
    dispatch({ type: 'DELETE_TRANSACTION', payload: id });
  };

  const createUser = async (payload: Partial<User> & { password: string }) => {
    dispatch({ type: 'SET_ERROR', payload: null });
    requireAuth();
    const response = await apiService.createUser(payload);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to create user');
    }

    const user = normalizeUser(response.data);
    dispatch({ type: 'ADD_USER', payload: user });
    return user;
  };

  const updateUser = async (id: string, payload: Partial<User>) => {
    dispatch({ type: 'SET_ERROR', payload: null });
    requireAuth();
    const response = await apiService.updateUser(id, payload);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update user');
    }

    const user = normalizeUser(response.data);
    dispatch({ type: 'UPDATE_USER', payload: user });
    return user;
  };

  const changeUserPassword = async (id: string, newPassword: string) => {
    dispatch({ type: 'SET_ERROR', payload: null });
    requireAuth();
    const response = await apiService.changeUserPassword(id, newPassword);
    if (!response.success) {
      throw new Error(response.message || 'Failed to change password');
    }
  };

  const deactivateUser = async (id: string) => {
    dispatch({ type: 'SET_ERROR', payload: null });
    requireAuth();
    const response = await apiService.deactivateUser(id);
    if (!response.success) {
      throw new Error(response.message || 'Failed to deactivate user');
    }

    dispatch({ type: 'DELETE_USER', payload: id });
  };

  const reactivateUser = async (id: string) => {
    dispatch({ type: 'SET_ERROR', payload: null });
    requireAuth();
    const response = await apiService.reactivateUser(id);
    if (!response.success) {
      throw new Error(response.message || 'Failed to reactivate user');
    }

    const user = normalizeUser(response.data);
    dispatch({ type: 'ADD_USER', payload: user });
  };

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        login,
        logout,
        register,
        refreshData,
        createBudget,
        updateBudget,
        deleteBudget,
        createExpense,
        updateExpense,
        approveExpense,
        rejectExpense,
        deleteExpense,
        createCategory,
        updateCategory,
        deleteCategory,
        createTransaction,
        updateTransaction,
        deleteTransaction,
        createUser,
        updateUser,
        changeUserPassword,
        deactivateUser,
        reactivateUser
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = useAppContextInternal;