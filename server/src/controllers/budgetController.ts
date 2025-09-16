import { Request, Response } from 'express';
import { Budget } from '../models';
import { IBudget } from '../types';

interface AuthRequest extends Request {
  user?: any;
}

export const getBudgets = async (req: AuthRequest, res: Response) => {
  try {
    const { category, period, status, page = 1, limit = 10 } = req.query;
    
    const filter: any = {};
    if (category) filter.category = category;
    if (period) filter.period = period;
    if (status) filter.status = status;

    const options = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      sort: { createdAt: -1 }
    };

    const budgets = await Budget.find(filter)
      .sort(options.sort)
      .limit(options.limit * options.page)
      .skip((options.page - 1) * options.limit);

    const total = await Budget.countDocuments(filter);

    res.json({
      success: true,
      data: budgets,
      pagination: {
        page: options.page,
        pages: Math.ceil(total / options.limit),
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
    const budget = await Budget.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

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