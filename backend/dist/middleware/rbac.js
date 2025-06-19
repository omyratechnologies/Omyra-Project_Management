import { errorResponse } from '../utils/response.js';
import { ProjectMember } from '../models/ProjectMember.js';
import { Task } from '../models/Task.js';
import { Meeting } from '../models/Meeting.js';
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            errorResponse(res, 'Access denied. User not authenticated.', undefined, 401);
            return;
        }
        if (!roles.includes(req.user.role)) {
            errorResponse(res, 'Access denied. Insufficient permissions.', undefined, 403);
            return;
        }
        next();
    };
};
export const isAdmin = authorize('admin');
export const isAdminOrProjectManager = authorize('admin', 'project_manager');
export const isNotClient = authorize('admin', 'project_manager', 'team_member');
export const isTeamMemberOrAbove = authorize('admin', 'project_manager', 'team_member');
export const canManageProject = async (req, res, next) => {
    try {
        if (!req.user) {
            errorResponse(res, 'Access denied. User not authenticated.', undefined, 401);
            return;
        }
        if (req.user.role === 'admin') {
            next();
            return;
        }
        const projectId = req.params.projectId || req.body.projectId;
        if (!projectId) {
            errorResponse(res, 'Project ID is required.', undefined, 400);
            return;
        }
        if (req.user.role === 'project_manager') {
            const projectMember = await ProjectMember.findOne({
                project: projectId,
                user: req.user.id,
                roleInProject: { $in: ['project_manager', 'lead'] }
            });
            if (!projectMember) {
                errorResponse(res, 'Access denied. You are not assigned to this project as a manager.', undefined, 403);
                return;
            }
        }
        else {
            errorResponse(res, 'Access denied. Insufficient permissions.', undefined, 403);
            return;
        }
        next();
    }
    catch (error) {
        errorResponse(res, 'Error checking project permissions.', error instanceof Error ? error.message : 'Unknown error', 500);
    }
};
export const canViewProject = async (req, res, next) => {
    try {
        if (!req.user) {
            errorResponse(res, 'Access denied. User not authenticated.', undefined, 401);
            return;
        }
        if (req.user.role === 'admin') {
            next();
            return;
        }
        const projectId = req.params.projectId || req.body.projectId;
        if (!projectId) {
            errorResponse(res, 'Project ID is required.', undefined, 400);
            return;
        }
        const projectMember = await ProjectMember.findOne({
            project: projectId,
            user: req.user.id
        });
        if (!projectMember) {
            errorResponse(res, 'Access denied. You are not a member of this project.', undefined, 403);
            return;
        }
        next();
    }
    catch (error) {
        errorResponse(res, 'Error checking project access.', error instanceof Error ? error.message : 'Unknown error', 500);
    }
};
export const canAssignTasks = async (req, res, next) => {
    try {
        if (!req.user) {
            errorResponse(res, 'Access denied. User not authenticated.', undefined, 401);
            return;
        }
        if (req.user.role === 'admin') {
            next();
            return;
        }
        if (req.user.role !== 'project_manager') {
            errorResponse(res, 'Access denied. Only project managers can assign tasks.', undefined, 403);
            return;
        }
        const projectId = req.body.projectId;
        if (!projectId) {
            errorResponse(res, 'Project ID is required.', undefined, 400);
            return;
        }
        const projectMember = await ProjectMember.findOne({
            project: projectId,
            user: req.user.id,
            roleInProject: { $in: ['project_manager', 'lead'] }
        });
        if (!projectMember) {
            errorResponse(res, 'Access denied. You are not a project manager for this project.', undefined, 403);
            return;
        }
        next();
    }
    catch (error) {
        errorResponse(res, 'Error checking task assignment permissions.', error instanceof Error ? error.message : 'Unknown error', 500);
    }
};
export const canManageMeetings = async (req, res, next) => {
    try {
        if (!req.user) {
            errorResponse(res, 'Access denied. User not authenticated.', undefined, 401);
            return;
        }
        if (req.user.role === 'admin') {
            next();
            return;
        }
        if (req.user.role !== 'project_manager') {
            errorResponse(res, 'Access denied. Only project managers can manage meetings.', undefined, 403);
            return;
        }
        next();
    }
    catch (error) {
        errorResponse(res, 'Error checking meeting management permissions.', error instanceof Error ? error.message : 'Unknown error', 500);
    }
};
export const canEditMeetingLinks = async (req, res, next) => {
    try {
        if (!req.user) {
            errorResponse(res, 'Access denied. User not authenticated.', undefined, 401);
            return;
        }
        if (req.user.role === 'admin') {
            next();
            return;
        }
        if (req.user.role === 'project_manager') {
            const meetingId = req.params.meetingId;
            if (!meetingId) {
                errorResponse(res, 'Meeting ID is required.', undefined, 400);
                return;
            }
            const meeting = await Meeting.findById(meetingId);
            if (!meeting) {
                errorResponse(res, 'Meeting not found.', undefined, 404);
                return;
            }
            if (meeting.organizer.toString() === req.user.id) {
                next();
                return;
            }
            const projectMember = await ProjectMember.findOne({
                project: meeting.project,
                user: req.user.id,
                roleInProject: { $in: ['project_manager', 'lead'] }
            });
            if (!projectMember) {
                errorResponse(res, 'Access denied. You cannot edit this meeting.', undefined, 403);
                return;
            }
        }
        else {
            errorResponse(res, 'Access denied. Insufficient permissions.', undefined, 403);
            return;
        }
        next();
    }
    catch (error) {
        errorResponse(res, 'Error checking meeting edit permissions.', error instanceof Error ? error.message : 'Unknown error', 500);
    }
};
export const canDeleteMeeting = async (req, res, next) => {
    try {
        if (!req.user) {
            errorResponse(res, 'Access denied. User not authenticated.', undefined, 401);
            return;
        }
        if (req.user.role !== 'admin') {
            errorResponse(res, 'Access denied. Only administrators can delete meetings.', undefined, 403);
            return;
        }
        next();
    }
    catch (error) {
        errorResponse(res, 'Error checking meeting deletion permissions.', error instanceof Error ? error.message : 'Unknown error', 500);
    }
};
export const canChangeProjectStatus = async (req, res, next) => {
    try {
        if (!req.user) {
            errorResponse(res, 'Access denied. User not authenticated.', undefined, 401);
            return;
        }
        if (req.user.role !== 'admin') {
            errorResponse(res, 'Access denied. Only administrators can change project status.', undefined, 403);
            return;
        }
        next();
    }
    catch (error) {
        errorResponse(res, 'Error checking project status change permissions.', error instanceof Error ? error.message : 'Unknown error', 500);
    }
};
export const canCreateTaskIssue = async (req, res, next) => {
    try {
        if (!req.user) {
            errorResponse(res, 'Access denied. User not authenticated.', undefined, 401);
            return;
        }
        if (!['admin', 'project_manager', 'team_member'].includes(req.user.role)) {
            errorResponse(res, 'Access denied. Clients cannot create task issues.', undefined, 403);
            return;
        }
        const taskId = req.params.taskId;
        if (!taskId) {
            errorResponse(res, 'Task ID is required.', undefined, 400);
            return;
        }
        const task = await Task.findById(taskId).populate('project');
        if (!task) {
            errorResponse(res, 'Task not found.', undefined, 404);
            return;
        }
        if (req.user.role === 'admin') {
            next();
            return;
        }
        const projectMember = await ProjectMember.findOne({
            project: task.project,
            user: req.user.id
        });
        if (!projectMember) {
            errorResponse(res, 'Access denied. You are not a member of this project.', undefined, 403);
            return;
        }
        next();
    }
    catch (error) {
        errorResponse(res, 'Error checking task issue creation permissions.', error instanceof Error ? error.message : 'Unknown error', 500);
    }
};
export const canCreateFeedback = async (req, res, next) => {
    try {
        if (!req.user) {
            errorResponse(res, 'Access denied. User not authenticated.', undefined, 401);
            return;
        }
        if (req.user.role !== 'client') {
            errorResponse(res, 'Access denied. Only clients can create feedback.', undefined, 403);
            return;
        }
        const projectId = req.params.projectId;
        if (!projectId) {
            errorResponse(res, 'Project ID is required.', undefined, 400);
            return;
        }
        const projectMember = await ProjectMember.findOne({
            project: projectId,
            user: req.user.id
        });
        if (!projectMember) {
            errorResponse(res, 'Access denied. You are not associated with this project.', undefined, 403);
            return;
        }
        next();
    }
    catch (error) {
        errorResponse(res, 'Error checking feedback creation permissions.', error instanceof Error ? error.message : 'Unknown error', 500);
    }
};
export const canViewTeamMember = async (req, res, next) => {
    try {
        if (!req.user) {
            errorResponse(res, 'Access denied. User not authenticated.', undefined, 401);
            return;
        }
        if (req.user.role === 'admin') {
            next();
            return;
        }
        const targetUserId = req.params.id;
        if (!targetUserId) {
            errorResponse(res, 'User ID is required.', undefined, 400);
            return;
        }
        if (targetUserId === req.user.id) {
            next();
            return;
        }
        const currentUserProjects = await ProjectMember.find({ user: req.user.id }).select('project');
        const targetUserProjects = await ProjectMember.find({ user: targetUserId }).select('project');
        const currentUserProjectIds = currentUserProjects.map(pm => pm.project.toString());
        const targetUserProjectIds = targetUserProjects.map(pm => pm.project.toString());
        const hasCommonProject = currentUserProjectIds.some(projectId => targetUserProjectIds.includes(projectId));
        if (!hasCommonProject) {
            errorResponse(res, 'Access denied. You can only view team members from your projects.', undefined, 403);
            return;
        }
        next();
    }
    catch (error) {
        errorResponse(res, 'Error checking team member access.', error instanceof Error ? error.message : 'Unknown error', 500);
    }
};
export const canViewAllTeamMembers = async (req, res, next) => {
    try {
        if (!req.user) {
            errorResponse(res, 'Access denied. User not authenticated.', undefined, 401);
            return;
        }
        if (req.user.role === 'admin') {
            next();
            return;
        }
        const { projectId } = req.query;
        if (projectId) {
            const projectMember = await ProjectMember.findOne({
                project: projectId,
                user: req.user.id
            });
            if (!projectMember) {
                errorResponse(res, 'Access denied. You are not a member of this project.', undefined, 403);
                return;
            }
        }
        else {
            const userProjects = await ProjectMember.find({ user: req.user.id });
            if (userProjects.length === 0) {
                errorResponse(res, 'Access denied. You are not a member of any projects.', undefined, 403);
                return;
            }
        }
        next();
    }
    catch (error) {
        errorResponse(res, 'Error checking team members access.', error instanceof Error ? error.message : 'Unknown error', 500);
    }
};
export const canUpdateTeamMember = async (req, res, next) => {
    try {
        if (!req.user) {
            errorResponse(res, 'Access denied. User not authenticated.', undefined, 401);
            return;
        }
        const targetUserId = req.params.id;
        if (!targetUserId) {
            errorResponse(res, 'User ID is required.', undefined, 400);
            return;
        }
        if (req.user.role === 'admin') {
            next();
            return;
        }
        if (targetUserId !== req.user.id) {
            errorResponse(res, 'Access denied. You can only update your own profile.', undefined, 403);
            return;
        }
        if (req.body.role) {
            errorResponse(res, 'Access denied. Only administrators can update user roles.', undefined, 403);
            return;
        }
        next();
    }
    catch (error) {
        errorResponse(res, 'Error checking team member update permissions.', error instanceof Error ? error.message : 'Unknown error', 500);
    }
};
