import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAppContext } from "@/context/AppContext";
import { formatCurrency } from "@/utils/currency";
import { Budget } from "@/types";

interface BudgetHealthProps {
  budget: Budget;
  showProgress?: boolean;
  showDetails?: boolean;
  className?: string;
}

export const BudgetHealth = ({ 
  budget, 
  showProgress = true, 
  showDetails = true,
  className = "" 
}: BudgetHealthProps) => {
  const { state } = useAppContext();
  
  // Calculate actual spending
  const approvedExpenses = state.expenses.filter(expense => expense.status === 'approved');
  const budgetExpenses = approvedExpenses.filter(expense => 
    expense.budgetId === budget.id || 
    (expense.category === budget.category && !expense.budgetId)
  );
  
  const actualSpent = budgetExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remaining = Math.max(0, budget.allocated - actualSpent);
  const utilization = budget.allocated > 0 ? (actualSpent / budget.allocated) * 100 : 0;
  
  // Determine status and colors
  let status: 'on-track' | 'warning' | 'over-budget' = 'on-track';
  let statusColor = 'bg-green-100 text-green-800';
  let progressColor = 'bg-green-500';
  
  if (actualSpent > budget.allocated) {
    status = 'over-budget';
    statusColor = 'bg-red-100 text-red-800';
    progressColor = 'bg-red-500';
  } else if (utilization >= 80) {
    status = 'warning';
    statusColor = 'bg-yellow-100 text-yellow-800';
    progressColor = 'bg-yellow-500';
  }
  
  const getStatusText = () => {
    switch (status) {
      case 'on-track':
        return 'On Track';
      case 'warning':
        return 'Warning';
      case 'over-budget':
        return 'Over Budget';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <Badge className={statusColor} variant="secondary">
          {getStatusText()}
        </Badge>
        <span className="text-sm text-muted-foreground">
          {utilization.toFixed(1)}% utilized
        </span>
      </div>
      
      {showProgress && (
        <div className="space-y-1">
          <Progress 
            value={Math.min(utilization, 100)} 
            className="h-2"
            style={{
              backgroundColor: utilization > 100 ? '#fee2e2' : undefined
            }}
          />
          {utilization > 100 && (
            <div className="text-xs text-red-600">
              Over budget by {formatCurrency(actualSpent - budget.allocated)}
            </div>
          )}
        </div>
      )}
      
      {showDetails && (
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <div className="text-muted-foreground">Allocated</div>
            <div className="font-medium">{formatCurrency(budget.allocated)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Spent</div>
            <div className="font-medium">{formatCurrency(actualSpent)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Remaining</div>
            <div className={`font-medium ${remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(remaining)}
            </div>
          </div>
        </div>
      )}
      
      <div className="text-xs text-muted-foreground">
        {budgetExpenses.length} expense{budgetExpenses.length !== 1 ? 's' : ''} linked
      </div>
    </div>
  );
};

// Quick status indicator for tables/lists
export const BudgetStatusBadge = ({ budget }: { budget: Budget }) => {
  return <BudgetHealth budget={budget} showProgress={false} showDetails={false} />;
};

// Compact health display for cards
export const BudgetHealthCard = ({ budget }: { budget: Budget }) => {
  return (
    <div className="p-4 border rounded-lg bg-card">
      <h4 className="font-medium mb-2">{budget.name}</h4>
      <BudgetHealth budget={budget} />
    </div>
  );
};