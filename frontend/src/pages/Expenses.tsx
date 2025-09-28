import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-table/DataTable";
import { ExpenseForm } from "@/components/forms/ExpenseForm";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useAppContext } from "@/context/AppContext";
import { Expense } from "@/types";
import { Plus, MoreHorizontal, Edit, Trash2, Check, X, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { formatCurrency } from "@/utils/currency";

const Expenses = () => {
  const { state, dispatch } = useAppContext();
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>();

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleDelete = (expenseId: string) => {
    dispatch({ type: 'DELETE_EXPENSE', payload: expenseId });
    toast({
      title: "Expense deleted",
      description: "The expense has been removed successfully.",
    });
  };

  const handleApprove = (expense: Expense) => {
    const updatedExpense = { ...expense, status: 'approved' as const };
    dispatch({ type: 'UPDATE_EXPENSE', payload: updatedExpense });
    toast({
      title: "Expense approved",
      description: "The expense has been approved successfully.",
    });
  };

  const handleReject = (expense: Expense) => {
    const updatedExpense = { ...expense, status: 'rejected' as const };
    dispatch({ type: 'UPDATE_EXPENSE', payload: updatedExpense });
    toast({
      title: "Expense rejected",
      description: "The expense has been rejected.",
      variant: "destructive"
    });
  };

  const getStatusBadge = (status: Expense['status']) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Approved</Badge>;
      case 'pending':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const columns: ColumnDef<Expense>[] = [
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div className="max-w-[300px]">
          <div className="font-medium truncate">{row.getValue("description")}</div>
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("amount"));
        return <div className="font-medium">{formatCurrency(amount)}</div>;
      },
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue("category")}</Badge>
      ),
    },
    {
      accessorKey: "vendor",
      header: "Vendor",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("vendor")}</div>
      ),
    },
    {
      accessorKey: "department",
      header: "Department",
      cell: ({ row }) => (
        <Badge variant="secondary">{row.getValue("department")}</Badge>
      ),
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        const date = row.getValue("date") as Date;
        return <div>{format(date, "MMM dd, yyyy")}</div>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => getStatusBadge(row.getValue("status")),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const expense = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(expense)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Expense
              </DropdownMenuItem>
              {expense.status === 'pending' && (
                <>
                  <DropdownMenuItem 
                    onClick={() => handleApprove(expense)}
                    className="text-green-600 dark:text-green-400"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Approve
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleReject(expense)}
                    className="text-red-600 dark:text-red-400"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Reject
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem 
                onClick={() => handleDelete(expense.id)}
                className="text-red-600 dark:text-red-400"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Expense
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight animate-fade-in">Expense Management</h1>
          <p className="text-muted-foreground animate-fade-in">
            Track and manage all business expenses with approval workflows.
          </p>
        </div>
        
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button className="gap-2 animate-bounce-gentle">
              <Plus className="h-4 w-4" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <ExpenseForm 
              expense={editingExpense}
              onSuccess={() => {
                setShowForm(false);
                setEditingExpense(undefined);
              }} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={state.expenses}
        searchKey="description"
        searchPlaceholder="Search expenses..."
      />
    </div>
  );
};

export default Expenses;