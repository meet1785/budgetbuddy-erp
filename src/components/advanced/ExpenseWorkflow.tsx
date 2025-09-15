import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useAppContext } from "@/context/AppContext";
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  User, 
  Calendar,
  DollarSign,
  FileText,
  ArrowRight,
  Send
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

export const ExpenseWorkflow = () => {
  const { state, dispatch } = useAppContext();
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);

  const getExpensesByStatus = () => {
    return {
      pending: state.expenses.filter(e => e.status === 'pending'),
      approved: state.expenses.filter(e => e.status === 'approved'),
      rejected: state.expenses.filter(e => e.status === 'rejected')
    };
  };

  const handleStatusChange = (expenseId: string, newStatus: 'approved' | 'rejected') => {
    const expense = state.expenses.find(e => e.id === expenseId);
    if (!expense) return;

    const updatedExpense = {
      ...expense,
      status: newStatus,
      approvedBy: newStatus === 'approved' ? state.currentUser?.name : undefined
    };

    dispatch({ type: 'UPDATE_EXPENSE', payload: updatedExpense });

    toast({
      title: `Expense ${newStatus}`,
      description: `The expense has been ${newStatus} successfully.`,
      variant: newStatus === 'approved' ? 'default' : 'destructive'
    });
  };

  const handleBulkApproval = (expenseIds: string[]) => {
    expenseIds.forEach(id => handleStatusChange(id, 'approved'));
    toast({
      title: "Bulk Approval Complete",
      description: `${expenseIds.length} expenses have been approved.`,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'approved':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const calculateWorkflowStats = () => {
    const expenses = getExpensesByStatus();
    const totalAmount = {
      pending: expenses.pending.reduce((sum, e) => sum + e.amount, 0),
      approved: expenses.approved.reduce((sum, e) => sum + e.amount, 0),
      rejected: expenses.rejected.reduce((sum, e) => sum + e.amount, 0)
    };

    const totalExpenses = state.expenses.length;
    const approvalRate = totalExpenses > 0 ? (expenses.approved.length / totalExpenses) * 100 : 0;

    return { expenses, totalAmount, approvalRate };
  };

  const { expenses, totalAmount, approvalRate } = calculateWorkflowStats();
  const selectedExpense = selectedExpenseId ? state.expenses.find(e => e.id === selectedExpenseId) : null;

  return (
    <div className="space-y-6">
      {/* Workflow Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expenses.pending.length}</div>
            <p className="text-xs text-muted-foreground">
              ${totalAmount.pending.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expenses.approved.length}</div>
            <p className="text-xs text-muted-foreground">
              ${totalAmount.approved.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expenses.rejected.length}</div>
            <p className="text-xs text-muted-foreground">
              ${totalAmount.rejected.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <ArrowRight className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvalRate.toFixed(1)}%</div>
            <Progress value={approvalRate} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Workflow Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expense Lists */}
        <div className="lg:col-span-2">
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Expense Workflow</CardTitle>
              <CardDescription>Review and manage expense approvals</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="pending" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="pending">
                    Pending ({expenses.pending.length})
                  </TabsTrigger>
                  <TabsTrigger value="approved">
                    Approved ({expenses.approved.length})
                  </TabsTrigger>
                  <TabsTrigger value="rejected">
                    Rejected ({expenses.rejected.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="space-y-4">
                  {expenses.pending.length > 0 && (
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground">
                        {expenses.pending.length} expenses awaiting approval
                      </p>
                      <Button 
                        size="sm" 
                        onClick={() => handleBulkApproval(expenses.pending.map(e => e.id))}
                        disabled={expenses.pending.length === 0}
                      >
                        <Send className="h-3 w-3 mr-1" />
                        Approve All
                      </Button>
                    </div>
                  )}
                  
                  {expenses.pending.map(expense => (
                    <div 
                      key={expense.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedExpenseId === expense.id ? 'bg-accent' : 'hover:bg-accent/50'
                      }`}
                      onClick={() => setSelectedExpenseId(expense.id)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium">{expense.description}</h4>
                          <p className="text-sm text-muted-foreground">
                            {expense.vendor} • {expense.department}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">${expense.amount.toLocaleString()}</div>
                          {getStatusBadge(expense.status)}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {format(expense.date, 'MMM dd, yyyy')}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(expense.id, 'approved');
                            }}
                          >
                            <CheckCircle2 className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(expense.id, 'rejected');
                            }}
                          >
                            <XCircle className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {expenses.pending.length === 0 && (
                    <div className="text-center py-8">
                      <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">All Caught Up!</h3>
                      <p className="text-muted-foreground">No pending expenses to review.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="approved" className="space-y-4">
                  {expenses.approved.map(expense => (
                    <div 
                      key={expense.id}
                      className="border rounded-lg p-4 cursor-pointer hover:bg-accent/50"
                      onClick={() => setSelectedExpenseId(expense.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium">{expense.description}</h4>
                          <p className="text-sm text-muted-foreground">
                            Approved by {expense.approvedBy}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">${expense.amount.toLocaleString()}</div>
                          {getStatusBadge(expense.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="rejected" className="space-y-4">
                  {expenses.rejected.map(expense => (
                    <div 
                      key={expense.id}
                      className="border rounded-lg p-4 cursor-pointer hover:bg-accent/50"
                      onClick={() => setSelectedExpenseId(expense.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium">{expense.description}</h4>
                          <p className="text-sm text-muted-foreground">
                            Rejected - {expense.vendor}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">${expense.amount.toLocaleString()}</div>
                          {getStatusBadge(expense.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Expense Details */}
        <div>
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Expense Details</CardTitle>
              <CardDescription>
                {selectedExpense ? 'Review expense information' : 'Select an expense to view details'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedExpense ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">{selectedExpense.description}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="font-medium">${selectedExpense.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Category:</span>
                        <Badge variant="outline">{selectedExpense.category}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Vendor:</span>
                        <span>{selectedExpense.vendor}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Department:</span>
                        <span>{selectedExpense.department}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date:</span>
                        <span>{format(selectedExpense.date, 'PPP')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(selectedExpense.status)}
                          {getStatusBadge(selectedExpense.status)}
                        </div>
                      </div>
                      {selectedExpense.tags && selectedExpense.tags.length > 0 && (
                        <div>
                          <span className="text-muted-foreground">Tags:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedExpense.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedExpense.status === 'pending' && (
                    <div className="flex gap-2 pt-4">
                      <Button 
                        className="flex-1"
                        onClick={() => handleStatusChange(selectedExpense.id, 'approved')}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button 
                        variant="destructive" 
                        className="flex-1"
                        onClick={() => handleStatusChange(selectedExpense.id, 'rejected')}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Select an expense from the list to view its details and take action.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};