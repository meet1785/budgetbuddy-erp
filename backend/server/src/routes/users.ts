import express from 'express';
import { body, param, query } from 'express-validator';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  changeUserPassword,
  deactivateUser,
  reactivateUser
} from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = express.Router();

const listValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('role').optional().isIn(['admin', 'manager', 'user']).withMessage('Invalid role'),
  query('isActive').optional().isIn(['true', 'false', '1', '0']).withMessage('isActive must be true/false')
];

const createValidation = [
  body('name').notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('department').notEmpty().withMessage('Department is required').isLength({ max: 100 }),
  body('role').optional().isIn(['admin', 'manager', 'user']).withMessage('Invalid role'),
  body('avatar').optional().isURL().withMessage('Avatar must be a valid URL'),
  body('permissions').optional().isArray().withMessage('Permissions must be an array of strings'),
  body('permissions.*').optional().isString().withMessage('Permission must be a string')
];

const updateValidation = [
  body('name').optional().isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('department').optional().isLength({ max: 100 }).withMessage('Department cannot exceed 100 characters'),
  body('role').optional().isIn(['admin', 'manager', 'user']).withMessage('Invalid role'),
  body('avatar').optional().isURL().withMessage('Avatar must be a valid URL'),
  body('permissions').optional().isArray().withMessage('Permissions must be an array of strings'),
  body('permissions.*').optional().isString().withMessage('Permission must be a string'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
];

const passwordValidation = [
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
];

const idValidation = [
  param('id').isMongoId().withMessage('Invalid user ID')
];

router.use(authenticate);

router.get('/', authorize('admin', 'manager'), validate(listValidation), getUsers);
router.get('/:id', authorize('admin', 'manager'), validate(idValidation), getUser);
router.post('/', authorize('admin'), validate(createValidation), createUser);
router.patch('/:id', authorize('admin'), validate([...idValidation, ...updateValidation]), updateUser);
router.patch('/:id/password', authorize('admin'), validate([...idValidation, ...passwordValidation]), changeUserPassword);
router.patch('/:id/deactivate', authorize('admin'), validate(idValidation), deactivateUser);
router.patch('/:id/reactivate', authorize('admin'), validate(idValidation), reactivateUser);

export default router;
