import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { ClientFeedback } from '../models/ClientFeedback.js';
import { Project } from '../models/Project.js';
import { Profile, ProjectMember } from '../models/index.js';
import { notificationService } from '../services/notificationService.js';
import { CreateClientFeedbackRequest, UpdateClientFeedbackRequest } from '../types/index.js';

export const createClientFeedback = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const { type, title, description, priority }: CreateClientFeedbackRequest = req.body;

    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      errorResponse(res, 'Project not found.', undefined, 404);
      return;
    }

    const feedback = new ClientFeedback({
      project: projectId,
      client: req.user!.id,
      type,
      title,
      description,
      priority
    });

    await feedback.save();
    await feedback.populate(['client', 'project']);

    // Notify project members and admins about new feedback
    const projectMembers = await ProjectMember.find({ project: projectId }).populate('user');
    const adminProfiles = await Profile.find({ role: 'admin' });
    
    // Get client info for the notification
    const clientProfile = await Profile.findOne({ user: req.user!.id });
    const clientName = clientProfile?.fullName || req.user!.email || 'Client';
    
    // Notify all project members
    for (const member of projectMembers) {
      await notificationService.sendNotification({
        userId: member.user._id.toString(),
        type: 'feedback_response',
        title: 'New Client Feedback',
        message: `${clientName} has submitted feedback for "${project.title}": ${feedback.title}`,
        priority: feedback.priority === 'urgent' ? 'urgent' : 'high',
        actionable: true,
        action: 'View Feedback',
        link: `/feedback/${feedback._id}`,
        metadata: {
          feedbackId: feedback._id,
          projectId: projectId,
          entityType: 'feedback',
          entityId: feedback._id
        }
      });
    }

    // Notify admins who aren't already project members
    const memberUserIds = projectMembers.map(m => m.user._id.toString());
    for (const adminProfile of adminProfiles) {
      if (!memberUserIds.includes(adminProfile.user.toString())) {
        await notificationService.sendNotification({
          userId: adminProfile.user.toString(),
          type: 'feedback_response',
          title: 'New Client Feedback',
          message: `${clientName} has submitted feedback for "${project.title}": ${feedback.title}`,
          priority: feedback.priority === 'urgent' ? 'urgent' : 'high',
          actionable: true,
          action: 'View Feedback',
          link: `/feedback/${feedback._id}`,
          metadata: {
            feedbackId: feedback._id,
            projectId: projectId,
            entityType: 'feedback',
            entityId: feedback._id
          }
        });
      }
    }

    successResponse(res, 'Feedback submitted successfully.', feedback, 201);
  } catch (error) {
    console.error('Error creating feedback:', error);
    errorResponse(res, 'Failed to submit feedback.', error instanceof Error ? error.message : 'Unknown error', 500);
  }
};

export const getProjectFeedback = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const { status, type, priority } = req.query;

    const filter: any = { project: projectId };

    if (status) filter.status = status;
    if (type) filter.type = type;
    if (priority) filter.priority = priority;

    const feedback = await ClientFeedback.find(filter)
      .populate('client', 'email profile')
      .populate('assignedTo', 'email profile')
      .populate('respondedBy', 'email profile')
      .sort({ createdAt: -1 });

    successResponse(res, 'Project feedback retrieved successfully.', feedback);
  } catch (error) {
    console.error('Error retrieving feedback:', error);
    errorResponse(res, 'Failed to retrieve feedback.', error instanceof Error ? error.message : 'Unknown error', 500);
  }
};

export const updateClientFeedback = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { feedbackId } = req.params;
    const updateData: UpdateClientFeedbackRequest = req.body;

    const feedback = await ClientFeedback.findById(feedbackId);
    if (!feedback) {
      errorResponse(res, 'Feedback not found.', undefined, 404);
      return;
    }

    // Handle response
    const finalUpdateData: any = { ...updateData };
    if (updateData.response && updateData.status === 'resolved') {
      finalUpdateData.respondedBy = req.user!.id;
      finalUpdateData.respondedAt = new Date();
    }

    const updatedFeedback = await ClientFeedback.findByIdAndUpdate(
      feedbackId,
      finalUpdateData,
      { new: true, runValidators: true }
    ).populate(['client', 'assignedTo', 'respondedBy', 'project']);

    // If a response was added, notify the client
    if (updateData.response && feedback.client) {
      const responderProfile = await Profile.findOne({ user: req.user!.id });
      const responderName = responderProfile?.fullName || req.user!.email || 'Team member';
      const project = updatedFeedback?.project as any;

      await notificationService.sendNotification({
        userId: feedback.client.toString(),
        type: 'feedback_response',
        title: 'Feedback Response Received',
        message: `${responderName} has responded to your feedback "${feedback.title}" for project "${project?.title || 'Unknown Project'}".`,
        priority: 'high',
        actionable: true,
        action: 'View Response',
        link: `/feedback/${feedback._id}`,
        metadata: {
          feedbackId: feedback._id,
          projectId: project?._id,
          entityType: 'feedback',
          entityId: feedback._id
        }
      });
    }

    successResponse(res, 'Feedback updated successfully.', updatedFeedback);
  } catch (error) {
    console.error('Error updating feedback:', error);
    errorResponse(res, 'Failed to update feedback.', error instanceof Error ? error.message : 'Unknown error', 500);
  }
};

export const getClientFeedback = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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
  } catch (error) {
    console.error('Error retrieving feedback:', error);
    errorResponse(res, 'Failed to retrieve feedback.', error instanceof Error ? error.message : 'Unknown error', 500);
  }
};

export const deleteClientFeedback = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { feedbackId } = req.params;

    const feedback = await ClientFeedback.findById(feedbackId);
    if (!feedback) {
      errorResponse(res, 'Feedback not found.', undefined, 404);
      return;
    }

    // Only admin or the client who created it can delete
    if (req.user!.role !== 'admin' && feedback.client.toString() !== req.user!.id) {
      errorResponse(res, 'Access denied. You can only delete your own feedback.', undefined, 403);
      return;
    }

    await ClientFeedback.findByIdAndDelete(feedbackId);
    successResponse(res, 'Feedback deleted successfully.');
  } catch (error) {
    console.error('Error deleting feedback:', error);
    errorResponse(res, 'Failed to delete feedback.', error instanceof Error ? error.message : 'Unknown error', 500);
  }
};
