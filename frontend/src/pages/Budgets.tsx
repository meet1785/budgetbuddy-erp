import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-table/DataTable";
import { BudgetForm } from "@/components/forms/BudgetForm";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useAppContext } from "@/context/AppContext";
import { Budget } from "@/types";
import { Plus, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { formatCurrency } from "@/utils/currency";

const Budgets = () => {
  const { state, deleteBudget } = useAppContext();
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | undefined>();
  const navigate = useNavigate();
  const location = useLocation();

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setShowForm(true);
    navigate({ pathname: location.pathname, search: "?modal=budget" }, { replace: true });
  };

  const handleDelete = async (budgetId: string) => {
    try {
      await deleteBudget(budgetId);
      toast({
        title: "Budget deleted",
        description: "The budget has been removed successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Unable to delete budget",
        description: error?.message || 'Something went wrong while deleting the budget.',
        variant: "destructive",
      });
    }
  };

  const closeModal = () => {
    const params = new URLSearchParams(location.search);
    if (params.get('modal') === 'budget') {
      params.delete('modal');
      navigate({ pathname: location.pathname, search: params.toString() ? `?${params.toString()}` : '' }, { replace: true });
    }
    setShowForm(false);
    setEditingBudget(undefined);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const modal = params.get('modal');
    if (modal === 'budget') {
      setShowForm(true);
    }
  }, [location.search]);

  const getStatusBadge = (status: Budget['status']) => {
    switch (status) {
      case 'on-track':
        return <Badge variant="default" className="bg-green-100 text-green-800">On Track</Badge>;
      case 'warning':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'over-budget':
        return <Badge variant="destructive">Over Budget</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const columns: ColumnDef<Budget>[] = [
    {
      accessorKey: "name",
      header: "Budget Name",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue("category")}</Badge>
      ),
    },
    {
      accessorKey: "allocated",
      header: "Allocated",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("allocated"));
        return <div className="font-medium">{formatCurrency(amount)}</div>;
      },
    },
    {
      accessorKey: "spent",
      header: "Spent",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("spent"));
        return <div className="text-red-600">{formatCurrency(amount)}</div>;
      },
    },
    {
      accessorKey: "remaining",
      header: "Remaining",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("remaining"));
        return <div className="text-green-600">{formatCurrency(amount)}</div>;
      },
    },
    {
      accessorKey: "utilization",
      header: "Progress",
      cell: ({ row }) => {
        const budget = row.original;
        const percentage = (budget.spent / budget.allocated) * 100;
        return (
          <div className="w-20">
            <Progress value={percentage} className="h-2" />
            <span className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</span>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => getStatusBadge(row.getValue("status")),
    },
    {
      accessorKey: "period",
      header: "Period",
      cell: ({ row }) => (
        <Badge variant="secondary" className="capitalize">
          {row.getValue("period")}
        </Badge>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const budget = row.original;

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
              <DropdownMenuItem onClick={() => handleEdit(budget)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Budget
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleDelete(budget.id)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Budget
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
          <h1 className="text-3xl font-bold tracking-tight animate-fade-in">Budget Management</h1>
          <p className="text-muted-foreground animate-fade-in">
            Create and manage your organization's budgets across different categories.
          </p>
        </div>
        
        <Dialog open={showForm} onOpenChange={(open) => {
          if (!open) {
            closeModal();
          } else {
            setShowForm(true);
          }
        }}>
          <DialogTrigger asChild>
            <Button
              className="gap-2 animate-bounce-gentle"
              onClick={() => {
                setEditingBudget(undefined);
                setShowForm(true);
                navigate({ pathname: location.pathname, search: "?modal=budget" }, { replace: true });
              }}
            >
              <Plus className="h-4 w-4" />
              Create Budget
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <BudgetForm 
              budget={editingBudget}
              onSuccess={() => {
                closeModal();
              }} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={state.budgets}
        searchKey="name"
        searchPlaceholder="Search budgets..."
      />
    </div>
  );
};

export default Budgets;