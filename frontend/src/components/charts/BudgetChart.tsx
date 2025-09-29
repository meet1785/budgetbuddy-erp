import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, Area, AreaChart } from 'recharts';
import { useAppContext } from '@/context/AppContext';
import { formatCurrency } from '@/utils/currency';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4'];

interface PieChartLabelProps {
  name?: string;
  percent?: number;
}

export const BudgetPieChart = () => {
  const { state } = useAppContext();
  
  // Calculate dynamic budget allocation vs spending
  const approvedExpenses = state.expenses.filter(expense => expense.status === 'approved');
  
  const data = state.categories.map((category, index) => {
    const categoryBudgets = state.budgets.filter(budget => budget.category === category.name);
    const allocated = categoryBudgets.reduce((sum, budget) => sum + budget.allocated, 0);
    
    // Calculate actual spending for this category
    const categoryExpenses = approvedExpenses.filter(expense => {
      // Link by budgetId first, then by category
      const expenseBudget = state.budgets.find(b => b.id === expense.budgetId);
      return expenseBudget ? expenseBudget.category === category.name : expense.category === category.name;
    });
    const spent = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    return {
      category: category.name,
      allocated,
      spent,
      remaining: Math.max(0, allocated - spent),
      color: COLORS[index % COLORS.length],
      utilization: allocated > 0 ? (spent / allocated) * 100 : 0
    };
  }).filter(item => item.allocated > 0);

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>Budget vs Spending by Category</CardTitle>
        <CardDescription>Budget allocation and actual spending comparison</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(props: any) => `${props.category} (${props.utilization.toFixed(1)}%)`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="spent"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number, name: string, props: any) => [
                formatCurrency(value), 
                'Spent',
                `Allocated: ${formatCurrency(props.payload.allocated)}`
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export const BudgetBarChart = () => {
  const { state } = useAppContext();
  
  // Calculate dynamic spending for each budget
  const approvedExpenses = state.expenses.filter(expense => expense.status === 'approved');
  
  const data = state.budgets.map(budget => {
    // Calculate actual spending for this budget
    const budgetExpenses = approvedExpenses.filter(expense => 
      expense.budgetId === budget.id || 
      (expense.category === budget.category && !expense.budgetId)
    );
    const actualSpent = budgetExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const remaining = Math.max(0, budget.allocated - actualSpent);
    const utilization = budget.allocated > 0 ? (actualSpent / budget.allocated) * 100 : 0;
    
    // Determine status color
    let status = 'on-track';
    if (actualSpent > budget.allocated) {
      status = 'over-budget';
    } else if (utilization >= 80) {
      status = 'warning';
    }
    
    return {
      name: budget.name.length > 15 ? budget.name.substring(0, 15) + '...' : budget.name,
      fullName: budget.name,
      allocated: budget.allocated,
      spent: actualSpent,
      remaining: remaining,
      utilization: utilization.toFixed(1),
      status,
      expenseCount: budgetExpenses.length
    };
  });

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>Budget vs Actual Spending</CardTitle>
        <CardDescription>Real-time comparison of allocated budgets and linked expenses</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              tickFormatter={(value) => formatCurrency(value).replace('₹', '₹ ')}
            />
            <Tooltip 
              formatter={(value: number, name: string, props: any) => {
                const payload = props.payload;
                if (name === 'allocated') {
                  return [formatCurrency(value), 'Budget Allocated'];
                } else if (name === 'spent') {
                  return [
                    formatCurrency(value), 
                    `Actual Spent (${payload.expenseCount} expenses)`
                  ];
                } else {
                  return [formatCurrency(value), 'Remaining'];
                }
              }}
              labelFormatter={(label, payload) => {
                if (payload && payload[0]) {
                  return `${payload[0].payload.fullName} (${payload[0].payload.utilization}% used)`;
                }
                return label;
              }}
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

export const ExpenseTrendsChart = () => {
  const { state } = useAppContext();
  
  // Calculate monthly expense trends
  const approvedExpenses = state.expenses.filter(expense => expense.status === 'approved');
  
  // Group expenses by month
  const monthlyData = approvedExpenses.reduce((acc, expense) => {
    const date = new Date(expense.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    
    if (!acc[monthKey]) {
      acc[monthKey] = {
        month: monthName,
        total: 0,
        count: 0,
        byCategory: {}
      };
    }
    
    acc[monthKey].total += expense.amount;
    acc[monthKey].count += 1;
    
    // Track by category
    if (!acc[monthKey].byCategory[expense.category]) {
      acc[monthKey].byCategory[expense.category] = 0;
    }
    acc[monthKey].byCategory[expense.category] += expense.amount;
    
    return acc;
  }, {} as Record<string, any>);
  
  // Convert to chart data and sort by date
  const chartData = Object.values(monthlyData)
    .sort((a: any, b: any) => a.month.localeCompare(b.month))
    .slice(-6); // Show last 6 months
  
  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>Expense Trends</CardTitle>
        <CardDescription>Monthly spending patterns and trends</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => formatCurrency(value).replace('₹', '₹ ')} />
            <Tooltip 
              formatter={(value: number, name: string, props: any) => [
                formatCurrency(value),
                `Total Expenses (${props.payload.count} transactions)`
              ]}
              labelFormatter={(label) => `Month: ${label}`}
            />
            <Area 
              type="monotone" 
              dataKey="total" 
              stroke="#10B981" 
              fill="#10B981" 
              fillOpacity={0.3}
              name="Monthly Expenses"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export const BudgetUtilizationChart = () => {
  const { state } = useAppContext();
  
  // Calculate budget utilization for each budget
  const approvedExpenses = state.expenses.filter(expense => expense.status === 'approved');
  
  const utilizationData = state.budgets.map(budget => {
    const budgetExpenses = approvedExpenses.filter(expense => 
      expense.budgetId === budget.id || 
      (expense.category === budget.category && !expense.budgetId)
    );
    const actualSpent = budgetExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const utilization = budget.allocated > 0 ? (actualSpent / budget.allocated) * 100 : 0;
    
    // Determine color based on utilization
    let color = '#10B981'; // Green for good
    if (utilization > 100) {
      color = '#EF4444'; // Red for over budget
    } else if (utilization > 80) {
      color = '#F59E0B'; // Yellow for warning
    }
    
    return {
      name: budget.name.length > 20 ? budget.name.substring(0, 20) + '...' : budget.name,
      fullName: budget.name,
      utilization: Math.min(utilization, 150), // Cap at 150% for chart display
      actualUtilization: utilization,
      allocated: budget.allocated,
      spent: actualSpent,
      color
    };
  }).sort((a, b) => b.utilization - a.utilization); // Sort by utilization

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>Budget Utilization</CardTitle>
        <CardDescription>How much of each budget has been utilized</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={utilizationData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              type="number" 
              domain={[0, 150]}
              tickFormatter={(value) => `${value}%`}
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              width={120}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              formatter={(value: number, name: string, props: any) => [
                `${props.payload.actualUtilization.toFixed(1)}%`,
                `Utilization (${formatCurrency(props.payload.spent)} / ${formatCurrency(props.payload.allocated)})`
              ]}
              labelFormatter={(label, payload) => {
                if (payload && payload[0]) {
                  return payload[0].payload.fullName;
                }
                return label;
              }}
            />
            <Bar 
              dataKey="utilization" 
              fill="#10B981"
              name="Utilization %"
            >
              {utilizationData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};