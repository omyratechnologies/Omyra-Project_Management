import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { apiClient, TaskIssue } from '../lib/api';
import { useToast } from './use-toast';

export interface CreateTaskIssueData {
  task: string;
  title: string;
  description: string;
  type: 'bug' | 'blocker' | 'clarification' | 'resource_needed' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string;
}

export interface UpdateTaskIssueData {
  title?: string;
  description?: string;
  type?: 'bug' | 'blocker' | 'clarification' | 'resource_needed' | 'other';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'open' | 'in_progress' | 'resolved' | 'closed';
  assignedTo?: string;
}

// Main hook that matches the component's expected interface
export const useTaskIssues = (taskId: string) => {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query for fetching issues
  const {
    data: issues = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['task-issues', taskId, filters],
    queryFn: async () => {
      console.log('Fetching issues for task:', taskId, 'with filters:', filters);
      const apiFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value && value !== 'all') {
          acc[key as keyof typeof acc] = value;
        }
        return acc;
      }, {} as { status?: string; priority?: string; type?: string });
      
      const response = await apiClient.getTaskIssues(taskId, apiFilters);
      console.log('Task issues API response:', response);
      return response;
    },
    enabled: !!taskId,
  });

  // Create issue mutation
  const createIssueMutation = useMutation({
    mutationFn: async (data: CreateTaskIssueData) => {
      console.log('Creating task issue:', data);
      return await apiClient.createTaskIssue(data.task, {
        title: data.title,
        description: data.description,
        type: data.type,
        priority: data.priority
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-issues', taskId] });
      toast({
        title: "Success",
        description: "Task issue created successfully!"
      });
    },
    onError: (error: any) => {
      console.error('Create issue error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create task issue",
        variant: "destructive"
      });
    },
  });

  // Update issue mutation
  const updateIssueMutation = useMutation({
    mutationFn: async ({ issueId, data }: { issueId: string; data: UpdateTaskIssueData }) => {
      console.log('Updating issue:', issueId, 'with data:', data);
      return await apiClient.updateTaskIssue(issueId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-issues', taskId] });
      toast({
        title: "Success",
        description: "Task issue updated successfully!"
      });
    },
    onError: (error: any) => {
      console.error('Update issue error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update task issue",
        variant: "destructive"
      });
    },
  });

  // Delete issue mutation
  const deleteIssueMutation = useMutation({
    mutationFn: async (issueId: string) => {
      console.log('Deleting issue:', issueId);
      return await apiClient.deleteTaskIssue(issueId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-issues', taskId] });
      toast({
        title: "Success",
        description: "Task issue deleted successfully!"
      });
    },
    onError: (error: any) => {
      console.error('Delete issue error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete task issue",
        variant: "destructive"
      });
    },
  });

  // Return interface that matches component expectations
  return {
    issues,
    loading,
    error,
    fetchIssues: (newFilters?: Record<string, string>) => {
      if (newFilters) {
        setFilters(newFilters);
      }
      refetch();
    },
    createIssue: (data: CreateTaskIssueData) => createIssueMutation.mutateAsync(data),
    updateIssue: (issueId: string, data: UpdateTaskIssueData) => 
      updateIssueMutation.mutateAsync({ issueId, data }),
    deleteIssue: (issueId: string) => deleteIssueMutation.mutateAsync(issueId),
  };
};
