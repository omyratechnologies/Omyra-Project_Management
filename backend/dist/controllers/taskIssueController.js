import { successResponse, errorResponse } from '../utils/response.js';
import { TaskIssue } from '../models/TaskIssue.js';
import { Task } from '../models/Task.js';
export const createTaskIssue = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { title, description, type, priority } = req.body;
        const task = await Task.findById(taskId);
        if (!task) {
            errorResponse(res, 'Task not found.', undefined, 404);
            return;
        }
        const taskIssue = new TaskIssue({
            task: taskId,
            reportedBy: req.user.id,
            title,
            description,
            type,
            priority
        });
        await taskIssue.save();
        await taskIssue.populate(['reportedBy', 'task']);
        successResponse(res, 'Task issue created successfully.', taskIssue, 201);
    }
    catch (error) {
        console.error('Error creating task issue:', error);
        errorResponse(res, 'Failed to create task issue.', error instanceof Error ? error.message : 'Unknown error', 500);
    }
};
export const getTaskIssues = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { status, priority, type } = req.query;
        const filter = { task: taskId };
        if (status)
            filter.status = status;
        if (priority)
            filter.priority = priority;
        if (type)
            filter.type = type;
        const taskIssues = await TaskIssue.find(filter)
            .populate('reportedBy', 'email profile')
            .populate('assignedTo', 'email profile')
            .populate('resolvedBy', 'email profile')
            .sort({ createdAt: -1 });
        successResponse(res, 'Task issues retrieved successfully.', taskIssues);
    }
    catch (error) {
        console.error('Error retrieving task issues:', error);
        errorResponse(res, 'Failed to retrieve task issues.', error instanceof Error ? error.message : 'Unknown error', 500);
    }
};
export const updateTaskIssue = async (req, res) => {
    try {
        const { issueId } = req.params;
        const updateData = req.body;
        const taskIssue = await TaskIssue.findById(issueId);
        if (!taskIssue) {
            errorResponse(res, 'Task issue not found.', undefined, 404);
            return;
        }
        const finalUpdateData = { ...updateData };
        if (updateData.status === 'resolved' && updateData.resolution) {
            finalUpdateData.resolvedBy = req.user.id;
            finalUpdateData.resolvedAt = new Date();
        }
        const updatedTaskIssue = await TaskIssue.findByIdAndUpdate(issueId, finalUpdateData, { new: true, runValidators: true }).populate(['reportedBy', 'assignedTo', 'resolvedBy', 'task']);
        successResponse(res, 'Task issue updated successfully.', updatedTaskIssue);
    }
    catch (error) {
        console.error('Error updating task issue:', error);
        errorResponse(res, 'Failed to update task issue.', error instanceof Error ? error.message : 'Unknown error', 500);
    }
};
export const getTaskIssue = async (req, res) => {
    try {
        const { issueId } = req.params;
        const taskIssue = await TaskIssue.findById(issueId)
            .populate('reportedBy', 'email profile')
            .populate('assignedTo', 'email profile')
            .populate('resolvedBy', 'email profile')
            .populate('task', 'title description status priority');
        if (!taskIssue) {
            errorResponse(res, 'Task issue not found.', undefined, 404);
            return;
        }
        successResponse(res, 'Task issue retrieved successfully.', taskIssue);
    }
    catch (error) {
        console.error('Error retrieving task issue:', error);
        errorResponse(res, 'Failed to retrieve task issue.', error instanceof Error ? error.message : 'Unknown error', 500);
    }
};
export const deleteTaskIssue = async (req, res) => {
    try {
        const { issueId } = req.params;
        const taskIssue = await TaskIssue.findById(issueId);
        if (!taskIssue) {
            errorResponse(res, 'Task issue not found.', undefined, 404);
            return;
        }
        if (req.user.role !== 'admin' && taskIssue.reportedBy.toString() !== req.user.id) {
            errorResponse(res, 'Access denied. You can only delete your own issues.', undefined, 403);
            return;
        }
        await TaskIssue.findByIdAndDelete(issueId);
        successResponse(res, 'Task issue deleted successfully.');
    }
    catch (error) {
        console.error('Error deleting task issue:', error);
        errorResponse(res, 'Failed to delete task issue.', error instanceof Error ? error.message : 'Unknown error', 500);
    }
};
