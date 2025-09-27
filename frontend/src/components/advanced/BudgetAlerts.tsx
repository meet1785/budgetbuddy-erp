import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAppContext } from "@/context/AppContext";
import { AlertTriangle, TrendingUp, DollarSign, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  progress?: number;
  action?: string;
}

export const BudgetAlerts = () => {
  const { state } = useAppContext();

  // Calculate budget alerts
  const generateAlerts = () => {
    const alerts = [];

    // Over budget alerts
    const overBudgetItems = state.budgets.filter(budget => budget.status === 'over-budget');

    // Warning alerts (75-90% utilization)
    const warningItems = state.budgets.filter(budget => {
      const utilization = (budget.spent / budget.allocated) * 100;
      return utilization >= 75 && utilization < 90;
    });

    // Critical alerts (90%+ utilization)
    const criticalItems = state.budgets.filter(budget => {
      const utilization = (budget.spent / budget.allocated) * 100;
      return utilization >= 90 && budget.status !== 'over-budget';
    });

    // Pending expenses that might push budgets over
    const pendingExpenses = state.expenses.filter(expense => expense.status === 'pending');
    const budgetsAtRisk = state.budgets.filter(budget => {
      const relatedPending = pendingExpenses
        .filter(expense => expense.category === budget.category)
        .reduce((sum, expense) => sum + expense.amount, 0);
      
      const projectedSpending = budget.spent + relatedPending;
      const projectedUtilization = (projectedSpending / budget.allocated) * 100;
      
      return projectedUtilization >= 90;
    });

    // Add over budget alerts
    overBudgetItems.forEach(budget => {
      const overspend = budget.spent - budget.allocated;
      alerts.push({
        id: `over-${budget.id}`,
        type: 'critical' as const,
        title: `Budget Exceeded: ${budget.name}`,
        description: `Over budget by $${overspend.toLocaleString()}`,
        budget,
        action: 'review'
      });
    });

    // Add warning alerts
    warningItems.forEach(budget => {
      const utilization = (budget.spent / budget.allocated) * 100;
      alerts.push({
        id: `warning-${budget.id}`,
        type: 'warning' as const,
        title: `Budget Warning: ${budget.name}`,
        description: `${utilization.toFixed(1)}% of budget used`,
        budget,
        action: 'monitor'
      });
    });

    // Add critical alerts
    criticalItems.forEach(budget => {
      const utilization = (budget.spent / budget.allocated) * 100;
      alerts.push({
        id: `critical-${budget.id}`,
        type: 'critical' as const,
        title: `Budget Critical: ${budget.name}`,
        description: `${utilization.toFixed(1)}% of budget used`,
        budget,
        action: 'urgent'
      });
    });

    // Add at-risk alerts
    budgetsAtRisk.forEach(budget => {
      const relatedPending = pendingExpenses
        .filter(expense => expense.category === budget.category)
        .reduce((sum, expense) => sum + expense.amount, 0);
      
      alerts.push({
        id: `risk-${budget.id}`,
        type: 'info' as const,
        title: `Potential Overspend: ${budget.name}`,
        description: `$${relatedPending.toLocaleString()} in pending expenses`,
        budget,
        action: 'review'
      });
    });

    return alerts.slice(0, 5); // Show top 5 alerts
  };

  const alerts = generateAlerts();

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <TrendingUp className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <DollarSign className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getAlertBadgeVariant = (type: string) => {
    switch (type) {
      case 'critical':
        return 'destructive';
      case 'warning':
        return 'default';
      case 'info':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const handleAlertAction = (alert: Alert) => {
    toast({
      title: "Alert Acknowledged",
      description: `Marked "${alert.title}" for ${alert.action}.`,
    });
  };

  if (alerts.length === 0) {
    return (
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-green-500" />
            Budget Health
          </CardTitle>
          <CardDescription>
            All budgets are within healthy spending limits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="text-green-500 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-muted-foreground">No budget alerts at this time</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Budget Alerts
        </CardTitle>
        <CardDescription>
          Critical budget notifications and recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.map((alert, index) => (
          <div 
            key={alert.id} 
            className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                {getAlertIcon(alert.type)}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm">{alert.title}</h4>
                    <Badge variant={getAlertBadgeVariant(alert.type)} className="text-xs">
                      {alert.type.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{alert.description}</p>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleAlertAction(alert)}
              >
                {alert.action === 'urgent' ? 'Act Now' : 
                 alert.action === 'review' ? 'Review' : 'Monitor'}
              </Button>
            </div>
            
            {alert.budget && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Budget Progress</span>
                  <span>
                    ${alert.budget.spent.toLocaleString()} / ${alert.budget.allocated.toLocaleString()}
                  </span>
                </div>
                <Progress 
                  value={(alert.budget.spent / alert.budget.allocated) * 100} 
                  className="h-2"
                />
              </div>
            )}
          </div>
        ))}

        {alerts.length === 5 && (
          <div className="text-center pt-4">
            <Button variant="outline" size="sm">
              View All Alerts
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};