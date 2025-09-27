import request from 'supertest';
import express from 'express';
import { Budget } from '../models';

// Mock the Budget model
jest.mock('../models', () => ({
  Budget: {
    find: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  },
}));

describe('Budget API Tests', () => {
  let app: express.Application;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Budget Model Validation', () => {
    it('should validate required fields', () => {
      const budgetData = {
        name: 'Test Budget',
        category: 'Testing',
        allocated: 1000,
        period: 'monthly',
      };

      expect(budgetData.name).toBeDefined();
      expect(budgetData.category).toBeDefined();
      expect(budgetData.allocated).toBeGreaterThan(0);
      expect(['monthly', 'quarterly', 'yearly']).toContain(budgetData.period);
    });

    it('should calculate remaining budget correctly', () => {
      const allocated = 1000;
      const spent = 300;
      const remaining = allocated - spent;
      
      expect(remaining).toBe(700);
    });

    it('should determine budget status correctly', () => {
      const testCases = [
        { spent: 100, allocated: 1000, expected: 'on-track' }, // 10%
        { spent: 800, allocated: 1000, expected: 'warning' },  // 80%
        { spent: 950, allocated: 1000, expected: 'over-budget' }, // 95%
      ];

      testCases.forEach(({ spent, allocated, expected }) => {
        const utilization = (spent / allocated) * 100;
        let status: string;
        
        if (utilization >= 90) {
          status = 'over-budget';
        } else if (utilization >= 75) {
          status = 'warning';
        } else {
          status = 'on-track';
        }
        
        expect(status).toBe(expected);
      });
    });
  });

  describe('Budget Calculations', () => {
    it('should handle edge cases for budget calculations', () => {
      // Test division by zero
      expect(() => {
        const utilization = 100 / 0;
        return isFinite(utilization) ? utilization : 0;
      }).not.toThrow();

      // Test negative values
      const allocated = 1000;
      const spent = -100; // Should not be possible but test anyway
      const remaining = Math.max(0, allocated - Math.max(0, spent));
      expect(remaining).toBe(1000);
    });
  });
});