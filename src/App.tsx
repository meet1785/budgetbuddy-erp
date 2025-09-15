import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider, useAppContext } from "@/context/AppContext";
import { mockData } from "@/data/mockData";
import React from "react";
import Dashboard from "./pages/Dashboard";
import Budgets from "./pages/Budgets";
import Expenses from "./pages/Expenses";
import Reports from "./pages/Reports";
import Transactions from "./pages/Transactions";
import Categories from "./pages/Categories";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import Layout from "./components/layout/Layout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Component to initialize data if localStorage is empty
function DataInitializer() {
  const { state, dispatch } = useAppContext();
  
  React.useEffect(() => {
    // Only initialize if we have no data
    if (state.categories.length === 0 && state.budgets.length === 0) {
      // Initialize with mock data
      dispatch({ type: 'SET_CATEGORIES', payload: mockData.categories });
      dispatch({ type: 'SET_BUDGETS', payload: mockData.budgets });
      dispatch({ type: 'SET_EXPENSES', payload: mockData.expenses });
      dispatch({ type: 'SET_TRANSACTIONS', payload: mockData.transactions });
      dispatch({ type: 'SET_USERS', payload: mockData.users });
      dispatch({ type: 'SET_CURRENT_USER', payload: mockData.users[0] });
    }
  }, [state.categories.length, state.budgets.length, dispatch]);

  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <DataInitializer />
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="budgets" element={<Budgets />} />
              <Route path="expenses" element={<Expenses />} />
              <Route path="reports" element={<Reports />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="categories" element={<Categories />} />
              <Route path="users" element={<Users />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
