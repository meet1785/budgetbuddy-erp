import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from '../types';

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(email: string) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
      },
      message: 'Please enter a valid email address'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'user'],
    default: 'user',
    required: true
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true,
    maxlength: [100, 'Department name cannot exceed 100 characters']
  },
  avatar: {
    type: String,
    required: false,
    validate: {
      validator: function(url: string) {
        if (!url) return true; // Optional field
        return /^https?:\/\/.+/.test(url);
      },
      message: 'Invalid avatar URL format'
    }
  },
  permissions: [{
    type: String,
    trim: true
  }],
  lastLogin: {
    type: Date,
    required: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tokenVersion: {
    type: Number,
    default: 0,
    required: true
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(_doc, ret) {
      const { _id, __v, password, tokenVersion, ...rest } = ret as Record<string, unknown> & {
        _id?: unknown;
        __v?: unknown;
        password?: unknown;
        tokenVersion?: unknown;
      };

      const id = _id != null ? String(_id) : undefined;

      return {
        ...rest,
        id,
      };
    }
  }
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Indexes for better query performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1, department: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ tokenVersion: 1 });

export const User = mongoose.model<IUser>('User', userSchema);