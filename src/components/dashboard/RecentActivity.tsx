
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CheckSquare, MessageCircle, FolderOpen, UserPlus } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { useTasks } from "@/hooks/useTasks";
import { useTeam } from "@/hooks/useTeam";

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

const formatTimeAgo = (date: string) => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return past.toLocaleDateString();
};

export function RecentActivity() {
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const { data: tasks = [], isLoading: tasksLoading } = useTasks();
  const { data: teamMembers = [], isLoading: teamLoading } = useTeam();

  const isLoading = projectsLoading || tasksLoading || teamLoading;

  // Create activity feed from recent data
  const createActivityFeed = () => {
    const activities: any[] = [];

    // Add recent project activities
    const recentProjects = projects
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 2);
    
    recentProjects.forEach(project => {
      if (project.createdBy?.profile) {
        activities.push({
          id: `project-${project._id}`,
          user: project.createdBy.profile.fullName,
          initials: getInitials(project.createdBy.profile.fullName),
          action: "created project",
          target: project.title,
          time: formatTimeAgo(project.createdAt),
          icon: FolderOpen,
          iconColor: "text-purple-600",
          timestamp: new Date(project.createdAt)
        });
      }
    });

    // Add recent task activities
    const recentTasks = tasks
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 3);

    recentTasks.forEach(task => {
      if (task.status === 'done' && task.assignedTo?.profile) {
        activities.push({
          id: `task-done-${task._id}`,
          user: task.assignedTo.profile.fullName,
          initials: getInitials(task.assignedTo.profile.fullName),
          action: "completed task",
          target: task.title,
          time: formatTimeAgo(task.updatedAt),
          icon: CheckSquare,
          iconColor: "text-green-600",
          timestamp: new Date(task.updatedAt)
        });
      } else if (task.createdBy?.profile) {
        activities.push({
          id: `task-created-${task._id}`,
          user: task.createdBy.profile.fullName,
          initials: getInitials(task.createdBy.profile.fullName),
          action: "created task",
          target: task.title,
          time: formatTimeAgo(task.createdAt),
          icon: CheckSquare,
          iconColor: "text-blue-600",
          timestamp: new Date(task.createdAt)
        });
      }
    });

    // Sort by most recent and limit to 4 items
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 4);
  };

  const activities = createActivityFeed();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start space-x-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No recent activity found. Start creating projects and tasks to see activity here!
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="text-xs bg-gray-100">
                  {activity.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <activity.icon className={`w-4 h-4 ${activity.iconColor}`} />
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.user}</span>{" "}
                    <span className="text-gray-600">{activity.action}</span>{" "}
                    <span className="font-medium">{activity.target}</span>
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
