import { useQuery } from '@tanstack/react-query';
import { apiClient, ProjectMember } from '../lib/api';

export const useProjectMembers = (projectId: string) => {
  return useQuery({
    queryKey: ['project-members', projectId],
    queryFn: async () => {
      // We can get project members by fetching the specific project
      const project = await apiClient.getProject(projectId);
      return project.members || [];
    },
    enabled: !!projectId,
  });
};
