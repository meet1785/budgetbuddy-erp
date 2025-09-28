import { ReactNode, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppContext } from "@/context/AppContext";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
        "Password must include uppercase, lowercase, and a number"
      ),
    confirmPassword: z.string(),
    department: z.string().min(2, "Enter a department"),
    role: z.enum(["admin", "manager", "user"]).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

const AuthPageLayout = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-black flex items-center justify-center p-6">
    <div className="w-full max-w-2xl">
      <Card className="border-slate-800 bg-slate-900/70 backdrop-blur shadow-2xl">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-bold text-white">{title}</CardTitle>
          <CardDescription className="text-slate-300">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  </div>
);

const Register = () => {
  const navigate = useNavigate();
  const { register: registerUser, state, dispatch } = useAppContext();
  const [submitting, setSubmitting] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
    return () => {
      isMounted.current = false;
    };
  }, [dispatch]);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      department: "",
      role: "user",
    },
  });

  const handleSubmit = async (values: RegisterFormValues) => {
    setSubmitting(true);
    try {
      await registerUser({
        name: values.name,
        email: values.email,
        password: values.password,
        department: values.department,
        role: values.role,
      });

      toast({
        title: "Account created",
        description: "Your workspace is ready. Welcome aboard!",
      });

      navigate("/", { replace: true });
    } catch (error: any) {
      toast({
        title: "Unable to register",
        description: error?.message || "Please review your information and try again.",
        variant: "destructive",
      });
    } finally {
      if (isMounted.current) {
        setSubmitting(false);
      }
    }
  };

  return (
    <AuthPageLayout
      title="Create your BudgetBuddy account"
      description="Collaborate with finance teams, manage budgets, and keep expenses under control."
    >
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-200">
              Full name
            </Label>
            <Input
              id="name"
              placeholder="Riley Summers"
              autoComplete="name"
              disabled={submitting || state.authLoading}
              {...form.register("name")}
              className={cn(
                "bg-slate-900/60 border-slate-700 text-slate-100 placeholder:text-slate-500",
                form.formState.errors.name && "border-red-500"
              )}
            />
            {form.formState.errors.name ? (
              <p className="text-sm text-red-400">{form.formState.errors.name.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="department" className="text-slate-200">
              Department
            </Label>
            <Input
              id="department"
              placeholder="Finance"
              autoComplete="organization-title"
              disabled={submitting || state.authLoading}
              {...form.register("department")}
              className={cn(
                "bg-slate-900/60 border-slate-700 text-slate-100 placeholder:text-slate-500",
                form.formState.errors.department && "border-red-500"
              )}
            />
            {form.formState.errors.department ? (
              <p className="text-sm text-red-400">{form.formState.errors.department.message}</p>
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-slate-200">
            Work email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            disabled={submitting || state.authLoading}
            {...form.register("email")}
            className={cn(
              "bg-slate-900/60 border-slate-700 text-slate-100 placeholder:text-slate-500",
              form.formState.errors.email && "border-red-500"
            )}
          />
          {form.formState.errors.email ? (
            <p className="text-sm text-red-400">{form.formState.errors.email.message}</p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-200">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              disabled={submitting || state.authLoading}
              {...form.register("password")}
              className={cn(
                "bg-slate-900/60 border-slate-700 text-slate-100 placeholder:text-slate-500",
                form.formState.errors.password && "border-red-500"
              )}
            />
            {form.formState.errors.password ? (
              <p className="text-sm text-red-400">{form.formState.errors.password.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-slate-200">
              Confirm password
            </Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              disabled={submitting || state.authLoading}
              {...form.register("confirmPassword")}
              className={cn(
                "bg-slate-900/60 border-slate-700 text-slate-100 placeholder:text-slate-500",
                form.formState.errors.confirmPassword && "border-red-500"
              )}
            />
            {form.formState.errors.confirmPassword ? (
              <p className="text-sm text-red-400">{form.formState.errors.confirmPassword.message}</p>
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-200">Role</Label>
          <Controller
            control={form.control}
            name="role"
            render={({ field }) => (
              <Select
                value={field.value ?? "user"}
                onValueChange={field.onChange}
                disabled={submitting || state.authLoading}
              >
                <SelectTrigger className="bg-slate-900/60 border-slate-700 text-slate-100">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 text-slate-100 border-slate-700">
                  <SelectItem value="user">Team member</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90"
          disabled={submitting || state.authLoading}
        >
          {submitting || state.authLoading ? "Creating account..." : "Create account"}
        </Button>

        {state.error ? (
          <p className="text-sm text-red-400 text-center">{state.error}</p>
        ) : null}

        <div className="text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </div>
      </form>
    </AuthPageLayout>
  );
};

export default Register;
