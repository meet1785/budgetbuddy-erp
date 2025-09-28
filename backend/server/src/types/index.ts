import { Document } from 'mongoose';

export interface IBudget extends Document {
  _id: string;
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

export interface IExpense extends Document {
  _id: string;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface ITransaction extends Document {
  _id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: Date;
  account: string;
  reference?: string;
  status: 'completed' | 'pending' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'user';
  department: string;
  avatar?: string;
  permissions: string[];
  createdAt: Date;
  lastLogin?: Date;
  isActive: boolean;
  tokenVersion: number;
  comparePassword(candidatePassword: string): Promise<boolean>;
  updateLastLogin(): Promise<IUser>;
}

export interface ICategory extends Document {
  _id: string;
  name: string;
  description?: string;
  budget?: number;
  color: string;
  parentId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
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