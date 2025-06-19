import { Meeting, Project, User, Profile } from '../models/index.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { notificationService } from '../services/notificationService.js';
import mongoose from 'mongoose';
export const createMeeting = async (req, res, next) => {
    try {
        const { title, description, projectId, scheduledAt, duration, attendees, locationUrl } = req.body;
        const user = req.user;
        if (!title || !title.trim()) {
            errorResponse(res, 'Meeting title is required', undefined, 400);
            return;
        }
        if (!projectId) {
            errorResponse(res, 'Project ID is required', undefined, 400);
            return;
        }
        if (!scheduledAt) {
            errorResponse(res, 'Scheduled date and time is required', undefined, 400);
            return;
        }
        if (!duration || duration < 15) {
            errorResponse(res, 'Duration must be at least 15 minutes', undefined, 400);
            return;
        }
        const scheduledDate = new Date(scheduledAt);
        if (scheduledDate < new Date()) {
            errorResponse(res, 'Cannot schedule a meeting in the past', undefined, 400);
            return;
        }
        if (user.role !== 'admin' && user.role !== 'project_manager') {
            errorResponse(res, 'Only admins and project managers can create meetings', undefined, 403);
            return;
        }
        const project = await Project.findById(projectId);
        if (!project) {
            errorResponse(res, 'Project not found', undefined, 404);
            return;
        }
        if (user.role === 'project_manager') {
            const projectAccess = await Project.findOne({
                _id: projectId,
                $or: [
                    { createdBy: user.id },
                ]
            });
            if (!projectAccess) {
                errorResponse(res, 'You do not have permission to create meetings for this project', undefined, 403);
                return;
            }
        }
        let attendeeUserIds = [];
        if (attendees && attendees.length > 0) {
            const validAttendeeIds = attendees.filter(id => id && id.trim() !== '');
            if (validAttendeeIds.length > 0) {
                try {
                    const attendeeObjectIds = validAttendeeIds.map(id => new mongoose.Types.ObjectId(id));
                    const attendeeProfiles = await Profile.find({ _id: { $in: attendeeObjectIds } }).populate('user');
                    if (attendeeProfiles.length === validAttendeeIds.length) {
                        attendeeUserIds = attendeeProfiles.map((profile) => profile.user.id);
                    }
                    else {
                        const attendeeUsers = await User.find({ _id: { $in: attendeeObjectIds } });
                        if (attendeeUsers.length === validAttendeeIds.length) {
                            attendeeUserIds = attendeeObjectIds;
                        }
                        else {
                            errorResponse(res, 'One or more attendees not found', undefined, 400);
                            return;
                        }
                    }
                }
                catch (error) {
                    errorResponse(res, 'Invalid attendee IDs provided', undefined, 400);
                    return;
                }
            }
        }
        const meeting = new Meeting({
            title: title.trim(),
            description: description?.trim(),
            project: projectId,
            scheduledAt: scheduledDate,
            duration,
            organizer: user.id,
            attendees: attendeeUserIds,
            locationUrl: locationUrl?.trim()
        });
        await meeting.save();
        const populatedMeeting = await Meeting.findById(meeting.id)
            .populate({
            path: 'organizer',
            select: 'email',
            populate: {
                path: 'profile',
                select: 'fullName email'
            }
        })
            .populate({
            path: 'attendees',
            select: 'email',
            populate: {
                path: 'profile',
                select: 'fullName email'
            }
        })
            .populate('project', 'title');
        if (attendeeUserIds.length > 0) {
            const project = populatedMeeting?.project;
            const organizer = populatedMeeting?.organizer;
            const organizerName = organizer?.profile?.fullName || organizer?.email || 'Unknown';
            for (const attendeeId of attendeeUserIds) {
                if (attendeeId.toString() !== user.id) {
                    await notificationService.sendNotification({
                        userId: attendeeId.toString(),
                        type: 'meeting_reminder',
                        title: 'New Meeting Scheduled',
                        message: `You have been invited to "${meeting.title}" scheduled for ${scheduledDate.toLocaleDateString()} at ${scheduledDate.toLocaleTimeString()}. Organized by ${organizerName}.`,
                        priority: 'high',
                        actionable: true,
                        action: 'View Meeting',
                        link: `/meetings/${meeting.id}`,
                        metadata: {
                            meetingId: meeting.id,
                            projectId: projectId,
                            entityType: 'meeting',
                            entityId: meeting.id,
                            scheduledAt: scheduledDate.toISOString()
                        }
                    });
                }
            }
        }
        successResponse(res, 'Meeting created successfully', populatedMeeting, 201);
    }
    catch (error) {
        next(error);
    }
};
export const getMeetings = async (req, res, next) => {
    try {
        const user = req.user;
        const { projectId, status, upcoming } = req.query;
        let query = {};
        if (user.role === 'team_member' || user.role === 'client') {
            query.attendees = user.id;
        }
        if (projectId) {
            query.project = projectId;
        }
        if (status) {
            query.status = status;
        }
        if (upcoming === 'true') {
            query.scheduledAt = { $gte: new Date() };
        }
        const meetings = await Meeting.find(query)
            .populate({
            path: 'organizer',
            select: 'email',
            populate: {
                path: 'profile',
                select: 'fullName email'
            }
        })
            .populate({
            path: 'attendees',
            select: 'email',
            populate: {
                path: 'profile',
                select: 'fullName email'
            }
        })
            .populate('project', 'title')
            .sort({ scheduledAt: 1 });
        successResponse(res, 'Meetings retrieved successfully', meetings);
    }
    catch (error) {
        next(error);
    }
};
export const getMeetingById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const meeting = await Meeting.findById(id)
            .populate({
            path: 'organizer',
            select: 'email',
            populate: {
                path: 'profile',
                select: 'fullName email'
            }
        })
            .populate({
            path: 'attendees',
            select: 'email',
            populate: {
                path: 'profile',
                select: 'fullName email'
            }
        })
            .populate('project', 'title');
        if (!meeting) {
            errorResponse(res, 'Meeting not found', undefined, 404);
            return;
        }
        const hasAccess = user.role === 'admin' ||
            user.role === 'project_manager' ||
            meeting.attendees.some(attendee => attendee.id.toString() === user.id) ||
            meeting.organizer.id.toString() === user.id;
        if (!hasAccess) {
            errorResponse(res, 'Access denied', undefined, 403);
            return;
        }
        successResponse(res, 'Meeting retrieved successfully', meeting);
    }
    catch (error) {
        next(error);
    }
};
export const updateMeeting = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const user = req.user;
        const meeting = await Meeting.findById(id);
        if (!meeting) {
            errorResponse(res, 'Meeting not found', undefined, 404);
            return;
        }
        const canUpdate = user.role === 'admin' ||
            user.role === 'project_manager' ||
            meeting.organizer.toString() === user.id;
        if (!canUpdate) {
            errorResponse(res, 'Only admins, project managers, and organizers can update meetings', undefined, 403);
            return;
        }
        const update = {};
        if (updateData.title)
            update.title = updateData.title;
        if (updateData.description !== undefined)
            update.description = updateData.description;
        if (updateData.scheduledAt)
            update.scheduledAt = new Date(updateData.scheduledAt);
        if (updateData.duration)
            update.duration = updateData.duration;
        if (updateData.locationUrl !== undefined)
            update.locationUrl = updateData.locationUrl;
        if (updateData.status)
            update.status = updateData.status;
        if (updateData.attendees) {
            const validAttendeeIds = updateData.attendees.filter(id => id && id.trim() !== '');
            if (validAttendeeIds.length > 0) {
                const attendeeProfileIds = validAttendeeIds.map(id => new mongoose.Types.ObjectId(id));
                const attendeeProfiles = await Profile.find({ _id: { $in: attendeeProfileIds } }).populate('user');
                if (attendeeProfiles.length !== validAttendeeIds.length) {
                    errorResponse(res, 'One or more attendees not found', undefined, 400);
                    return;
                }
                const attendeeUserIds = attendeeProfiles.map((profile) => profile.user.id);
                update.attendees = attendeeUserIds;
            }
            else {
                update.attendees = [];
            }
        }
        const updatedMeeting = await Meeting.findByIdAndUpdate(id, update, { new: true })
            .populate({
            path: 'organizer',
            select: 'email',
            populate: {
                path: 'profile',
                select: 'fullName email'
            }
        })
            .populate({
            path: 'attendees',
            select: 'email',
            populate: {
                path: 'profile',
                select: 'fullName email'
            }
        })
            .populate('project', 'title');
        successResponse(res, 'Meeting updated successfully', updatedMeeting);
    }
    catch (error) {
        next(error);
    }
};
export const deleteMeeting = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const meeting = await Meeting.findById(id);
        if (!meeting) {
            errorResponse(res, 'Meeting not found', undefined, 404);
            return;
        }
        if (user.role !== 'admin') {
            errorResponse(res, 'Only administrators can delete meetings', undefined, 403);
            return;
        }
        await Meeting.findByIdAndDelete(id);
        successResponse(res, 'Meeting deleted successfully');
    }
    catch (error) {
        next(error);
    }
};
export const getUpcomingMeetings = async (req, res, next) => {
    try {
        const user = req.user;
        const { limit = 5 } = req.query;
        let query = {
            scheduledAt: { $gte: new Date() },
            status: 'scheduled'
        };
        if (user.role === 'team_member' || user.role === 'client') {
            query.attendees = user.id;
        }
        const meetings = await Meeting.find(query)
            .populate('organizer', 'email')
            .populate('attendees', 'email')
            .populate('project', 'title')
            .sort({ scheduledAt: 1 })
            .limit(Number(limit));
        successResponse(res, 'Upcoming meetings retrieved successfully', meetings);
    }
    catch (error) {
        next(error);
    }
};
export const updateMeetingLink = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { locationUrl } = req.body;
        const user = req.user;
        const meeting = await Meeting.findById(id);
        if (!meeting) {
            errorResponse(res, 'Meeting not found', undefined, 404);
            return;
        }
        const canEditLink = user.role === 'admin' ||
            user.role === 'project_manager' ||
            meeting.organizer.toString() === user.id;
        if (!canEditLink) {
            errorResponse(res, 'Only admins, project managers, and organizers can edit meeting links', undefined, 403);
            return;
        }
        meeting.locationUrl = locationUrl;
        await meeting.save();
        const updatedMeeting = await Meeting.findById(id)
            .populate({
            path: 'organizer',
            select: 'email',
            populate: {
                path: 'profile',
                select: 'fullName email'
            }
        })
            .populate({
            path: 'attendees',
            select: 'email',
            populate: {
                path: 'profile',
                select: 'fullName email'
            }
        })
            .populate('project', 'title');
        successResponse(res, 'Meeting link updated successfully', updatedMeeting);
    }
    catch (error) {
        next(error);
    }
};
