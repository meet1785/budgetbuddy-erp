import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { Budget, Expense, Transaction, User, Category, DashboardMetrics } from '@/types';
import apiService from '@/services/api';

interface AppState {
  budgets: Budget[];
  expenses: Expense[];
  transactions: Transaction[];
  users: User[];
  categories: Category[];
  currentUser: User | null;
  metrics: DashboardMetrics;
  loading: boolean;
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
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'SET_CATEGORIES'; payload: Category[] }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'SET_CURRENT_USER'; payload: User }
  | { type: 'SET_METRICS'; payload: DashboardMetrics }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_PERIOD'; payload: 'monthly' | 'quarterly' | 'yearly' }
  | { type: 'SET_ONLINE'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

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

const toDate = (value: unknown, fallback: Date = new Date()): Date => {
  const date = value ? new Date(value as string | number | Date) : undefined;
  return date && !Number.isNaN(date.getTime()) ? date : fallback;
};

const ensureNumber = (value: unknown, fallback = 0): number => {
  const num = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const normalizeBudget = (data: any): Budget => {
  const allocated = ensureNumber(data?.allocated);
  const spent = ensureNumber(data?.spent);
  return {
    id: String(data?.id ?? data?._id ?? crypto.randomUUID()),
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
  lastLogin: data?.lastLogin ? toDate(data?.lastLogin) : undefined
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

type BudgetPayload = {
  name: string;
  category: string;
  allocated: number;
  period: Budget['period'];
};

type ExpensePayload = {
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
};

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  refreshData: () => Promise<void>;
  createBudget: (payload: BudgetPayload) => Promise<Budget>;
  updateBudget: (id: string, payload: BudgetPayload) => Promise<Budget>;
  deleteBudget: (id: string) => Promise<void>;
  createExpense: (payload: ExpensePayload) => Promise<Expense>;
  updateExpense: (id: string, payload: Partial<ExpensePayload>) => Promise<Expense>;
  approveExpense: (id: string) => Promise<Expense>;
  rejectExpense: (id: string) => Promise<Expense>;
  deleteExpense: (id: string) => Promise<void>;
}

// Check if backend API is available
const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await apiService.healthCheck();
    return response.success;
  } catch (error) {
    console.log('Backend API not available, using localStorage fallback');
    return false;
  }
};

// Load initial state from localStorage or use defaults
const loadInitialState = (): AppState => {
  try {
    const savedState = localStorage.getItem('erp-app-state');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      return {
        ...parsed,
        budgets: normalizeBudgets(parsed.budgets),
        expenses: normalizeExpenses(parsed.expenses),
        transactions: normalizeTransactions(parsed.transactions),
        users: normalizeUsers(parsed.users),
        categories: normalizeCategories(parsed.categories),
        metrics: normalizeMetrics(parsed.metrics),
        isOnline: false,
        error: null
      };
    }
  } catch (error) {
    console.error('Error loading state from localStorage:', error);
  }
  
  return {
    budgets: [],
    expenses: [],
    transactions: [],
    users: [],
    categories: [],
    currentUser: null,
    metrics: defaultMetrics,
    loading: false,
    selectedPeriod: 'monthly',
    isOnline: false,
    error: null
  };
};

