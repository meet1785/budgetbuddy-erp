import express from 'express';
import { body, param } from 'express-validator';
import {
  getBudgets,
  getBudget,
  createBudget,
  updateBudget,
  deleteBudget
} from '../controllers/budgetController';
import { authenticate, authorize, checkPermission } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = express.Router();

// Validation rules
const createBudgetValidation = [
  body('name').notEmpty().withMessage('Budget name is required').isLength({ max: 100 }),
  body('category').notEmpty().withMessage('Category is required'),
  body('allocated').isNumeric().withMessage('Allocated amount must be a number').isFloat({ min: 0 }),
  body('period').isIn(['monthly', 'quarterly', 'yearly']).withMessage('Invalid period'),
  body('spent').optional().isNumeric().withMessage('Spent amount must be a number').isFloat({ min: 0 })
];

const updateBudgetValidation = [
  body('name').optional().isLength({ max: 100 }).withMessage('Budget name cannot exceed 100 characters'),
  body('category').optional().notEmpty().withMessage('Category cannot be empty'),
  body('allocated').optional().isNumeric().withMessage('Allocated amount must be a number').isFloat({ min: 0 }),
  body('period').optional().isIn(['monthly', 'quarterly', 'yearly']).withMessage('Invalid period'),
  body('spent').optional().isNumeric().withMessage('Spent amount must be a number').isFloat({ min: 0 })
];

const idValidation = [
  param('id').isMongoId().withMessage('Invalid budget ID')
];

// Apply authentication to all routes
router.use(authenticate);

// Routes
router.get('/', getBudgets);
router.get('/:id', validate(idValidation), getBudget);
router.post('/', checkPermission('edit_budgets'), validate(createBudgetValidation), createBudget);
router.patch('/:id', checkPermission('edit_budgets'), validate([...idValidation, ...updateBudgetValidation]), updateBudget);
router.delete('/:id', authorize('admin', 'manager'), validate(idValidation), deleteBudget);

export default router;