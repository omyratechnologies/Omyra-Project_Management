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
        .populate({
          path: 'createdBy',
          select: 'email createdAt updatedAt profile',
          populate: {
            path: 'profile',
            select: 'fullName role'
          }
        })
        .populate({
          path: 'members',
          populate: {
            path: 'user',
            select: 'email createdAt updatedAt profile',
            populate: {
              path: 'profile',
              select: 'fullName email role'
            }
          }
        })
        .sort({ createdAt: -1 });
    } else {
      // Non-admins can only see projects they're members of or created
      const projectMembers = await ProjectMember.find({ user: req.user.id });
      const projectIds = projectMembers.map(pm => pm.project);
      
      projects = await Project.find({
        $or: [
          { createdBy: req.user.id },
          { _id: { $in: projectIds } }
        ]
      })
        .populate({
          path: 'createdBy',
          select: 'email createdAt updatedAt profile',
          populate: {
            path: 'profile',
            select: 'fullName role'
          }
        })
        .populate({
          path: 'members',
          populate: {
            path: 'user',
            select: 'email createdAt updatedAt profile',
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
      .populate({
        path: 'createdBy',
        select: 'email createdAt updatedAt profile',
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
      // Check if user is the creator (handle both populated and non-populated createdBy)
      let isCreator = false;
      if (project.createdBy) {
        const createdById = typeof project.createdBy === 'object' && project.createdBy._id 
          ? project.createdBy._id.toString()
          : project.createdBy.toString();
        isCreator = createdById === req.user.id;
      }
      
      const isMember = await ProjectMember.findOne({
        project: id,
        user: req.user.id
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
        select: 'email createdAt updatedAt profile',
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

    const { title, description, status, startDate, endDate }: CreateProjectRequest = req.body;

    const project = new Project({
      title,
      description,
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      createdBy: req.user.id
    });

    await project.save();

    // Add creator as project member
    const projectMember = new ProjectMember({
      project: project.id,
      user: req.user.id,
      roleInProject: 'owner'
    });

    await projectMember.save();

    const populatedProject = await Project.findById(project.id)
      .populate({
        path: 'createdBy',
        select: 'email createdAt updatedAt profile',
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
    if (req.user.role !== 'admin' && project.createdBy.toString() !== req.user.id) {
      // Check if user is a project manager for this project
      if (req.user.role !== 'project_manager') {
        errorResponse(res, 'Access denied', undefined, 403);
        return;
      }

      const isMember = await ProjectMember.findOne({
        project: id,
        user: req.user.id
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
    if (req.user.role !== 'admin' && project.createdBy.toString() !== req.user.id) {
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

    console.log('Add project member request:', { projectId: id, userId, roleInProject });

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

    // Check if user exists - try both user ID and profile ID
    let userProfile = await Profile.findOne({ user: userId });
    let actualUserId = userId;
    
    console.log('Looking for user profile with userId:', userId);
    
    // If not found by user ID, try to find by profile ID
    if (!userProfile) {
      userProfile = await Profile.findById(userId);
      console.log('Profile found by ID:', userProfile ? 'Yes' : 'No');
      
      // If found by profile ID, get the actual user ID for consistency
      if (userProfile) {
        actualUserId = userProfile.user.toString();
        console.log('Using actual user ID:', actualUserId);
      } else {
        console.log('User not found by either user ID or profile ID');
        errorResponse(res, 'User not found', undefined, 404);
        return;
      }
    } else {
      console.log('Profile found by user ID');
    }

    // Check if user is already a member (using actual user ID)
    const existingMember = await ProjectMember.findOne({
      project: id,
      user: actualUserId
    });

    if (existingMember) {
      errorResponse(res, 'User is already a member of this project', undefined, 400);
      return;
    }

    const projectMember = new ProjectMember({
      project: id,
      user: actualUserId,
      roleInProject: roleInProject || 'member'
    });

    await projectMember.save();

    const populatedMember = await ProjectMember.findById(projectMember.id)
      .populate({
        path: 'user',
        populate: {
          path: 'profile',
          select: 'fullName email role'
        }
      });

    // Send project invitation email
    const memberUser = populatedMember?.user as any;
    const inviterProfile = await Profile.findOne({ user: req.user.id });
    
    if (memberUser && inviterProfile) {
      const inviteeName = memberUser.profile?.fullName || memberUser.email?.split('@')[0] || 'Team Member';
      const inviterName = inviterProfile.fullName || req.user.email?.split('@')[0] || 'Project Manager';
      
      // Generate invitation token for future use (optional)
      const invitationToken = jwt.sign(
        { projectId: id, userId, inviterId: req.user.id },
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

    // Handle both user ID and profile ID - find the actual user ID
    let actualUserId = userId;
    
    // First check if it's a user ID by looking for a profile with this user
    const userProfile = await Profile.findOne({ user: userId });
    
    // If not found by user ID, check if it's a profile ID
    if (!userProfile) {
      const profileById = await Profile.findById(userId);
      if (profileById) {
        actualUserId = profileById.user.toString();
      }
    }

    const projectMember = await ProjectMember.findOneAndDelete({
      project: id,
      user: actualUserId
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

export const updateProjectStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'User not authenticated', undefined, 401);
      return;
    }

    // Only admin can change project status
    if (req.user.role !== 'admin') {
      errorResponse(res, 'Access denied. Only administrators can change project status.', undefined, 403);
      return;
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      errorResponse(res, 'Status is required', undefined, 400);
      return;
    }

    const project = await Project.findById(id);
    if (!project) {
      errorResponse(res, 'Project not found', undefined, 404);
      return;
    }

    const oldStatus = project.status;
    project.status = status;
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

    // Notify project members about status change
    const projectMembers = await ProjectMember.find({ project: id })
      .populate('user', 'email');

    const memberEmails = projectMembers.map(member => (member.user as any).email);

    if (memberEmails.length > 0) {
      try {
        await emailService.sendEmail({
          from: config.emailFrom,
          to: memberEmails,
          subject: `Project Status Updated: ${project.title}`,
          text: `The status of project "${project.title}" has been changed from "${oldStatus}" to "${status}".`,
          html: `
            <h2>Project Status Update</h2>
            <p>The status of project "<strong>${project.title}</strong>" has been changed:</p>
            <ul>
              <li>Previous Status: <strong>${oldStatus}</strong></li>
              <li>New Status: <strong>${status}</strong></li>
            </ul>
            <p>Updated by: ${req.user.email}</p>
          `
        });
      } catch (emailError) {
        console.error('Failed to send project status update notification:', emailError);
      }
    }

    successResponse(res, 'Project status updated successfully', updatedProject);
  } catch (error) {
    next(error);
  }
};
