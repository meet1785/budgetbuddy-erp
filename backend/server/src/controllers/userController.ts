import { Request, Response } from 'express';
import { SortOrder } from 'mongoose';
import { User } from '../models';
import { IUser } from '../types';

interface AuthRequest extends Request {
  user?: IUser;
}

const normalizeQueryValue = (value: unknown): string | undefined => {
  if (Array.isArray(value)) {
    const [first] = value;
    return first != null ? String(first) : undefined;
  }
  if (value === undefined || value === null) {
    return undefined;
  }
  return String(value);
};

const parsePositiveInt = (value: unknown, fallback: number): number => {
  const normalized = normalizeQueryValue(value);
  if (!normalized) return fallback;
  const parsed = parseInt(normalized, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const { role, department, search, page, limit, isActive } = req.query;

    const filter: Record<string, unknown> = {};

    const normalizedRole = normalizeQueryValue(role);
    const normalizedDepartment = normalizeQueryValue(department);
    const normalizedSearch = normalizeQueryValue(search);
    const normalizedIsActive = normalizeQueryValue(isActive);

    if (normalizedRole) filter.role = normalizedRole;
    if (normalizedDepartment) filter.department = normalizedDepartment;
    if (normalizedSearch) {
      filter.$or = [
        { name: { $regex: normalizedSearch, $options: 'i' } },
        { email: { $regex: normalizedSearch, $options: 'i' } }
      ];
    }
    if (normalizedIsActive !== undefined) {
      if (/^(true|1)$/i.test(normalizedIsActive)) {
        filter.isActive = true;
      } else if (/^(false|0)$/i.test(normalizedIsActive)) {
        filter.isActive = false;
      }
    }

    const pageNumber = parsePositiveInt(page, 1);
    const limitNumber = parsePositiveInt(limit, 20);
    const sort: Record<string, SortOrder> = { createdAt: 'desc' };

    const users = await User.find(filter)
      .select('+isActive')
      .sort(sort)
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .lean();

    const total = await User.countDocuments(filter);

    const sanitized = users.map(({ password, __v, ...rest }) => rest);

    res.json({
      success: true,
      data: sanitized,
      pagination: {
        page: pageNumber,
        pages: Math.ceil(total / limitNumber),
        total
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select('+isActive');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { password, __v, ...rest } = user.toObject();

    res.json({
      success: true,
      data: rest
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user'
    });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role = 'user', department, avatar, permissions } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      department,
      avatar,
      permissions: permissions && Array.isArray(permissions) ? permissions : []
    });

    const { password: _password, __v, ...rest } = user.toObject();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: rest
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user'
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const allowedUpdates = ['name', 'department', 'role', 'permissions', 'avatar', 'isActive'];
    const updates = Object.keys(req.body);

    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({
        success: false,
        message: 'Invalid updates'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('+isActive');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { password, __v, ...rest } = user.toObject();

    res.json({
      success: true,
      message: 'User updated successfully',
      data: rest
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user'
    });
  }
};

export const changeUserPassword = async (req: Request, res: Response) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password is required'
      });
    }

    const user = await User.findById(req.params.id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.password = newPassword;
    await user.save();

  await User.findByIdAndUpdate(req.params.id, { $inc: { tokenVersion: 1 } });

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Change user password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user password'
    });
  }
};

export const deactivateUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (req.user && String(req.user._id) === String(user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account'
      });
    }

    user.isActive = false;
    await user.save();

  await User.findByIdAndUpdate(req.params.id, { $inc: { tokenVersion: 1 } });

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deactivating user'
    });
  }
};

export const reactivateUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = true;
    await user.save();

  await User.findByIdAndUpdate(req.params.id, { $inc: { tokenVersion: 1 } });

    res.json({
      success: true,
      message: 'User reactivated successfully'
    });
  } catch (error) {
    console.error('Reactivate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error reactivating user'
    });
  }
};
