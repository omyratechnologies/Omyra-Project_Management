import { Response, NextFunction } from 'express';
import { Task, Project, ProjectMember, User } from '../models/index.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { CreateTaskRequest, UpdateTaskRequest } from '../types/index.js';
import { emailService } from '../services/emailService.js';

export const getTasks = async (
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
    let tasks;

    if (req.user.role === 'admin') {
      // Admins can see all tasks
      const query = projectId ? { project: projectId } : {};
      tasks = await Task.find(query)
        .populate('project', 'title')
        .populate({
          path: 'assignedTo',
          select: 'email createdAt updatedAt profile',
          populate: {
            path: 'profile',
            select: 'fullName role'
          }
        })
        .populate({
          path: 'createdBy',
          select: 'email createdAt updatedAt profile',
          populate: {
            path: 'profile',
            select: 'fullName role'
          }
        })
        .sort({ createdAt: -1 });
    } else {
      // Non-admins can only see tasks from projects they're members of
      const projectMembers = await ProjectMember.find({ user: req.user.id });
      const projectIds = projectMembers.map(pm => pm.project);

      const query: any = { project: { $in: projectIds } };
      if (projectId) {
        query.project = projectId;
      }

      // Team members can only see tasks assigned to them
      if (req.user.role === 'team_member') {
        query.assignedTo = req.user.id;
      }

      tasks = await Task.find(query)
        .populate('project', 'title')
        .populate({
          path: 'assignedTo',
          select: 'email createdAt updatedAt profile',
          populate: {
            path: 'profile',
            select: 'fullName role'
          }
        })
        .populate({
          path: 'createdBy',
          select: 'email createdAt updatedAt profile',
          populate: {
            path: 'profile',
            select: 'fullName role'
          }
        })
        .sort({ createdAt: -1 });
    }

    successResponse(res, 'Tasks retrieved successfully', tasks);
  } catch (error) {
    next(error);
  }
};

export const getTask = async (
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

    const task = await Task.findById(id)
      .populate('project', 'title')
      .populate('assignedTo', 'email')
      .populate({
        path: 'assignedTo',
        populate: {
          path: 'profile',
          select: 'fullName role'
        }
      })
      .populate('createdBy', 'email')
      .populate({
        path: 'createdBy',
        populate: {
          path: 'profile',
          select: 'fullName role'
        }
      });

    if (!task) {
      errorResponse(res, 'Task not found', undefined, 404);
      return;
    }

    // Check if user has access to this task
    if (req.user.role !== 'admin') {
      const isMember = await ProjectMember.findOne({
        project: task.project,
        user: req.user.id
      });

      if (!isMember) {
        errorResponse(res, 'Access denied', undefined, 403);
        return;
      }

      // Team members can only see tasks assigned to them
      if (req.user.role === 'team_member') {
        const assignedToId = task.assignedTo 
          ? (typeof task.assignedTo === 'object' && task.assignedTo._id 
              ? task.assignedTo._id.toString() 
              : task.assignedTo.toString())
          : null;
        
        if (assignedToId !== req.user.id) {
          errorResponse(res, 'Access denied', undefined, 403);
          return;
        }
      }
    }

    successResponse(res, 'Task retrieved successfully', task);
  } catch (error) {
    next(error);
  }
};

