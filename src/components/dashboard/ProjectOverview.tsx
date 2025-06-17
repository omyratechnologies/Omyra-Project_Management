
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Users } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { useTasks } from "@/hooks/useTasks";
import { Project } from "@/lib/api";

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-blue-100 text-blue-800";
    case "planning":
      return "bg-yellow-100 text-yellow-800";
    case "completed":
      return "bg-green-100 text-green-800";
    case "on_hold":
      return "bg-orange-100 text-orange-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "active":
      return "Active";
    case "planning":
      return "Planning";
    case "completed":
      return "Completed";
    case "on_hold":
      return "On Hold";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
};

const calculateProjectProgress = (project: Project, allTasks: any[]) => {
  const projectTasks = allTasks.filter(task => task.project._id === project._id || task.project === project._id);
  if (projectTasks.length === 0) return 0;
  
  const completedTasks = projectTasks.filter(task => task.status === 'done');
  return Math.round((completedTasks.length / projectTasks.length) * 100);
};

export function ProjectOverview() {
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const { data: allTasks = [], isLoading: tasksLoading } = useTasks();

  // Get the most recent projects (limit to 3 for overview)
  const recentProjects = projects.slice(0, 2);
  const isLoading = projectsLoading || tasksLoading;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Recent Projects</span>
            <a href="/projects" className="text-sm text-blue-600 hover:text-blue-800">
              View All
            </a>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="p-4 border border-gray-200 rounded-lg">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
                  <div className="h-2 bg-gray-200 rounded mb-2"></div>
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (projects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Recent Projects</span>
            <a href="/projects" className="text-sm text-blue-600 hover:text-blue-800">
              View All
            </a>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No projects found. Create your first project to get started!
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Recent Projects</span>
          <a href="/projects" className="text-sm text-blue-600 hover:text-blue-800">
            View All
          </a>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentProjects.map((project) => {
            const progress = calculateProjectProgress(project, allTasks);
            const memberCount = project.members?.length || 0;
            
            return (
              <div key={project._id} className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{project.title}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={getStatusColor(project.status)} variant="secondary">
                        {getStatusLabel(project.status)}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {project.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                )}
                
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {project.endDate 
                        ? `Due ${new Date(project.endDate).toLocaleDateString()}`
                        : 'No due date'
                      }
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{memberCount} members</span>
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
