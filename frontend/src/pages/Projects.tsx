import { useState, useMemo } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, Search, Calendar, Users, Filter, UserPlus, TrendingUp, 
  AlertTriangle, CheckCircle, X, MessageSquare, Edit, Trash2, 
  Eye, MoreVertical, Building
} from "lucide-react";
import { useProjects, useDeleteProject } from "@/hooks/useProjects";
import { useTasks } from "@/hooks/useTasks";
import { useAuth } from "@/contexts/AuthContext";
import { useRBAC } from "@/hooks/useRBAC";
import { NewProjectForm } from "@/components/forms/NewProjectForm";
import { EditProjectForm } from "@/components/forms/EditProjectForm";
import { ProjectDetails } from "@/components/project/ProjectDetails";
import { AssignMemberToProjectForm } from "@/components/forms/AssignMemberToProjectForm";
import { ClientAssignment } from "@/components/project/ClientAssignment";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Projects = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [showEditProjectForm, setShowEditProjectForm] = useState(false);
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [showClientAssignment, setShowClientAssignment] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const { data: tasks = [], isLoading: tasksLoading } = useTasks();
  const { mutate: deleteProject } = useDeleteProject();
  const { profile } = useAuth();
  const rbac = useRBAC();
  const isAdmin = profile?.role === 'admin';

  const isLoading = projectsLoading || tasksLoading;

  // Calculate dynamic project statistics
  const projectStats = useMemo(() => {
    const safeProjects = projects || [];
    const safeTasks = tasks || [];
    
    const totalProjects = safeProjects.length;
    const activeProjects = safeProjects.filter(p => p.status === 'active').length;
    const completedProjects = safeProjects.filter(p => p.status === 'completed').length;
    const onHoldProjects = safeProjects.filter(p => p.status === 'on_hold').length;
    
    // Calculate overall completion rate across all projects
    const overallCompletion = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;
    
    return {
      totalProjects,
      activeProjects,
      completedProjects,
      onHoldProjects,
      overallCompletion
    };
  }, [projects, tasks]);

  // Calculate dynamic progress for each project based on tasks
  const calculateProjectProgress = (project: any) => {
    const projectTasks = tasks.filter(task => task.project?.id === project.id);
    if (projectTasks.length === 0) return 0;
    
    const completedTasks = projectTasks.filter(task => task.status === 'done').length;
    return Math.round((completedTasks / projectTasks.length) * 100);
  };

  // Get project urgency level
  const getProjectUrgency = (project: any) => {
    if (!project.endDate) return 'normal';
    
    const endDate = new Date(project.endDate);
    const now = new Date();
    const daysUntilDue = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDue < 0) return 'overdue';
    if (daysUntilDue <= 7) return 'urgent';
    if (daysUntilDue <= 30) return 'attention';
    return 'normal';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-100 text-emerald-800 border-emerald-200 ring-1 ring-emerald-300/50";
      case "planning":
        return "bg-blue-100 text-blue-800 border-blue-200 ring-1 ring-blue-300/50";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200 ring-1 ring-green-300/50";
      case "on_hold":
        return "bg-amber-100 text-amber-800 border-amber-200 ring-1 ring-amber-300/50";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200 ring-1 ring-red-300/50";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200 ring-1 ring-slate-300/50";
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'overdue':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'urgent':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'attention':
        return <TrendingUp className="w-4 h-4 text-amber-600" />;
      default:
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredProjects = (projects || []).filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (project.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    
    // Debug logging
    if (searchTerm && searchTerm.length > 0) {
      console.log(`Filtering project "${project.title}": searchMatch=${matchesSearch}, statusMatch=${matchesStatus}`);
    }
    
    return matchesSearch && matchesStatus;
  });

  const canCreateProject = profile?.role === 'admin' || profile?.role === 'project_manager';

  const handleViewDetails = (project: any) => {
    setSelectedProject(project);
    setShowProjectDetails(true);
  };

  const handleEditProject = (project: any) => {
    setSelectedProject(project);
    setShowEditProjectForm(true);
  };

  const handleDeleteProject = (project: any) => {
    setSelectedProject(project);
    setShowDeleteDialog(true);
  };

  const handleManageMembers = (project: any) => {
    setSelectedProject(project);
    setShowMemberForm(true);
  };

  const handleClientAssignment = (project: any) => {
    setSelectedProject(project);
    setShowClientAssignment(true);
  };

  const confirmDelete = () => {
    if (selectedProject) {
      deleteProject(selectedProject.id);
      setShowDeleteDialog(false);
      setSelectedProject(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
          <main className="flex-1 p-1 overflow-auto">
            <div className="max-w-7xl mx-auto">
              <div className="animate-pulse space-y-6">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                
                {/* Stats cards skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
                
                {/* Projects grid skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
    );
  }

  return (
    <div className="space-y-8">
        <main className="flex-1 p-1 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Projects</h1>
                <p className="text-gray-600">Manage and track all your projects with real-time insights</p>
              </div>
              {canCreateProject && (
                <Button 
                  className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-lg"
                  onClick={() => setShowNewProjectForm(true)}
                >
                  <Plus className="w-4 h-4" />
                  <span>New Project</span>
                </Button>
              )}
            </div>

            {/* Dynamic Statistics Cards with PM-focused colors */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="border-0 shadow-sm bg-gradient-to-br from-slate-50 to-slate-100 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-700">Total Projects</p>
                      <p className="text-2xl font-bold text-slate-900">{projectStats.totalProjects}</p>
                    </div>
                    <div className="p-3 bg-slate-600 rounded-lg">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-emerald-100 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-emerald-700">Active Projects</p>
                      <p className="text-2xl font-bold text-emerald-900">{projectStats.activeProjects}</p>
                    </div>
                    <div className="p-3 bg-emerald-600 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-700">Completed</p>
                      <p className="text-2xl font-bold text-green-900">{projectStats.completedProjects}</p>
                    </div>
                    <div className="p-3 bg-green-600 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-indigo-50 to-indigo-100 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-indigo-700">Success Rate</p>
                      <p className="text-2xl font-bold text-indigo-900">{projectStats.overallCompletion}%</p>
                    </div>
                    <div className="p-3 bg-indigo-600 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => {
                    console.log('Projects search term changed:', e.target.value);
                    setSearchTerm(e.target.value);
                  }}
                  className={`pl-10 pr-10 border-0 shadow-sm ${searchTerm ? 'ring-2 ring-blue-500' : ''}`}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                {/* Search Results Counter */}
                {(searchTerm || statusFilter !== "all") && (
                  <div className="absolute -bottom-6 left-0 text-xs text-gray-500">
                    {filteredProjects.length} of {projects.length} projects
                    {searchTerm && ` matching "${searchTerm}"`}
                    {statusFilter !== "all" && ` with status "${statusFilter}"`}
                  </div>
                )}
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48 border-0 shadow-sm">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Projects Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {projects
                .filter((project) =>
                  project.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
                  (statusFilter === "all" || project.status === statusFilter)
                )
                .map((project) => {
                  const progress = calculateProjectProgress(project);
                  const urgency = getProjectUrgency(project);
                  
                  return (
                    <Card 
                      key={project._id} 
                      className="relative hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleViewDetails(project)}
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg group-hover:text-blue-600 transition-colors line-clamp-2">
                            {project.title}
                          </CardTitle>
                          <div className="flex items-center space-x-2">
                            {getUrgencyIcon(urgency)}
                            <Badge className={getStatusColor(project.status)} variant="secondary">
                              {project.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                        {project.description && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{project.description}</p>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Dynamic Progress */}
                        <div>
                          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                            <span>Progress</span>
                            <span className="font-medium">{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                          <div className="text-xs text-gray-500 mt-1">
                            {tasks.filter(t => t.project?.id === project._id && t.status === 'done').length} of{' '}
                            {tasks.filter(t => t.project?.id === project._id).length} tasks completed
                          </div>
                        </div>
                        
                        {/* Client Information */}
                        {project.client && (
                          <div className="flex items-center space-x-2 text-sm">
                            <Building className="w-4 h-4 text-blue-500" />
                            <span className="text-gray-600">Client:</span>
                            <span className="font-medium text-blue-700">{typeof project.client === 'string' ? project.client : project.client?.companyName || 'Unknown Client'}</span>
                          </div>
                        )}
                        
                        {/* Dates */}
                        {(project.startDate || project.endDate) && (
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {project.startDate && project.endDate 
                                  ? `${formatDate(project.startDate)} - ${formatDate(project.endDate)}`
                                  : project.startDate 
                                    ? `Started ${formatDate(project.startDate)}`
                                    : `Due ${formatDate(project.endDate)}`
                                }
                              </span>
                            </div>
                          </div>
                        )}
                        
                        {/* Action Buttons */}
                        <div className="flex items-center justify-between mt-4 pt-4 border-t">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetails(project);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </Button>

                            {isAdmin && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditProject(project);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                                Edit
                              </Button>
                            )}
                          </div>

                          {isAdmin && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleManageMembers(project);
                                  }}
                                >
                                  <UserPlus className="w-4 h-4 mr-2" />
                                  Manage Members
                                </DropdownMenuItem>
                                {(profile?.role === 'admin' || profile?.role === 'project_manager') && (
                                  <DropdownMenuItem 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleClientAssignment(project);
                                    }}
                                  >
                                    <Building className="w-4 h-4 mr-2" />
                                    Assign Client
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteProject(project);
                                  }}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete Project
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>

            {filteredProjects.length === 0 && (
              <div className="col-span-full text-center py-12">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || statusFilter !== 'all' ? 'No projects found' : 'No projects yet'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria' 
                    : 'Get started by creating your first project'
                  }
                </p>
                {canCreateProject && !searchTerm && statusFilter === 'all' && (
                  <Button
                    onClick={() => setShowNewProjectForm(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Project
                  </Button>
                )}
              </div>
            )}
          </div>
        </main>

        <NewProjectForm 
          open={showNewProjectForm} 
          onOpenChange={setShowNewProjectForm} 
        />
        
        {selectedProject && (
          <EditProjectForm
            open={showEditProjectForm}
            onOpenChange={setShowEditProjectForm}
            project={selectedProject}
          />
        )}

        {selectedProject && (
          <ProjectDetails
            open={showProjectDetails}
            onOpenChange={setShowProjectDetails}
            project={selectedProject}
            projectProgress={calculateProjectProgress(selectedProject)}
          />
        )}

        {selectedProject && (
          <AssignMemberToProjectForm
            open={showMemberForm}
            onOpenChange={setShowMemberForm}
            projectId={selectedProject.id}
            projectTitle={selectedProject.title}
            existingMembers={selectedProject.members}
          />
        )}

        {selectedProject && showClientAssignment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <ClientAssignment
                  project={selectedProject}
                  onUpdate={(updatedProject) => {
                    // Handle project update here - you might want to refresh the projects list
                    console.log('Project updated:', updatedProject);
                    setShowClientAssignment(false);
                    setSelectedProject(null);
                  }}
                  onClose={() => {
                    setShowClientAssignment(false);
                    setSelectedProject(null);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Project</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this project? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
  );
};

export default Projects;
