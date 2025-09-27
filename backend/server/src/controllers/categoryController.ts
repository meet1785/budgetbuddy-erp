import { Request, Response } from 'express';
import { SortOrder } from 'mongoose';
import { Category, Budget, Expense } from '../models';

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

const parseBoolean = (value: unknown): boolean | undefined => {
  const normalized = normalizeQueryValue(value);
  if (normalized === undefined) return undefined;
  if (/^(true|1)$/i.test(normalized)) return true;
  if (/^(false|0)$/i.test(normalized)) return false;
  return undefined;
};

const parsePositiveInt = (value: unknown, fallback: number): number => {
  const normalized = normalizeQueryValue(value);
  if (!normalized) return fallback;
  const parsed = parseInt(normalized, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const { search, isActive, page, limit } = req.query;

    const filter: Record<string, unknown> = {};

    const normalizedSearch = normalizeQueryValue(search);
    const activeFilter = parseBoolean(isActive);

    if (normalizedSearch) {
      filter.name = { $regex: normalizedSearch, $options: 'i' };
    }

    if (activeFilter !== undefined) {
      filter.isActive = activeFilter;
    }

    const pageNumber = parsePositiveInt(page, 1);
    const limitNumber = parsePositiveInt(limit, 20);
    const sort: Record<string, SortOrder> = { name: 'asc' };

    const categories = await Category.find(filter)
      .sort(sort)
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    const total = await Category.countDocuments(filter);

    res.json({
      success: true,
      data: categories,
      pagination: {
        page: pageNumber,
        pages: Math.ceil(total / limitNumber),
        total
      }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories'
    });
  }
};

export const getCategory = async (req: Request, res: Response) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching category'
    });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const category = await Category.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating category'
    });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating category'
    });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const budgetsUsingCategory = await Budget.countDocuments({ category: category.name });
    const expensesUsingCategory = await Expense.countDocuments({ category: category.name });

    if (budgetsUsingCategory > 0 || expensesUsingCategory > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category that is in use by budgets or expenses'
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting category'
    });
  }
};
