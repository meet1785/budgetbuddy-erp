import { ReactNode, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppContext } from "@/context/AppContext";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

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
    <div className="w-full max-w-md">
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

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, state, dispatch } = useAppContext();
  const [submitting, setSubmitting] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
    return () => {
      isMounted.current = false;
    };
  }, [dispatch]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: searchParams.get("email") ?? "",
      password: "",
    },
  });

  const handleSubmit = async (values: LoginFormValues) => {
    setSubmitting(true);
    try {
      await login(values.email, values.password);
      toast({
        title: "Welcome back",
        description: "You have signed in successfully.",
      });
      navigate("/", { replace: true });
    } catch (error: any) {
      toast({
        title: "Unable to sign in",
        description: error?.message || "Please check your credentials and try again.",
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
      title="BudgetBuddy ERP"
      description="Sign in to manage budgets, expenses, and financial operations."
    >
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-slate-200">
            Work Email
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

        <div className="space-y-2">
          <Label htmlFor="password" className="text-slate-200">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
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

        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90"
          disabled={submitting || state.authLoading}
        >
          {submitting || state.authLoading ? "Signing in..." : "Sign in"}
        </Button>

        {state.error ? (
          <p className="text-sm text-red-400 text-center">{state.error}</p>
        ) : null}

        <div className="text-center text-sm text-slate-400">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-primary hover:underline font-medium"
          >
            Create one here
          </Link>
        </div>
      </form>
    </AuthPageLayout>
  );
};

export default Login;
