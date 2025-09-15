import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { Budget, Expense, Transaction, User, Category, DashboardMetrics } from '@/types';

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
  | { type: 'SET_PERIOD'; payload: 'monthly' | 'quarterly' | 'yearly' };

// Load initial state from localStorage or use defaults
const loadInitialState = (): AppState => {
  try {
    const savedState = localStorage.getItem('erp-app-state');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      // Convert date strings back to Date objects
      if (parsed.expenses) {
        parsed.expenses = parsed.expenses.map((expense: any) => ({
          ...expense,
          date: new Date(expense.date)
        }));
      }
      if (parsed.transactions) {
        parsed.transactions = parsed.transactions.map((transaction: any) => ({
          ...transaction,
          date: new Date(transaction.date)
        }));
      }
      if (parsed.budgets) {
        parsed.budgets = parsed.budgets.map((budget: any) => ({
          ...budget,
          createdAt: new Date(budget.createdAt),
          updatedAt: new Date(budget.updatedAt)
        }));
      }
      return parsed;
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
    metrics: {
      totalBudget: 0,
      totalExpenses: 0,
      remainingBudget: 0,
      savingsGoal: 0,
      monthlyBurnRate: 0,
      budgetUtilization: 0,
      expenseGrowth: 0,
      categoryBreakdown: []
    },
    loading: false,
    selectedPeriod: 'monthly'
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
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

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
    localStorage.setItem('erp-app-state', JSON.stringify(state));
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
  }, [state]);

  // Auto-calculate metrics whenever relevant state changes
  useEffect(() => {
    const newMetrics = calculateMetrics(state);
    dispatch({ type: 'SET_METRICS', payload: newMetrics });
  }, [state.budgets, state.expenses, state.categories]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};