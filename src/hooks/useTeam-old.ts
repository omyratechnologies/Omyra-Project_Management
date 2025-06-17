
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'project_manager' | 'team_member';
  avatar_url?: string;
  created_at: string;
}

export const useTeam = () => {
  const { data: teamMembers = [], isLoading } = useQuery({
    queryKey: ['team'],
    queryFn: async () => {
      console.log('Fetching team members...');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching team members:', error);
        throw error;
      }

      console.log('Team members fetched:', data);
      return data as TeamMember[];
    }
  });

  return {
    teamMembers,
    isLoading
  };
};
