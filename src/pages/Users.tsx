import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DataTable } from "@/components/data-table/DataTable";
import { useAppContext } from "@/context/AppContext";
import { User } from "@/types";
import { format } from "date-fns";
import { MoreHorizontal, Edit, Trash2, Shield, UserCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const Users = () => {
  const { state } = useAppContext();

  const getRoleBadge = (role: User['role']) => {
    switch (role) {
      case 'admin':
        return <Badge variant="default" className="bg-red-100 text-red-800">Admin</Badge>;
      case 'manager':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Manager</Badge>;
      case 'user':
        return <Badge variant="secondary">User</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "User",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{user.name}</div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => getRoleBadge(row.getValue("role")),
    },
    {
      accessorKey: "department",
      header: "Department",
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue("department")}</Badge>
      ),
    },
    {
      accessorKey: "permissions",
      header: "Permissions",
      cell: ({ row }) => {
        const permissions = row.getValue("permissions") as string[];
        return (
          <div className="flex items-center gap-1">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {permissions.length} permissions
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as Date;
        return <div className="text-sm">{format(date, "MMM dd, yyyy")}</div>;
      },
    },
    {
      accessorKey: "lastLogin",
      header: "Last Login",
      cell: ({ row }) => {
        const date = row.getValue("lastLogin") as Date | undefined;
        return date ? (
          <div className="text-sm">{format(date, "MMM dd, yyyy")}</div>
        ) : (
          <span className="text-sm text-muted-foreground">Never</span>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const user = row.original;

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
                <UserCheck className="mr-2 h-4 w-4" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Edit User
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Shield className="mr-2 h-4 w-4" />
                Manage Permissions
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Calculate summary stats
  const totalUsers = state.users.length;
  const adminCount = state.users.filter(u => u.role === 'admin').length;
  const managerCount = state.users.filter(u => u.role === 'manager').length;
  const userCount = state.users.filter(u => u.role === 'user').length;
  const activeUsers = state.users.filter(u => u.lastLogin && 
    new Date().getTime() - u.lastLogin.getTime() < 7 * 24 * 60 * 60 * 1000).length; // Active in last 7 days

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight animate-fade-in">User Management</h1>
          <p className="text-muted-foreground animate-fade-in">
            Manage user accounts, roles, and permissions across your organization.
          </p>
        </div>
        
        <Button className="gap-2 animate-bounce-gentle">
          <UserCheck className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg border p-4 bg-gradient-card shadow-card animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <UserCheck className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Total Users</span>
          </div>
          <div className="text-2xl font-bold">{totalUsers}</div>
        </div>

        <div className="rounded-lg border p-4 bg-gradient-card shadow-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-muted-foreground">Administrators</span>
          </div>
          <div className="text-2xl font-bold">{adminCount}</div>
        </div>

        <div className="rounded-lg border p-4 bg-gradient-card shadow-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-2 mb-2">
            <UserCheck className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-muted-foreground">Managers</span>
          </div>
          <div className="text-2xl font-bold">{managerCount}</div>
        </div>

        <div className="rounded-lg border p-4 bg-gradient-card shadow-card animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 rounded-full bg-green-500" />
            <span className="text-sm font-medium text-muted-foreground">Active Users</span>
          </div>
          <div className="text-2xl font-bold">{activeUsers}</div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={state.users}
        searchKey="name"
        searchPlaceholder="Search users..."
      />
    </div>
  );
};

export default Users;