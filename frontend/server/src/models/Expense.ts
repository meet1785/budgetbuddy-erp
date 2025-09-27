import mongoose, { Schema } from 'mongoose';
import { IExpense } from '../types';

const expenseSchema = new Schema<IExpense>({
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  budgetId: {
    type: Schema.Types.ObjectId,
    ref: 'Budget',
    required: false
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  vendor: {
    type: String,
    required: [true, 'Vendor is required'],
    trim: true,
    maxlength: [100, 'Vendor name cannot exceed 100 characters']
  },
  receiptUrl: {
    type: String,
    required: false,
    validate: {
      validator: function(url: string) {
        if (!url) return true; // Optional field
        return /^https?:\/\/.+/.test(url);
      },
      message: 'Invalid receipt URL format'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    required: true
  },
  approvedBy: {
    type: String,
    required: false,
    trim: true
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true,
    maxlength: [100, 'Department name cannot exceed 100 characters']
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for better query performance
expenseSchema.index({ category: 1, status: 1 });
expenseSchema.index({ department: 1 });
expenseSchema.index({ date: -1 });
expenseSchema.index({ budgetId: 1 });
expenseSchema.index({ status: 1, createdAt: -1 });

export const Expense = mongoose.model<IExpense>('Expense', expenseSchema);