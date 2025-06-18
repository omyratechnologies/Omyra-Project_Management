import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { CheckCircle2, XCircle, Clock, Users, MessageSquare } from 'lucide-react';
import { apiClient, MeetingAttendee, Meeting } from '../../lib/api';
import { useRBAC } from '../../hooks/useRBAC';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/use-toast';

interface MeetingAttendanceProps {
  meeting?: Meeting;
  meetingId?: string;
  isAttendee?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const MeetingAttendance: React.FC<MeetingAttendanceProps> = ({ 
  meeting: propMeeting, 
  meetingId,
  isAttendee = false,
  open,
  onOpenChange 
}) => {
  const [meeting, setMeeting] = useState<Meeting | null>(propMeeting || null);
  const [attendance, setAttendance] = useState<MeetingAttendee[]>([]);
  const [userAttendance, setUserAttendance] = useState<MeetingAttendee | null>(null);
  const [loading, setLoading] = useState(true);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);

  const rbac = useRBAC();
  const { profile } = useAuth();
  const { toast } = useToast();

  // Helper function to get role display name
  const getRoleDisplayName = (role?: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'project_manager': return 'Project Manager';
      case 'team_member': return 'Team Member';
      case 'client': return 'Client';
      default: return 'Member';
    }
  };

  useEffect(() => {
    loadAttendance();
  }, [meeting?._id, meetingId]);

  useEffect(() => {
    // If only meetingId is provided, fetch the meeting data
    if (meetingId && !meeting) {
      loadMeeting();
    }
  }, [meetingId, meeting]);

  const loadMeeting = async () => {
    if (!meetingId) return;
    
    try {
      const meetingData = await apiClient.getMeeting(meetingId);
      setMeeting(meetingData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load meeting details',
        variant: 'destructive'
      });
    }
  };

  const loadAttendance = async () => {
    const currentMeetingId = meeting?._id || meetingId;
    if (!currentMeetingId) return;

    try {
      setLoading(true);
      
      // Load full attendance data for admins and project managers
      if (rbac.isAdmin || rbac.isProjectManager) {
        const data = await apiClient.getMeetingAttendance(currentMeetingId);
        setAttendance(data);
        
        // Find current user's attendance
        const currentUserAttendance = data.find(
          (att) => att.user.id === profile?.id
        );
        setUserAttendance(currentUserAttendance || null);
      } else {
        // For regular attendees, just load their own attendance
        const userAttendanceData = await apiClient.getMyMeetingAttendance(currentMeetingId);
        setUserAttendance(userAttendanceData);
        setAttendance([]);
      }
    } catch (error) {
      console.error('Failed to load meeting attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAttendance = async (status: MeetingAttendee['status'], reason?: string) => {
    const currentMeetingId = meeting?._id || meetingId;
    if (!currentMeetingId) return;

    try {
      const data = await apiClient.updateMeetingAttendance(currentMeetingId, {
        status,
        reason
      });
      setUserAttendance(data);
      toast({
        title: 'Success',
        description: 'Attendance status updated'
      });
      setUpdateDialogOpen(false);
      loadAttendance();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update attendance',
        variant: 'destructive'
      });
    }
  };

  const handleJoinMeeting = async () => {
    const currentMeetingId = meeting?._id || meetingId;
    if (!currentMeetingId) return;

    try {
      await apiClient.joinMeeting(currentMeetingId);
      toast({
        title: 'Success',
        description: 'Joined meeting successfully'
      });
      loadAttendance();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to join meeting',
        variant: 'destructive'
      });
    }
  };

  const handleLeaveMeeting = async () => {
    const currentMeetingId = meeting?._id || meetingId;
    if (!currentMeetingId) return;

    try {
      await apiClient.leaveMeeting(currentMeetingId);
      toast({
        title: 'Success',
        description: 'Left meeting successfully'
      });
      loadAttendance();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to leave meeting',
        variant: 'destructive'
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'attending':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'not_attending':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'tentative':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'attending':
        return 'bg-green-100 text-green-800';
      case 'not_attending':
        return 'bg-red-100 text-red-800';
      case 'tentative':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case 'attending': return 'Attending';
      case 'not_attending': return 'Not Attending';
      case 'tentative': return 'Maybe';
      default: return 'No Response';
    }
  };

  const currentMeeting = meeting || null;
  
  if (!currentMeeting) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Clock className="w-8 h-8 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500">Loading meeting details...</p>
        </div>
      </div>
    );
  }

  const isMeetingStarted = new Date(currentMeeting.scheduledAt) <= new Date();
  const isUserAttendee = isAttendee || currentMeeting.attendees?.some((attendee: any) => attendee._id === profile?.id || attendee.id === profile?.id);
  const canJoinMeeting = isUserAttendee && userAttendance?.status === 'attending' && isMeetingStarted;

  const content = (
    <div className="space-y-4">
      {/* User's attendance status and controls - only show for actual attendees */}
      {isUserAttendee && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="w-4 h-4" />
              Your Attendance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {userAttendance && getStatusIcon(userAttendance.status)}
                <span className="font-medium">
                  {userAttendance 
                    ? getStatusDisplayName(userAttendance.status)
                    : 'No response yet'
                  }
                </span>
                {userAttendance?.status && (
                  <Badge className={getStatusColor(userAttendance.status)}>
                    {getStatusDisplayName(userAttendance.status)}
                  </Badge>
                )}
              </div>
              
              <div className="flex gap-2">
                <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Update Status
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Update Attendance</DialogTitle>
                      <DialogDescription>
                        Update your attendance status for this meeting
                      </DialogDescription>
                    </DialogHeader>
                    <AttendanceUpdateForm
                      currentStatus={userAttendance?.status}
                      currentReason={userAttendance?.reason}
                      onSubmit={handleUpdateAttendance}
                      onCancel={() => setUpdateDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>

                {canJoinMeeting && currentMeeting.locationUrl && (
                  <Button size="sm" onClick={handleJoinMeeting}>
                    Join Meeting
                  </Button>
                )}
              </div>
            </div>

            {userAttendance?.reason && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 text-gray-500 mt-0.5" />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Reason:</span>
                    <p className="text-sm text-gray-600">{userAttendance.reason}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Meeting link for attendees */}
      {isUserAttendee && currentMeeting.locationUrl && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Meeting Link:</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(currentMeeting.locationUrl, '_blank')}
              >
                Open Link
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attendance list for admins and PMs */}
      {(rbac.isAdmin || rbac.isProjectManager) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="w-4 h-4" />
              Attendance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Loading attendance...</div>
            ) : (
              <div className="space-y-3">
                {currentMeeting.attendees?.map((attendee: any, index: number) => {
                  const attendeeRecord = attendance.find(
                    (att) => att.user.id === attendee.id
                  );
                  
                  return (
                    <div key={attendee.id || attendee.email || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          {attendee.profile?.fullName?.charAt(0) || attendee.email?.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium">
                            {attendee.profile?.fullName || attendee.email}
                          </div>
                          <div className="text-xs text-gray-500">
                            {getRoleDisplayName(attendee.profile?.role)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {attendeeRecord ? (
                          <>
                            {getStatusIcon(attendeeRecord.status)}
                            <Badge className={getStatusColor(attendeeRecord.status)}>
                              {getStatusDisplayName(attendeeRecord.status)}
                            </Badge>
                          </>
                        ) : (
                          <Badge variant="outline">No Response</Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {/* Attendance Summary */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm font-medium text-blue-800 mb-2">Attendance Summary</div>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-medium text-green-700">
                        {attendance.filter(att => 
                          att.status === 'attending' && 
                          currentMeeting.attendees?.some(attendee => attendee._id === att.user._id || attendee.id === att.user.id)
                        ).length}
                      </div>
                      <div className="text-green-600">Attending</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-red-700">
                        {attendance.filter(att => 
                          att.status === 'not_attending' && 
                          currentMeeting.attendees?.some(attendee => attendee._id === att.user._id || attendee.id === att.user.id)
                        ).length}
                      </div>
                      <div className="text-red-600">Not Attending</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-yellow-700">
                        {attendance.filter(att => 
                          att.status === 'tentative' && 
                          currentMeeting.attendees?.some(attendee => attendee._id === att.user._id || attendee.id === att.user.id)
                        ).length}
                      </div>
                      <div className="text-yellow-600">Maybe</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-700">
                        {(currentMeeting.attendees?.length || 0) - attendance.filter(att => 
                          currentMeeting.attendees?.some(attendee => attendee._id === att.user._id || attendee.id === att.user.id)
                        ).length}
                      </div>
                      <div className="text-gray-600">No Response</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );

  // If open prop is provided, wrap in a dialog
  if (open !== undefined && onOpenChange) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Meeting Attendance</DialogTitle>
            <DialogDescription>
              Manage attendance for: {currentMeeting?.title || 'Selected Meeting'}
            </DialogDescription>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  // Otherwise, return as standalone component
  return content;
};

interface AttendanceUpdateFormProps {
  currentStatus?: string;
  currentReason?: string;
  onSubmit: (status: MeetingAttendee['status'], reason?: string) => void;
  onCancel: () => void;
}

const AttendanceUpdateForm: React.FC<AttendanceUpdateFormProps> = ({
  currentStatus,
  currentReason,
  onSubmit,
  onCancel
}) => {
  const [status, setStatus] = useState<MeetingAttendee['status']>(
    (currentStatus as MeetingAttendee['status']) || 'tentative'
  );
  const [reason, setReason] = useState(currentReason || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(status, reason || undefined);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="status">Attendance Status</Label>
        <Select value={status} onValueChange={(value: MeetingAttendee['status']) => setStatus(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="attending">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Attending
              </div>
            </SelectItem>
            <SelectItem value="not_attending">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-600" />
                Not Attending
              </div>
            </SelectItem>
            <SelectItem value="tentative">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                Maybe
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {status === 'not_attending' && (
        <div>
          <Label htmlFor="reason">Reason (optional)</Label>
          <Textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please provide a reason for not attending..."
            rows={3}
          />
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Update Status</Button>
      </div>
    </form>
  );
};
