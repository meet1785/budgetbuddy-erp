import DashboardOverview from "@/components/dashboard/dashboard-overview";
import { BudgetPieChart, BudgetBarChart } from "@/components/charts/BudgetChart";

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight animate-fade-in">Financial Dashboard</h1>
        <p className="text-muted-foreground animate-fade-in">
          Monitor your organization's budgets, expenses, and financial performance.
        </p>
      </div>
      
      <DashboardOverview />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BudgetPieChart />
        <BudgetBarChart />
      </div>
    </div>
  );
};

export default Dashboard;