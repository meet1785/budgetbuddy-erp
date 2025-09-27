import express from 'express';
import { body } from 'express-validator';
import { register, login, getProfile, updateProfile, changePassword } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = express.Router();

// Validation rules
const registerValidation = [
  body('name').notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('department').notEmpty().withMessage('Department is required'),
  body('role').optional().isIn(['admin', 'manager', 'user']).withMessage('Invalid role')
];

const loginValidation = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

const updateProfileValidation = [
  body('name').optional().isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('department').optional().notEmpty().withMessage('Department cannot be empty'),
  body('avatar').optional().isURL().withMessage('Avatar must be a valid URL')
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
];

// Routes
router.post('/register', validate(registerValidation), register);
router.post('/login', validate(loginValidation), login);
router.get('/profile', authenticate, getProfile);
router.patch('/profile', authenticate, validate(updateProfileValidation), updateProfile);
router.patch('/change-password', authenticate, validate(changePasswordValidation), changePassword);

export default router;