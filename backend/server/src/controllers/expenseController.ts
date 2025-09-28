import { Request, Response } from 'express';
import { SortOrder } from 'mongoose';
import mongoose from 'mongoose';
import { Expense, Budget } from '../models';

interface AuthRequest extends Request {
  user?: any;
}

const normalizeQueryValue = (value: unknown): string | undefined => {
  if (Array.isArray(value)) {
    const [first] = value;
    return first != null ? String(first) : undefined;
  }
  if (value === undefined || value === null) {
    return undefined;
  }
  return String(value);
};

const parsePositiveInt = (value: unknown, fallback: number): number => {
  const normalized = normalizeQueryValue(value);
  if (!normalized) return fallback;
  const parsed = parseInt(normalized, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const recalculateBudgetUsage = async (budgetId: mongoose.Types.ObjectId | string) => {
  try {
    const id = typeof budgetId === 'string' ? new mongoose.Types.ObjectId(budgetId) : budgetId;
    const [result] = await Expense.aggregate([
      { $match: { budgetId: id, status: 'approved' } },
      {
        $group: {
          _id: '$budgetId',
          totalSpent: { $sum: '$amount' }
        }
      }
    ]);

    const spent = result?.totalSpent ?? 0;
    const budget = await Budget.findById(id);
    if (!budget) return;

    budget.spent = spent;
    budget.remaining = budget.allocated - spent;

    const utilization = (spent / (budget.allocated || 1)) * 100;
    if (utilization >= 90) {
      budget.status = 'over-budget';
    } else if (utilization >= 75) {
      budget.status = 'warning';
    } else {
      budget.status = 'on-track';
    }

    await budget.save();
  } catch (error) {
    console.error('Recalculate budget usage error:', error);
  }
};

export const getExpenses = async (req: AuthRequest, res: Response) => {
  try {
    const { category, status, department, page, limit } = req.query;
    
    const filter: Record<string, unknown> = {};
    const normalizedCategory = normalizeQueryValue(category);
    const normalizedStatus = normalizeQueryValue(status);
    const normalizedDepartment = normalizeQueryValue(department);

    if (normalizedCategory) filter.category = normalizedCategory;
    if (normalizedStatus) filter.status = normalizedStatus;
    if (normalizedDepartment) filter.department = normalizedDepartment;

    const pageNumber = parsePositiveInt(page, 1);
    const limitNumber = parsePositiveInt(limit, 10);
    const sort: Record<string, SortOrder> = { createdAt: 'desc' };

    const expenses = await Expense.find(filter)
      .populate('budgetId', 'name category')
      .sort(sort)
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    const total = await Expense.countDocuments(filter);

    res.json({
      success: true,
      data: expenses,
      pagination: {
        page: pageNumber,
        pages: Math.ceil(total / limitNumber),
        total
      }
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching expenses'
    });
  }
};

export const getExpense = async (req: Request, res: Response) => {
  try {
    const expense = await Expense.findById(req.params.id).populate('budgetId', 'name category');
    
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    res.json({
      success: true,
      data: expense
    });
  } catch (error) {
    console.error('Get expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching expense'
    });
  }
};

export const createExpense = async (req: AuthRequest, res: Response) => {
  try {
    const expenseData = {
      ...req.body,
      createdBy: req.user?._id
    };

    const expense = await Expense.create(expenseData);

    // Update budget spent amount if budgetId is provided
    if (expense.budgetId && expense.status === 'approved') {
      await recalculateBudgetUsage(expense.budgetId);
    }

    const populatedExpense = await Expense.findById(expense._id).populate('budgetId', 'name category');

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: populatedExpense
    });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating expense'
    });
  }
};

export const updateExpense = async (req: AuthRequest, res: Response) => {
  try {
    const oldExpense = await Expense.findById(req.params.id);
    if (!oldExpense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('budgetId', 'name category');

    // Update budget spent amount when status or budget association changes
    if (oldExpense.budgetId) {
      await recalculateBudgetUsage(oldExpense.budgetId);
    }

    if (expense?.budgetId && (!oldExpense.budgetId || String(oldExpense.budgetId) !== String(expense.budgetId))) {
      await recalculateBudgetUsage(expense.budgetId);
    } else if (expense?.budgetId && oldExpense.status !== expense.status) {
      await recalculateBudgetUsage(expense.budgetId);
    }

    res.json({
      success: true,
      message: 'Expense updated successfully',
      data: expense
    });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating expense'
    });
  }
};

export const approveExpense = async (req: AuthRequest, res: Response) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'approved',
        approvedBy: req.user?.name || req.user?.email
      },
      { new: true, runValidators: true }
    ).populate('budgetId', 'name category');

    // Update budget spent amount
    if (expense.budgetId) {
      await recalculateBudgetUsage(expense.budgetId);
    }

    res.json({
      success: true,
      message: 'Expense approved successfully',
      data: updatedExpense
    });
  } catch (error) {
    console.error('Approve expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving expense'
    });
  }
};

export const rejectExpense = async (req: AuthRequest, res: Response) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'rejected',
        approvedBy: req.user?.name || req.user?.email
      },
      { new: true, runValidators: true }
    ).populate('budgetId', 'name category');

    // Remove from budget spent amount if it was previously approved
    if (expense.budgetId) {
      await recalculateBudgetUsage(expense.budgetId);
    }

    res.json({
      success: true,
      message: 'Expense rejected successfully',
      data: updatedExpense
    });
  } catch (error) {
    console.error('Reject expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting expense'
    });
  }
};

export const deleteExpense = async (req: Request, res: Response) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Remove from budget spent amount if it was approved
    if (expense.budgetId && expense.status === 'approved') {
      await Budget.findByIdAndUpdate(
        expense.budgetId,
        { $inc: { spent: -expense.amount } }
      );
    }

    await Expense.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting expense'
    });
  }
};