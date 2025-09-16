import express from 'express';
import { body, param } from 'express-validator';
import {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  approveExpense,
  rejectExpense,
  deleteExpense
} from '../controllers/expenseController';
import { authenticate, authorize, checkPermission } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = express.Router();

// Validation rules
const createExpenseValidation = [
  body('description').notEmpty().withMessage('Description is required').isLength({ max: 500 }),
  body('amount').isNumeric().withMessage('Amount must be a number').isFloat({ min: 0.01 }),
  body('category').notEmpty().withMessage('Category is required'),
  body('vendor').notEmpty().withMessage('Vendor is required').isLength({ max: 100 }),
  body('department').notEmpty().withMessage('Department is required').isLength({ max: 100 }),
  body('date').optional().isISO8601().withMessage('Invalid date format'),
  body('budgetId').optional().isMongoId().withMessage('Invalid budget ID'),
  body('receiptUrl').optional().isURL().withMessage('Receipt URL must be valid'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('tags.*').optional().isLength({ max: 50 }).withMessage('Tag cannot exceed 50 characters')
];

const updateExpenseValidation = [
  body('description').optional().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('amount').optional().isNumeric().withMessage('Amount must be a number').isFloat({ min: 0.01 }),
  body('category').optional().notEmpty().withMessage('Category cannot be empty'),
  body('vendor').optional().isLength({ max: 100 }).withMessage('Vendor name cannot exceed 100 characters'),
  body('department').optional().isLength({ max: 100 }).withMessage('Department name cannot exceed 100 characters'),
  body('date').optional().isISO8601().withMessage('Invalid date format'),
  body('budgetId').optional().isMongoId().withMessage('Invalid budget ID'),
  body('receiptUrl').optional().isURL().withMessage('Receipt URL must be valid'),
  body('status').optional().isIn(['pending', 'approved', 'rejected']).withMessage('Invalid status'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('tags.*').optional().isLength({ max: 50 }).withMessage('Tag cannot exceed 50 characters')
];

const idValidation = [
  param('id').isMongoId().withMessage('Invalid expense ID')
];

// Apply authentication to all routes
router.use(authenticate);

// Routes
router.get('/', getExpenses);
router.get('/:id', validate(idValidation), getExpense);
router.post('/', checkPermission('create_expenses'), validate(createExpenseValidation), createExpense);
router.patch('/:id', validate([...idValidation, ...updateExpenseValidation]), updateExpense);
router.patch('/:id/approve', checkPermission('approve_expenses'), validate(idValidation), approveExpense);
router.patch('/:id/reject', checkPermission('approve_expenses'), validate(idValidation), rejectExpense);
router.delete('/:id', validate(idValidation), deleteExpense);

export default router;