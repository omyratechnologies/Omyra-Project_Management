import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  MessageSquare, 
  Plus, 
  Search,
  Filter,
  Clock,
  AlertCircle,
  CheckCircle2,
  Eye,
  Star,
  TrendingUp,
  FileText
} from 'lucide-react';
import { useClientFeedback, ClientFeedback } from '@/hooks/useClientDashboard';
import { useProjects } from '@/hooks/useProjects';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { safeFormatDistanceToNow } from '@/utils/dateUtils';
import { Skeleton } from '@/components/ui/skeleton';

interface ClientFeedbackCenterProps {
  projectId?: string;
}

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'open':
      return <AlertCircle className="w-3 h-3" />;
    case 'under_review':
      return <Eye className="w-3 h-3" />;
    case 'in_progress':
      return <TrendingUp className="w-3 h-3" />;
    case 'resolved':
    case 'closed':
      return <CheckCircle2 className="w-3 h-3" />;
    default:
      return <MessageSquare className="w-3 h-3" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'open':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'under_review':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'in_progress':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'resolved':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'closed':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'low':
      return 'bg-blue-100 text-blue-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'high':
      return 'bg-orange-100 text-orange-800';
    case 'urgent':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getTypeColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'general':
      return 'bg-blue-100 text-blue-800';
    case 'feature_request':
      return 'bg-purple-100 text-purple-800';
    case 'bug_report':
      return 'bg-red-100 text-red-800';
    case 'improvement':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const FeedbackCard: React.FC<{ 
  feedback: ClientFeedback; 
  onClick: () => void;
}> = ({ feedback, onClick }) => {
  const hasResponse = feedback.response && feedback.response.trim().length > 0;
  
  return (
    <Card 
      className="group cursor-pointer hover:shadow-md transition-all duration-200 border-0 shadow-sm"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {feedback.title}
              </h3>
              <Badge className={`${getStatusColor(feedback.status)} border text-xs`}>
                <div className="flex items-center space-x-1">
                  {getStatusIcon(feedback.status)}
                  <span>{feedback.status.replace('_', ' ')}</span>
                </div>
              </Badge>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {feedback.message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge className={`${getPriorityColor(feedback.priority)} text-xs`}>
              {feedback.priority}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            {hasResponse && (
              <div className="flex items-center space-x-1 text-green-600">
                <CheckCircle2 className="w-3 h-3" />
                <span>Responded</span>
              </div>
            )}
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{safeFormatDistanceToNow(feedback.createdAt)}</span>
            </div>
          </div>
        </div>

        {feedback.project && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <FileText className="w-3 h-3" />
              <span>{feedback.project.title}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const CreateFeedbackDialog: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  projectId?: string;
  projects?: { _id: string; title: string }[];
}> = ({ open, onOpenChange, onSubmit, projectId, projects }) => {
  const [formData, setFormData] = useState({
    projectId: projectId || '',
    type: 'general' as 'general' | 'feature_request' | 'bug_report' | 'improvement',
    title: '',
    message: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      projectId: projectId || '',
      type: 'general',
      title: '',
      message: '',
      priority: 'medium'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Submit Feedback</DialogTitle>
          <DialogDescription>
            Share your thoughts, suggestions, or report issues
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!projectId && projects && (
            <div>
              <Label htmlFor="project">Project</Label>
              <Select value={formData.projectId} onValueChange={(value) => setFormData(prev => ({ ...prev, projectId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
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
          )}

          <div>
            <Label htmlFor="type">Type</Label>
            <Select value={formData.type} onValueChange={(value: 'general' | 'feature_request' | 'bug_report' | 'improvement') => setFormData(prev => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Feedback</SelectItem>
                <SelectItem value="feature_request">Feature Request</SelectItem>
                <SelectItem value="bug_report">Bug Report</SelectItem>
                <SelectItem value="improvement">Improvement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Brief description of your feedback"
              required
            />
          </div>

          <div>
            <Label htmlFor="message">Description</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Provide detailed feedback..."
              rows={4}
              required
            />
          </div>

          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select value={formData.priority} onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => setFormData(prev => ({ ...prev, priority: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Submit Feedback
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const FeedbackDetailDialog: React.FC<{
  feedback: ClientFeedback;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ feedback, open, onOpenChange }) => {
  const hasResponse = feedback.response && feedback.response.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <span>{feedback.title}</span>
          </DialogTitle>
          <div className="flex items-center space-x-2 mt-2">
            <Badge className={`${getStatusColor(feedback.status)} border text-xs`}>
              <div className="flex items-center space-x-1">
                {getStatusIcon(feedback.status)}
                <span>{feedback.status.replace('_', ' ')}</span>
              </div>
            </Badge>
            <Badge className={`${getPriorityColor(feedback.priority)} text-xs`}>
              {feedback.priority}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Original Feedback */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Your Feedback</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 whitespace-pre-wrap">{feedback.message}</p>
            </div>
          </div>

          {/* Project Information */}
          {feedback.project && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Project</h4>
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">{feedback.project.title}</span>
              </div>
            </div>
          )}

          {/* Response Section */}
          {hasResponse ? (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Response</h4>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 whitespace-pre-wrap">{feedback.response}</p>
                {feedback.responseDate && (
                  <div className="mt-3 pt-3 border-t border-green-200">
                    <div className="flex items-center space-x-1 text-xs text-green-600">
                      <Clock className="w-3 h-3" />
                      <span>Responded {safeFormatDistanceToNow(feedback.responseDate)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Response</h4>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center space-x-3">
                <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                <div>
                  <p className="text-yellow-800 font-medium">Awaiting Response</p>
                  <p className="text-yellow-700 text-sm">We'll respond to your feedback soon.</p>
                </div>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="border-t border-gray-100 pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Submitted:</span>
                <p>{new Date(feedback.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <span className="font-medium">Last Updated:</span>
                <p>{new Date(feedback.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const ClientFeedbackCenter: React.FC<ClientFeedbackCenterProps> = ({ projectId }) => {
  const { data: allFeedback, isLoading, refetch } = useClientFeedback();
  const { data: projects } = useProjects();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<ClientFeedback | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  // Filter feedback based on projectId if provided
  const feedback = projectId 
    ? allFeedback?.filter(f => f.project._id === projectId) || []
    : allFeedback || [];

  const filteredFeedback = feedback.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateFeedback = async (data: any) => {
    try {
      // Use the projectId from the form data if no projectId prop is provided
      const targetProjectId = projectId || data.projectId;
      
      if (!targetProjectId) {
        toast({
          title: 'Error',
          description: 'Please select a project',
          variant: 'destructive'
        });
        return;
      }

      // Transform the form data to match API expectations
      const feedbackData = {
        type: data.type,
        title: data.title,
        description: data.message, // Map message to description
        priority: data.priority
      };

      await apiClient.createClientFeedback(targetProjectId, feedbackData);
      toast({
        title: 'Success',
        description: 'Feedback submitted successfully'
      });
      setCreateDialogOpen(false);
      refetch();
    } catch (error) {
      console.error('Error creating feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit feedback',
        variant: 'destructive'
      });
    }
  };

  const openFeedbackCount = feedback.filter(f => f.status === 'open').length;
  const respondedCount = feedback.filter(f => f.response && f.response.trim().length > 0).length;

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-56" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-32 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <span>Feedback Center</span>
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {feedback.length} feedback items • {openFeedbackCount} open • {respondedCount} responded
              </p>
            </div>
            
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Submit Feedback
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 mt-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search feedback..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-900">{openFeedbackCount}</p>
                  <p className="text-xs text-blue-600">Open Items</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-900">{respondedCount}</p>
                  <p className="text-xs text-green-600">Responded</p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-purple-900">{feedback.length}</p>
                  <p className="text-xs text-purple-600">Total Feedback</p>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {filteredFeedback.length === 0 ? (
            <div className="text-center py-12">
              {feedback.length === 0 ? (
                <>
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Feedback Yet</h3>
                  <p className="text-gray-600 mb-4">
                    Start by sharing your thoughts and suggestions with the team.
                  </p>
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Submit Your First Feedback
                  </Button>
                </>
              ) : (
                <>
                  <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Found</h3>
                  <p className="text-gray-600">
                    Try adjusting your search or filter criteria.
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredFeedback.map((item) => (
                <FeedbackCard
                  key={item._id}
                  feedback={item}
                  onClick={() => setSelectedFeedback(item)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Feedback Dialog */}
      <CreateFeedbackDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateFeedback}
        projectId={projectId}
        projects={projects?.map(p => ({ _id: p._id, title: p.title })) || []}
      />

      {/* Feedback Detail Dialog */}
      {selectedFeedback && (
        <FeedbackDetailDialog
          feedback={selectedFeedback}
          open={!!selectedFeedback}
          onOpenChange={(open) => !open && setSelectedFeedback(null)}
        />
      )}
    </>
  );
};
