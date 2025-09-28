import { Request, Response } from 'express';
import { SortOrder } from 'mongoose';
import { Budget, Expense } from '../models';

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

export const getBudgets = async (req: AuthRequest, res: Response) => {
  try {
    const { category, period, status, page, limit } = req.query;

    const filter: Record<string, unknown> = {};
    const normalizedCategory = normalizeQueryValue(category);
    const normalizedPeriod = normalizeQueryValue(period);
    const normalizedStatus = normalizeQueryValue(status);

    if (normalizedCategory) filter.category = normalizedCategory;
    if (normalizedPeriod) filter.period = normalizedPeriod;
    if (normalizedStatus) filter.status = normalizedStatus;

    const pageNumber = parsePositiveInt(page, 1);
    const limitNumber = parsePositiveInt(limit, 10);
    const sort: Record<string, SortOrder> = { createdAt: 'desc' };

    const budgets = await Budget.find(filter)
      .sort(sort)
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    const total = await Budget.countDocuments(filter);

    res.json({
      success: true,
      data: budgets,
      pagination: {
        page: pageNumber,
        pages: Math.ceil(total / limitNumber),
        total
      }
    });
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching budgets'
    });
  }
};

export const getBudget = async (req: Request, res: Response) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    res.json({
      success: true,
      data: budget
    });
  } catch (error) {
    console.error('Get budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching budget'
    });
  }
};

export const createBudget = async (req: AuthRequest, res: Response) => {
  try {
    const budgetData = {
      ...req.body,
      createdBy: req.user?._id
    };

    const budget = await Budget.create(budgetData);

    res.status(201).json({
      success: true,
      message: 'Budget created successfully',
      data: budget
    });
  } catch (error) {
    console.error('Create budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating budget'
    });
  }
};

export const updateBudget = async (req: Request, res: Response) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

  const allowedUpdates = ['name', 'category', 'allocated', 'period'];
    const updates = Object.keys(req.body);
    const invalidField = updates.find(field => !allowedUpdates.includes(field));
    if (invalidField) {
      return res.status(400).json({
        success: false,
        message: `Invalid field provided: ${invalidField}`
      });
    }

    updates.forEach(field => {
      (budget as any)[field] = req.body[field];
    });

    // Recalculate derived fields
    const approvedExpenses = await Expense.aggregate([
      { $match: { budgetId: budget._id, status: 'approved' } },
      {
        $group: {
          _id: '$budgetId',
          total: { $sum: '$amount' }
        }
      }
    ]);

    const currentSpent = approvedExpenses[0]?.total ?? 0;
    budget.spent = currentSpent;
    budget.remaining = budget.allocated - currentSpent;
    const utilization = (currentSpent / (budget.allocated || 1)) * 100;
    if (utilization >= 90) {
      budget.status = 'over-budget';
    } else if (utilization >= 75) {
      budget.status = 'warning';
    } else {
      budget.status = 'on-track';
    }

    await budget.save();

    res.json({
      success: true,
      message: 'Budget updated successfully',
      data: budget
    });
  } catch (error) {
    console.error('Update budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating budget'
    });
  }
};

export const deleteBudget = async (req: Request, res: Response) => {
  try {
    const budget = await Budget.findByIdAndDelete(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    res.json({
      success: true,
      message: 'Budget deleted successfully'
    });
  } catch (error) {
    console.error('Delete budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting budget'
    });
  }
};