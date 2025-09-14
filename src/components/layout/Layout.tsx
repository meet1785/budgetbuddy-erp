import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { useAppContext } from "@/context/AppContext";
import { mockBudgets, mockExpenses, mockTransactions, mockUsers, mockCategories, mockMetrics } from "@/data/mockData";

const Layout = () => {
  const { dispatch } = useAppContext();

  useEffect(() => {
    // Initialize mock data
    dispatch({ type: 'SET_BUDGETS', payload: mockBudgets });
    dispatch({ type: 'SET_EXPENSES', payload: mockExpenses });
    dispatch({ type: 'SET_TRANSACTIONS', payload: mockTransactions });
    dispatch({ type: 'SET_USERS', payload: mockUsers });
    dispatch({ type: 'SET_CATEGORIES', payload: mockCategories });
    dispatch({ type: 'SET_METRICS', payload: mockMetrics });
    dispatch({ type: 'SET_CURRENT_USER', payload: mockUsers[0] });
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;