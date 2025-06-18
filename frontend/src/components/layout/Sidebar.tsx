import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  FolderOpen, 
  CheckSquare, 
  Users, 
  Calendar,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  BookOpen,
  Building
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProjects } from "@/hooks/useProjects";
import { useTasks } from "@/hooks/useTasks";
import { useMemo } from "react";

interface SidebarProps {
  collapsed: boolean;
  onToggle: (collapsed: boolean) => void;
}

const getInitials = (name: string | null | undefined) => {
  if (!name) return '??';
  return name
    .split(' ')
    .map(n => n[0])
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
    case "client":
      return "bg-purple-100 text-purple-800";
    case "accountant":
      return "bg-yellow-100 text-yellow-800";
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
    case "client":
      return "Client";
    case "accountant":
      return "Accountant";
    default:
      return "User";
  }
};

interface NavigationItem {
  name: string;
  href: string;
  icon: any;  // Using any for Lucide icons
  badge: number | null;
  tourId: string;
  alertBadge?: boolean;
  roles?: string[]; // Optional roles restriction
}

const navigationItems: NavigationItem[] = [
  { 
    name: "Dashboard", 
    href: "/", 
    icon: LayoutDashboard,
    badge: null,
    tourId: "dashboard",
    roles: ["admin", "project_manager", "team_member", "accountant"] // Hide from clients
  },
  { 
    name: "Client Dashboard", 
    href: "/client-dashboard", 
    icon: LayoutDashboard,
    badge: null,
    tourId: "client-dashboard",
    roles: ["client"] // Only visible to clients
  },
  { 
    name: "Projects", 
    href: "/projects", 
    icon: FolderOpen,
    badge: null,
    tourId: "projects-link"
  },
  { 
    name: "Tasks", 
    href: "/tasks", 
    icon: CheckSquare,
    badge: null,
    tourId: "tasks-link",
    alertBadge: true,
    roles: ["admin", "project_manager", "team_member"] // Hide from clients and accountants
  },
  { 
    name: "Meetings", 
    href: "/meetings", 
    icon: Calendar,
    badge: null,
    tourId: "meetings"
  },
  { 
    name: "Team", 
    href: "/team", 
    icon: Users,
    badge: null,
    tourId: "team-link",
    roles: ["admin", "project_manager", "team_member"] // Hide from clients
  },
  { 
    name: "Knowledge Base", 
    href: "/confluence", 
    icon: BookOpen,
    badge: null,
    tourId: "confluence-link"
  },
  { 
    name: "Clients", 
    href: "/clients", 
    icon: Building,
    badge: null,
    tourId: "clients-link",
    roles: ["admin", "accountant"] // Only visible to admins and accountants
  },
  { 
    name: "Settings", 
    href: "/settings", 
    icon: Settings,
    badge: null,
    tourId: "settings-link"
  },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const { profile } = useAuth();
  const { data: projects = [] } = useProjects();
  const { data: tasks = [] } = useTasks();

  // Calculate dynamic badges for navigation items
  const navigationData = useMemo(() => {
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const myTasks = tasks.filter(t => 
      t.assignedTo?.id === profile?.id && t.status !== 'done'
    ).length;
    const overdueTasks = tasks.filter(t => 
      t.assignedTo?.id === profile?.id && 
      t.dueDate && 
      new Date(t.dueDate) < new Date() && 
      t.status !== 'done'
    ).length;

    return { activeProjects, myTasks, overdueTasks };
  }, [projects, tasks, profile]);

  // Filter navigation items based on user role
  const filteredNavigationItems = useMemo(() => {
    return navigationItems.filter(item => {
      if (!item.roles) return true; // Show items without role restrictions
      return item.roles.includes(profile?.role || '');
    });
  }, [profile?.role]);

  return (
    <div className={cn(
      "fixed left-0 top-0 h-full bg-white border-r border-gray-100 transition-all duration-300 z-30 shadow-sm",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex flex-col h-full">
        {/* Logo & Brand */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          {!collapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm">O</span>
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 text-sm">Omyra Technologies</h2>
                <p className="text-xs text-gray-500">Project Nexus</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggle(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            )}
          </Button>
        </div>

        {/* Search Bar */}
        {/* {!collapsed && (
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Search..." 
                className="pl-10 h-8 bg-gray-50 border-gray-200 focus:bg-white"
              />
            </div>
          </div>
        )} */}

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {filteredNavigationItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    data-tour={item.tourId}
                    className={cn(
                      "relative flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                      isActive 
                        ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-100 shadow-sm" 
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                      collapsed ? "justify-center" : "justify-start"
                    )}
                    title={collapsed ? item.name : undefined}
                  >
                    <div className="relative">
                      <item.icon className={cn(
                        "w-5 h-5 transition-colors",
                        collapsed ? "" : "mr-3",
                        isActive ? "text-blue-600" : "text-gray-600 group-hover:text-gray-700"
                      )} />
                      
                      {/* Alert badge for overdue tasks */}
                      {item.alertBadge && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    
                    {!collapsed && (
                      <>
                        <span className="truncate">{item.name}</span>
                        {item.badge && (
                          <Badge 
                            variant="secondary" 
                            className={cn(
                              "ml-auto text-xs px-1.5 py-0.5 h-5",
                              item.alertBadge 
                                ? "bg-red-100 text-red-700 border-red-200" 
                                : "bg-blue-100 text-blue-700 border-blue-200"
                            )}
                          >
                            {item.alertBadge || item.badge}
                          </Badge>
                        )}
                      </>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-100">
          {!collapsed ? (
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
              <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium">
                  {getInitials(profile?.fullName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {profile?.fullName || 'Loading...'}
                </p>
                <div className="flex items-center space-x-2">
                  <p className="text-xs text-gray-500 truncate">
                    {profile?.email || ''}
                  </p>
                  {profile?.role && (
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs px-1 py-0", getRoleColor(profile.role))}
                    >
                      {getRoleLabel(profile.role)}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <Avatar className="w-8 h-8 border-2 border-white shadow-sm cursor-pointer hover:scale-105 transition-transform">
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium text-xs">
                  {getInitials(profile?.fullName)}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
