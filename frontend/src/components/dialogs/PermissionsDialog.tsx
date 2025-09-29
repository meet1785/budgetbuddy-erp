import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/types";
import { Shield, Save, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAppContext } from "@/context/AppContext";
import { getErrorMessage } from "@/lib/utils";

interface PermissionsDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Define available permissions by category
const PERMISSION_CATEGORIES = {
  "Budget Management": [
    "create_budget",
    "edit_budget",
    "delete_budget",
    "approve_budget",
    "view_all_budgets"
  ],
  "Expense Management": [
    "create_expense",
    "edit_expense",
    "delete_expense",
    "approve_expense",
    "view_all_expenses"
  ],
  "User Management": [
    "create_user",
    "edit_user",
    "delete_user",
    "manage_permissions",
    "view_all_users"
  ],
  "Reports & Analytics": [
    "view_reports",
    "export_data",
    "view_analytics",
    "create_reports"
  ],
  "System Administration": [
    "system_settings",
    "backup_data",
    "audit_logs",
    "manage_integrations"
  ]
};

const PERMISSION_DESCRIPTIONS = {
  // Budget Management
  "create_budget": "Create new budgets",
  "edit_budget": "Modify existing budgets",
  "delete_budget": "Remove budgets",
  "approve_budget": "Approve budget requests",
  "view_all_budgets": "View all organization budgets",
  
  // Expense Management
  "create_expense": "Submit new expenses",
  "edit_expense": "Modify expense details",
  "delete_expense": "Remove expenses",
  "approve_expense": "Approve expense claims",
  "view_all_expenses": "View all organization expenses",
  
  // User Management
  "create_user": "Add new users",
  "edit_user": "Modify user profiles",
  "delete_user": "Remove users",
  "manage_permissions": "Assign user permissions",
  "view_all_users": "View all users",
  
  // Reports & Analytics
  "view_reports": "Access financial reports",
  "export_data": "Export data to files",
  "view_analytics": "Access analytics dashboard",
  "create_reports": "Generate custom reports",
  
  // System Administration
  "system_settings": "Modify system settings",
  "backup_data": "Create data backups",
  "audit_logs": "Access audit trails",
  "manage_integrations": "Configure integrations"
};

export const PermissionsDialog = ({ user, open, onOpenChange }: PermissionsDialogProps) => {
  const { updateUser } = useAppContext();
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    user?.permissions || []
  );
  const [isUpdating, setIsUpdating] = useState(false);

  if (!user) return null;

  const handlePermissionChange = (permission: string, checked: boolean) => {
    if (checked) {
      setSelectedPermissions(prev => [...prev, permission]);
    } else {
      setSelectedPermissions(prev => prev.filter(p => p !== permission));
    }
  };

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      await updateUser(user.id, {
        permissions: selectedPermissions
      });
      
      toast({
        title: "Permissions updated",
        description: `Successfully updated permissions for ${user.name}`,
      });
      
      onOpenChange(false);
    } catch (error: unknown) {
      toast({
        title: "Failed to update permissions",
        description: getErrorMessage(error, "Something went wrong while updating permissions."),
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setSelectedPermissions(user.permissions);
    onOpenChange(false);
  };

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Manage Permissions
          </DialogTitle>
          <DialogDescription>
            Configure permissions and access levels for this user
          </DialogDescription>
        </DialogHeader>

        {/* User Info Header */}
        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.avatar} />
            <AvatarFallback>
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold">{user.name}</h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div className="text-right">
            {getRoleBadge(user.role)}
            <p className="text-sm text-muted-foreground mt-1">{user.department}</p>
          </div>
        </div>

        {/* Permissions Grid */}
        <div className="space-y-6">
          {Object.entries(PERMISSION_CATEGORIES).map(([category, permissions]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-lg">{category}</CardTitle>
                <CardDescription>
                  Manage {category.toLowerCase()} permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {permissions.map((permission) => (
                    <div key={permission} className="flex items-start space-x-3">
                      <Checkbox
                        id={permission}
                        checked={selectedPermissions.includes(permission)}
                        onCheckedChange={(checked) => 
                          handlePermissionChange(permission, checked as boolean)
                        }
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <label
                          htmlFor={permission}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {PERMISSION_DESCRIPTIONS[permission as keyof typeof PERMISSION_DESCRIPTIONS]}
                        </label>
                        <p className="text-xs text-muted-foreground mt-1">
                          {permission}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Selected Permissions ({selectedPermissions.length})</h4>
          <div className="flex flex-wrap gap-1">
            {selectedPermissions.length > 0 ? (
              selectedPermissions.map((permission) => (
                <Badge key={permission} variant="secondary" className="text-xs">
                  {permission}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground italic">No permissions selected</span>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={isUpdating}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isUpdating}>
            <Save className="h-4 w-4 mr-2" />
            {isUpdating ? "Updating..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};