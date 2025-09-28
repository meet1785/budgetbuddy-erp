import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAppContext } from "@/context/AppContext";
import { CheckCircle, Clock, XCircle, User, DollarSign, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Expense } from "@/types";
import { formatCurrency } from "@/utils/currency";

interface ExpenseWorkflowProps {
  expense?: Expense;
}

export const ExpenseWorkflow = ({ expense }: ExpenseWorkflowProps) => {
  const { state, dispatch } = useAppContext();
  const [isProcessing, setIsProcessing] = useState(false);

  const workflowSteps = [
    { id: 'submitted', label: 'Submitted', icon: FileText },
    { id: 'review', label: 'Under Review', icon: Clock },
    { id: 'approved', label: 'Approved', icon: CheckCircle },
    { id: 'processed', label: 'Processed', icon: DollarSign }
  ];

  const getCurrentStepIndex = (status: Expense['status']) => {
    switch (status) {
      case 'pending': return 1;
      case 'approved': return 2;
      case 'rejected': return -1;
      default: return 0;
    }
  };

  const handleApprove = async (expenseId: string) => {
    setIsProcessing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const updatedExpense = state.expenses.find(e => e.id === expenseId);
    if (updatedExpense) {
      const approved = { ...updatedExpense, status: 'approved' as const, approvedBy: state.currentUser?.name };
      dispatch({ type: 'UPDATE_EXPENSE', payload: approved });
      
      toast({
        title: "Expense Approved",
        description: `Expense of ${formatCurrency(updatedExpense.amount)} has been approved.`,
      });
    }
    
    setIsProcessing(false);
  };

  const handleReject = async (expenseId: string) => {
    setIsProcessing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const updatedExpense = state.expenses.find(e => e.id === expenseId);
    if (updatedExpense) {
      const rejected = { ...updatedExpense, status: 'rejected' as const };
      dispatch({ type: 'UPDATE_EXPENSE', payload: rejected });
      
      toast({
        title: "Expense Rejected",
        description: `Expense of ${formatCurrency(updatedExpense.amount)} has been rejected.`,
        variant: "destructive"
      });
    }
    
    setIsProcessing(false);
  };

  // If no specific expense is provided, show pending expenses workflow
  if (!expense) {
    const pendingExpenses = state.expenses.filter(e => e.status === 'pending');
    const totalPendingAmount = pendingExpenses.reduce((sum, e) => sum + e.amount, 0);

    return (
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Expense Workflow
          </CardTitle>
          <CardDescription>
            Manage pending expense approvals and workflow
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{pendingExpenses.length}</div>
              <div className="text-sm text-muted-foreground">Pending Expenses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">
                ${formatCurrency(totalPendingAmount)}
              </div>
              <div className="text-sm text-muted-foreground">Total Amount</div>
            </div>
          </div>

          {pendingExpenses.length > 0 ? (
            <div className="space-y-3">
              <h4 className="font-medium">Pending Approvals</h4>
              {pendingExpenses.slice(0, 3).map((exp, index) => (
                <div 
                  key={exp.id} 
                  className="border rounded-lg p-3 space-y-2 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-medium text-sm">{exp.description}</h5>
                      <p className="text-xs text-muted-foreground">
                        {exp.vendor} • {exp.department}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      ${formatCurrency(exp.amount)}
                    </Badge>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleApprove(exp.id)}
                      disabled={isProcessing}
                      className="flex-1"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Approve
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleReject(exp.id)}
                      disabled={isProcessing}
                      className="flex-1"
                    >
                      <XCircle className="h-3 w-3 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
              
              {pendingExpenses.length > 3 && (
                <Button variant="outline" size="sm" className="w-full">
                  View All {pendingExpenses.length} Pending Expenses
                </Button>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-2" />
              <p className="text-muted-foreground">No pending expenses</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Show specific expense workflow
  const currentStep = getCurrentStepIndex(expense.status);
  const progress = expense.status === 'rejected' ? 0 : ((currentStep + 1) / workflowSteps.length) * 100;

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Expense Workflow
        </CardTitle>
        <CardDescription>
          Track the approval process for this expense
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">
              {expense.status === 'rejected' ? 'Rejected' : `${Math.round(progress)}%`}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-4">
          {workflowSteps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index <= currentStep;
            const isCurrent = index === currentStep;
            const isRejected = expense.status === 'rejected' && index > 0;

            return (
              <div 
                key={step.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  isCompleted ? 'bg-green-50 border-green-200' : 
                  isRejected ? 'bg-red-50 border-red-200' : 
                  'bg-muted/20'
                }`}
              >
                <div className={`p-2 rounded-full ${
                  isCompleted ? 'bg-green-500 text-white' : 
                  isRejected ? 'bg-red-500 text-white' :
                  'bg-muted text-muted-foreground'
                }`}>
                  <Icon className="h-4 w-4" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${
                      isCompleted ? 'text-green-700' : 
                      isRejected ? 'text-red-700' : 
                      'text-muted-foreground'
                    }`}>
                      {step.label}
                    </span>
                    {isCurrent && !isRejected && (
                      <Badge variant="default" className="text-xs">Current</Badge>
                    )}
                  </div>
                  
                  {isCompleted && step.id === 'approved' && expense.approvedBy && (
                    <p className="text-xs text-muted-foreground">
                      Approved by {expense.approvedBy}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {expense.status === 'rejected' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-700">
              <XCircle className="h-4 w-4" />
              <span className="font-medium">Expense Rejected</span>
            </div>
            <p className="text-sm text-red-600 mt-1">
              This expense was rejected and will need to be resubmitted with corrections.
            </p>
          </div>
        )}

        {expense.status === 'pending' && state.currentUser?.permissions.includes('approve_expenses') && (
          <div className="flex gap-2">
            <Button 
              onClick={() => handleApprove(expense.id)}
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? 'Processing...' : 'Approve'}
            </Button>
            <Button 
              variant="outline"
              onClick={() => handleReject(expense.id)}
              disabled={isProcessing}
              className="flex-1"
            >
              Reject
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};