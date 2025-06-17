import { Response, NextFunction } from 'express';
import { Profile, ProjectMember, User } from '../models/index.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getTeamMembers = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'User not authenticated', undefined, 401);
      return;
    }

    const { projectId } = req.query;
    let profiles;

    if (projectId) {
      // Get team members for a specific project
      const projectMembers = await ProjectMember.find({ project: projectId })
        .populate({
          path: 'user',
          populate: {
            path: 'profile',
            select: 'fullName email role avatar'
          }
        });

      profiles = projectMembers.map(pm => ({
        ...(pm.user as any).profile.toObject(),
        roleInProject: pm.roleInProject,
        joinedAt: pm.joinedAt
      }));
    } else {
      // Get all team members (admin and project managers only)
      if (req.user.role !== 'admin' && req.user.role !== 'project_manager') {
        errorResponse(res, 'Access denied', undefined, 403);
        return;
      }

      profiles = await Profile.find()
        .populate('user', 'email')
        .select('fullName email role avatar createdAt')
        .sort({ createdAt: -1 });
    }

    successResponse(res, 'Team members retrieved successfully', profiles);
  } catch (error) {
    next(error);
  }
};

export const getTeamMember = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'User not authenticated', undefined, 401);
      return;
    }

    const { id } = req.params;

    const profile = await Profile.findById(id)
      .populate('user', 'email createdAt');

    if (!profile) {
      errorResponse(res, 'Team member not found', undefined, 404);
      return;
    }

    // Check permissions - users can view their own profile, admins and PMs can view all
    if (req.user.role !== 'admin' && 
        req.user.role !== 'project_manager' && 
        (profile.user as any)._id?.toString() !== req.user.userId) {
      errorResponse(res, 'Access denied', undefined, 403);
      return;
    }

    successResponse(res, 'Team member retrieved successfully', profile);
  } catch (error) {
    next(error);
  }
};

export const updateTeamMember = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'User not authenticated', undefined, 401);
      return;
    }

    const { id } = req.params;
    const { fullName, role, avatar } = req.body;

    const profile = await Profile.findById(id);
    if (!profile) {
      errorResponse(res, 'Team member not found', undefined, 404);
      return;
    }

    // Check permissions
    const isOwnProfile = profile.user.toString() === req.user.userId;
    const canUpdateRole = req.user.role === 'admin';
    const canUpdateProfile = isOwnProfile || req.user.role === 'admin';

    if (!canUpdateProfile) {
      errorResponse(res, 'Access denied', undefined, 403);
      return;
    }

    // Only admins can update roles
    if (role && !canUpdateRole) {
      errorResponse(res, 'Only admins can update user roles', undefined, 403);
      return;
    }

    // Update allowed fields
    if (fullName) profile.fullName = fullName;
    if (avatar !== undefined) profile.avatar = avatar;
    if (role && canUpdateRole) profile.role = role;

    await profile.save();

    const updatedProfile = await Profile.findById(id)
      .populate('user', 'email createdAt');

    successResponse(res, 'Team member updated successfully', updatedProfile);
  } catch (error) {
    next(error);
  }
};

export const deleteTeamMember = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'User not authenticated', undefined, 401);
      return;
    }

    // Only admins can delete team members
    if (req.user.role !== 'admin') {
      errorResponse(res, 'Access denied. Only admins can delete team members', undefined, 403);
      return;
    }

    const { id } = req.params;

    const profile = await Profile.findById(id);
    if (!profile) {
      errorResponse(res, 'Team member not found', undefined, 404);
      return;
    }

    // Prevent deleting own account
    if (profile.user.toString() === req.user.userId) {
      errorResponse(res, 'Cannot delete your own account', undefined, 400);
      return;
    }

    // Remove from all project memberships
    await ProjectMember.deleteMany({ user: profile.user });

    // Delete profile and user
    await Profile.findByIdAndDelete(id);
    await User.findByIdAndDelete(profile.user);

    successResponse(res, 'Team member deleted successfully');
  } catch (error) {
    next(error);
  }
};
