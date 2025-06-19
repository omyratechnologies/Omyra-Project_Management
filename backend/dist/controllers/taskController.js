import { Task, Project, ProjectMember, User } from '../models/index.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { emailService } from '../services/emailService.js';
import { notificationService } from '../services/notificationService.js';
export const getTasks = async (req, res, next) => {
    try {
        if (!req.user) {
            errorResponse(res, 'User not authenticated', undefined, 401);
            return;
        }
        const { projectId } = req.query;
        let tasks;
        if (req.user.role === 'admin') {
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
        }
        else {
            const projectMembers = await ProjectMember.find({ user: req.user.id });
            const projectIds = projectMembers.map(pm => pm.project);
            const query = { project: { $in: projectIds } };
            if (projectId) {
                query.project = projectId;
            }
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
    }
    catch (error) {
        next(error);
    }
};
export const getTask = async (req, res, next) => {
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
        if (req.user.role !== 'admin') {
            const isMember = await ProjectMember.findOne({
                project: task.project,
                user: req.user.id
            });
            if (!isMember) {
                errorResponse(res, 'Access denied', undefined, 403);
                return;
            }
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
    }
    catch (error) {
        next(error);
    }
};
export const createTask = async (req, res, next) => {
    try {
        if (!req.user) {
            errorResponse(res, 'User not authenticated', undefined, 401);
            return;
        }
        const { title, description, priority, assignedTo, dueDate, projectId } = req.body;
        const project = await Project.findById(projectId);
        if (!project) {
            errorResponse(res, 'Project not found', undefined, 404);
            return;
        }
        if (req.user.role !== 'admin' && req.user.role !== 'project_manager') {
            errorResponse(res, 'Access denied. Only admins and project managers can create tasks', undefined, 403);
            return;
        }
        if (req.user.role !== 'admin') {
            const isMember = await ProjectMember.findOne({
                project: projectId,
                user: req.user.id
            });
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
        if (assignedTo && populatedTask?.assignedTo) {
            const assignee = populatedTask.assignedTo;
            const creator = populatedTask.createdBy;
            const projectData = populatedTask.project;
            const assigneeName = assignee.profile?.fullName || assignee.email.split('@')[0];
            const assignerName = creator.profile?.fullName || creator.email.split('@')[0];
            const projectName = projectData.title;
            const dueDateTime = dueDate ? new Date(dueDate).toLocaleDateString() : 'No due date set';
            emailService.sendTaskAssignmentEmail(assignee.email, assigneeName, assignerName, projectName, title, description || '', dueDateTime, priority || 'medium', task.id.toString()).catch((error) => {
                console.error('Failed to send task assignment email:', error);
            });
            await notificationService.sendNotification({
                userId: assignedTo,
                type: 'task_assigned',
                title: 'New Task Assigned',
                message: `You have been assigned a new task: "${title}" in project "${projectName}"`,
                priority: priority === 'urgent' ? 'urgent' : priority === 'high' ? 'high' : 'medium',
                actionable: true,
                action: 'View Task',
                link: `/tasks/${task.id}`,
                metadata: {
                    projectId: projectId,
                    taskId: task.id.toString(),
                    assignedBy: req.user.id
                }
            }).catch((error) => {
                console.error('Failed to send task assignment notification:', error);
            });
        }
        successResponse(res, 'Task created successfully', populatedTask, 201);
    }
    catch (error) {
        next(error);
    }
};
export const updateTask = async (req, res, next) => {
    try {
        if (!req.user) {
            errorResponse(res, 'User not authenticated', undefined, 401);
            return;
        }
        const { id } = req.params;
        const updates = req.body;
        const task = await Task.findById(id);
        if (!task) {
            errorResponse(res, 'Task not found', undefined, 404);
            return;
        }
        let canUpdate = false;
        if (req.user.role === 'admin') {
            canUpdate = true;
        }
        else if (req.user.role === 'project_manager') {
            const isMember = await ProjectMember.findOne({
                project: task.project,
                user: req.user.id
            });
            canUpdate = !!isMember;
        }
        else if (req.user.role === 'team_member') {
            const assignedToId = task.assignedTo
                ? (typeof task.assignedTo === 'object' && task.assignedTo._id
                    ? task.assignedTo._id.toString()
                    : task.assignedTo.toString())
                : null;
            canUpdate = assignedToId === req.user.id;
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
        const originalAssignedTo = task.assignedTo;
        const newAssignedTo = updates.assignedTo;
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
        if (newAssignedTo && (!originalAssignedTo || originalAssignedTo.toString() !== newAssignedTo.toString()) && updatedTask?.assignedTo) {
            const assignee = updatedTask.assignedTo;
            const creator = updatedTask.createdBy;
            const projectData = updatedTask.project;
            const assigneeName = assignee.profile?.fullName || assignee.email.split('@')[0];
            const assignerName = creator.profile?.fullName || creator.email.split('@')[0];
            const projectName = projectData.title;
            const dueDateTime = updatedTask.dueDate ? new Date(updatedTask.dueDate).toLocaleDateString() : 'No due date set';
            emailService.sendTaskAssignmentEmail(assignee.email, assigneeName, assignerName, projectName, updatedTask.title, updatedTask.description || '', dueDateTime, updatedTask.priority || 'medium', updatedTask.id.toString()).catch((error) => {
                console.error('Failed to send task assignment email:', error);
            });
            await notificationService.sendNotification({
                userId: newAssignedTo,
                type: 'task_assigned',
                title: 'Task Reassigned',
                message: `You have been assigned to task: "${updatedTask.title}" in project "${projectName}"`,
                priority: updatedTask.priority === 'urgent' ? 'urgent' : updatedTask.priority === 'high' ? 'high' : 'medium',
                actionable: true,
                action: 'View Task',
                link: `/tasks/${updatedTask.id}`,
                metadata: {
                    projectId: updatedTask.project.toString(),
                    taskId: updatedTask.id.toString(),
                    assignedBy: req.user.id
                }
            }).catch((error) => {
                console.error('Failed to send task reassignment notification:', error);
            });
        }
        if (updates.status === 'done' && task.status !== 'done' && task.assignedTo) {
            const projectData = updatedTask?.project;
            await notificationService.sendNotification({
                userId: task.createdBy.toString(),
                type: 'task_completed',
                title: 'Task Completed',
                message: `Task "${updatedTask?.title}" has been completed in project "${projectData?.title}"`,
                priority: 'medium',
                actionable: true,
                action: 'View Task',
                link: `/tasks/${updatedTask?.id}`,
                metadata: {
                    projectId: updatedTask?.project.toString(),
                    taskId: updatedTask?.id.toString(),
                    completedBy: task.assignedTo.toString()
                }
            }).catch((error) => {
                console.error('Failed to send task completion notification:', error);
            });
        }
        successResponse(res, 'Task updated successfully', updatedTask);
    }
    catch (error) {
        next(error);
    }
};
export const deleteTask = async (req, res, next) => {
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
        if (req.user.role !== 'admin' && req.user.role !== 'project_manager') {
            errorResponse(res, 'Access denied', undefined, 403);
            return;
        }
        if (req.user.role === 'project_manager') {
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
    }
    catch (error) {
        next(error);
    }
};
export const assignTask = async (req, res, next) => {
    try {
        if (!req.user) {
            errorResponse(res, 'User not authenticated', undefined, 401);
            return;
        }
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
        if (assignedTo) {
            const isAssignedUserMember = await ProjectMember.findOne({
                project: task.project,
                user: assignedTo
            });
            if (!isAssignedUserMember) {
                errorResponse(res, 'Assigned user is not a member of this project', undefined, 400);
                return;
            }
            const assigneeUser = await User.findById(assignedTo).populate('profile');
            if (!assigneeUser || !assigneeUser.profile) {
                errorResponse(res, 'Assigned user not found', undefined, 404);
                return;
            }
            const assigneeProfile = assigneeUser.profile;
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
        if (assignedTo && assignedTo !== oldAssignee?.toString()) {
            const assignee = updatedTask?.assignedTo;
            const projectData = updatedTask?.project;
            if (assignee && assignee.email) {
                const assigneeName = assignee.profile?.fullName || assignee.email.split('@')[0];
                const assignerName = req.user.email;
                const projectName = projectData.title;
                const dueDateTime = task.dueDate ? task.dueDate.toLocaleDateString() : 'No due date set';
                try {
                    await emailService.sendTaskAssignmentEmail(assignee.email, assigneeName, assignerName, projectName, task.title, task.description || '', dueDateTime, task.priority, task.id.toString());
                }
                catch (emailError) {
                    console.error('Failed to send task assignment email:', emailError);
                }
            }
        }
        successResponse(res, 'Task assigned successfully', updatedTask);
    }
    catch (error) {
        next(error);
    }
};
