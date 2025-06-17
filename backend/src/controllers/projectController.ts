import { Response, NextFunction } from 'express';
import { Project, ProjectMember, Profile, User } from '../models/index.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { CreateProjectRequest, UpdateProjectRequest, AddProjectMemberRequest } from '../types/index.js';
import { emailService } from '../services/emailService.js';
import jwt from 'jsonwebtoken';
import { config } from '../config/environment.js';

export const getProjects = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'User not authenticated', undefined, 401);
      return;
    }

    let projects;
    
    if (req.user.role === 'admin') {
      // Admins can see all projects
      projects = await Project.find()
        .populate('createdBy', 'email')
        .populate({
          path: 'createdBy',
          populate: {
            path: 'profile',
            select: 'fullName role'
          }
        })
        .populate({
          path: 'members',
          populate: {
            path: 'user',
            populate: {
              path: 'profile',
              select: 'fullName email role'
            }
          }
        })
        .sort({ createdAt: -1 });
    } else {
      // Non-admins can only see projects they're members of or created
      const projectMembers = await ProjectMember.find({ user: req.user.userId });
      const projectIds = projectMembers.map(pm => pm.project);
      
      projects = await Project.find({
        $or: [
          { createdBy: req.user.userId },
          { _id: { $in: projectIds } }
        ]
      })
        .populate('createdBy', 'email')
        .populate({
          path: 'createdBy',
          populate: {
            path: 'profile',
            select: 'fullName role'
          }
        })
        .populate({
          path: 'members',
          populate: {
            path: 'user',
            populate: {
              path: 'profile',
              select: 'fullName email role'
            }
          }
        })
        .sort({ createdAt: -1 });
    }

    successResponse(res, 'Projects retrieved successfully', projects);
  } catch (error) {
    next(error);
  }
};

export const getProject = async (
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
    
    const project = await Project.findById(id)
      .populate('createdBy', 'email')
      .populate({
        path: 'createdBy',
        populate: {
          path: 'profile',
          select: 'fullName role'
        }
      });

    if (!project) {
      errorResponse(res, 'Project not found', undefined, 404);
      return;
    }

    // Check if user has access to this project
    if (req.user.role !== 'admin') {
      const isCreator = (project.createdBy as any)._id?.toString() === req.user.userId || 
                       project.createdBy.toString() === req.user.userId;
      const isMember = await ProjectMember.findOne({
        project: id,
        user: req.user.userId
      });

      if (!isCreator && !isMember) {
        errorResponse(res, 'Access denied', undefined, 403);
        return;
      }
    }

    // Get project members
    const projectMembers = await ProjectMember.find({ project: id })
      .populate({
        path: 'user',
        populate: {
          path: 'profile',
          select: 'fullName email role'
        }
      });

    successResponse(res, 'Project retrieved successfully', {
      ...project.toObject(),
      members: projectMembers
    });
  } catch (error) {
    next(error);
  }
};

