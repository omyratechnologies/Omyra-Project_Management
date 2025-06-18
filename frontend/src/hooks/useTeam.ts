import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, Profile } from '../lib/api';
import { useToast } from './use-toast';

export const useTeam = (projectId?: string) => {
  return useQuery({
    queryKey: ['team', projectId],
    queryFn: () => apiClient.getTeamMembers(projectId),
  });
};

export const useTeamMember = (id: string) => {
  return useQuery({
    queryKey: ['team', 'member', id],
    queryFn: () => apiClient.getTeamMember(id),
    enabled: !!id,
  });
};

export const useUpdateTeamMember = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof apiClient.updateTeamMember>[1] }) =>
      apiClient.updateTeamMember(id, data),
    onSuccess: (updatedMember) => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
      queryClient.invalidateQueries({ queryKey: ['team', 'member', updatedMember.id] });
      toast({
        title: "Success",
        description: "Team member updated successfully!"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update team member",
        variant: "destructive"
      });
    },
  });
};

export const useDeleteTeamMember = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: apiClient.deleteTeamMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
      toast({
        title: "Success",
        description: "Team member deleted successfully!"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete team member",
        variant: "destructive"
      });
    },
  });
};
