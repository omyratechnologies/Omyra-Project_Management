import { useState, useMemo } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Search, Mail, Filter, Calendar, Users, TrendingUp, CheckCircle, UserCheck, Activity, X, Edit, Trash2, MoreVertical } from "lucide-react";
import { useTeam, useUpdateTeamMember, useDeleteTeamMember } from "@/hooks/useTeam";
import { useProjects } from "@/hooks/useProjects";
import { useTasks } from "@/hooks/useTasks";
import { useAuth } from "@/contexts/AuthContext";
import { AddMemberForm } from "@/components/forms/AddMemberForm";
import { TeamMember, TeamMemberStats } from "@/types/team";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TeamStats {
  totalMembers: number;
  admins: number;
  projectManagers: number;
  teamMembersCount: number;
  activeMembers: number;
  avgTasksPerMember: number;
}

const Team = () => {
  // State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [deletingMember, setDeletingMember] = useState<TeamMember | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Queries and mutations
  const { data: teamMembers = [], isLoading: teamLoading } = useTeam();
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const { data: tasks = [], isLoading: tasksLoading } = useTasks();
  const { profile } = useAuth();
  const deleteTeamMember = useDeleteTeamMember();

  // Debug logging
  console.log('Team Management Debug:', {
    teamMembers: teamMembers?.length || 0,
    projects: projects?.length || 0,
    tasks: tasks?.length || 0,
    teamMembersData: teamMembers,
    projectsData: projects,
    tasksData: tasks
  });

  const isLoading = teamLoading || projectsLoading || tasksLoading;

  // Computed values
  const canAddMember = profile?.role === 'admin';
  const filteredMembers = (teamMembers || []).filter((member: TeamMember) => {
    const matchesSearch = member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Calculate dynamic team statistics
  const teamStats = useMemo<TeamStats>(() => {
    const safeMembers = teamMembers || [];
    const safeProjects = projects || [];
    const safeTasks = tasks || [];
    
    const totalMembers = safeMembers.length;
    const admins = safeMembers.filter(m => m.role === 'admin').length;
    const projectManagers = safeMembers.filter(m => m.role === 'project_manager').length;
    const teamMembersCount = safeMembers.filter(m => m.role === 'team_member').length;
    
    // Calculate active members (those assigned to projects or tasks)
    const activeMembers = new Set();
    safeProjects.forEach(project => {
      project.members?.forEach((member: any) => {
        activeMembers.add(member.id || member);
      });
    });
    safeTasks.forEach(task => {
      if (task.assignedTo?.id) {
        activeMembers.add(task.assignedTo.id);
      }
    });
    
    // Calculate average tasks per member
    const membersWithTasks = safeMembers.filter(member => 
      safeTasks.some(task => task.assignedTo?.id === member.id)
    );
    const avgTasksPerMember = membersWithTasks.length > 0 
      ? Math.round(safeTasks.length / membersWithTasks.length) 
      : 0;
    
    return {
      totalMembers,
      admins,
      projectManagers,
      teamMembersCount,
      activeMembers: activeMembers.size,
      avgTasksPerMember
    };
  }, [teamMembers, projects, tasks]);

  // Event handlers
  const handleEditMember = (member: TeamMember) => {
    setEditingMember(member);
    setShowAddMemberForm(true);
  };

  const handleDeleteMember = (member: TeamMember) => {
    setDeletingMember(member);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deletingMember?.id) return;
    
    try {
      await deleteTeamMember.mutateAsync(deletingMember.id);
      setShowDeleteDialog(false);
      setDeletingMember(null);
    } catch (error) {
      console.error('Failed to delete team member:', error);
    }
  };

  const onMemberUpdated = () => {
    setEditingMember(null);
    setShowAddMemberForm(false);
  };

  // Helper functions
  const getMemberActivity = (member: TeamMember): TeamMemberStats => {
    console.log(`\n=== Checking activity for ${member.fullName} ===`);
    console.log('Member IDs:', { id: member.id, userId: member.userId, email: member.email });
    
    // Check projects
    console.log('All projects:', projects.map(p => ({
      id: p._id,
      title: p.title,
      members: p.members?.map(m => ({
        id: m.user?.id || m.user?._id || m.user,
        email: m.user?.email || m.user?.profile?.email,
        fullName: m.user?.profile?.fullName,
        rawMember: m
      }))
    })));
    
    const memberProjects = projects.filter(project => {
      const hasMatch = project.members?.some((m: any) => {
        const memberId = m.user?.id || m.user?._id || m.user;
        const memberEmail = m.user?.email || m.user?.profile?.email;
        const match = memberId === member.id || 
                     memberId === member.userId || 
                     memberEmail === member.email;
        if (match) {
          console.log('Project match found:', { projectTitle: project.title, memberId, memberEmail });
        }
        return match;
      });
      return hasMatch;
    }).length;
    
    // Check tasks  
    console.log('All tasks:', tasks.map(t => ({
      id: t._id,
      title: t.title,
      assignedTo: {
        id: t.assignedTo?.id || t.assignedTo?._id,
        email: t.assignedTo?.email,
        fullName: t.assignedTo?.profile?.fullName,
        rawAssignedTo: t.assignedTo
      },
      status: t.status
    })));
    
    const memberTasks = tasks.filter(task => {
      if (!task.assignedTo) return false;
      const assigneeId = task.assignedTo.id || task.assignedTo._id;
      const assigneeEmail = task.assignedTo.email;
      const match = assigneeId === member.id || 
                   assigneeId === member.userId || 
                   assigneeEmail === member.email;
      if (match) {
        console.log('Task match found:', { taskTitle: task.title, assigneeId, assigneeEmail });
      }
      return match;
    });
    
    const completedTasks = memberTasks.filter(task => task.status === 'done').length;
    
    console.log(`Results for ${member.fullName}:`, {
      memberProjects,
      memberTasks: memberTasks.length,
      completedTasks
    });
    console.log('=== End check ===\n');
    
    return {
      projects: memberProjects,
      tasks: memberTasks.length,
      completedTasks,
      completionRate: memberTasks.length > 0 ? Math.round((completedTasks / memberTasks.length) * 100) : 0
    };
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-indigo-100 text-indigo-800 border-indigo-200 ring-1 ring-indigo-300/50";
      case "project_manager":
        return "bg-blue-100 text-blue-800 border-blue-200 ring-1 ring-blue-300/50";
      case "team_member":
        return "bg-emerald-100 text-emerald-800 border-emerald-200 ring-1 ring-emerald-300/50";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200 ring-1 ring-slate-300/50";
    }
  };

  const getInitials = (name: string | undefined | null) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <main className="flex-1 p-1 overflow-auto">
            <div className="max-w-7xl mx-auto">
              <div className="animate-pulse space-y-8">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                
                {/* Stats cards skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
                
                {/* Team members grid skeleton */}
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Team Members</h1>
                <p className="text-gray-600">Manage your team and track their performance with real-time insights</p>
              </div>
              {canAddMember && (
                <Button 
                  className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-lg"
                  onClick={() => setShowAddMemberForm(true)}
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Member</span>
                </Button>
              )}
            </div>

            {/* Dynamic Statistics Cards with PM-focused colors */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="border-0 shadow-sm bg-gradient-to-br from-slate-50 to-slate-100 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-700">Total Members</p>
                      <p className="text-2xl font-bold text-slate-900">{teamStats.totalMembers}</p>
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
                      <p className="text-sm font-medium text-emerald-700">Active Members</p>
                      <p className="text-2xl font-bold text-emerald-900">{teamStats.activeMembers}</p>
                    </div>
                    <div className="p-3 bg-emerald-600 rounded-lg">
                      <UserCheck className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-700">Avg Tasks/Member</p>
                      <p className="text-2xl font-bold text-blue-900">{teamStats.avgTasksPerMember}</p>
                    </div>
                    <div className="p-3 bg-blue-600 rounded-lg">
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-indigo-50 to-indigo-100 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-indigo-700">Roles Distribution</p>
                      <p className="text-xs text-indigo-600 mt-1 font-medium">
                        {teamStats.admins}A • {teamStats.projectManagers}PM • {teamStats.teamMembersCount}TM
                      </p>
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
                  placeholder="Search team members..."
                  value={searchTerm}
                  onChange={(e) => {
                    console.log('Team search term changed:', e.target.value);
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
                {(searchTerm || roleFilter !== "all") && (
                  <div className="absolute -bottom-6 left-0 text-xs text-gray-500">
                    {filteredMembers.length} of {teamMembers.length} members
                    {searchTerm && ` matching "${searchTerm}"`}
                    {roleFilter !== "all" && ` with role "${roleFilter.replace('_', ' ')}"`}
                  </div>
                )}
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-48 border-0 shadow-sm">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="project_manager">Project Manager</SelectItem>
                  <SelectItem value="team_member">Team Member</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Team Members Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8" role="grid">
              {filteredMembers.map((member) => {
                const activity = getMemberActivity(member);
                const canModify = profile?.role === 'admin' || (profile?.role === 'project_manager' && member.role === 'team_member');
                
                return (
                  <Card 
                    key={member.id} 
                    className="group relative hover:shadow-xl transition-all duration-300 border-0 shadow-sm bg-white hover:-translate-y-1"
                    role="gridcell"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleEditMember(member);
                      }
                    }}
                  >
                    {canModify && (
                      <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <TooltipProvider>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                aria-label="Open member actions menu"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-36">
                              <DropdownMenuItem onClick={() => handleEditMember(member)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteMember(member)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TooltipProvider>
                      </div>
                    )}
                    
                    <CardHeader className="pb-4">
                      <div className="flex items-start space-x-4">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Avatar className="w-14 h-14 ring-2 ring-white shadow-lg">
                              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-blue-600 text-white text-lg font-semibold">
                                {getInitials(member.fullName)}
                              </AvatarFallback>
                            </Avatar>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{member.fullName}'s profile</p>
                          </TooltipContent>
                        </Tooltip>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg group-hover:text-indigo-600 transition-colors truncate">
                            {member.fullName}
                          </CardTitle>
                          <Badge className={getRoleColor(member.role)} variant="secondary">
                            {member.role.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{member.email}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{member.email}</p>
                        </TooltipContent>
                      </Tooltip>
                      
                      {/* Activity Stats with PM-focused colors */}
                      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100" role="group" aria-label="Member statistics">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="text-center">
                              <div className="text-lg font-bold text-slate-700">{activity.projects}</div>
                              <div className="text-xs text-gray-500">Projects</div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Assigned to {activity.projects} projects</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="text-center">
                              <div className="text-lg font-bold text-emerald-600">{activity.tasks}</div>
                              <div className="text-xs text-gray-500">Tasks</div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{activity.tasks} tasks assigned</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="text-center">
                              <div className="text-lg font-bold text-indigo-600">{activity.completionRate}%</div>
                              <div className="text-xs text-gray-500">Success</div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{activity.completionRate}% task completion rate</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      
                      <div className="pt-2 border-t border-gray-100">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <Calendar className="w-3 h-3" />
                              <span>Joined {new Date(member.createdAt).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Member since {new Date(member.createdAt).toLocaleDateString('en-US', { 
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            })}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredMembers.length === 0 && (
              <div className="col-span-full text-center py-12">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || roleFilter !== 'all' ? 'No team members found' : 'No team members yet'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || roleFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria' 
                    : 'Get started by adding your first team member'
                  }
                </p>
                {canAddMember && !searchTerm && roleFilter === 'all' && (
                  <Button
                    onClick={() => setShowAddMemberForm(true)}
                    className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-lg"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Team Member
                  </Button>
                )}
              </div>
            )}
          </div>
        </main>

        <AddMemberForm 
          open={showAddMemberForm} 
          onOpenChange={setShowAddMemberForm} 
          member={editingMember}
          onMemberUpdated={() => {
            setEditingMember(null);
            setShowAddMemberForm(false);
          }}
        />

        {/* Delete member confirmation dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-lg font-semibold">
                Delete Team Member
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this member? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowDeleteDialog(false)} />
              <AlertDialogAction 
                onClick={confirmDelete}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
  );
};

export default Team;