const initialState: AppState = loadInitialState();

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_BUDGETS':
      return { ...state, budgets: action.payload };
    case 'ADD_BUDGET':
      return { ...state, budgets: [...state.budgets, action.payload] };
    case 'UPDATE_BUDGET':
      const updatedBudget = action.payload;
      // Recalculate status based on spending
      const utilization = (updatedBudget.spent / updatedBudget.allocated) * 100;
      updatedBudget.status = utilization >= 90 ? 'over-budget' : utilization >= 75 ? 'warning' : 'on-track';
      return {
        ...state,
        budgets: state.budgets.map(b => b.id === updatedBudget.id ? updatedBudget : b)
      };
    case 'DELETE_BUDGET':
      return {
        ...state,
        budgets: state.budgets.filter(b => b.id !== action.payload)
      };
    case 'SET_EXPENSES':
      return { ...state, expenses: action.payload };
    case 'ADD_EXPENSE':
      return { ...state, expenses: [...state.expenses, action.payload] };
    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map(e => e.id === action.payload.id ? action.payload : e)
      };
    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter(e => e.id !== action.payload)
      };
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload };
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [...state.transactions, action.payload] };
    case 'SET_USERS':
      return { ...state, users: action.payload };
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] };
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };
    case 'SET_METRICS':
      return { ...state, metrics: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_PERIOD':
      return { ...state, selectedPeriod: action.payload };
    case 'SET_ONLINE':
      return { ...state, isOnline: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

const AppContext = createContext<AppContextValue | null>(null);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

// Save state to localStorage
const saveStateToLocalStorage = (state: AppState) => {
  try {
    const stateToSave = { ...state };
    delete (stateToSave as any).isOnline;
    delete (stateToSave as any).error;
    localStorage.setItem('erp-app-state', JSON.stringify(stateToSave));
  } catch (error) {
    console.error('Error saving state to localStorage:', error);
  }
};

// Calculate metrics from current state
const calculateMetrics = (state: AppState): DashboardMetrics => {
  const totalBudget = state.budgets.reduce((sum, budget) => sum + budget.allocated, 0);
  const totalExpenses = state.expenses
    .filter(expense => expense.status === 'approved')
    .reduce((sum, expense) => sum + expense.amount, 0);
  const remainingBudget = totalBudget - totalExpenses;
  const budgetUtilization = totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0;
  
  const categoryBreakdown = state.categories.map(category => {
    const categoryExpenses = state.expenses
      .filter(expense => expense.category === category.name && expense.status === 'approved')
      .reduce((sum, expense) => sum + expense.amount, 0);
    const percentage = totalExpenses > 0 ? (categoryExpenses / totalExpenses) * 100 : 0;
    return {
      category: category.name,
      amount: categoryExpenses,
      percentage: Math.round(percentage * 10) / 10 // Round to 1 decimal place
    };
  }).filter(item => item.amount > 0);

  // Calculate monthly burn rate (expenses from last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const monthlyExpenses = state.expenses
    .filter(expense => 
      expense.status === 'approved' && 
      new Date(expense.date) >= thirtyDaysAgo
    )
    .reduce((sum, expense) => sum + expense.amount, 0);

  return {
    totalBudget,
    totalExpenses,
    remainingBudget,
    savingsGoal: remainingBudget,
    monthlyBurnRate: monthlyExpenses,
    budgetUtilization,
    expenseGrowth: 0, // Would calculate from historical data
    categoryBreakdown
  };
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Auto-save to localStorage whenever state changes
  useEffect(() => {
    saveStateToLocalStorage(state);
  }, [state.budgets, state.expenses, state.transactions, state.users, state.categories]);

  // Auto-calculate metrics whenever relevant state changes
  useEffect(() => {
    const newMetrics = calculateMetrics(state);
    dispatch({ type: 'SET_METRICS', payload: newMetrics });
  }, [state.budgets, state.expenses, state.categories]);

  // Check API health on mount and periodically
  useEffect(() => {
    const checkApi = async () => {
      const isOnline = await checkApiHealth();
      dispatch({ type: 'SET_ONLINE', payload: isOnline });
      
      if (isOnline) {
        console.log('✅ Backend API is available');
        // TODO: Sync data with backend when online
      } else {
        console.log('📱 Running in offline mode with localStorage');
      }
    };

    checkApi();
    
    // Check every 30 seconds
    const interval = setInterval(checkApi, 30000);
    return () => clearInterval(interval);
  }, []);

  const createBudget = async (payload: BudgetPayload): Promise<Budget> => {
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      if (state.isOnline) {
        const response = await apiService.createBudget(payload);
        if (!response.success || !response.data) {
          throw new Error('Failed to create budget');
        }
        const budget = normalizeBudget(response.data);
        dispatch({ type: 'ADD_BUDGET', payload: budget });
        return budget;
      }

      const now = new Date();
      const offlineBudget = normalizeBudget({
        ...payload,
        allocated: payload.allocated,
        spent: 0,
        remaining: payload.allocated,
        status: 'on-track',
        createdAt: now,
        updatedAt: now
      });
      dispatch({ type: 'ADD_BUDGET', payload: offlineBudget });
      return offlineBudget;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create budget' });
      throw error;
    }
  };

  const updateBudget = async (id: string, payload: BudgetPayload): Promise<Budget> => {
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      if (state.isOnline) {
        const response = await apiService.updateBudget(id, payload);
        if (!response.success || !response.data) {
          throw new Error('Failed to update budget');
        }
        const budget = normalizeBudget(response.data);
        dispatch({ type: 'UPDATE_BUDGET', payload: budget });
        return budget;
      }

      const existing = state.budgets.find(budget => budget.id === id);
      if (!existing) {
        throw new Error('Budget not found');
      }

      const offlineBudget = normalizeBudget({
        ...existing,
        ...payload,
        id,
        spent: existing.spent,
        updatedAt: new Date()
      });
      dispatch({ type: 'UPDATE_BUDGET', payload: offlineBudget });
      return offlineBudget;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update budget' });
      throw error;
    }
  };

  const deleteBudget = async (id: string): Promise<void> => {
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      if (state.isOnline) {
        const response = await apiService.deleteBudget(id);
        if (!response.success) {
          throw new Error('Failed to delete budget');
        }
      }

      dispatch({ type: 'DELETE_BUDGET', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete budget' });
      throw error;
    }
  };

  const createExpense = async (payload: ExpensePayload): Promise<Expense> => {
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      if (state.isOnline) {
        const response = await apiService.createExpense(payload);
        if (!response.success || !response.data) {
          throw new Error('Failed to create expense');
        }
        const expense = normalizeExpense(response.data);
        dispatch({ type: 'ADD_EXPENSE', payload: expense });
        return expense;
      }

      const offlineExpense = normalizeExpense({
        ...payload,
        status: payload.status ?? 'pending'
      });
      dispatch({ type: 'ADD_EXPENSE', payload: offlineExpense });
      return offlineExpense;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create expense' });
      throw error;
    }
  };

  const updateExpense = async (id: string, payload: Partial<ExpensePayload>): Promise<Expense> => {
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      if (state.isOnline) {
        const response = await apiService.updateExpense(id, payload);
        if (!response.success || !response.data) {
          throw new Error('Failed to update expense');
        }
        const expense = normalizeExpense(response.data);
        dispatch({ type: 'UPDATE_EXPENSE', payload: expense });
        return expense;
      }

      const existing = state.expenses.find(expense => expense.id === id);
      if (!existing) {
        throw new Error('Expense not found');
      }

      const offlineExpense = normalizeExpense({
        ...existing,
        ...payload,
        id,
        status: payload.status ?? existing.status
      });
      dispatch({ type: 'UPDATE_EXPENSE', payload: offlineExpense });
      return offlineExpense;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update expense' });
      throw error;
    }
  };

  const approveExpense = async (id: string): Promise<Expense> => {
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      if (state.isOnline) {
        const response = await apiService.approveExpense(id);
        if (!response.success || !response.data) {
          throw new Error('Failed to approve expense');
        }
        const expense = normalizeExpense(response.data);
        dispatch({ type: 'UPDATE_EXPENSE', payload: expense });
        return expense;
      }

      const existing = state.expenses.find(expense => expense.id === id);
      if (!existing) {
        throw new Error('Expense not found');
      }

      const offlineExpense: Expense = {
        ...existing,
        status: 'approved',
        approvedBy: existing.approvedBy ?? 'offline-user'
      };
      dispatch({ type: 'UPDATE_EXPENSE', payload: offlineExpense });
      return offlineExpense;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to approve expense' });
      throw error;
    }
  };

  const rejectExpense = async (id: string): Promise<Expense> => {
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      if (state.isOnline) {
        const response = await apiService.rejectExpense(id);
        if (!response.success || !response.data) {
          throw new Error('Failed to reject expense');
        }
        const expense = normalizeExpense(response.data);
        dispatch({ type: 'UPDATE_EXPENSE', payload: expense });
        return expense;
      }

      const existing = state.expenses.find(expense => expense.id === id);
      if (!existing) {
        throw new Error('Expense not found');
      }

      const offlineExpense: Expense = {
        ...existing,
        status: 'rejected'
      };
      dispatch({ type: 'UPDATE_EXPENSE', payload: offlineExpense });
      return offlineExpense;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to reject expense' });
      throw error;
    }
  };

  const deleteExpense = async (id: string): Promise<void> => {
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      if (state.isOnline) {
        const response = await apiService.deleteExpense(id);
        if (!response.success) {
          throw new Error('Failed to delete expense');
        }
      }

      dispatch({ type: 'DELETE_EXPENSE', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete expense' });
      throw error;
    }
  };

  const refreshData = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      if (state.isOnline) {
        // Fetch all data from API when backend is connected
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

        if (budgetsResult.status === 'fulfilled') {
          dispatch({
            type: 'SET_BUDGETS',
            payload: normalizeBudgets(budgetsResult.value.data as any[] | undefined)
          });
        } else {
          console.error('Failed to load budgets:', budgetsResult.reason);
          failedResources.push('budgets');
        }

        if (expensesResult.status === 'fulfilled') {
          dispatch({
            type: 'SET_EXPENSES',
            payload: normalizeExpenses(expensesResult.value.data as any[] | undefined)
          });
        } else {
          console.error('Failed to load expenses:', expensesResult.reason);
          failedResources.push('expenses');
        }

        if (transactionsResult.status === 'fulfilled') {
          dispatch({
            type: 'SET_TRANSACTIONS',
            payload: normalizeTransactions(transactionsResult.value.data as any[] | undefined)
          });
        } else {
          console.error('Failed to load transactions:', transactionsResult.reason);
          failedResources.push('transactions');
        }

        if (usersResult.status === 'fulfilled') {
          dispatch({
            type: 'SET_USERS',
            payload: normalizeUsers(usersResult.value.data as any[] | undefined)
          });
        } else {
          console.error('Failed to load users:', usersResult.reason);
          failedResources.push('users');
        }

        if (categoriesResult.status === 'fulfilled') {
          dispatch({
            type: 'SET_CATEGORIES',
            payload: normalizeCategories(categoriesResult.value.data as any[] | undefined)
          });
        } else {
          console.error('Failed to load categories:', categoriesResult.reason);
          failedResources.push('categories');
        }

        if (metricsResult.status === 'fulfilled') {
          dispatch({
            type: 'SET_METRICS',
            payload: normalizeMetrics(metricsResult.value.data as any)
          });
        } else {
          console.error('Failed to load metrics:', metricsResult.reason);
        }

        if (failedResources.length > 0) {
          dispatch({
            type: 'SET_ERROR',
            payload: `Some data failed to refresh: ${failedResources.join(', ')}`
          });
        }
      } else {
        // Recalculate metrics from local data
        const newMetrics = calculateMetrics(state);
        dispatch({ type: 'SET_METRICS', payload: newMetrics });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to refresh data' });
      console.error('Error refreshing data:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        refreshData,
        createBudget,
        updateBudget,
        deleteBudget,
        createExpense,
        updateExpense,
        approveExpense,
        rejectExpense,
        deleteExpense
      }}
    >
      {children}
    </AppContext.Provider>
  );
};