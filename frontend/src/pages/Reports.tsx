import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppContext } from "@/context/AppContext";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Download, FileText, TrendingUp, Calendar, DollarSign } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ReportGenerator } from "@/components/advanced/ReportGenerator";
import { BudgetAlerts } from "@/components/advanced/BudgetAlerts";
import { formatCurrency } from "@/utils/currency";

const Reports = () => {
  const { state } = useAppContext();

  // Mock monthly data for charts
  const monthlyData = [
    { month: 'Jan', expenses: 75000, budget: 85000, revenue: 120000 },
    { month: 'Feb', expenses: 82000, budget: 85000, revenue: 135000 },
    { month: 'Mar', expenses: 89320, budget: 125450, revenue: 145000 },
    { month: 'Apr', expenses: 78000, budget: 90000, revenue: 140000 },
    { month: 'May', expenses: 85000, budget: 95000, revenue: 150000 },
    { month: 'Jun', expenses: 92000, budget: 100000, revenue: 160000 },
  ];

  const handleExportReport = (reportType: string) => {
    toast({
      title: "Report Generated",
      description: `${reportType} report has been exported successfully.`,
    });
  };

  const generateQuickStats = () => {
    const totalBudget = state.budgets.reduce((sum, budget) => sum + budget.allocated, 0);
    const totalSpent = state.budgets.reduce((sum, budget) => sum + budget.spent, 0);
    const averageUtilization = (totalSpent / totalBudget) * 100;
    const topCategory = state.metrics.categoryBreakdown[0];

    return {
      totalBudget,
      totalSpent,
      averageUtilization,
      topCategory,
      totalExpenses: state.expenses.length,
      pendingApprovals: state.expenses.filter(e => e.status === 'pending').length
    };
  };

  const stats = generateQuickStats();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight animate-fade-in">Financial Reports</h1>
          <p className="text-muted-foreground animate-fade-in">
            Comprehensive financial analytics and reporting dashboard.
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExportReport("Budget Analysis")}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => handleExportReport("Expense Summary")}>
            <FileText className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalBudget)}</div>
            <p className="text-xs text-muted-foreground">
              Across {state.budgets.length} budgets
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Utilization</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageUtilization.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(stats.totalSpent)} spent
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.topCategory?.category}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(stats.topCategory?.amount || 0)} spent
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">
              Out of {stats.totalExpenses} expenses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>Monthly Expense Trends</CardTitle>
            <CardDescription>Budget vs actual spending over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => [formatCurrency(value), '']} />
                <Legend />
                <Line type="monotone" dataKey="budget" stroke="#3B82F6" strokeWidth={2} name="Budget" />
                <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} name="Expenses" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>Revenue vs Expenses</CardTitle>
            <CardDescription>Financial performance overview</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => [formatCurrency(value), '']} />
                <Legend />
                <Area type="monotone" dataKey="revenue" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Revenue" />
                <Area type="monotone" dataKey="expenses" stackId="2" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} name="Expenses" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Features */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ReportGenerator />
        <BudgetAlerts />
      </div>

      {/* Report Templates */}
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle>Report Templates</CardTitle>
          <CardDescription>Pre-built reports for common financial analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "Budget Performance", description: "Detailed budget vs actual analysis", type: "Monthly" },
              { name: "Expense Analysis", description: "Category-wise expense breakdown", type: "Quarterly" },
              { name: "Variance Report", description: "Budget variance analysis", type: "Monthly" },
              { name: "Cash Flow Statement", description: "Income and expense flow", type: "Monthly" },
              { name: "Department Summary", description: "Department-wise spending", type: "Quarterly" },
              { name: "Vendor Analysis", description: "Top vendors and spending patterns", type: "Yearly" }
            ].map((report, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{report.name}</CardTitle>
                    <Badge variant="outline">{report.type}</Badge>
                  </div>
                  <CardDescription>{report.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleExportReport(report.name)}
                  >
                    Generate Report
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;