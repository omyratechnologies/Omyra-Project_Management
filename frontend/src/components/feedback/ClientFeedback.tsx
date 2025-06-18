import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { MessageSquare, Plus, Star } from 'lucide-react';
import { apiClient, ClientFeedback } from '../../lib/api';
import { useRBAC } from '../../hooks/useRBAC';
import { useToast } from '../../hooks/use-toast';

interface ClientFeedbackComponentProps {
  projectId: string;
  projectTitle?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const ClientFeedbackComponent: React.FC<ClientFeedbackComponentProps> = ({ 
  projectId, 
  projectTitle = 'Selected Project',
  open,
  onOpenChange 
}) => {
  const [feedback, setFeedback] = useState<ClientFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<ClientFeedback | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    priority: ''
  });

  const rbac = useRBAC();
  const { toast } = useToast();

  useEffect(() => {
    loadFeedback();
  }, [projectId, filters]);

  const loadFeedback = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getProjectFeedback(projectId, filters);
      setFeedback(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load feedback',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFeedback = async (data: {
    type: ClientFeedback['type'];
    title: string;
    description: string;
    priority: ClientFeedback['priority'];
  }) => {
    try {
      await apiClient.createClientFeedback(projectId, data);
      toast({
        title: 'Success',
        description: 'Feedback submitted successfully'
      });
      setCreateDialogOpen(false);
      loadFeedback();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit feedback',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateFeedback = async (feedbackId: string, data: any) => {
    try {
      await apiClient.updateClientFeedback(feedbackId, data);
      toast({
        title: 'Success',
        description: 'Feedback updated successfully'
      });
      loadFeedback();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update feedback',
        variant: 'destructive'
      });
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'general': return 'bg-gray-100 text-gray-800';
      case 'feature_request': return 'bg-blue-100 text-blue-800';
      case 'bug_report': return 'bg-red-100 text-red-800';
      case 'improvement': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!rbac.canProvideFeedback && !rbac.isAdmin && !rbac.isProjectManager) {
    return null;
  }

  const content = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Client Feedback</h3>
        {rbac.canProvideFeedback && (
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Provide Feedback
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Provide Feedback</DialogTitle>
                <DialogDescription>
                  Share your feedback for project: {projectTitle}
                </DialogDescription>
              </DialogHeader>
              <CreateFeedbackForm
                onSubmit={handleCreateFeedback}
                onCancel={() => setCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters - Only show to admin/PM */}
      {(rbac.isAdmin || rbac.isProjectManager) && (
        <div className="flex gap-2">
          <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="feature_request">Feature Request</SelectItem>
              <SelectItem value="bug_report">Bug Report</SelectItem>
              <SelectItem value="improvement">Improvement</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.priority} onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Priority</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Feedback List */}
      <div className="space-y-3">
        {loading ? (
          <div>Loading feedback...</div>
        ) : feedback.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No feedback submitted yet
          </div>
        ) : (
          feedback.map((item) => (
            <Card key={item._id} className="cursor-pointer hover:bg-gray-50" onClick={() => setSelectedFeedback(item)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4" />
                      <h4 className="font-medium">{item.title}</h4>
                      <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                      <Badge className={getTypeColor(item.type)}>{item.type.replace('_', ' ')}</Badge>
                      <Badge className={getPriorityColor(item.priority)}>{item.priority}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>From: {item.client?.profile?.fullName || 'Unknown'}</span>
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      {item.response && <span className="text-green-600">Responded</span>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Feedback Detail Dialog */}
      {selectedFeedback && (
        <FeedbackDetailDialog
          feedback={selectedFeedback}
          onClose={() => setSelectedFeedback(null)}
          onUpdate={handleUpdateFeedback}
        />
      )}
    </div>
  );

  // If open prop is provided, wrap in a dialog
  if (open !== undefined && onOpenChange) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Client Feedback</DialogTitle>
            <DialogDescription>
              Manage feedback for project: {projectTitle}
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

interface CreateFeedbackFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const CreateFeedbackForm: React.FC<CreateFeedbackFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'general' as ClientFeedback['type'],
    priority: 'medium' as ClientFeedback['priority']
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
          required
        />
      </div>

      <div>
        <Label htmlFor="type">Type</Label>
        <Select value={formData.type} onValueChange={(value: ClientFeedback['type']) => setFormData(prev => ({ ...prev, type: value }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">General Feedback</SelectItem>
            <SelectItem value="feature_request">Feature Request</SelectItem>
            <SelectItem value="bug_report">Bug Report</SelectItem>
            <SelectItem value="improvement">Improvement Suggestion</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="priority">Priority</Label>
        <Select value={formData.priority} onValueChange={(value: ClientFeedback['priority']) => setFormData(prev => ({ ...prev, priority: value }))}>
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
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Submit Feedback</Button>
      </div>
    </form>
  );
};

interface FeedbackDetailDialogProps {
  feedback: ClientFeedback;
  onClose: () => void;
  onUpdate: (id: string, data: any) => void;
}

const FeedbackDetailDialog: React.FC<FeedbackDetailDialogProps> = ({ feedback, onClose, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    status: feedback.status,
    response: feedback.response || ''
  });

  const rbac = useRBAC();

  const handleUpdate = () => {
    onUpdate(feedback._id, formData);
    setEditing(false);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            {feedback.title}
          </DialogTitle>
          <div className="flex gap-2">
            <Badge className={getStatusColor(feedback.status)}>{feedback.status}</Badge>
            <Badge className={getTypeColor(feedback.type)}>{feedback.type.replace('_', ' ')}</Badge>
            <Badge className={getPriorityColor(feedback.priority)}>{feedback.priority}</Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Description</h4>
            <p className="text-gray-700">{feedback.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">From:</span>
              <p>{feedback.client?.profile?.fullName || 'Unknown'}</p>
            </div>
            <div>
              <span className="font-medium">Submitted:</span>
              <p>{new Date(feedback.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {feedback.response && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2 text-green-800">Response</h4>
              <p className="text-green-700">{feedback.response}</p>
              {feedback.respondedBy && (
                <p className="text-xs text-green-600 mt-2">
                  Responded by {feedback.respondedBy?.profile?.fullName} on{' '}
                  {feedback.respondedAt && new Date(feedback.respondedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          )}

          {(rbac.isAdmin || rbac.isProjectManager) && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Management</h4>
              {editing ? (
                <div className="space-y-3">
                  <div>
                    <Label>Status</Label>
                    <Select value={formData.status} onValueChange={(value: ClientFeedback['status']) => setFormData(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="under_review">Under Review</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Response</Label>
                    <Textarea
                      value={formData.response}
                      onChange={(e) => setFormData(prev => ({ ...prev, response: e.target.value }))}
                      placeholder="Provide a response to the client..."
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleUpdate}>Save Response</Button>
                    <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <Button onClick={() => setEditing(true)}>Respond to Feedback</Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Helper functions
const getTypeColor = (type: string) => {
  switch (type) {
    case 'general': return 'bg-gray-100 text-gray-800';
    case 'feature_request': return 'bg-blue-100 text-blue-800';
    case 'bug_report': return 'bg-red-100 text-red-800';
    case 'improvement': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'open': return 'bg-red-100 text-red-800';
    case 'under_review': return 'bg-yellow-100 text-yellow-800';
    case 'in_progress': return 'bg-blue-100 text-blue-800';
    case 'resolved': return 'bg-green-100 text-green-800';
    case 'closed': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'low': return 'bg-blue-100 text-blue-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'high': return 'bg-orange-100 text-orange-800';
    case 'urgent': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};
