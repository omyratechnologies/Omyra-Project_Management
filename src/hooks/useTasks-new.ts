import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, Task } from '../lib/api';
import { useToast } from './use-toast';

export const useTasks = (projectId?: string) => {
  return useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => apiClient.getTasks(projectId),
  });
};

export const useTask = (id: string) => {
  return useQuery({
    queryKey: ['tasks', 'detail', id],
    queryFn: () => apiClient.getTask(id),
    enabled: !!id,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: apiClient.createTask,
    onSuccess: (newTask) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', newTask.project] });
      toast({
        title: "Success",
        description: "Task created successfully!"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create task",
        variant: "destructive"
      });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof apiClient.updateTask>[1] }) =>
      apiClient.updateTask(id, data),
    onSuccess: (updatedTask, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'detail', updatedTask._id] });
      // Don't show toast for status updates to avoid spam during drag & drop
      if (!('status' in variables.data)) {
        toast({
          title: "Success",
          description: "Task updated successfully!"
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update task",
        variant: "destructive"
      });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: apiClient.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "Success",
        description: "Task deleted successfully!"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete task",
        variant: "destructive"
      });
    },
  });
};

// Hook for bulk status updates (drag & drop)
export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Task['status'] }) =>
      apiClient.updateTask(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: any) => {
      console.error('Failed to update task status:', error);
    },
  });
};
