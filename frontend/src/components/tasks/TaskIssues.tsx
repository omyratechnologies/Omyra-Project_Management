import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { AlertCircle, Bug, Clock, CheckCircle2, X, Plus } from 'lucide-react';
import { useRBAC } from '../../hooks/useRBAC';
import { useToast } from '../../hooks/use-toast';
import { useTaskIssues, CreateTaskIssueData, UpdateTaskIssueData } from '../../hooks/useTaskIssues';
import { TaskIssue } from '../../lib/api';

interface TaskIssuesProps {
  taskId: string;
  taskTitle?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const TaskIssues: React.FC<TaskIssuesProps> = ({ 
  taskId, 
  taskTitle = 'Selected Task', 
  open, 
  onOpenChange 
}) => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<TaskIssue | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    type: 'all'
  });

  const rbac = useRBAC();
  const {
    issues,
    loading,
    error,
    fetchIssues,
    createIssue,
    updateIssue,
    deleteIssue
  } = useTaskIssues(taskId);

  useEffect(() => {
    // Only include non-'all' filters in the API request
    const apiFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== 'all') {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, string>);

    fetchIssues(apiFilters);
  }, [taskId, filters]);

  const handleCreateIssue = async (data: Omit<CreateTaskIssueData, 'task'>) => {
    try {
      // Add the task ID to the form data
      const issueData: CreateTaskIssueData = {
        ...data,
        task: taskId
      };
      await createIssue(issueData);
      setCreateDialogOpen(false);
    } catch (error) {
      // Error is already handled by the hook
      console.error('Failed to create issue:', error);
    }
  };

  const handleUpdateIssue = async (issueId: string, data: UpdateTaskIssueData) => {
    try {
      await updateIssue(issueId, data);
    } catch (error) {
      // Error is already handled by the hook
      console.error('Failed to update issue:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">Task Issues & Feedback</h3>
          <p className="text-sm text-gray-500">Track and manage issues or feedback for this task</p>
        </div>
        {rbac.canCreateTaskIssue && (
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" variant="default">
                <Plus className="w-4 h-4" />
                Report Issue
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Report Issue</DialogTitle>
                <DialogDescription>
                  Report an issue or concern with task: {taskTitle}
                </DialogDescription>
              </DialogHeader>
              <CreateIssueForm
                onSubmit={handleCreateIssue}
                onCancel={() => setCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters - Only show if there are issues or user can create them */}
      {(issues.length > 0 || rbac.canCreateTaskIssues) && (
        <div className="flex flex-wrap gap-2">
          <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.priority} onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="bug">Bug</SelectItem>
              <SelectItem value="blocker">Blocker</SelectItem>
              <SelectItem value="clarification">Clarification</SelectItem>
              <SelectItem value="resource_needed">Resource Needed</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Issues List with better loading and empty states */}
      <div className="space-y-3 min-h-[200px]">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-pulse text-gray-500">Loading issues...</div>
          </div>
        ) : issues.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-500">
            {rbac.canCreateTaskIssues ? (
              <>
                <p className="mb-2">No issues reported yet</p>
                <p className="text-sm">Click "Report Issue" to create the first one</p>
              </>
            ) : (
              <p>No issues reported for this task</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {issues.map((issue) => (
              <Card key={issue._id} className="cursor-pointer hover:bg-gray-50" onClick={() => setSelectedIssue(issue)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getIssueIcon(issue.type)}
                        <h4 className="font-medium">{issue.title}</h4>
                        <Badge className={getStatusColor(issue.status)}>{issue.status}</Badge>
                        <Badge className={getPriorityColor(issue.priority)}>{issue.priority}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{issue.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>Reported by: {issue.reportedBy?.fullName || issue.reportedBy?.email || 'Unknown'}</span>
                        <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Issue Detail Dialog */}
      {selectedIssue && (
        <IssueDetailDialog
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
          onUpdate={handleUpdateIssue}
        />
      )}
    </div>
  );
};

interface CreateIssueFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const CreateIssueForm: React.FC<CreateIssueFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'other' as TaskIssue['type'],
    priority: 'medium' as TaskIssue['priority']
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
        <Select value={formData.type} onValueChange={(value: TaskIssue['type']) => setFormData(prev => ({ ...prev, type: value }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bug">Bug</SelectItem>
            <SelectItem value="blocker">Blocker</SelectItem>
            <SelectItem value="clarification">Clarification</SelectItem>
            <SelectItem value="resource_needed">Resource Needed</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="priority">Priority</Label>
        <Select value={formData.priority} onValueChange={(value: TaskIssue['priority']) => setFormData(prev => ({ ...prev, priority: value }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Create Issue</Button>
      </div>
    </form>
  );
};

interface IssueDetailDialogProps {
  issue: TaskIssue;
  onClose: () => void;
  onUpdate: (id: string, data: any) => void;
}

const IssueDetailDialog: React.FC<IssueDetailDialogProps> = ({ issue, onClose, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    status: issue.status,
    resolution: issue.resolution || ''
  });

  const rbac = useRBAC();

  const handleUpdate = () => {
    onUpdate(issue._id, formData);
    setEditing(false);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getIssueIcon(issue.type)}
            {issue.title}
          </DialogTitle>
          <div className="flex gap-2">
            <Badge className={getStatusColor(issue.status)}>{issue.status}</Badge>
            <Badge className={getPriorityColor(issue.priority)}>{issue.priority}</Badge>
            <Badge variant="outline">{issue.type}</Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Description</h4>
            <p className="text-gray-700">{issue.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Reported by:</span>
              <p>{issue.reportedBy?.fullName || issue.reportedBy?.email || 'Unknown'}</p>
            </div>
            <div>
              <span className="font-medium">Created:</span>
              <p>{new Date(issue.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {(rbac.isAdmin || rbac.isProjectManager) && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Management</h4>
              {editing ? (
                <div className="space-y-3">
                  <div>
                    <Label>Status</Label>
                    <Select value={formData.status} onValueChange={(value: TaskIssue['status']) => setFormData(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Resolution</Label>
                    <Textarea
                      value={formData.resolution}
                      onChange={(e) => setFormData(prev => ({ ...prev, resolution: e.target.value }))}
                      placeholder="Describe the resolution..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleUpdate}>Save</Button>
                    <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {issue.resolution && (
                    <div>
                      <span className="font-medium">Resolution:</span>
                      <p className="text-gray-700">{issue.resolution}</p>
                    </div>
                  )}
                  <Button onClick={() => setEditing(true)}>Update Issue</Button>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
  // If open prop is provided, wrap in a dialog
};

// Helper function moved outside component to avoid recreating
const getIssueIcon = (type: string) => {
  switch (type) {
    case 'bug': return <Bug className="w-4 h-4" />;
    case 'blocker': return <AlertCircle className="w-4 h-4" />;
    default: return <AlertCircle className="w-4 h-4" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'open': return 'bg-red-100 text-red-800';
    case 'in_progress': return 'bg-yellow-100 text-yellow-800';
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
    case 'critical': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};
