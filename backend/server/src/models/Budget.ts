import mongoose, { Schema } from 'mongoose';
import { IBudget } from '../types';

const budgetSchema = new Schema<IBudget>({
  name: {
    type: String,
    required: [true, 'Budget name is required'],
    trim: true,
    maxlength: [100, 'Budget name cannot exceed 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  allocated: {
    type: Number,
    required: [true, 'Allocated amount is required'],
    min: [0, 'Allocated amount must be positive']
  },
  spent: {
    type: Number,
    default: 0,
    min: [0, 'Spent amount must be positive']
  },
  remaining: {
    type: Number,
    default: function() {
      return this.allocated - this.spent;
    }
  },
  period: {
    type: String,
    enum: ['monthly', 'quarterly', 'yearly'],
    required: [true, 'Period is required'],
    default: 'monthly'
  },
  status: {
    type: String,
    enum: ['on-track', 'warning', 'over-budget'],
    default: 'on-track'
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(_doc, ret) {
      const { _id, __v, ...rest } = ret as Record<string, unknown> & {
        _id?: unknown;
        __v?: unknown;
      };

      const id = _id != null ? String(_id) : undefined;

      return {
        ...rest,
        id,
      };
    }
  }
});

// Pre-save middleware to calculate remaining and status
budgetSchema.pre('save', function(next) {
  this.remaining = this.allocated - this.spent;
  
  const utilization = (this.spent / this.allocated) * 100;
  if (utilization >= 90) {
    this.status = 'over-budget';
  } else if (utilization >= 75) {
    this.status = 'warning';
  } else {
    this.status = 'on-track';
  }
  
  next();
});

// Index for better query performance
budgetSchema.index({ category: 1, period: 1 });
budgetSchema.index({ status: 1 });
budgetSchema.index({ createdAt: -1 });

export const Budget = mongoose.model<IBudget>('Budget', budgetSchema);