import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
import { useAppContext } from "@/context/AppContext";
import { Budget } from "@/types";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const budgetFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  category: z.string().min(1, "Please select a category"),
  allocated: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a positive number",
  }),
  period: z.enum(["monthly", "quarterly", "yearly"]),
});

type BudgetFormValues = z.infer<typeof budgetFormSchema>;

interface BudgetFormProps {
  budget?: Budget;
  onSuccess?: () => void;
}

export function BudgetForm({ budget, onSuccess }: BudgetFormProps) {
  const { state, createBudget, updateBudget } = useAppContext();
  const [submitting, setSubmitting] = useState(false);
  
  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      name: budget?.name || "",
      category: budget?.category || "",
      allocated: budget?.allocated?.toString() || "",
      period: budget?.period || "monthly",
    },
  });

  const onSubmit = async (values: BudgetFormValues) => {
    const payload = {
      name: values.name,
      category: values.category,
      allocated: Number(values.allocated),
      period: values.period,
    };

    setSubmitting(true);
    try {
      if (budget) {
        await updateBudget(budget.id, payload);
        toast({
          title: "Budget updated",
          description: "Your budget has been updated successfully.",
        });
      } else {
        await createBudget(payload);
        toast({
          title: "Budget created",
          description: "Your new budget has been created successfully.",
        });
      }

      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Unable to save budget",
        description: error?.message || 'Something went wrong while saving the budget.',
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="animate-scale-in">
      <CardHeader>
        <CardTitle>{budget ? 'Edit Budget' : 'Create New Budget'}</CardTitle>
        <CardDescription>
          {budget ? 'Update your budget details' : 'Set up a new budget to track your expenses'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Q1 Marketing Budget" {...field} />
                  </FormControl>
                  <FormDescription>
                    Give your budget a descriptive name
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {state.categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the category this budget belongs to
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="allocated"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Allocated Amount</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="10000" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter the total budget amount in dollars
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="period"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Period</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    How often does this budget reset?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3">
              <Button type="submit" className="flex-1" disabled={submitting}>
                {budget ? 'Update Budget' : 'Create Budget'}
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