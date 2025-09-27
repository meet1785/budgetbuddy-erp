import express from 'express';
import { body, param, query } from 'express-validator';
import {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction
} from '../controllers/transactionController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = express.Router();

const listValidation = [
  query('type').optional().isIn(['income', 'expense']).withMessage('Invalid transaction type'),
  query('status').optional().isIn(['completed', 'pending', 'failed']).withMessage('Invalid status'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

const createValidation = [
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('amount').isNumeric().withMessage('Amount must be a number').isFloat({ min: 0.01 }),
  body('description').notEmpty().withMessage('Description is required').isLength({ max: 500 }),
  body('category').notEmpty().withMessage('Category is required'),
  body('date').optional().isISO8601().withMessage('Invalid date'),
  body('account').notEmpty().withMessage('Account is required').isLength({ max: 100 }),
  body('reference').optional().isLength({ max: 50 }).withMessage('Reference cannot exceed 50 characters'),
  body('status').optional().isIn(['completed', 'pending', 'failed']).withMessage('Invalid status')
];

const updateValidation = [
  body('type').optional().isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('amount').optional().isNumeric().withMessage('Amount must be a number').isFloat({ min: 0.01 }),
  body('description').optional().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('category').optional().notEmpty().withMessage('Category cannot be empty'),
  body('date').optional().isISO8601().withMessage('Invalid date'),
  body('account').optional().isLength({ max: 100 }).withMessage('Account cannot exceed 100 characters'),
  body('reference').optional().isLength({ max: 50 }).withMessage('Reference cannot exceed 50 characters'),
  body('status').optional().isIn(['completed', 'pending', 'failed']).withMessage('Invalid status')
];

const idValidation = [
  param('id').isMongoId().withMessage('Invalid transaction ID')
];

router.use(authenticate);

router.get('/', validate(listValidation), getTransactions);
router.get('/:id', validate(idValidation), getTransaction);
router.post('/', authorize('admin', 'manager'), validate(createValidation), createTransaction);
router.patch('/:id', authorize('admin', 'manager'), validate([...idValidation, ...updateValidation]), updateTransaction);
router.delete('/:id', authorize('admin'), validate(idValidation), deleteTransaction);

export default router;
