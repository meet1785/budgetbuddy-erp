import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAppContext } from "@/context/AppContext";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  AlertCircle, 
  Calendar,
  Users,
  Activity,
  Target
} from "lucide-react";

interface DashboardWidgetProps {
  type: 'budget-status' | 'expense-trends' | 'pending-approvals' | 'team-spending' | 'goals' | 'alerts';
  className?: string;
}

export const DashboardWidget = ({ type, className }: DashboardWidgetProps) => {
  const { state } = useAppContext();

  const renderBudgetStatus = () => {
    const totalBudget = state.budgets.reduce((sum, b) => sum + b.allocated, 0);
    const totalSpent = state.budgets.reduce((sum, b) => sum + b.spent, 0);
    const utilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    const overBudgetCount = state.budgets.filter(b => b.status === 'over-budget').length;
    const warningCount = state.budgets.filter(b => b.status === 'warning').length;

    return (
      <Card className={`animate-fade-in ${className}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Budget Overview</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="text-2xl font-bold">${totalSpent.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                of ${totalBudget.toLocaleString()} allocated
              </p>
            </div>
            
            <Progress value={utilization} className="h-2" />
            
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{utilization.toFixed(1)}% used</span>
              <span className="text-muted-foreground">
                ${(totalBudget - totalSpent).toLocaleString()} remaining
              </span>
            </div>
            
            {(overBudgetCount > 0 || warningCount > 0) && (
              <div className="flex gap-2">
                {overBudgetCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {overBudgetCount} over budget
                  </Badge>
                )}
                {warningCount > 0 && (
                  <Badge variant="default" className="text-xs bg-yellow-100 text-yellow-800">
                    {warningCount} at warning
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderExpenseTrends = () => {
    const thisMonthExpenses = state.expenses
      .filter(e => {
        const expenseDate = new Date(e.date);
        const now = new Date();
        return expenseDate.getMonth() === now.getMonth() && 
               expenseDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, e) => sum + e.amount, 0);

    const lastMonthExpenses = state.expenses
      .filter(e => {
        const expenseDate = new Date(e.date);
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        return expenseDate.getMonth() === lastMonth.getMonth() && 
               expenseDate.getFullYear() === lastMonth.getFullYear();
      })
      .reduce((sum, e) => sum + e.amount, 0);

    const trend = lastMonthExpenses > 0 ? 
      ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 : 0;
    const isIncreasing = trend > 0;

    return (
      <Card className={`animate-fade-in ${className}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Expense Trends</CardTitle>
          {isIncreasing ? 
            <TrendingUp className="h-4 w-4 text-red-500" /> : 
            <TrendingDown className="h-4 w-4 text-green-500" />
          }
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-2xl font-bold">${thisMonthExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This month</p>
            
            <div className={`flex items-center gap-1 text-xs ${
              isIncreasing ? 'text-red-600' : 'text-green-600'
            }`}>
              {isIncreasing ? 
                <TrendingUp className="h-3 w-3" /> : 
                <TrendingDown className="h-3 w-3" />
              }
              <span>
                {Math.abs(trend).toFixed(1)}% vs last month
              </span>
            </div>
            
            <div className="text-xs text-muted-foreground">
              Last month: ${lastMonthExpenses.toLocaleString()}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderPendingApprovals = () => {
    const pendingExpenses = state.expenses.filter(e => e.status === 'pending');
    const totalPendingAmount = pendingExpenses.reduce((sum, e) => sum + e.amount, 0);

    return (
      <Card className={`animate-fade-in ${className}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
          <AlertCircle className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-2xl font-bold">{pendingExpenses.length}</div>
            <p className="text-xs text-muted-foreground">expenses pending</p>
            
            {totalPendingAmount > 0 && (
              <div className="text-sm font-medium text-orange-600">
                ${totalPendingAmount.toLocaleString()} total
              </div>
            )}
            
            {pendingExpenses.length > 0 && (
              <Button size="sm" variant="outline" className="w-full mt-2">
                Review Expenses
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderTeamSpending = () => {
    const departments = [...new Set(state.expenses.map(e => e.department))];
    const departmentSpending = departments.map(dept => ({
      name: dept,
      amount: state.expenses
        .filter(e => e.department === dept && e.status === 'approved')
        .reduce((sum, e) => sum + e.amount, 0)
    })).sort((a, b) => b.amount - a.amount);

    const topDepartment = departmentSpending[0];

    return (
      <Card className={`animate-fade-in ${className}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Team Spending</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topDepartment && (
              <div>
                <div className="text-2xl font-bold">${topDepartment.amount.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {topDepartment.name} (top spender)
                </p>
              </div>
            )}
            
            <div className="space-y-1">
              {departmentSpending.slice(0, 3).map((dept, index) => (
                <div key={dept.name} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{dept.name}</span>
                  <span className="font-medium">${dept.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderGoals = () => {
    const totalBudget = state.budgets.reduce((sum, b) => sum + b.allocated, 0);
    const totalSpent = state.budgets.reduce((sum, b) => sum + b.spent, 0);
    const savingsGoal = state.metrics.savingsGoal;
    const currentSavings = totalBudget - totalSpent;
    const goalProgress = savingsGoal > 0 ? (currentSavings / savingsGoal) * 100 : 0;

    return (
      <Card className={`animate-fade-in ${className}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Savings Goal</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="text-2xl font-bold">${currentSavings.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                of ${savingsGoal.toLocaleString()} goal
              </p>
            </div>
            
            <Progress value={Math.min(goalProgress, 100)} className="h-2" />
            
            <div className="text-xs text-muted-foreground">
              {goalProgress >= 100 ? '🎉 Goal achieved!' : 
               `${goalProgress.toFixed(1)}% towards goal`}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderAlerts = () => {
    const overBudgetCount = state.budgets.filter(b => b.status === 'over-budget').length;
    const warningCount = state.budgets.filter(b => b.status === 'warning').length;
    const pendingCount = state.expenses.filter(e => e.status === 'pending').length;

    const totalAlerts = overBudgetCount + warningCount + (pendingCount > 0 ? 1 : 0);

    return (
      <Card className={`animate-fade-in ${className}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Alerts</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-2xl font-bold">{totalAlerts}</div>
            <p className="text-xs text-muted-foreground">active alerts</p>
            
            {totalAlerts > 0 && (
              <div className="space-y-1">
                {overBudgetCount > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-red-600">Over budget</span>
                    <span className="font-medium">{overBudgetCount}</span>
                  </div>
                )}
                {warningCount > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-yellow-600">Warning</span>
                    <span className="font-medium">{warningCount}</span>
                  </div>
                )}
                {pendingCount > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-blue-600">Pending approval</span>
                    <span className="font-medium">{pendingCount}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  switch (type) {
    case 'budget-status':
      return renderBudgetStatus();
    case 'expense-trends':
      return renderExpenseTrends();
    case 'pending-approvals':
      return renderPendingApprovals();
    case 'team-spending':
      return renderTeamSpending();
    case 'goals':
      return renderGoals();
    case 'alerts':
      return renderAlerts();
    default:
      return null;
  }
};