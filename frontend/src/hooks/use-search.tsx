import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { formatCurrency } from '@/utils/currency';
import { 
  Wallet, 
  Receipt, 
  CreditCard, 
  Users, 
  DollarSign 
} from 'lucide-react';

export interface SearchResult {
  type: 'budget' | 'expense' | 'transaction' | 'user' | 'category';
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  path: string;
}

export const useSearch = () => {
  const { state } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results: SearchResult[] = [];

    // Search budgets
    const matchingBudgets = state.budgets.filter(
      budget => 
        budget.name.toLowerCase().includes(query) ||
        budget.category.toLowerCase().includes(query)
    ).map(budget => ({
      type: 'budget' as const,
      id: budget.id,
      title: budget.name,
      subtitle: `${budget.category} • ${formatCurrency(budget.spent)} / ${formatCurrency(budget.allocated)}`,
      icon: Wallet,
      path: '/budgets'
    }));

    // Search expenses
    const matchingExpenses = state.expenses.filter(
      expense => 
        expense.description.toLowerCase().includes(query) ||
        expense.category.toLowerCase().includes(query) ||
        expense.vendor.toLowerCase().includes(query)
    ).map(expense => ({
      type: 'expense' as const,
      id: expense.id,
      title: expense.description,
      subtitle: `${expense.category} • ${formatCurrency(expense.amount)} • ${expense.vendor}`,
      icon: Receipt,
      path: '/expenses'
    }));

    // Search transactions
    const matchingTransactions = state.transactions.filter(
      transaction => 
        transaction.description.toLowerCase().includes(query) ||
        transaction.category.toLowerCase().includes(query) ||
        transaction.account.toLowerCase().includes(query)
    ).map(transaction => ({
      type: 'transaction' as const,
      id: transaction.id,
      title: transaction.description,
      subtitle: `${transaction.category} • ${formatCurrency(transaction.amount)} • ${transaction.account}`,
      icon: CreditCard,
      path: '/transactions'
    }));

    // Search users
    const matchingUsers = state.users.filter(
      user => 
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.department.toLowerCase().includes(query)
    ).map(user => ({
      type: 'user' as const,
      id: user.id,
      title: user.name,
      subtitle: `${user.email} • ${user.department} • ${user.role}`,
      icon: Users,
      path: '/users'
    }));

    // Search categories
    const matchingCategories = state.categories.filter(
      category => 
        category.name.toLowerCase().includes(query) ||
        (category.description && category.description.toLowerCase().includes(query))
    ).map(category => ({
      type: 'category' as const,
      id: category.id,
      title: category.name,
      subtitle: category.description || 'Category',
      icon: DollarSign,
      path: '/categories'
    }));

    // Combine and limit results
    results.push(...matchingBudgets.slice(0, 3));
    results.push(...matchingExpenses.slice(0, 3));
    results.push(...matchingTransactions.slice(0, 3));
    results.push(...matchingUsers.slice(0, 2));
    results.push(...matchingCategories.slice(0, 2));

    setSearchResults(results.slice(0, 10)); // Limit to 10 results
  }, [searchQuery, state]);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    hasResults: searchResults.length > 0
  };
};