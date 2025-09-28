import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppContext } from "@/context/AppContext";
import { User } from "@/types";
import { toast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/utils";

const userFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  department: z.string().min(1, "Department is required"),
  role: z.enum(["admin", "manager", "user"]),
  permissions: z.string().optional(),
  avatar: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional(),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormProps {
  user?: User;
  onSuccess?: () => void;
}

export function UserForm({ user, onSuccess }: UserFormProps) {
  const { createUser, updateUser } = useAppContext();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      department: user?.department ?? "",
      role: user?.role ?? "user",
      permissions: user?.permissions?.join(", ") ?? "",
      avatar: user?.avatar ?? "",
      password: "",
    },
  });

  const isEditMode = !!user;

  const onSubmit = async (values: UserFormValues) => {
    const permissions = values.permissions
      ? values.permissions
          .split(",")
          .map((permission) => permission.trim())
          .filter(Boolean)
      : [];

    const payload = {
      name: values.name,
      email: values.email,
      department: values.department,
  role: values.role,
      permissions,
      avatar: values.avatar ? values.avatar : undefined,
    };

    setSubmitting(true);
    try {
      if (isEditMode && user) {
        await updateUser(user.id, payload);
        toast({
          title: "User updated",
          description: "User profile has been updated successfully.",
        });
      } else {
        if (!values.password) {
          throw new Error("Password is required for new users");
        }

        await createUser({
          ...payload,
          password: values.password,
        });
        toast({
          title: "User created",
          description: "New user has been created successfully.",
        });
      }

      onSuccess?.();
    } catch (error: unknown) {
      toast({
        title: "Unable to save user",
        description: getErrorMessage(error, "Something went wrong while saving the user."),
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="animate-scale-in">
      <CardHeader>
        <CardTitle>{isEditMode ? "Edit User" : "Create New User"}</CardTitle>
        <CardDescription>
          {isEditMode
            ? "Update user details and permissions"
            : "Invite a new team member to BudgetBuddy"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="jane.doe@company.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <Input placeholder="Finance" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Administrator</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Determines what this user can access in the system
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="avatar"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Avatar URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://images.example.com/avatar.jpg" {...field} />
                    </FormControl>
                    <FormDescription>
                      Optional image URL shown in the dashboard header
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="permissions"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Permissions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="reports:view, budgets:manage"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a comma-separated list of permissions to assign
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!isEditMode && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Temporary Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormDescription>
                        The user will be prompted to change their password after logging in
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1" disabled={submitting}>
                {isEditMode ? "Update User" : "Create User"}
              </Button>
              <Button type="button" variant="outline" onClick={onSuccess}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
