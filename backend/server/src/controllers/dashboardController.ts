import { Request, Response } from 'express';
import { Budget, Expense, Transaction, Category } from '../models';
import { DashboardMetrics } from '../types';

export const getDashboardMetrics = async (req: Request, res: Response) => {
  try {
    // Get all budgets and calculate total budget
    const budgets = await Budget.find({});
    const totalBudget = budgets.reduce((sum, budget) => sum + budget.allocated, 0);

    // Get approved expenses and calculate total expenses
    const approvedExpenses = await Expense.find({ status: 'approved' });
    const totalExpenses = approvedExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Calculate remaining budget
    const remainingBudget = totalBudget - totalExpenses;

    // Calculate budget utilization percentage
    const budgetUtilization = totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0;

    // Calculate monthly burn rate (expenses from last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const monthlyExpenses = await Expense.find({
      status: 'approved',
      date: { $gte: thirtyDaysAgo }
    });
    const monthlyBurnRate = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Get all categories for breakdown
    const categories = await Category.find({ isActive: true });
    
    // Calculate category breakdown
    const categoryBreakdown = await Promise.all(
      categories.map(async (category) => {
        const categoryExpenses = await Expense.find({
          category: category.name,
          status: 'approved'
        });
        
        const amount = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
        
        return {
          category: category.name,
          amount,
          percentage: Math.round(percentage * 10) / 10
        };
      })
    );

    // Filter out categories with no expenses
    const filteredCategoryBreakdown = categoryBreakdown.filter(item => item.amount > 0);

    // Calculate expense growth (compare last 30 days with previous 30 days)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    
    const previousMonthExpenses = await Expense.find({
      status: 'approved',
      date: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
    });
    const previousMonthTotal = previousMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    const expenseGrowth = previousMonthTotal > 0 
      ? ((monthlyBurnRate - previousMonthTotal) / previousMonthTotal) * 100 
      : 0;

    const metrics: DashboardMetrics = {
      totalBudget,
      totalExpenses,
      remainingBudget,
      savingsGoal: remainingBudget, // Using remaining budget as savings goal
      monthlyBurnRate,
      budgetUtilization: Math.round(budgetUtilization * 10) / 10,
      expenseGrowth: Math.round(expenseGrowth * 10) / 10,
      categoryBreakdown: filteredCategoryBreakdown
    };

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Get dashboard metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard metrics'
    });
  }
};

export const getBudgetAlerts = async (req: Request, res: Response) => {
  try {
    const budgets = await Budget.find({});
    
    const alerts = budgets.map(budget => {
      const utilization = (budget.spent / budget.allocated) * 100;
      
      if (utilization >= 90) {
        return {
          type: 'warning',
          title: `${budget.name} 90% Used`,
          message: 'Consider reallocating funds from other categories',
          budget: budget.name,
          utilization: Math.round(utilization)
        };
      } else if (utilization < 50) {
        return {
          type: 'info',
          title: `${budget.name} Under Budget`,
          message: `₹${budget.remaining.toLocaleString('en-IN')} remaining in ${budget.name.toLowerCase()} budget`,
          budget: budget.name,
          utilization: Math.round(utilization)
        };
      }
      return null;
    }).filter(alert => alert !== null);

    // Add savings goal alert if there's remaining budget
    const totalBudget = budgets.reduce((sum, budget) => sum + budget.allocated, 0);
    const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
    const remainingBudget = totalBudget - totalSpent;
    
    if (remainingBudget > 0) {
      const savingsPercentage = (remainingBudget / totalBudget) * 100;
      alerts.push({
        type: 'success',
        title: 'Savings Goal on Track',
        message: `${Math.round(savingsPercentage)}% remaining with budget allocation`,
        budget: 'Overall',
        utilization: Math.round(100 - savingsPercentage)
      });
    }

    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    console.error('Get budget alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching budget alerts'
    });
  }
};

export const getRecentTransactions = async (req: Request, res: Response) => {
  try {
    const { limit = 10 } = req.query;
    
    const transactions = await Transaction.find({})
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string));

    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('Get recent transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent transactions'
    });
  }
};

export const getPendingExpenses = async (req: Request, res: Response) => {
  try {
    const { limit = 10 } = req.query;
    
    const pendingExpenses = await Expense.find({ status: 'pending' })
      .populate('budgetId', 'name category')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string));

    res.json({
      success: true,
      data: pendingExpenses
    });
  } catch (error) {
    console.error('Get pending expenses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending expenses'
    });
  }
};