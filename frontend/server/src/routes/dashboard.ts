import express from 'express';
import {
  getDashboardMetrics,
  getBudgetAlerts,
  getRecentTransactions,
  getPendingExpenses
} from '../controllers/dashboardController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Routes
router.get('/metrics', getDashboardMetrics);
router.get('/alerts', getBudgetAlerts);
router.get('/recent-transactions', getRecentTransactions);
router.get('/pending-expenses', getPendingExpenses);

export default router;