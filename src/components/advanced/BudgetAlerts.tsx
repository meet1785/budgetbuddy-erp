import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/context/AppContext";
import { AlertTriangle, CheckCircle, XCircle, Bell, Settings, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface BudgetAlert {
  id: string;
  budgetId: string;
  budgetName: string;
  type: 'warning' | 'critical' | 'exceeded';
  message: string;
  threshold: number;
  currentUtilization: number;
  createdAt: Date;
  acknowledged: boolean;
}

export const BudgetAlerts = () => {
  const { state } = useAppContext();
  const [alerts, setAlerts] = useState<BudgetAlert[]>([]);
  const [showSettings, setShowSettings] = useState(false);

  // Check for budget alerts
  useEffect(() => {
    const newAlerts: BudgetAlert[] = [];
    
    state.budgets.forEach(budget => {
      const utilization = (budget.spent / budget.allocated) * 100;
      
      if (utilization >= 100) {
        newAlerts.push({
          id: `${budget.id}-exceeded`,
          budgetId: budget.id,
          budgetName: budget.name,
          type: 'exceeded',
          message: `Budget has been exceeded by $${(budget.spent - budget.allocated).toLocaleString()}`,
          threshold: 100,
          currentUtilization: utilization,
          createdAt: new Date(),
          acknowledged: false
        });
      } else if (utilization >= 90) {
        newAlerts.push({
          id: `${budget.id}-critical`,
          budgetId: budget.id,
          budgetName: budget.name,
          type: 'critical',
          message: `Budget is critically close to limit (${utilization.toFixed(1)}% used)`,
          threshold: 90,
          currentUtilization: utilization,
          createdAt: new Date(),
          acknowledged: false
        });
      } else if (utilization >= 75) {
        newAlerts.push({
          id: `${budget.id}-warning`,
          budgetId: budget.id,
          budgetName: budget.name,
          type: 'warning',
          message: `Budget usage is approaching limit (${utilization.toFixed(1)}% used)`,
          threshold: 75,
          currentUtilization: utilization,
          createdAt: new Date(),
          acknowledged: false
        });
      }
    });

    setAlerts(newAlerts);
  }, [state.budgets]);

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, acknowledged: true }
        : alert
    ));
    
    toast({
      title: "Alert Acknowledged",
      description: "The budget alert has been marked as acknowledged.",
    });
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    
    toast({
      title: "Alert Dismissed",
      description: "The budget alert has been removed.",
    });
  };

  const getAlertIcon = (type: BudgetAlert['type']) => {
    switch (type) {
      case 'exceeded':
        return <XCircle className="h-4 w-4" />;
      case 'critical':
        return <AlertTriangle className="h-4 w-4" />;
      case 'warning':
        return <Bell className="h-4 w-4" />;
    }
  };

  const getAlertVariant = (type: BudgetAlert['type']) => {
    switch (type) {
      case 'exceeded':
        return 'destructive';
      case 'critical':
        return 'destructive';
      case 'warning':
        return 'default';
    }
  };

  const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged);
  const acknowledgedAlerts = alerts.filter(alert => alert.acknowledged);

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Budget Alerts & Notifications
              {unacknowledgedAlerts.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unacknowledgedAlerts.length}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Real-time budget monitoring and threshold alerts
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Alert Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-card p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">Exceeded</span>
            </div>
            <div className="text-2xl font-bold text-red-600">
              {alerts.filter(a => a.type === 'exceeded').length}
            </div>
          </div>
          
          <div className="bg-gradient-card p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">Critical</span>
            </div>
            <div className="text-2xl font-bold text-red-500">
              {alerts.filter(a => a.type === 'critical').length}
            </div>
          </div>

          <div className="bg-gradient-card p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium">Warning</span>
            </div>
            <div className="text-2xl font-bold text-yellow-600">
              {alerts.filter(a => a.type === 'warning').length}
            </div>
          </div>
        </div>

        {/* Active Alerts */}
        {unacknowledgedAlerts.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Active Alerts</h4>
            {unacknowledgedAlerts.map(alert => (
              <Alert key={alert.id} variant={getAlertVariant(alert.type)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getAlertIcon(alert.type)}
                      <AlertTitle className="text-sm">
                        {alert.budgetName}
                      </AlertTitle>
                      <Badge variant="outline" className="text-xs">
                        {alert.currentUtilization.toFixed(1)}% used
                      </Badge>
                    </div>
                    <AlertDescription>
                      {alert.message}
                    </AlertDescription>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => acknowledgeAlert(alert.id)}
                    >
                      <CheckCircle className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => dismissAlert(alert.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        )}

        {/* Acknowledged Alerts */}
        {acknowledgedAlerts.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-muted-foreground">Acknowledged Alerts</h4>
            {acknowledgedAlerts.map(alert => (
              <Alert key={alert.id} className="opacity-60">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertTitle className="text-sm">
                        {alert.budgetName}
                      </AlertTitle>
                      <Badge variant="outline" className="text-xs">
                        Acknowledged
                      </Badge>
                    </div>
                    <AlertDescription>
                      {alert.message}
                    </AlertDescription>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => dismissAlert(alert.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </Alert>
            ))}
          </div>
        )}

        {/* No Alerts */}
        {alerts.length === 0 && (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">All Budgets Healthy</h3>
            <p className="text-muted-foreground">
              No budget alerts at this time. All budgets are within acceptable thresholds.
            </p>
          </div>
        )}

        {/* Alert Settings */}
        {showSettings && (
          <div className="border-t pt-4 space-y-4">
            <h4 className="font-medium">Alert Settings</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium">Warning Threshold</span>
                </div>
                <p className="text-muted-foreground">75% of budget used</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="font-medium">Critical Threshold</span>
                </div>
                <p className="text-muted-foreground">90% of budget used</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="font-medium">Exceeded Threshold</span>
                </div>
                <p className="text-muted-foreground">100% of budget used</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};