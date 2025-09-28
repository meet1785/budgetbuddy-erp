import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useAppContext } from "@/context/AppContext";
import { ThemeProvider } from "@/components/theme-provider";
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
import Login from "./pages/Login";
import Register from "./pages/Register";

const queryClient = new QueryClient();

const FullScreenLoader = ({ message }: { message: string }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-background text-muted-foreground">
    <div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
    <p className="mt-4 text-sm">{message}</p>
  </div>
);

// Component to initialize data if localStorage is empty
function DataInitializer() {
  const { state, dispatch } = useAppContext();
  const seededRef = React.useRef(false);
  
  React.useEffect(() => {
    if (seededRef.current) {
      return;
    }

    const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('auth_token');
    const shouldSeed =
      !state.loading &&
      !state.authLoading &&
      !state.isOnline &&
      !hasToken &&
      state.categories.length === 0 &&
      state.budgets.length === 0 &&
      state.expenses.length === 0 &&
      state.transactions.length === 0 &&
      state.users.length === 0;

    if (!shouldSeed) {
      return;
    }

    seededRef.current = true;
    dispatch({ type: 'SET_CATEGORIES', payload: mockData.categories });
    dispatch({ type: 'SET_BUDGETS', payload: mockData.budgets });
    dispatch({ type: 'SET_EXPENSES', payload: mockData.expenses });
    dispatch({ type: 'SET_TRANSACTIONS', payload: mockData.transactions });
    dispatch({ type: 'SET_USERS', payload: mockData.users });
  }, [
    state.categories.length,
    state.budgets.length,
    state.expenses.length,
    state.transactions.length,
    state.users.length,
    state.currentUser,
    state.loading,
    state.authLoading,
    state.isOnline,
    dispatch
  ]);

  return null;
}

const AppRoutes = () => {
  const { state } = useAppContext();

  if (state.authLoading && !state.currentUser) {
    return <FullScreenLoader message="Checking your session..." />;
  }

  if (!state.currentUser) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
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
      <Route path="login" element={<Navigate to="/" replace />} />
      <Route path="register" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="erp-ui-theme">
      <AppProvider>
        <DataInitializer />
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AppProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
