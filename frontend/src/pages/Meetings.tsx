import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, Users, MapPin, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useRBAC } from '@/hooks/useRBAC';
import { apiClient, Meeting, Project } from '@/lib/api';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import CreateMeetingDialog from '@/components/meetings/CreateMeetingDialog';
import MeetingDetailsDialog from '@/components/meetings/MeetingDetailsDialog';
import CalendarView from '@/components/meetings/CalendarView';
import { MeetingAttendance } from '@/components/meetings/MeetingAttendance';

const Meetings = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedMeetingForAttendance, setSelectedMeetingForAttendance] = useState<string | null>(null);
  const [showAttendanceDialog, setShowAttendanceDialog] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const rbac = useRBAC();

  const handleViewAttendance = (meetingId: string) => {
    setSelectedMeetingForAttendance(meetingId);
    setShowAttendanceDialog(true);
  };

  const handleCloseAttendanceDialog = (open: boolean) => {
    setShowAttendanceDialog(open);
    if (!open) {
      setSelectedMeetingForAttendance(null);
    }
  };

  const canCreateMeetings = rbac.canManageMeetings;

  useEffect(() => {
    let mounted = true;
    
    const loadDataSafely = async () => {
      if (mounted) {
        await loadData();
      }
    };

    loadDataSafely();

    return () => {
      mounted = false;
    };
  }, [statusFilter, projectFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [meetingsData, projectsData] = await Promise.all([
        apiClient.getMeetings({
          status: statusFilter === 'all' ? undefined : statusFilter,
          projectId: projectFilter === 'all' ? undefined : projectFilter,
        }),
        apiClient.getProjects()
      ]);
      
      setMeetings(meetingsData);
      setProjects(projectsData);
    } catch (error: any) {
      console.error('Error loading meetings data:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load meetings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMeeting = async (meetingData: any) => {
    try {
      await apiClient.createMeeting(meetingData);
      toast({
        title: 'Success',
        description: 'Meeting created successfully',
      });
      setCreateDialogOpen(false);
      await loadData(); // Wait for data refresh
    } catch (error: any) {
      console.error('Error creating meeting:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create meeting',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateMeeting = async (id: string, data: any) => {
    try {
      await apiClient.updateMeeting(id, data);
      toast({
        title: 'Success',
        description: 'Meeting updated successfully',
      });
      setDetailsDialogOpen(false);
      await loadData(); // Wait for data refresh
    } catch (error: any) {
      console.error('Error updating meeting:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update meeting',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteMeeting = async (id: string) => {
    try {
      await apiClient.deleteMeeting(id);
      toast({
        title: 'Success',
        description: 'Meeting deleted successfully',
      });
      setDetailsDialogOpen(false);
      await loadData(); // Wait for data refresh
    } catch (error: any) {
      console.error('Error deleting meeting:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete meeting',
        variant: 'destructive',
      });
    }
  };

  const filteredMeetings = meetings.filter(meeting => {
    if (!meeting) return false;
    const titleMatch = meeting.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const descriptionMatch = meeting.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    return titleMatch || descriptionMatch;
  });

  const formatMeetingDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const formatMeetingTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'p');
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Invalid time';
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

  const openMeetingDetails = (meeting: Meeting) => {
    if (!meeting) return;
    setSelectedMeeting(meeting);
    setDetailsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Meetings</h1>
          <p className="text-gray-600">Manage your team meetings and schedule</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
          >
            List
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            onClick={() => setViewMode('calendar')}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Calendar
          </Button>
          {canCreateMeetings && (
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Meeting
            </Button>
          )}
        </div>
      </div>

      {viewMode === 'list' && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search meetings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project._id} value={project._id}>
                    {project.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Meetings List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMeetings.map((meeting) => (
              <Card 
                key={meeting._id} 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => openMeetingDetails(meeting)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{meeting.title}</CardTitle>
                    <Badge className={getStatusColor(meeting.status)}>
                      {meeting.status}
                    </Badge>
                  </div>
                  <CardDescription>{meeting.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatMeetingDate(meeting.scheduledAt)}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      {formatMeetingTime(meeting.scheduledAt)} ({meeting.duration} min)
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      {meeting.attendees?.length || 0} attendees
                    </div>
                    {meeting.locationUrl && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        Virtual Meeting
                      </div>
                    )}
                  </div>
                  {(rbac.canManageMeetings || meeting.attendees?.some((attendee: any) => attendee.id === user?.id)) && (
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewAttendance(meeting._id);
                        }}
                        className="w-full"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        {rbac.canManageMeetings ? 'Manage Attendance' : 'My Attendance'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredMeetings.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No meetings found</h3>
              <p className="text-gray-500">
                {canCreateMeetings 
                  ? "Get started by creating your first meeting." 
                  : "No meetings have been scheduled yet."
                }
              </p>
            </div>
          )}
        </>
      )}

      {viewMode === 'calendar' && (
        <CalendarView meetings={meetings} onSelectMeeting={openMeetingDetails} />
      )}

      {/* Dialogs */}
      <CreateMeetingDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreateMeeting={handleCreateMeeting}
        projects={projects}
      />
      
      <MeetingDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        meeting={selectedMeeting}
        onUpdateMeeting={handleUpdateMeeting}
        onDeleteMeeting={handleDeleteMeeting}
        projects={projects}
        canEdit={canCreateMeetings}
      />

      {selectedMeetingForAttendance && (
        <MeetingAttendance
          meetingId={selectedMeetingForAttendance}
          open={showAttendanceDialog}
          onOpenChange={handleCloseAttendanceDialog}
          isAttendee={meetings.find(m => m._id === selectedMeetingForAttendance)?.attendees?.some((attendee: any) => attendee._id === user?.id || attendee.id === user?.id)}
        />
      )}
    </div>
  );
};

export default Meetings;
