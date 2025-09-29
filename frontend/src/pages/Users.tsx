import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DataTable } from "@/components/data-table/DataTable";
import { useAppContext } from "@/context/AppContext";
import { User } from "@/types";
import { Plus, MoreHorizontal, Edit, Shield, Eye, RotateCcw, Ban } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { UserForm } from "@/components/forms/UserForm";
import { UserProfileDialog } from "@/components/dialogs/UserProfileDialog";
import { PermissionsDialog } from "@/components/dialogs/PermissionsDialog";
import { toast } from "@/hooks/use-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { getErrorMessage } from "@/lib/utils";

const Users = () => {
  const { state, deactivateUser, reactivateUser } = useAppContext();
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [permissionsUser, setPermissionsUser] = useState<User | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const getRoleBadge = (role: User['role']) => {
    switch (role) {
      case 'admin':
        return <Badge variant="default" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Admin</Badge>;
      case 'manager':
        return <Badge variant="default" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Manager</Badge>;
      case 'user':
        return <Badge variant="secondary">User</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Calculate summary statistics
  const totalUsers = state.users.length;
  const adminCount = state.users.filter(user => user.role === 'admin').length;
  const managerCount = state.users.filter(user => user.role === 'manager').length;
  
  // Active users (logged in within last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const activeUsers = state.users.filter(user => 
    user.lastLogin && new Date(user.lastLogin) >= sevenDaysAgo
  ).length;

  const handleDeactivate = async (user: User) => {
    try {
      await deactivateUser(user.id);
      toast({
        title: "User deactivated",
        description: `${user.name} can no longer access the system.`,
      });
    } catch (error: unknown) {
      toast({
        title: "Unable to deactivate user",
        description: getErrorMessage(error, "Something went wrong while deactivating the user."),
        variant: "destructive",
      });
    }
  };

  const handleReactivate = async (user: User) => {
    try {
      await reactivateUser(user.id);
      toast({
        title: "User reactivated",
        description: `${user.name} has been reactivated successfully.`,
      });
    } catch (error: unknown) {
      toast({
        title: "Unable to reactivate user",
        description: getErrorMessage(error, "Something went wrong while reactivating the user."),
        variant: "destructive",
      });
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowForm(true);
    navigate({ pathname: location.pathname, search: "?modal=user" }, { replace: true });
  };

  const handleViewProfile = (user: User) => {
    setProfileUser(user);
    setShowProfile(true);
  };

  const handleManagePermissions = (user: User) => {
    setPermissionsUser(user);
    setShowPermissions(true);
  };

  const closeModal = () => {
    const params = new URLSearchParams(location.search);
    if (params.get('modal') === 'user') {
      params.delete('modal');
      navigate({ pathname: location.pathname, search: params.toString() ? `?${params.toString()}` : '' }, { replace: true });
    }
    setShowForm(false);
    setEditingUser(undefined);
  };

  // Handle URL parameters for modal state
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const modal = params.get('modal');
    if (modal === 'user') {
      setShowForm(true);
    }
  }, [location.search]);

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "User",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="text-xs">
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
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
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean;
        return (
          <Badge variant={isActive ? "outline" : "destructive"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        );
      }
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
          <div className="flex gap-1 flex-wrap">
            {permissions.slice(0, 2).map((permission, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {permission}
              </Badge>
            ))}
            {permissions.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{permissions.length - 2}
              </Badge>
            )}
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
        const date = row.getValue("lastLogin") as Date | null;
        if (!date) return <div className="text-sm text-muted-foreground">Never</div>;
        return <div className="text-sm">{format(date, "MMM dd, yyyy")}</div>;
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
              <DropdownMenuItem onClick={() => handleViewProfile(user)}>
                <Eye className="mr-2 h-4 w-4" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEditUser(user)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit User
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleManagePermissions(user)}>
                <Shield className="mr-2 h-4 w-4" />
                Manage Permissions
              </DropdownMenuItem>
              {user.isActive ? (
                <DropdownMenuItem
                  className="text-red-600 dark:text-red-400"
                  onClick={() => handleDeactivate(user)}
                >
                  <Ban className="mr-2 h-4 w-4" />
                  Deactivate User
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  className="text-green-600 dark:text-green-400"
                  onClick={() => handleReactivate(user)}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reactivate User
                </DropdownMenuItem>
              )}
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
          <h1 className="text-3xl font-bold tracking-tight animate-fade-in">User Management</h1>
          <p className="text-muted-foreground animate-fade-in">
            Manage user accounts, roles, and permissions across your organization.
          </p>
        </div>

        <Dialog
          open={showForm}
          onOpenChange={(open) => {
            if (!open) {
              closeModal();
            } else {
              setShowForm(true);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button
              className="gap-2 animate-bounce-gentle"
              onClick={() => {
                setEditingUser(undefined);
                setShowForm(true);
                navigate({ pathname: location.pathname, search: "?modal=user" }, { replace: true });
              }}
            >
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogTitle className="sr-only">
              {editingUser ? 'Edit User' : 'Add New User'}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {editingUser ? 'Update user information and settings' : 'Create a new user account'}
            </DialogDescription>
            <UserForm
              user={editingUser}
              onSuccess={() => {
                closeModal();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Active user accounts
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administrators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminCount}</div>
            <p className="text-xs text-muted-foreground">
              System administrators
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Managers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{managerCount}</div>
            <p className="text-xs text-muted-foreground">
              Department managers
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Logged in (7 days)
            </p>
          </CardContent>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={state.users}
        searchKey="name"
        searchPlaceholder="Search users..."
      />

      {/* User Profile Dialog */}
      <UserProfileDialog
        user={profileUser}
        open={showProfile}
        onOpenChange={setShowProfile}
      />

      {/* Permissions Management Dialog */}
      <PermissionsDialog
        user={permissionsUser}
        open={showPermissions}
        onOpenChange={setShowPermissions}
      />
    </div>
  );
};

export default Users;