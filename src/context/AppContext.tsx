import React, { createContext, useContext, useReducer, ReactNode } from 'react';
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

const initialState: AppState = {
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

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_BUDGETS':
      return { ...state, budgets: action.payload };
    case 'ADD_BUDGET':
      return { ...state, budgets: [...state.budgets, action.payload] };
    case 'UPDATE_BUDGET':
      return {
        ...state,
        budgets: state.budgets.map(b => b.id === action.payload.id ? action.payload : b)
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

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};