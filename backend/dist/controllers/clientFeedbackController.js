import { successResponse, errorResponse } from '../utils/response.js';
import { ClientFeedback } from '../models/ClientFeedback.js';
import { Project } from '../models/Project.js';
export const createClientFeedback = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { type, title, description, priority } = req.body;
        // Verify project exists
        const project = await Project.findById(projectId);
        if (!project) {
            errorResponse(res, 'Project not found.', undefined, 404);
            return;
        }
        const feedback = new ClientFeedback({
            project: projectId,
            client: req.user.id,
            type,
            title,
            description,
            priority
        });
        await feedback.save();
        await feedback.populate(['client', 'project']);
        successResponse(res, 'Feedback submitted successfully.', feedback, 201);
    }
    catch (error) {
        console.error('Error creating feedback:', error);
        errorResponse(res, 'Failed to submit feedback.', error instanceof Error ? error.message : 'Unknown error', 500);
    }
};
export const getProjectFeedback = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { status, type, priority } = req.query;
        const filter = { project: projectId };
        if (status)
            filter.status = status;
        if (type)
            filter.type = type;
        if (priority)
            filter.priority = priority;
        const feedback = await ClientFeedback.find(filter)
            .populate('client', 'email profile')
            .populate('assignedTo', 'email profile')
            .populate('respondedBy', 'email profile')
            .sort({ createdAt: -1 });
        successResponse(res, 'Project feedback retrieved successfully.', feedback);
    }
    catch (error) {
        console.error('Error retrieving feedback:', error);
        errorResponse(res, 'Failed to retrieve feedback.', error instanceof Error ? error.message : 'Unknown error', 500);
    }
};
export const updateClientFeedback = async (req, res) => {
    try {
        const { feedbackId } = req.params;
        const updateData = req.body;
        const feedback = await ClientFeedback.findById(feedbackId);
        if (!feedback) {
            errorResponse(res, 'Feedback not found.', undefined, 404);
            return;
        }
        // Handle response
        const finalUpdateData = { ...updateData };
        if (updateData.response && updateData.status === 'resolved') {
            finalUpdateData.respondedBy = req.user.id;
            finalUpdateData.respondedAt = new Date();
        }
        const updatedFeedback = await ClientFeedback.findByIdAndUpdate(feedbackId, finalUpdateData, { new: true, runValidators: true }).populate(['client', 'assignedTo', 'respondedBy', 'project']);
        successResponse(res, 'Feedback updated successfully.', updatedFeedback);
    }
    catch (error) {
        console.error('Error updating feedback:', error);
        errorResponse(res, 'Failed to update feedback.', error instanceof Error ? error.message : 'Unknown error', 500);
    }
};
export const getClientFeedback = async (req, res) => {
    try {
        const { feedbackId } = req.params;
        const feedback = await ClientFeedback.findById(feedbackId)
            .populate('client', 'email profile')
            .populate('assignedTo', 'email profile')
            .populate('respondedBy', 'email profile')
            .populate('project', 'title description status');
        if (!feedback) {
            errorResponse(res, 'Feedback not found.', undefined, 404);
            return;
        }
        successResponse(res, 'Feedback retrieved successfully.', feedback);
    }
    catch (error) {
        console.error('Error retrieving feedback:', error);
        errorResponse(res, 'Failed to retrieve feedback.', error instanceof Error ? error.message : 'Unknown error', 500);
    }
};
export const deleteClientFeedback = async (req, res) => {
    try {
        const { feedbackId } = req.params;
        const feedback = await ClientFeedback.findById(feedbackId);
        if (!feedback) {
            errorResponse(res, 'Feedback not found.', undefined, 404);
            return;
        }
        // Only admin or the client who created it can delete
        if (req.user.role !== 'admin' && feedback.client.toString() !== req.user.id) {
            errorResponse(res, 'Access denied. You can only delete your own feedback.', undefined, 403);
            return;
        }
        await ClientFeedback.findByIdAndDelete(feedbackId);
        successResponse(res, 'Feedback deleted successfully.');
    }
    catch (error) {
        console.error('Error deleting feedback:', error);
        errorResponse(res, 'Failed to delete feedback.', error instanceof Error ? error.message : 'Unknown error', 500);
    }
};
//# sourceMappingURL=clientFeedbackController.js.map