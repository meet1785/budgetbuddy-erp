import DashboardOverview from "@/components/dashboard/dashboard-overview";
import { BudgetPieChart, BudgetBarChart, ExpenseTrendsChart, BudgetUtilizationChart } from "@/components/charts/BudgetChart";
import { useAppContext } from "@/context/AppContext";
import { BudgetHealthCard } from "@/components/budget/BudgetHealth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard = () => {
  const { state } = useAppContext();
  
  // Get top 6 budgets by allocation for dashboard display
  const topBudgets = [...state.budgets]
    .sort((a, b) => b.allocated - a.allocated)
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight animate-fade-in">Financial Dashboard</h1>
        <p className="text-muted-foreground animate-fade-in">
          Monitor your organization's budgets, expenses, and financial performance.
        </p>
      </div>
      
      <DashboardOverview />
      
      {/* Budget Health Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Health Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topBudgets.map((budget) => (
              <BudgetHealthCard key={budget.id} budget={budget} />
            ))}
          </div>
          {state.budgets.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              No budgets created yet. Create your first budget to see health indicators.
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BudgetPieChart />
        <BudgetBarChart />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExpenseTrendsChart />
        <BudgetUtilizationChart />
      </div>
    </div>
  );
};

export default Dashboard;