import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-table/DataTable";
import { useAppContext } from "@/context/AppContext";
import { Transaction } from "@/types";
import { format } from "date-fns";
import { ArrowDownLeft, ArrowUpRight, Circle } from "lucide-react";
import { formatCurrencyWithSign } from "@/utils/currency";

const Transactions = () => {
  const { state } = useAppContext();

  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'pending':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getTypeIcon = (type: Transaction['type']) => {
    if (type === 'income') {
      return <ArrowDownLeft className="h-4 w-4 text-green-600" />;
    }
    return <ArrowUpRight className="h-4 w-4 text-red-600" />;
  };

  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("type") as Transaction['type'];
        return (
          <div className="flex items-center gap-2">
            {getTypeIcon(type)}
            <span className="capitalize font-medium">{type}</span>
          </div>
        );
      },
    },
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
        const type = row.original.type;
        return (
          <div className={`font-medium ${type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrencyWithSign(type === 'income' ? amount : -amount, true)}
          </div>
        );
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
      accessorKey: "account",
      header: "Account",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("account")}</div>
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
      accessorKey: "reference",
      header: "Reference",
      cell: ({ row }) => {
        const reference = row.getValue("reference") as string;
        return reference ? (
          <Badge variant="secondary" className="font-mono text-xs">
            {reference}
          </Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => getStatusBadge(row.getValue("status")),
    },
  ];

  // Calculate summary stats
  const totalIncome = state.transactions
    .filter(t => t.type === 'income' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = state.transactions
    .filter(t => t.type === 'expense' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const netFlow = totalIncome - totalExpenses;
  const pendingTransactions = state.transactions.filter(t => t.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight animate-fade-in">Transaction History</h1>
        <p className="text-muted-foreground animate-fade-in">
          View and manage all financial transactions across your accounts.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg border p-4 bg-gradient-card shadow-card animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <ArrowDownLeft className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-muted-foreground">Total Income</span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrencyWithSign(totalIncome, true)}
          </div>
        </div>

        <div className="rounded-lg border p-4 bg-gradient-card shadow-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-2 mb-2">
            <ArrowUpRight className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-muted-foreground">Total Expenses</span>
          </div>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrencyWithSign(-totalExpenses, true)}
          </div>
        </div>

        <div className="rounded-lg border p-4 bg-gradient-card shadow-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-2 mb-2">
            <Circle className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Net Cash Flow</span>
          </div>
          <div className={`text-2xl font-bold ${netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrencyWithSign(netFlow, true)}
          </div>
        </div>

        <div className="rounded-lg border p-4 bg-gradient-card shadow-card animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-2 mb-2">
            <Circle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium text-muted-foreground">Pending</span>
          </div>
          <div className="text-2xl font-bold text-yellow-600">
            {pendingTransactions}
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={state.transactions}
        searchKey="description"
        searchPlaceholder="Search transactions..."
      />
    </div>
  );
};

export default Transactions;