import express from 'express';
import { body, param, query } from 'express-validator';
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = express.Router();

const listValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('isActive')
    .optional()
    .isIn(['true', 'false', '1', '0'])
    .withMessage('isActive must be true/false')
];

const createValidation = [
  body('name').notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('description').optional().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('color').notEmpty().withMessage('Color is required')
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Color must be a valid hex code'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
];

const updateValidation = [
  body('name').optional().isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('color').optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Color must be a valid hex code'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
];

const idValidation = [
  param('id').isMongoId().withMessage('Invalid category ID')
];

router.use(authenticate);

router.get('/', validate(listValidation), getCategories);
router.get('/:id', validate(idValidation), getCategory);
router.post('/', authorize('admin', 'manager'), validate(createValidation), createCategory);
router.patch('/:id', authorize('admin', 'manager'), validate([...idValidation, ...updateValidation]), updateCategory);
router.delete('/:id', authorize('admin'), validate(idValidation), deleteCategory);

export default router;
