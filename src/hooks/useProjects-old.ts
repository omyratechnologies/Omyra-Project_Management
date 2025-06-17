
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Project {
  id: string;
  title: string;
  description?: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  start_date?: string;
  end_date?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const useProjects = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      console.log('Fetching projects...');
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          created_by_profile:profiles!projects_created_by_fkey(full_name),
          project_members(
            user_id,
            role_in_project,
            profiles(full_name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        throw error;
      }

      console.log('Projects fetched:', data);
      return data as Project[];
    }
  });

  const createProject = useMutation({
    mutationFn: async (projectData: {
      title: string;
      description?: string;
      start_date?: string;
      end_date?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          ...projectData,
          created_by: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: "Success",
        description: "Project created successfully"
      });
    },
    onError: (error) => {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive"
      });
    }
  });

  return {
    projects,
    isLoading,
    createProject: createProject.mutate
  };
};
