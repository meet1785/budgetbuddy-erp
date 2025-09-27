import { Request, Response } from 'express';
import { Expense, Budget } from '../models';

interface AuthRequest extends Request {
  user?: any;
}

export const getExpenses = async (req: AuthRequest, res: Response) => {
  try {
    const { category, status, department, page = 1, limit = 10 } = req.query;
    
    const filter: any = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (department) filter.department = department;

    const options = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      sort: { createdAt: -1 }
    };

    const expenses = await Expense.find(filter)
      .populate('budgetId', 'name category')
      .sort(options.sort)
      .limit(options.limit * options.page)
      .skip((options.page - 1) * options.limit);

    const total = await Expense.countDocuments(filter);

    res.json({
      success: true,
      data: expenses,
      pagination: {
        page: options.page,
        pages: Math.ceil(total / options.limit),
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
      await Budget.findByIdAndUpdate(
        expense.budgetId,
        { $inc: { spent: expense.amount } }
      );
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

    // Update budget spent amount if status changed
    if (oldExpense.budgetId && (oldExpense.status !== expense!.status)) {
      if (oldExpense.status === 'approved' && expense!.status !== 'approved') {
        // Subtract from budget if changed from approved to non-approved
        await Budget.findByIdAndUpdate(
          oldExpense.budgetId,
          { $inc: { spent: -oldExpense.amount } }
        );
      } else if (oldExpense.status !== 'approved' && expense!.status === 'approved') {
        // Add to budget if changed from non-approved to approved
        await Budget.findByIdAndUpdate(
          oldExpense.budgetId,
          { $inc: { spent: expense!.amount } }
        );
      }
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
    if (expense.budgetId && expense.status !== 'approved') {
      await Budget.findByIdAndUpdate(
        expense.budgetId,
        { $inc: { spent: expense.amount } }
      );
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
    if (expense.budgetId && expense.status === 'approved') {
      await Budget.findByIdAndUpdate(
        expense.budgetId,
        { $inc: { spent: -expense.amount } }
      );
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