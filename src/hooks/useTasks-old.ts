
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Task {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  due_date?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'review' | 'done';
  assigned_to?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  projects?: { title: string };
  assigned_profile?: { full_name: string };
}

export const useTasks = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      console.log('Fetching tasks...');
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          projects(title),
          assigned_profile:profiles!tasks_assigned_to_fkey(full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tasks:', error);
        throw error;
      }

      console.log('Tasks fetched:', data);
      return data as Task[];
    }
  });

  const updateTaskStatus = useMutation({
    mutationFn: async ({ taskId, status }: { 
      taskId: string; 
      status: 'todo' | 'in_progress' | 'review' | 'done' 
    }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update({ status })
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "Success",
        description: "Task status updated successfully"
      });
    },
    onError: (error) => {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive"
      });
    }
  });

  return {
    tasks,
    isLoading,
    updateTaskStatus: updateTaskStatus.mutate
  };
};
