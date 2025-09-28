import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useAppContext } from '@/context/AppContext';
import { formatCurrency } from '@/utils/currency';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4'];

interface PieChartLabelProps {
  name?: string;
  percent?: number;
}

export const BudgetPieChart = () => {
  const { state } = useAppContext();
  
  const data = state.metrics.categoryBreakdown.map((item, index) => ({
    ...item,
    color: COLORS[index % COLORS.length]
  }));

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>Budget Distribution</CardTitle>
        <CardDescription>Current budget allocation by category</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(props: PieChartLabelProps) => `${props.name} ${((props.percent || 0) * 100).toFixed(1)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="amount"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => [formatCurrency(value), 'Amount']} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export const BudgetBarChart = () => {
  const { state } = useAppContext();
  
  const data = state.budgets.map(budget => ({
    name: budget.name.split(' ')[0], // Shortened name for display
    allocated: budget.allocated,
    spent: budget.spent,
    remaining: budget.remaining,
    utilization: ((budget.spent / budget.allocated) * 100).toFixed(1)
  }));

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>Budget vs Actual Spending</CardTitle>
        <CardDescription>Comparison of allocated budgets and actual spending</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              formatter={(value: number, name: string) => [
                formatCurrency(value), 
                name.charAt(0).toUpperCase() + name.slice(1)
              ]}
            />
            <Legend />
            <Bar dataKey="allocated" fill="#3B82F6" name="Allocated" />
            <Bar dataKey="spent" fill="#10B981" name="Spent" />
            <Bar dataKey="remaining" fill="#F59E0B" name="Remaining" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};