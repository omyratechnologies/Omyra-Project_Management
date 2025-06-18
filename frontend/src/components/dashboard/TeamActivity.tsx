import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useTeam } from "@/hooks/useTeam";
import { useTasks } from "@/hooks/useTasks";
import { useProjects } from "@/hooks/useProjects";

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

const getRoleColor = (role: string) => {
  switch (role) {
    case "admin":
      return "bg-red-100 text-red-800";
    case "project_manager":
      return "bg-blue-100 text-blue-800";
    case "team_member":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getRoleLabel = (role: string) => {
  switch (role) {
    case "admin":
      return "Admin";
    case "project_manager":
      return "Project Manager";
    case "team_member":
      return "Team Member";
    default:
      return role;
  }
};

interface TeamMember {
  id: string;
  fullName: string;
  role: string;
  // add other properties as needed
}

export function TeamActivity() {
  const { data: teamMembers = [], isLoading: teamLoading } = useTeam();
  const { data: allTasks = [], isLoading: tasksLoading } = useTasks();
  const { data: projects = [], isLoading: projectsLoading } = useProjects();

  const isLoading = teamLoading || tasksLoading || projectsLoading;

  // Calculate member stats
  const getMemberStats = (memberId: string) => {
    const memberTasks = allTasks.filter(task => 
      task.assignedTo?.id === memberId || task.assignedTo?.user === memberId
    );
    const completedTasks = memberTasks.filter(task => task.status === 'done');
    
    // Find current project (most recent project with active tasks)
    const activeTasks = memberTasks.filter(task => task.status !== 'done');
    const currentProject = activeTasks.length > 0 
      ? activeTasks[0].project?.title || 'No active project'
      : 'No active project';
    
    return {
      tasksCompleted: completedTasks.length,
      currentProject
    };
  };

  // Limit to 4 members for overview
  const displayMembers = teamMembers.slice(0, 4);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Team Overview</span>
            <a href="/team" className="text-sm text-blue-600 hover:text-blue-800">
              View All Team
            </a>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={`skeleton-${i}`} className="p-4 border border-gray-200 rounded-lg">
                <div className="animate-pulse">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (teamMembers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Team Overview</span>
            <a href="/team" className="text-sm text-blue-600 hover:text-blue-800">
              View All Team
            </a>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No team members found. Start adding team members to see them here!
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Team Overview</span>
          <a href="/team" className="text-sm text-blue-600 hover:text-blue-800">
            View All Team
          </a>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayMembers.map((member: TeamMember) => {
            const stats = getMemberStats(member.id);
            const initials = getInitials(member.fullName);
            
            return (
              <div key={member.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                <div className="flex items-center space-x-3 mb-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-blue-100 text-blue-700">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{member.fullName}</h3>
                    <p className="text-sm text-gray-500 truncate">{getRoleLabel(member.role)}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Role</span>
                    <Badge className={getRoleColor(member.role)} variant="secondary">
                      {getRoleLabel(member.role)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Tasks Done</span>
                    <span className="text-sm font-medium text-gray-900">{stats.tasksCompleted}</span>
                  </div>
                  
                  <div>
                    <span className="text-xs text-gray-500">Current Project</span>
                    <p className="text-sm font-medium text-gray-900 truncate">{stats.currentProject}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