export const createTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'User not authenticated', undefined, 401);
      return;
    }

    const { title, description, priority, assignedTo, dueDate, projectId }: CreateTaskRequest = req.body;

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      errorResponse(res, 'Project not found', undefined, 404);
      return;
    }

    // Check if user has access to create tasks in this project
    if (req.user.role !== 'admin' && req.user.role !== 'project_manager') {
      errorResponse(res, 'Access denied. Only admins and project managers can create tasks', undefined, 403);
      return;
    }

    // Check if user is a member of the project
    if (req.user.role !== 'admin') {
      const isMember = await ProjectMember.findOne({
        project: projectId,
        user: req.user.id
      });

      // Check if user is the project creator (handle both populated and non-populated createdBy)
      let isCreator = false;
      if (project.createdBy) {
        const createdById = typeof project.createdBy === 'object' && project.createdBy._id 
          ? project.createdBy._id.toString()
          : project.createdBy.toString();
        isCreator = createdById === req.user.id;
      }

      if (!isMember && !isCreator) {
        errorResponse(res, 'Access denied', undefined, 403);
        return;
      }
    }

    // If assignedTo is provided, check if that user is a member of the project
    if (assignedTo) {
      const isAssignedUserMember = await ProjectMember.findOne({
        project: projectId,
        user: assignedTo
      });

      if (!isAssignedUserMember) {
        errorResponse(res, 'Assigned user is not a member of this project', undefined, 400);
        return;
      }
    }

    const task = new Task({
      title,
      description,
      priority: priority || 'medium',
      project: projectId,
      assignedTo: assignedTo || null,
      createdBy: req.user.id,
      dueDate: dueDate ? new Date(dueDate) : undefined
    });

    await task.save();

    const populatedTask = await Task.findById(task.id)
      .populate('project', 'title')
      .populate({
        path: 'assignedTo',
        select: 'email createdAt updatedAt profile',
        populate: {
          path: 'profile',
          select: 'fullName role'
        }
      })
      .populate({
        path: 'createdBy',
        select: 'email createdAt updatedAt profile',
        populate: {
          path: 'profile',
          select: 'fullName role'
        }
      });

    // Send task assignment email if task is assigned to someone
    if (assignedTo && populatedTask?.assignedTo) {
      const assignee = populatedTask.assignedTo as any;
      const creator = populatedTask.createdBy as any;
      const projectData = populatedTask.project as any;
      
      const assigneeName = assignee.profile?.fullName || assignee.email.split('@')[0];
      const assignerName = creator.profile?.fullName || creator.email.split('@')[0];
      const projectName = projectData.title;
      const dueDateTime = dueDate ? new Date(dueDate).toLocaleDateString() : 'No due date set';

      emailService.sendTaskAssignmentEmail(
        assignee.email,
        assigneeName,
        assignerName,
        projectName,
        title,
        description || '',
        dueDateTime,
        priority || 'medium',
        task.id.toString()
      ).catch((error: any) => {
        console.error('Failed to send task assignment email:', error);
      });
    }

    successResponse(res, 'Task created successfully', populatedTask, 201);
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (
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
    const updates: UpdateTaskRequest = req.body;

    const task = await Task.findById(id);
    if (!task) {
      errorResponse(res, 'Task not found', undefined, 404);
      return;
    }

    // Check permissions
    let canUpdate = false;

    if (req.user.role === 'admin') {
      canUpdate = true;
    } else if (req.user.role === 'project_manager') {
      // Project managers can update tasks in their projects
      const isMember = await ProjectMember.findOne({
        project: task.project,
        user: req.user.id
      });
      canUpdate = !!isMember;
    } else if (req.user.role === 'team_member') {
      // Team members can only update tasks assigned to them (status updates)
      const assignedToId = task.assignedTo 
        ? (typeof task.assignedTo === 'object' && task.assignedTo._id 
            ? task.assignedTo._id.toString() 
            : task.assignedTo.toString())
        : null;
      canUpdate = assignedToId === req.user.id;
      
      // Team members can only update status, not other fields
      const allowedUpdates = ['status'];
      const providedUpdates = Object.keys(updates);
      const hasInvalidUpdates = providedUpdates.some(update => !allowedUpdates.includes(update));
      
      if (hasInvalidUpdates) {
        errorResponse(res, 'Team members can only update task status', undefined, 403);
        return;
      }
    }

    if (!canUpdate) {
      errorResponse(res, 'Access denied', undefined, 403);
      return;
    }

    // If assignedTo is being updated, check if the user is a member of the project
    if (updates.assignedTo) {
      const isAssignedUserMember = await ProjectMember.findOne({
        project: task.project,
        user: updates.assignedTo
      });

      if (!isAssignedUserMember) {
        errorResponse(res, 'Assigned user is not a member of this project', undefined, 400);
        return;
      }
    }

    // Check if task assignment changed
    const originalAssignedTo = task.assignedTo;
    const newAssignedTo = updates.assignedTo;
    
    // Apply updates
    Object.assign(task, {
      ...updates,
      dueDate: updates.dueDate ? new Date(updates.dueDate) : task.dueDate
    });

    await task.save();

    const updatedTask = await Task.findById(id)
      .populate('project', 'title')
      .populate('assignedTo', 'email')
      .populate({
        path: 'assignedTo',
        populate: {
          path: 'profile',
          select: 'fullName role'
        }
      })
      .populate('createdBy', 'email')
      .populate({
        path: 'createdBy',
        populate: {
          path: 'profile',
          select: 'fullName role'
        }
      });

    // Send task assignment email if task was reassigned to a different user
    if (newAssignedTo && (!originalAssignedTo || originalAssignedTo.toString() !== newAssignedTo.toString()) && updatedTask?.assignedTo) {
      const assignee = updatedTask.assignedTo as any;
      const creator = updatedTask.createdBy as any;
      const projectData = updatedTask.project as any;
      
      const assigneeName = assignee.profile?.fullName || assignee.email.split('@')[0];
      const assignerName = creator.profile?.fullName || creator.email.split('@')[0];
      const projectName = projectData.title;
      const dueDateTime = updatedTask.dueDate ? new Date(updatedTask.dueDate).toLocaleDateString() : 'No due date set';

      emailService.sendTaskAssignmentEmail(
        assignee.email,
        assigneeName,
        assignerName,
        projectName,
        updatedTask.title,
        updatedTask.description || '',
        dueDateTime,
        updatedTask.priority || 'medium',
        updatedTask.id.toString()
      ).catch((error: any) => {
        console.error('Failed to send task assignment email:', error);
      });
    }

    successResponse(res, 'Task updated successfully', updatedTask);
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (
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

    const task = await Task.findById(id);
    if (!task) {
      errorResponse(res, 'Task not found', undefined, 404);
      return;
    }

    // Check permissions - only admins and project managers can delete tasks
    if (req.user.role !== 'admin' && req.user.role !== 'project_manager') {
      errorResponse(res, 'Access denied', undefined, 403);
      return;
    }

    if (req.user.role === 'project_manager') {
      // Project managers can only delete tasks from their projects
      const isMember = await ProjectMember.findOne({
        project: task.project,
        user: req.user.id
      });

      if (!isMember) {
        errorResponse(res, 'Access denied', undefined, 403);
        return;
      }
    }

    await Task.findByIdAndDelete(id);

    successResponse(res, 'Task deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const assignTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'User not authenticated', undefined, 401);
      return;
    }

    // Only admins and project managers can assign tasks
    if (req.user.role !== 'admin' && req.user.role !== 'project_manager') {
      errorResponse(res, 'Access denied. Only admins and project managers can assign tasks.', undefined, 403);
      return;
    }

    const { id } = req.params;
    const { assignedTo } = req.body;

    const task = await Task.findById(id).populate('project');
    if (!task) {
      errorResponse(res, 'Task not found', undefined, 404);
      return;
    }

    // Check if user is authorized to assign tasks in this project
    if (req.user.role === 'project_manager') {
      const isMember = await ProjectMember.findOne({
        project: task.project,
        user: req.user.id,
        roleInProject: { $in: ['project_manager', 'lead'] }
      });

      if (!isMember) {
        errorResponse(res, 'Access denied. You are not a project manager for this project.', undefined, 403);
        return;
      }
    }

    // Check if assignee is a member of the project
    if (assignedTo) {
      const isAssignedUserMember = await ProjectMember.findOne({
        project: task.project,
        user: assignedTo
      });

      if (!isAssignedUserMember) {
        errorResponse(res, 'Assigned user is not a member of this project', undefined, 400);
        return;
      }

      // Check if assignee is a team member or dev (not client)
      const assigneeUser = await User.findById(assignedTo).populate('profile');
      if (!assigneeUser || !assigneeUser.profile) {
        errorResponse(res, 'Assigned user not found', undefined, 404);
        return;
      }

      const assigneeProfile = assigneeUser.profile as any;
      if (assigneeProfile.role === 'client') {
        errorResponse(res, 'Cannot assign tasks to clients', undefined, 400);
        return;
      }
    }

    const oldAssignee = task.assignedTo;
    task.assignedTo = assignedTo || undefined;
    await task.save();

    const updatedTask = await Task.findById(id)
      .populate('project', 'title')
      .populate('assignedTo', 'email')
      .populate({
        path: 'assignedTo',
        populate: {
          path: 'profile',
          select: 'fullName role'
        }
      })
      .populate('createdBy', 'email')
      .populate({
        path: 'createdBy',
        populate: {
          path: 'profile',
          select: 'fullName role'
        }
      });

    // Send notification email if assigned to someone new
    if (assignedTo && assignedTo !== oldAssignee?.toString()) {
      const assignee = updatedTask?.assignedTo as any;
      const projectData = updatedTask?.project as any;
      
      if (assignee && assignee.email) {
        const assigneeName = assignee.profile?.fullName || assignee.email.split('@')[0];
        const assignerName = req.user.email;
        const projectName = projectData.title;
        const dueDateTime = task.dueDate ? task.dueDate.toLocaleDateString() : 'No due date set';

        try {
          await emailService.sendTaskAssignmentEmail(
            assignee.email,
            assigneeName,
            assignerName,
            projectName,
            task.title,
            task.description || '',
            dueDateTime,
            task.priority,
            task.id.toString()
          );
        } catch (emailError) {
          console.error('Failed to send task assignment email:', emailError);
        }
      }
    }

    successResponse(res, 'Task assigned successfully', updatedTask);
  } catch (error) {
    next(error);
  }
};
