
import { Menu, Bell, Search, Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "./UserMenu";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTasks } from "@/hooks/useTasks";
import { useProjects } from "@/hooks/useProjects";
import { useTeam } from "@/hooks/useTeam";
import { useAuth } from "@/contexts/AuthContext";
import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface TopBarProps {
  onMenuClick: () => void;
}

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
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

export const TopBar = ({ onMenuClick }: TopBarProps) => {
  const { data: tasks = [] } = useTasks();
  const { data: projects = [] } = useProjects();
  const { data: teamMembers = [] } = useTeam();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Global search functionality
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    const results: any[] = [];

    // Search projects
    projects.forEach(project => {
      if (project.title.toLowerCase().includes(query) || 
          (project.description || '').toLowerCase().includes(query)) {
        results.push({
          type: 'project',
          id: project._id,
          title: project.title,
          subtitle: project.description || 'Project',
          path: '/projects'
        });
      }
    });

    // Search tasks
    tasks.forEach(task => {
      if (task.title.toLowerCase().includes(query) || 
          (task.description || '').toLowerCase().includes(query)) {
        results.push({
          type: 'task',
          id: task._id,
          title: task.title,
          subtitle: `Task • ${task.project?.title || 'No project'}`,
          path: '/tasks'
        });
      }
    });

    // Search team members
    teamMembers.forEach(member => {
      if (member.fullName.toLowerCase().includes(query) || 
          member.email.toLowerCase().includes(query)) {
        results.push({
          type: 'member',
          id: member._id,
          title: member.fullName,
          subtitle: `${member.role.replace('_', ' ')} • ${member.email}`,
          path: '/team'
        });
      }
    });

    return results.slice(0, 6); // Limit to 6 results
  }, [searchQuery, projects, tasks, teamMembers]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowSearchResults(false);
    if (showSearchResults) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showSearchResults]);

  const handleSearchResultClick = (result: any) => {
    navigate(result.path);
    setSearchQuery("");
    setShowSearchResults(false);
  };

  // Calculate notifications
  const notifications = useMemo(() => {
    if (!profile) return [];
    
    const myTasks = tasks.filter(t => t.assignedTo?._id === profile.id);
    const overdueTasks = myTasks.filter(t => 
      t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done'
    );
    const dueSoon = myTasks.filter(t => {
      if (!t.dueDate || t.status === 'done') return false;
      const dueDate = new Date(t.dueDate);
      const now = new Date();
      const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 3 && diffDays > 0;
    });

    const notificationList = [
      ...overdueTasks.map(task => ({
        id: `overdue-${task._id}`,
        type: 'overdue',
        title: 'Overdue Task',
        message: `"${task.title}" was due ${formatTimeAgo(task.dueDate!)}`,
        time: task.dueDate!,
        urgent: true
      })),
      ...dueSoon.map(task => ({
        id: `due-soon-${task._id}`,
        type: 'due_soon',
        title: 'Task Due Soon',
        message: `"${task.title}" is due soon`,
        time: task.dueDate!,
        urgent: false
      }))
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

    return notificationList;
  }, [tasks, profile]);

  const unreadCount = notifications.filter(n => n.urgent).length;

  return (
    <header className="h-16 border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-20 flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuClick}
          className="md:hidden p-2"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        {/* Search Bar - Hidden on mobile */}
        <div className="hidden md:flex relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
          <Input 
            placeholder="Search projects, tasks, or team members..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(e.target.value.trim().length > 0);
            }}
            onFocus={() => searchQuery.trim() && setShowSearchResults(true)}
            onClick={(e) => e.stopPropagation()}
            className="pl-10 w-80 h-9 bg-gray-50 border-gray-200 focus:bg-white focus:w-96 transition-all duration-200"
          />
          
          {/* Search Results Dropdown */}
          {showSearchResults && searchQuery.trim() && (
            <div className="absolute top-full mt-1 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
              {searchResults.length > 0 ? (
                <>
                  <div className="p-2 text-xs text-gray-500 font-medium border-b">
                    Search Results ({searchResults.length})
                  </div>
                  {searchResults.map((result) => (
                    <div
                      key={`${result.type}-${result.id}`}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      onClick={() => handleSearchResultClick(result)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          result.type === 'project' ? 'bg-blue-500' :
                          result.type === 'task' ? 'bg-green-500' :
                          'bg-purple-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {result.title}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {result.subtitle}
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {result.type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No results found for "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        {/* Quick Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="hidden sm:flex p-2">
              <Plus className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/projects')}>
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/tasks')}>
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/team')}>
              <Plus className="w-4 h-4 mr-2" />
              Add Team Member
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="relative p-2">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 hover:bg-red-600"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications ({notifications.length})</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length > 0 ? (
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notification) => (
                  <DropdownMenuItem 
                    key={notification.id}
                    className="p-3 cursor-pointer hover:bg-gray-50"
                  >
                    <div className="flex items-start space-x-3 w-full">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        notification.urgent ? 'bg-red-500' : 'bg-yellow-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 truncate">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTimeAgo(notification.time)}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
            ) : (
              <div className="p-3 text-center text-gray-500 text-sm">
                No notifications
              </div>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center justify-center">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Settings */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="hidden sm:flex p-2"
          onClick={() => navigate('/settings')}
        >
          <Settings className="h-4 w-4" />
        </Button>

        <UserMenu />
      </div>
    </header>
  );
};
