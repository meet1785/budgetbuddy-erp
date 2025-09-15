import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAppContext } from "@/context/AppContext";
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, CheckCircle2 } from "lucide-react";

interface DashboardWidgetProps {
  title: string;
  type: 'metric' | 'budget' | 'alert' | 'progress';
  className?: string;
}

export const DashboardWidget = ({ title, type, className }: DashboardWidgetProps) => {
  const { state } = useAppContext();

  const renderMetricWidget = () => {
    const totalBudget = state.budgets.reduce((sum, budget) => sum + budget.allocated, 0);
    const totalSpent = state.budgets.reduce((sum, budget) => sum + budget.spent, 0);
    const utilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    const variance = totalBudget - totalSpent;
    const isPositive = variance >= 0;

    return (
      <Card className={`animate-fade-in ${className}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Budget Overview</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalBudget.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            {isPositive ? (
              <TrendingUp className="h-3 w-3 text-green-600" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-600" />
            )}
            {Math.abs(variance).toLocaleString()} {isPositive ? 'remaining' : 'over budget'}
          </p>
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span>Utilization</span>
              <span>{utilization.toFixed(1)}%</span>
            </div>
            <Progress value={utilization} className="h-2" />
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderBudgetWidget = () => {
    const budgetsByStatus = {
      onTrack: state.budgets.filter(b => b.status === 'on-track').length,
      warning: state.budgets.filter(b => b.status === 'warning').length,
      overBudget: state.budgets.filter(b => b.status === 'over-budget').length
    };

    return (
      <Card className={`animate-fade-in ${className}`}>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Budget Status</CardTitle>
          <CardDescription>{state.budgets.length} active budgets</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-sm">On Track</span>
            </div>
            <Badge variant="default" className="bg-green-100 text-green-800">
              {budgetsByStatus.onTrack}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm">Warning</span>
            </div>
            <Badge variant="default" className="bg-yellow-100 text-yellow-800">
              {budgetsByStatus.warning}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <span className="text-sm">Over Budget</span>
            </div>
            <Badge variant="destructive">
              {budgetsByStatus.overBudget}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderAlertWidget = () => {
    const pendingExpenses = state.expenses.filter(e => e.status === 'pending').length;
    const criticalBudgets = state.budgets.filter(b => b.status === 'over-budget').length;
    const warningBudgets = state.budgets.filter(b => b.status === 'warning').length;
    const totalAlerts = criticalBudgets + warningBudgets + (pendingExpenses > 5 ? 1 : 0);

    return (
      <Card className={`animate-fade-in ${className}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">System Alerts</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalAlerts}</div>
          <p className="text-xs text-muted-foreground">Active alerts</p>
          <div className="mt-3 space-y-2">
            {criticalBudgets > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-red-600">Over Budget</span>
                <span>{criticalBudgets}</span>
              </div>
            )}
            {warningBudgets > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-yellow-600">Budget Warning</span>
                <span>{warningBudgets}</span>
              </div>
            )}
            {pendingExpenses > 5 && (
              <div className="flex justify-between text-xs">
                <span className="text-blue-600">Pending Approvals</span>
                <span>{pendingExpenses}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderProgressWidget = () => {
    const currentMonth = new Date().getMonth();
    const monthProgress = ((currentMonth + 1) / 12) * 100;
    const yearlyTarget = 1000000; // $1M yearly target
    const currentSpent = state.expenses
      .filter(e => e.status === 'approved')
      .reduce((sum, e) => sum + e.amount, 0);
    const targetProgress = (currentSpent / yearlyTarget) * 100;

    return (
      <Card className={`animate-fade-in ${className}`}>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Annual Progress</CardTitle>
          <CardDescription>Year-to-date financial progress</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Year Progress</span>
              <span>{monthProgress.toFixed(0)}%</span>
            </div>
            <Progress value={monthProgress} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Spending vs Target</span>
              <span>{targetProgress.toFixed(1)}%</span>
            </div>
            <Progress 
              value={targetProgress} 
              className="h-2" 
              // Change color based on progress vs time
              // If spending is ahead of time, show warning color
            />
            <p className="text-xs text-muted-foreground mt-1">
              ${currentSpent.toLocaleString()} of ${yearlyTarget.toLocaleString()} target
            </p>
          </div>
        </CardContent>
      </Card>
    );
  };

  switch (type) {
    case 'metric':
      return renderMetricWidget();
    case 'budget':
      return renderBudgetWidget();
    case 'alert':
      return renderAlertWidget();
    case 'progress':
      return renderProgressWidget();
    default:
      return renderMetricWidget();
  }
};