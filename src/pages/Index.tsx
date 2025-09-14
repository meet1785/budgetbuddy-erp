import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import DashboardOverview from "@/components/dashboard/dashboard-overview";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Financial Dashboard</h1>
              <p className="text-muted-foreground">
                Monitor your organization's budgets, expenses, and financial performance.
              </p>
            </div>
            <DashboardOverview />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
