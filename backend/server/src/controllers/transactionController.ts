import { Request, Response } from 'express';
import { SortOrder } from 'mongoose';
import { Transaction } from '../models';

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

const parseDate = (value: unknown): Date | undefined => {
  const normalized = normalizeQueryValue(value);
  if (!normalized) return undefined;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

export const getTransactions = async (req: Request, res: Response) => {
  try {
    const { type, status, category, account, startDate, endDate, page, limit } = req.query;

    const filter: Record<string, unknown> = {};

    const normalizedType = normalizeQueryValue(type);
    const normalizedStatus = normalizeQueryValue(status);
    const normalizedCategory = normalizeQueryValue(category);
    const normalizedAccount = normalizeQueryValue(account);
    const parsedStartDate = parseDate(startDate);
    const parsedEndDate = parseDate(endDate);

    if (normalizedType) filter.type = normalizedType;
    if (normalizedStatus) filter.status = normalizedStatus;
    if (normalizedCategory) filter.category = normalizedCategory;
    if (normalizedAccount) filter.account = normalizedAccount;

    if (parsedStartDate || parsedEndDate) {
      filter.date = {
        ...(parsedStartDate ? { $gte: parsedStartDate } : {}),
        ...(parsedEndDate ? { $lte: parsedEndDate } : {})
      };
    }

    const pageNumber = parsePositiveInt(page, 1);
    const limitNumber = parsePositiveInt(limit, 20);
    const sort: Record<string, SortOrder> = { date: 'desc' };

    const transactions = await Transaction.find(filter)
      .sort(sort)
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    const total = await Transaction.countDocuments(filter);

    res.json({
      success: true,
      data: transactions,
      pagination: {
        page: pageNumber,
        pages: Math.ceil(total / limitNumber),
        total
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transactions'
    });
  }
};

export const getTransaction = async (req: Request, res: Response) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transaction'
    });
  }
};

export const createTransaction = async (req: Request, res: Response) => {
  try {
    const transaction = await Transaction.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: transaction
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating transaction'
    });
  }
};

export const updateTransaction = async (req: Request, res: Response) => {
  try {
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      message: 'Transaction updated successfully',
      data: transaction
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating transaction'
    });
  }
};

export const deleteTransaction = async (req: Request, res: Response) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    await Transaction.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting transaction'
    });
  }
};