export const createProject = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'User not authenticated', undefined, 401);
      return;
    }

    const { title, description, startDate, endDate }: CreateProjectRequest = req.body;

    const project = new Project({
      title,
      description,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      createdBy: req.user.userId
    });

    await project.save();

    // Add creator as project member
    const projectMember = new ProjectMember({
      project: project._id,
      user: req.user.userId,
      roleInProject: 'owner'
    });

    await projectMember.save();

    const populatedProject = await Project.findById(project._id)
      .populate('createdBy', 'email')
      .populate({
        path: 'createdBy',
        populate: {
          path: 'profile',
          select: 'fullName role'
        }
      });

    successResponse(res, 'Project created successfully', populatedProject, 201);
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (
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
    const updates: UpdateProjectRequest = req.body;

    const project = await Project.findById(id);
    if (!project) {
      errorResponse(res, 'Project not found', undefined, 404);
      return;
    }

    // Check permissions
    if (req.user.role !== 'admin' && project.createdBy.toString() !== req.user.userId) {
      // Check if user is a project manager for this project
      if (req.user.role !== 'project_manager') {
        errorResponse(res, 'Access denied', undefined, 403);
        return;
      }

      const isMember = await ProjectMember.findOne({
        project: id,
        user: req.user.userId
      });

      if (!isMember) {
        errorResponse(res, 'Access denied', undefined, 403);
        return;
      }
    }

    // Apply updates
    Object.assign(project, {
      ...updates,
      startDate: updates.startDate ? new Date(updates.startDate) : project.startDate,
      endDate: updates.endDate ? new Date(updates.endDate) : project.endDate
    });

    await project.save();

    const updatedProject = await Project.findById(id)
      .populate('createdBy', 'email')
      .populate({
        path: 'createdBy',
        populate: {
          path: 'profile',
          select: 'fullName role'
        }
      });

    successResponse(res, 'Project updated successfully', updatedProject);
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (
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

    const project = await Project.findById(id);
    if (!project) {
      errorResponse(res, 'Project not found', undefined, 404);
      return;
    }

    // Check permissions - only admin or project creator can delete
    if (req.user.role !== 'admin' && project.createdBy.toString() !== req.user.userId) {
      errorResponse(res, 'Access denied', undefined, 403);
      return;
    }

    await Project.findByIdAndDelete(id);
    await ProjectMember.deleteMany({ project: id });

    successResponse(res, 'Project deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const addProjectMember = async (
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
    const { userId, roleInProject }: AddProjectMemberRequest = req.body;

    const project = await Project.findById(id);
    if (!project) {
      errorResponse(res, 'Project not found', undefined, 404);
      return;
    }

    // Check permissions
    if (req.user.role !== 'admin' && req.user.role !== 'project_manager') {
      errorResponse(res, 'Access denied', undefined, 403);
      return;
    }

    // Check if user exists
    const userProfile = await Profile.findOne({ user: userId });
    if (!userProfile) {
      errorResponse(res, 'User not found', undefined, 404);
      return;
    }

    // Check if user is already a member
    const existingMember = await ProjectMember.findOne({
      project: id,
      user: userId
    });

    if (existingMember) {
      errorResponse(res, 'User is already a member of this project', undefined, 400);
      return;
    }

    const projectMember = new ProjectMember({
      project: id,
      user: userId,
      roleInProject: roleInProject || 'member'
    });

    await projectMember.save();

    const populatedMember = await ProjectMember.findById(projectMember._id)
      .populate({
        path: 'user',
        populate: {
          path: 'profile',
          select: 'fullName email role'
        }
      });

    // Send project invitation email
    const memberUser = populatedMember?.user as any;
    const inviterProfile = await Profile.findOne({ user: req.user.userId });
    
    if (memberUser && inviterProfile) {
      const inviteeName = memberUser.profile?.fullName || memberUser.email?.split('@')[0] || 'Team Member';
      const inviterName = inviterProfile.fullName || req.user.email?.split('@')[0] || 'Project Manager';
      
      // Generate invitation token for future use (optional)
      const invitationToken = jwt.sign(
        { projectId: id, userId, inviterId: req.user.userId },
        config.jwtSecret,
        { expiresIn: '7d' }
      );

      emailService.sendProjectInvitationEmail(
        memberUser.email || memberUser.profile?.email || '',
        inviteeName,
        inviterName,
        project.title,
        project.description || '',
        roleInProject || 'member',
        invitationToken
      ).catch((error: any) => {
        console.error('Failed to send project invitation email:', error);
      });
    }

    successResponse(res, 'Project member added successfully', populatedMember, 201);
  } catch (error) {
    next(error);
  }
};

export const removeProjectMember = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'User not authenticated', undefined, 401);
      return;
    }

    const { id, userId } = req.params;

    const project = await Project.findById(id);
    if (!project) {
      errorResponse(res, 'Project not found', undefined, 404);
      return;
    }

    // Check permissions
    if (req.user.role !== 'admin' && req.user.role !== 'project_manager') {
      errorResponse(res, 'Access denied', undefined, 403);
      return;
    }

    const projectMember = await ProjectMember.findOneAndDelete({
      project: id,
      user: userId
    });

    if (!projectMember) {
      errorResponse(res, 'Project member not found', undefined, 404);
      return;
    }

    successResponse(res, 'Project member removed successfully');
  } catch (error) {
    next(error);
  }
};
