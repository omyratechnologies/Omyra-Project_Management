import { successResponse, errorResponse } from '../utils/response.js';
import { MeetingAttendee } from '../models/MeetingAttendee.js';
import { Meeting } from '../models/Meeting.js';
export const updateMeetingAttendance = async (req, res) => {
    try {
        const { meetingId } = req.params;
        const { status, reason } = req.body;
        // Verify meeting exists
        const meeting = await Meeting.findById(meetingId);
        if (!meeting) {
            errorResponse(res, 'Meeting not found.', undefined, 404);
            return;
        }
        // Check if user is an attendee or admin
        const isAdmin = req.user.role === 'admin';
        const isAttendee = meeting.attendees.some(attendeeId => attendeeId.toString() === req.user.id.toString());
        if (!isAdmin && !isAttendee) {
            errorResponse(res, 'Access denied. You are not an attendee of this meeting.', undefined, 403);
            return;
        }
        let attendee = await MeetingAttendee.findOne({
            meeting: meetingId,
            user: req.user.id
        });
        if (attendee) {
            // Update existing attendance
            attendee.status = status;
            if (reason)
                attendee.reason = reason;
            await attendee.save();
        }
        else {
            // Create new attendance record
            attendee = new MeetingAttendee({
                meeting: meetingId,
                user: req.user.id,
                status,
                reason
            });
            await attendee.save();
        }
        await attendee.populate(['user', 'meeting']);
        successResponse(res, 'Meeting attendance updated successfully.', attendee);
    }
    catch (error) {
        console.error('Error updating meeting attendance:', error);
        errorResponse(res, 'Failed to update meeting attendance.', error instanceof Error ? error.message : 'Unknown error', 500);
    }
};
export const getMeetingAttendance = async (req, res) => {
    try {
        const { meetingId } = req.params;
        const attendees = await MeetingAttendee.find({ meeting: meetingId })
            .populate('user', 'email profile')
            .sort({ createdAt: -1 });
        successResponse(res, 'Meeting attendance retrieved successfully.', attendees);
    }
    catch (error) {
        console.error('Error retrieving meeting attendance:', error);
        errorResponse(res, 'Failed to retrieve meeting attendance.', error instanceof Error ? error.message : 'Unknown error', 500);
    }
};
export const joinMeeting = async (req, res) => {
    try {
        const { meetingId } = req.params;
        let attendee = await MeetingAttendee.findOne({
            meeting: meetingId,
            user: req.user.id
        });
        if (!attendee) {
            // Create new attendance record if not exists
            attendee = new MeetingAttendee({
                meeting: meetingId,
                user: req.user.id,
                status: 'attending'
            });
        }
        attendee.joinedAt = new Date();
        await attendee.save();
        successResponse(res, 'Successfully joined the meeting.', attendee);
    }
    catch (error) {
        console.error('Error joining meeting:', error);
        errorResponse(res, 'Failed to join meeting.', error instanceof Error ? error.message : 'Unknown error', 500);
    }
};
export const getMyMeetingAttendance = async (req, res) => {
    try {
        const { meetingId } = req.params;
        // Verify meeting exists
        const meeting = await Meeting.findById(meetingId);
        if (!meeting) {
            errorResponse(res, 'Meeting not found.', undefined, 404);
            return;
        }
        // Check if user is an attendee or admin
        const isAdmin = req.user.role === 'admin';
        const isAttendee = meeting.attendees.some(attendeeId => attendeeId.toString() === req.user.id.toString());
        if (!isAdmin && !isAttendee) {
            errorResponse(res, 'Access denied. You are not an attendee of this meeting.', undefined, 403);
            return;
        }
        const attendee = await MeetingAttendee.findOne({
            meeting: meetingId,
            user: req.user.id
        }).populate('user', 'email profile');
        // Return the attendance record, or null if not found
        successResponse(res, 'Meeting attendance retrieved successfully.', attendee);
    }
    catch (error) {
        console.error('Error getting meeting attendance:', error);
        errorResponse(res, 'Failed to get meeting attendance.', error instanceof Error ? error.message : 'Unknown error', 500);
    }
};
export const leaveMeeting = async (req, res) => {
    try {
        const { meetingId } = req.params;
        const attendee = await MeetingAttendee.findOne({
            meeting: meetingId,
            user: req.user.id
        });
        if (!attendee) {
            errorResponse(res, 'Attendance record not found.', undefined, 404);
            return;
        }
        attendee.leftAt = new Date();
        await attendee.save();
        successResponse(res, 'Successfully left the meeting.', attendee);
    }
    catch (error) {
        console.error('Error leaving meeting:', error);
        errorResponse(res, 'Failed to leave meeting.', error instanceof Error ? error.message : 'Unknown error', 500);
    }
};
//# sourceMappingURL=meetingAttendanceController.js.map