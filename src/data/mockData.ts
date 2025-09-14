import { Budget, Expense, Transaction, User, Category, DashboardMetrics } from '@/types';

export const mockCategories: Category[] = [
  { id: '1', name: 'Operations', description: 'Day-to-day operational expenses', color: '#3B82F6', isActive: true },
  { id: '2', name: 'Marketing', description: 'Marketing and advertising expenses', color: '#10B981', isActive: true },
  { id: '3', name: 'Development', description: 'Software development costs', color: '#F59E0B', isActive: true },
  { id: '4', name: 'Administration', description: 'Administrative expenses', color: '#8B5CF6', isActive: true },
  { id: '5', name: 'Travel', description: 'Business travel expenses', color: '#EF4444', isActive: true },
  { id: '6', name: 'Equipment', description: 'Office equipment and supplies', color: '#06B6D4', isActive: true },
];

export const mockBudgets: Budget[] = [
  {
    id: '1',
    name: 'Q4 Operations Budget',
    category: 'Operations',
    allocated: 50000,
    spent: 45200,
    remaining: 4800,
    period: 'quarterly',
    status: 'warning',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-03-15')
  },
  {
    id: '2',
    name: 'Marketing Campaign 2024',
    category: 'Marketing',
    allocated: 20000,
    spent: 12500,
    remaining: 7500,
    period: 'monthly',
    status: 'on-track',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-03-10')
  },
  {
    id: '3',
    name: 'Development Sprint Budget',
    category: 'Development',
    allocated: 35000,
    spent: 28300,
    remaining: 6700,
    period: 'monthly',
    status: 'on-track',
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-20')
  },
  {
    id: '4',
    name: 'Administrative Expenses',
    category: 'Administration',
    allocated: 15000,
    spent: 8900,
    remaining: 6100,
    period: 'monthly',
    status: 'on-track',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-03-18')
  }
];

export const mockExpenses: Expense[] = [
  {
    id: '1',
    description: 'Office Rent - March 2024',
    amount: 8500,
    category: 'Operations',
    budgetId: '1',
    date: new Date('2024-03-01'),
    vendor: 'Property Management Co.',
    status: 'approved',
    approvedBy: 'John Manager',
    tags: ['recurring', 'rent'],
    department: 'Administration'
  },
  {
    id: '2',
    description: 'Google Ads Campaign',
    amount: 2300,
    category: 'Marketing',
    budgetId: '2',
    date: new Date('2024-03-15'),
    vendor: 'Google LLC',
    status: 'approved',
    approvedBy: 'Sarah Smith',
    tags: ['advertising', 'digital'],
    department: 'Marketing'
  },
  {
    id: '3',
    description: 'Software Development Tools',
    amount: 4200,
    category: 'Development',
    budgetId: '3',
    date: new Date('2024-03-10'),
    vendor: 'JetBrains',
    status: 'approved',
    approvedBy: 'Tech Lead',
    tags: ['software', 'tools'],
    department: 'Engineering'
  },
  {
    id: '4',
    description: 'Business Travel - Client Meeting',
    amount: 1800,
    category: 'Travel',
    date: new Date('2024-03-20'),
    vendor: 'American Airlines',
    status: 'pending',
    tags: ['travel', 'client'],
    department: 'Sales'
  },
  {
    id: '5',
    description: 'Office Supplies',
    amount: 450,
    category: 'Equipment',
    budgetId: '4',
    date: new Date('2024-03-18'),
    vendor: 'Staples',
    status: 'approved',
    approvedBy: 'Office Manager',
    tags: ['supplies', 'office'],
    department: 'Administration'
  }
];

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'expense',
    amount: 8500,
    description: 'Office Rent Payment',
    category: 'Operations',
    date: new Date('2024-03-01'),
    account: 'Business Checking',
    reference: 'CHK-001234',
    status: 'completed'
  },
  {
    id: '2',
    type: 'income',
    amount: 25000,
    description: 'Client Payment - Project Alpha',
    category: 'Revenue',
    date: new Date('2024-03-15'),
    account: 'Business Checking',
    reference: 'DEP-005678',
    status: 'completed'
  },
  {
    id: '3',
    type: 'expense',
    amount: 2300,
    description: 'Marketing Campaign',
    category: 'Marketing',
    date: new Date('2024-03-15'),
    account: 'Business Credit Card',
    reference: 'CC-009876',
    status: 'completed'
  },
  {
    id: '4',
    type: 'expense',
    amount: 4200,
    description: 'Software Licenses',
    category: 'Development',
    date: new Date('2024-03-10'),
    account: 'Business Credit Card',
    reference: 'CC-009875',
    status: 'completed'
  },
  {
    id: '5',
    type: 'expense',
    amount: 1800,
    description: 'Business Travel',
    category: 'Travel',
    date: new Date('2024-03-20'),
    account: 'Business Credit Card',
    reference: 'CC-009877',
    status: 'pending'
  }
];

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@company.com',
    role: 'admin',
    department: 'Administration',
    avatar: '/avatars/john.jpg',
    permissions: ['view_all', 'edit_all', 'delete_all', 'approve_expenses'],
    createdAt: new Date('2024-01-01'),
    lastLogin: new Date('2024-03-20')
  },
  {
    id: '2',
    name: 'Sarah Smith',
    email: 'sarah.smith@company.com',
    role: 'manager',
    department: 'Marketing',
    avatar: '/avatars/sarah.jpg',
    permissions: ['view_department', 'edit_department', 'approve_expenses'],
    createdAt: new Date('2024-01-15'),
    lastLogin: new Date('2024-03-19')
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike.johnson@company.com',
    role: 'user',
    department: 'Engineering',
    avatar: '/avatars/mike.jpg',
    permissions: ['view_own', 'create_expenses'],
    createdAt: new Date('2024-02-01'),
    lastLogin: new Date('2024-03-18')
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily.davis@company.com',
    role: 'manager',
    department: 'Finance',
    avatar: '/avatars/emily.jpg',
    permissions: ['view_all', 'edit_budgets', 'approve_expenses'],
    createdAt: new Date('2024-01-20'),
    lastLogin: new Date('2024-03-20')
  }
];

export const mockMetrics: DashboardMetrics = {
  totalBudget: 125450,
  totalExpenses: 89320,
  remainingBudget: 36130,
  savingsGoal: 15000,
  monthlyBurnRate: 29773,
  budgetUtilization: 71.2,
  expenseGrowth: 8.2,
  categoryBreakdown: [
    { category: 'Operations', amount: 45200, percentage: 50.6 },
    { category: 'Development', amount: 28300, percentage: 31.7 },
    { category: 'Marketing', amount: 12500, percentage: 14.0 },
    { category: 'Administration', amount: 8900, percentage: 10.0 },
    { category: 'Travel', amount: 1800, percentage: 2.0 },
    { category: 'Equipment', amount: 450, percentage: 0.5 }
  ]
};