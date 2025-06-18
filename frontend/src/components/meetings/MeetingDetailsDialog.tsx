import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Clock, Users, MapPin, Edit, Trash2, ExternalLink } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Meeting, Project, Profile } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { apiClient } from '@/lib/api';

interface MeetingDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meeting: Meeting | null;
  onUpdateMeeting: (id: string, data: any) => Promise<void>;
  onDeleteMeeting: (id: string) => Promise<void>;
  projects: Project[];
  canEdit: boolean;
}

const MeetingDetailsDialog: React.FC<MeetingDetailsDialogProps> = ({
  open,
  onOpenChange,
  meeting,
  onUpdateMeeting,
  onDeleteMeeting,
  projects,
  canEdit
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledAt: new Date(),
    duration: 60,
    attendees: [] as string[],
    locationUrl: '',
    status: 'scheduled' as Meeting['status']
  });
  const [time, setTime] = useState('09:00');
  const [teamMembers, setTeamMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (meeting && open) {
      const meetingDate = new Date(meeting.scheduledAt);
      setFormData({
        title: meeting.title,
        description: meeting.description || '',
        scheduledAt: meetingDate,
        duration: meeting.duration,
        attendees: meeting.attendees.filter(a => a && (a.id || a._id)).map(a => a.id || a._id),
        locationUrl: meeting.locationUrl || '',
        status: meeting.status
      });
      setTime(format(meetingDate, 'HH:mm'));
      loadTeamMembers();
    }
  }, [meeting, open]);

  const loadTeamMembers = async () => {
    try {
      // Try to get team members for the specific project if available
      const projectId = meeting?.project?.id || meeting?.project?._id || meeting?.project;
      const members = await apiClient.getTeamMembers(projectId);
      setTeamMembers(members);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load team members',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meeting) return;
    
    setLoading(true);

    try {
      // Combine date and time
      const [hours, minutes] = time.split(':').map(Number);
      const scheduledDateTime = new Date(formData.scheduledAt);
      scheduledDateTime.setHours(hours, minutes, 0, 0);

      await onUpdateMeeting(meeting._id, {
        ...formData,
        attendees: formData.attendees.filter(id => id && id.trim() !== ''),
        scheduledAt: scheduledDateTime.toISOString(),
      });

      setIsEditing(false);
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!meeting) return;
    await onDeleteMeeting(meeting._id);
  };

  const handleAttendeeToggle = (memberId: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        attendees: [...prev.attendees, memberId]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        attendees: prev.attendees.filter(id => id !== memberId)
      }));
    }
  };

  const getStatusColor = (status: Meeting['status']) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const handleJoinMeeting = () => {
    if (meeting?.locationUrl) {
      window.open(meeting.locationUrl, '_blank');
    }
  };

  if (!meeting) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-xl">{meeting.title}</DialogTitle>
              <DialogDescription className="mt-2">
                {meeting.description}
              </DialogDescription>
            </div>
            <Badge className={getStatusColor(meeting.status)}>
              {meeting.status}
            </Badge>
          </div>
        </DialogHeader>

        {!isEditing ? (
          // View Mode
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <CalendarIcon className="w-4 h-4 mr-2 text-gray-500" />
                  <span>{format(new Date(meeting.scheduledAt), 'PPP')}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="w-4 h-4 mr-2 text-gray-500" />
                  <span>{format(new Date(meeting.scheduledAt), 'p')} ({meeting.duration} min)</span>
                </div>
                <div className="flex items-center text-sm">
                  <Users className="w-4 h-4 mr-2 text-gray-500" />
                  <span>{meeting.attendees.length} attendees</span>
                </div>
                {meeting.locationUrl && (
                  <div className="flex items-center text-sm">
                    <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                    <span>Virtual Meeting</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Project</Label>
                <p className="text-sm">{meeting.project?.title}</p>
                
                <Label className="text-sm font-medium">Organizer</Label>
                <p className="text-sm">{meeting.organizer?.email}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Attendees</Label>
              <div className="max-h-32 overflow-y-auto border rounded-md p-3">
                {meeting.attendees.filter(attendee => attendee && (attendee.id || attendee._id)).map((attendee, index) => (
                  <div key={attendee.id || attendee._id || `attendee-${index}`} className="text-sm py-1">
                    {attendee.email}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              {meeting.locationUrl && meeting.status === 'scheduled' && (
                <Button onClick={handleJoinMeeting} className="flex-1">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Join Meeting
                </Button>
              )}
              
              {canEdit && (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Meeting</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this meeting? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          </div>
        ) : (
          // Edit Mode
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Meeting Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter meeting title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as Meeting['status'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Meeting agenda and details"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.scheduledAt && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.scheduledAt ? format(formData.scheduledAt, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.scheduledAt}
                      onSelect={(date) => date && setFormData(prev => ({ ...prev, scheduledAt: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes) *</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  min="15"
                  max="480"
                  step="15"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="locationUrl">Meeting Link</Label>
              <Input
                id="locationUrl"
                value={formData.locationUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, locationUrl: e.target.value }))}
                placeholder="https://meet.google.com/... or Zoom link"
                type="url"
              />
            </div>

            <div className="space-y-2">
              <Label>Attendees</Label>
              <div className="max-h-48 overflow-y-auto border rounded-md p-3 space-y-2">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={member.id}
                      checked={formData.attendees.includes(member.id)}
                      onCheckedChange={(checked) => handleAttendeeToggle(member.id, checked as boolean)}
                    />
                    <Label htmlFor={member.id} className="text-sm cursor-pointer">
                      {member.fullName} ({member.email})
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Meeting'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MeetingDetailsDialog;
