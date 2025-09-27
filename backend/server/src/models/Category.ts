import mongoose, { Schema } from 'mongoose';
import { ICategory } from '../types';

const categorySchema = new Schema<ICategory>({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Category name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: false,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  budget: {
    type: Number,
    required: false,
    min: [0, 'Budget must be positive']
  },
  color: {
    type: String,
    required: [true, 'Color is required'],
    validate: {
      validator: function(color: string) {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
      },
      message: 'Color must be a valid hex color code'
    }
  },
  parentId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: false
  },
  isActive: {
    type: Boolean,
    default: true,
    required: true
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

// Virtual for getting subcategories
categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentId'
});

// Indexes for better query performance
categorySchema.index({ name: 1 }, { unique: true });
categorySchema.index({ isActive: 1 });
categorySchema.index({ parentId: 1 });

export const Category = mongoose.model<ICategory>('Category', categorySchema);