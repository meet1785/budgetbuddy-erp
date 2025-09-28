export interface Budget {
  id: string;
  name: string;
  category: string;
  allocated: number;
  spent: number;
  remaining: number;
  period: 'monthly' | 'quarterly' | 'yearly';
  status: 'on-track' | 'warning' | 'over-budget';
  createdAt: Date;
  updatedAt: Date;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  budgetId?: string;
  date: Date;
  vendor: string;
  receiptUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  tags: string[];
  department: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: Date;
  account: string;
  reference?: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  department: string;
  avatar?: string;
  permissions: string[];
  createdAt: Date;
  lastLogin?: Date;
  isActive: boolean;
}

export interface Report {
  id: string;
  name: string;
  type: 'budget' | 'expense' | 'revenue' | 'profit-loss';
  period: {
    start: Date;
    end: Date;
  };
  data: Record<string, unknown>;
  createdBy: string;
  createdAt: Date;
}

export interface DashboardMetrics {
  totalBudget: number;
  totalExpenses: number;
  remainingBudget: number;
  savingsGoal: number;
  monthlyBurnRate: number;
  budgetUtilization: number;
  expenseGrowth: number;
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  budget?: number;
  color: string;
  parentId?: string;
  isActive: boolean;
}