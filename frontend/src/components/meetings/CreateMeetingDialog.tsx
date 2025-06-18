import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, Clock, Users } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { apiClient, Project, Profile } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';

interface CreateMeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateMeeting: (data: any) => Promise<void>;
  projects: Project[];
}

const CreateMeetingDialog: React.FC<CreateMeetingDialogProps> = ({
  open,
  onOpenChange,
  onCreateMeeting,
  projects
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    scheduledAt: new Date(),
    duration: 60,
    attendees: [] as string[],
    locationUrl: ''
  });
  const [time, setTime] = useState('09:00');
  const [teamMembers, setTeamMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadTeamMembers();
    }
  }, [open]);

  const loadTeamMembers = async () => {
    try {
      // Load all team members from user's projects since we don't have a specific project context here
      const members = await apiClient.getTeamMembers();
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
    setLoading(true);

    try {
      // Combine date and time
      const [hours, minutes] = time.split(':').map(Number);
      const scheduledDateTime = new Date(formData.scheduledAt);
      scheduledDateTime.setHours(hours, minutes, 0, 0);

      await onCreateMeeting({
        ...formData,
        attendees: formData.attendees.filter(id => id && id.trim() !== ''),
        scheduledAt: scheduledDateTime.toISOString(),
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        projectId: '',
        scheduledAt: new Date(),
        duration: 60,
        attendees: [],
        locationUrl: ''
      });
      setTime('09:00');
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setLoading(false);
    }
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Meeting</DialogTitle>
          <DialogDescription>
            Schedule a new meeting with your team members.
          </DialogDescription>
        </DialogHeader>

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
              <Label htmlFor="project">Project *</Label>
              <Select 
                value={formData.projectId} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, projectId: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project._id} value={project._id}>
                      {project.title}
                    </SelectItem>
                  ))}
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
            <Label htmlFor="locationUrl">Meeting Link (Optional)</Label>
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Meeting'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateMeetingDialog;
