import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Search, 
  Calendar, 
  User, 
  Filter, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  X, 
  Bug,
  LayoutGrid,
  List as ListIcon,
  GripVertical
} from "lucide-react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  closestCenter,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useTasks, useUpdateTaskStatus } from "@/hooks/useTasks";
import { useAuth } from "@/contexts/AuthContext";
import { useRBAC } from "@/hooks/useRBAC";
import { NewTaskForm } from "@/components/forms/NewTaskForm";
import { TaskIssues } from "@/components/tasks/TaskIssues";
import { TaskIssueCount } from "@/components/tasks/TaskIssueCount";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Task item component with drag and drop
interface Task {
  _id: string;
  title: string;
  description?: string;
  dueDate?: string;
  assignedTo?: {
    _id: string;
    fullName?: string;
    email: string;
  };
  priority: string;
  project?: {
    _id: string;
    title: string;
  };
}

// Common interface for task-related props
interface TaskViewProps {
  getPriorityColor: (priority: string) => string;
  getTaskUrgency: (task: Task) => string;
  formatDueDate: (dateString: string) => string;
  onViewIssues: (taskId: string, taskTitle: string) => void;
}

const SortableTask = ({ task, getPriorityColor, getTaskUrgency, formatDueDate, onViewIssues, mode = 'kanban' }: { 
  task: Task; 
  getPriorityColor: (priority: string) => string;
  getTaskUrgency: (task: Task) => string;
  formatDueDate: (dateString: string) => string;
  onViewIssues: (taskId: string, taskTitle: string) => void;
  mode?: 'kanban' | 'list';
} & TaskViewProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: task._id,
    transition: {
      duration: 150,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: 'none', // Prevents scrolling while trying to drag on touch devices
  };

  const urgency = getTaskUrgency(task);

  const baseClassName = mode === 'kanban' 
    ? 'bg-white border rounded-xl shadow-sm hover:shadow-md' 
    : 'bg-white border-b last:border-b-0 hover:bg-gray-50';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group relative touch-manipulation select-none ${baseClassName} transition-all cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-50 rotate-1 scale-105 shadow-lg z-50 ring-2 ring-blue-500' : ''
      } ${
        mode === 'kanban' ? (
          urgency === 'overdue' ? 'border-red-200 bg-red-50/50' : 
          urgency === 'urgent' ? 'border-orange-200 bg-orange-50/50' : 
          'border-gray-200'
        ) : ''
      } hover:border-blue-300`}
    >
      {/* Add a subtle visual indicator that appears on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-50/0 to-blue-50/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none" />

      <div className={`relative ${mode === 'kanban' ? 'p-4' : 'p-3'}`}>
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-medium text-gray-900 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
            {task.title}
          </h3>
          <div className="flex items-center gap-2 flex-shrink-0">
            {urgency === 'overdue' && (
              <div className="p-1 bg-red-100 rounded" title="Overdue">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
              </div>
            )}
            {urgency === 'urgent' && (
              <div className="p-1 bg-orange-100 rounded" title="Urgent">
                <Clock className="w-3.5 h-3.5 text-orange-600" />
              </div>
            )}
            <Badge className={`${getPriorityColor(task.priority)} select-none`} variant="secondary">
              {task.priority.toUpperCase()}
            </Badge>
          </div>
        </div>

        {task.description && mode === 'kanban' && (
          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        <div className={`flex ${mode === 'kanban' ? 'flex-col space-y-2' : 'items-center gap-4'}`}>
          {task.dueDate && (
            <div className={`flex items-center gap-1.5 text-xs ${
              urgency === 'overdue' ? 'text-red-600 font-medium' : 
              urgency === 'urgent' ? 'text-orange-600 font-medium' : 'text-gray-500'
            }`}>
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {urgency === 'overdue' ? 'Overdue: ' : 'Due: '}
                {formatDueDate(task.dueDate)}
              </span>
            </div>
          )}
          {task.assignedTo && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <User className="w-3.5 h-3.5" />
              <span>{task.assignedTo.fullName || task.assignedTo.email}</span>
            </div>
          )}
          {task.project && (
            <div className="inline-flex items-center text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full">
              {task.project.title}
            </div>
          )}
        </div>

        <div className={`flex items-center justify-between ${mode === 'kanban' ? 'mt-3 pt-2 border-t border-gray-100' : 'mt-2'}`}>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onViewIssues(task._id, task.title);
            }}
            className="h-7 px-2.5 text-xs hover:bg-gray-100 rounded-lg"
          >
            <Bug className="w-3.5 h-3.5 mr-1.5" />
            <TaskIssueCount taskId={task._id} />
          </Button>

          {/* Subtle grab indicator */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex gap-0.5">
              <div className="w-1 h-4 bg-gray-200 rounded-full" />
              <div className="w-1 h-4 bg-gray-200 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Task list view component
const TaskListView = ({
  tasks,
  getPriorityColor,
  getTaskUrgency,
  formatDueDate,
  onViewIssues
}: TaskViewProps & {
  tasks: Task[];
}) => {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-xl">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ListIcon className="w-5 h-5 text-gray-600" />
            <span className="font-semibold">All Tasks</span>
          </div>
          <Badge variant="secondary" className="bg-white/90 text-gray-700 font-medium px-2.5">
            {tasks.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-100">
          <SortableContext items={tasks.map(task => task._id)} strategy={verticalListSortingStrategy}>
            {tasks.map((task) => (
              <SortableTask
                key={task._id}
                task={task}
                getPriorityColor={getPriorityColor}
                getTaskUrgency={getTaskUrgency}
                formatDueDate={formatDueDate}
                onViewIssues={onViewIssues}
                mode="list"
              />
            ))}
          </SortableContext>

          {tasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <ListIcon className="w-12 h-12 mb-2 text-gray-300" />
              <p className="text-sm">No tasks found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Droppable column component
const DroppableColumn = ({ 
  column, 
  getPriorityColor,
  getTaskUrgency,
  formatDueDate,
  onViewIssues
}: TaskViewProps & { 
  column: { id: string; title: string; tasks: Task[] }; 
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const getColumnIcon = (columnId: string) => {
    switch (columnId) {
      case 'todo':
        return <Clock className="w-5 h-5 text-gray-600" />;
      case 'in_progress':
        return <TrendingUp className="w-5 h-5 text-blue-600" />;
      case 'done':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return null;
    }
  };

  const getColumnColor = (columnId: string) => {
    switch (columnId) {
      case 'todo':
        return 'from-gray-50 to-gray-100 border-gray-200/50';
      case 'in_progress':
        return 'from-blue-50 to-blue-100 border-blue-200/50';
      case 'done':
        return 'from-green-50 to-green-100 border-green-200/50';
      default:
        return 'from-gray-50 to-gray-100 border-gray-200/50';
    }
  };

  return (
    <Card 
      className={`border shadow-sm transition-all duration-200 ${
        isOver ? 'ring-2 ring-blue-400 shadow-md' : 'hover:shadow-md'
      }`}
    >
      <CardHeader className={`pb-4 bg-gradient-to-r ${getColumnColor(column.id)} rounded-t-xl border-b`}>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getColumnIcon(column.id)}
            <span className="font-semibold text-gray-900">{column.title}</span>
          </div>
          <Badge variant="secondary" className="bg-white/90 text-gray-700 font-medium px-2.5">
            {column.tasks.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <div
          ref={setNodeRef}
          className={`space-y-3 min-h-[calc(100vh-24rem)] rounded-lg transition-all duration-200 ${
            isOver ? 'bg-blue-50 border-2 border-blue-300 border-dashed p-3' : 'p-1'
          }`}
        >
          <SortableContext
            items={column.tasks.map(task => task._id)}
            strategy={verticalListSortingStrategy}
          >
            {column.tasks.map((task) => (
              <SortableTask
                key={task._id}
                task={task}
                getPriorityColor={getPriorityColor}
                getTaskUrgency={getTaskUrgency}
                formatDueDate={formatDueDate}
                onViewIssues={onViewIssues}
                mode="kanban"
              />
            ))}
          </SortableContext>
          
          {column.tasks.length === 0 && (
            <div className="flex flex-col items-center justify-center h-32 text-gray-400">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                {getColumnIcon(column.id)}
              </div>
              <p className="text-sm">Drop tasks here</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const dropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.5',
      },
    },
  }),
};

type ViewMode = 'kanban' | 'list';

export function Tasks() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedTaskTitle, setSelectedTaskTitle] = useState<string | null>(null);
  const [showTaskIssues, setShowTaskIssues] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const { data: tasks = [], isLoading: tasksLoading } = useTasks();
  const { mutate: updateTaskStatus } = useUpdateTaskStatus();
  const { profile } = useAuth();
  const rbac = useRBAC();

  const isLoading = tasksLoading;

  // Configure sensors for drag and drop with improved touch handling
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // Very short distance to start drag
        delay: 50, // Shorter delay for more responsive feel
        tolerance: 10, // Increased tolerance for better touch support
        pressure: 0, // No pressure requirement for touch devices
      },
    })
  );

  // Filter tasks based on search and priority
  const filteredTasks = useMemo(() => {
    const safeTasks = tasks || [];
    return safeTasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (task.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (task.assignedTo?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (task.project?.title || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
      
      return matchesSearch && matchesPriority;
    });
  }, [tasks, searchTerm, priorityFilter]);

  // Group filtered tasks by status
  const groupedTasks = useMemo(() => ({
    todo: filteredTasks.filter(t => t.status === 'todo'),
    in_progress: filteredTasks.filter(t => t.status === 'in_progress'),
    done: filteredTasks.filter(t => t.status === 'done')
  }), [filteredTasks]);

  // Memoize columns for better performance
  const columns = useMemo(() => [
    { id: "todo", title: "To Do", tasks: groupedTasks.todo },
    { id: "in_progress", title: "In Progress", tasks: groupedTasks.in_progress },
    { id: "done", title: "Done", tasks: groupedTasks.done },
  ], [groupedTasks]);

  // Calculate dynamic task statistics
  const taskStats = useMemo(() => {
    const safeTasks = tasks || [];
    
    const totalTasks = safeTasks.length;
    const todoTasks = safeTasks.filter(t => t.status === 'todo').length;
    const inProgressTasks = safeTasks.filter(t => t.status === 'in_progress').length;
    const doneTasks = safeTasks.filter(t => t.status === 'done').length;
    
    // Calculate overdue tasks
    const now = new Date();
    const overdueTasks = safeTasks.filter(t => 
      t.dueDate && 
      new Date(t.dueDate) < now && 
      t.status !== 'done'
    ).length;
    
    // Calculate urgent tasks (due within 3 days)
    const urgentTasks = safeTasks.filter(t => {
      if (!t.dueDate || t.status === 'done') return false;
      const dueDate = new Date(t.dueDate);
      const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilDue <= 3 && daysUntilDue >= 0;
    }).length;
    
    // Calculate completion rate
    const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
    
    return {
      totalTasks,
      todoTasks,
      inProgressTasks,
      doneTasks,
      overdueTasks,
      urgentTasks,
      completionRate
    };
  }, [tasks]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveId(null);
    
    if (!over) return;

    const activeTaskId = active.id as string;
    const activeTask = tasks?.find(task => task._id === activeTaskId);
    
    if (!activeTask) return;

    try {
      if (viewMode === 'kanban') {
        const overColumnId = over.id as string;
        
        // Validate if the column ID is valid
        if (!['todo', 'in_progress', 'done'].includes(overColumnId)) return;
        
        // Only update if dropping in a different column
        if (activeTask.status !== overColumnId) {
          await updateTaskStatus({ 
            id: activeTaskId, 
            status: overColumnId as "todo" | "in_progress" | "done"
          });
        }
      } else {
        // List view reordering
        const overId = over.id as string;
        if (activeTaskId !== overId) {
          // Implement list reordering logic here if needed
          console.log('List reordering:', { from: activeTaskId, to: overId });
        }
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTaskUrgency = (task: any) => {
    if (!task.dueDate) return 'normal';
    
    const dueDate = new Date(task.dueDate);
    const now = new Date();
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDue < 0) return 'overdue';
    if (daysUntilDue <= 1) return 'urgent';
    if (daysUntilDue <= 3) return 'attention';
    return 'normal';
  };

  const formatDueDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const canCreateTask = profile?.role === 'admin' || profile?.role === 'project_manager';

  const handleViewTaskIssues = (taskId: string, taskTitle: string) => {
    setSelectedTaskId(taskId);
    setSelectedTaskTitle(taskTitle);
    setShowTaskIssues(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
       <main className="flex-1 p-1 overflow-auto">
            <div className="max-w-7xl mx-auto">
              <div className="animate-pulse space-y-8">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                
                {/* Stats cards skeleton */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
                
                {/* Kanban columns skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-96 bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        <main className="flex-1 p-1 overflow-auto">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Header with improved spacing and alignment */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-6 rounded-xl shadow-sm">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Task Board</h1>
                  <p className="text-sm lg:text-base text-gray-600 mt-1">Manage and track tasks with real-time Kanban board</p>
                </div>
                {canCreateTask && (
                  <Button 
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-sm transition-all duration-200 px-6"
                    onClick={() => setShowNewTaskForm(true)}
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Task</span>
                  </Button>
                )}
              </div>

              {/* Dynamic Statistics Cards with improved layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-md transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-blue-800">Total Tasks</p>
                        <p className="text-2xl font-bold text-blue-900">{taskStats.totalTasks}</p>
                      </div>
                      <div className="p-2.5 bg-blue-500 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm bg-gradient-to-br from-yellow-50 to-yellow-100 hover:shadow-md transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-yellow-800">To Do</p>
                        <p className="text-2xl font-bold text-yellow-900">{taskStats.todoTasks}</p>
                      </div>
                      <div className="p-2.5 bg-yellow-500 rounded-lg">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100 hover:shadow-md transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-orange-800">In Progress</p>
                        <p className="text-2xl font-bold text-orange-900">{taskStats.inProgressTasks}</p>
                      </div>
                      <div className="p-2.5 bg-orange-500 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100 hover:shadow-md transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-green-800">Completed</p>
                        <p className="text-2xl font-bold text-green-900">{taskStats.doneTasks}</p>
                      </div>
                      <div className="p-2.5 bg-green-500 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-red-100 hover:shadow-md transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-red-800">Overdue</p>
                        <p className="text-2xl font-bold text-red-900">{taskStats.overdueTasks}</p>
                      </div>
                      <div className="p-2.5 bg-red-500 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-md transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-purple-800">Success Rate</p>
                        <p className="text-2xl font-bold text-purple-900">{taskStats.completionRate}%</p>
                      </div>
                      <div className="p-2.5 bg-purple-500 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters with view toggle */}
              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="relative flex-1 w-full sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search tasks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`pl-10 pr-10 bg-gray-50 border-0 shadow-sm focus:ring-2 focus:ring-blue-500 ${
                        searchTerm ? 'ring-2 ring-blue-500' : ''
                      }`}
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                      <SelectTrigger className="w-full sm:w-48 bg-gray-50 border-0 shadow-sm">
                        <div className="flex items-center gap-2">
                          <Filter className="w-4 h-4 text-gray-500" />
                          <SelectValue placeholder="Filter by priority" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex items-center bg-gray-50 rounded-lg shadow-sm p-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`p-1.5 ${viewMode === 'kanban' ? 'bg-white shadow-sm' : ''}`}
                        onClick={() => setViewMode('kanban')}
                        title="Kanban View"
                      >
                        <LayoutGrid className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`p-1.5 ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                        onClick={() => setViewMode('list')}
                        title="List View"
                      >
                        <ListIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                {/* Search Results Counter */}
                {(searchTerm || priorityFilter !== "all") && (
                  <div className="mt-3 px-1 text-sm text-gray-500">
                    Found <span className="font-medium">{filteredTasks.length}</span> of <span className="font-medium">{(tasks || []).length}</span> tasks
                    {searchTerm && <span className="text-blue-600"> matching "{searchTerm}"</span>}
                    {priorityFilter !== "all" && <span className="text-purple-600"> with {priorityFilter} priority</span>}
                  </div>
                )}
              </div>

              {/* Task Views */}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                {viewMode === 'kanban' ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    {columns.map((column) => (
                      <div key={column.id} className="transition-transform duration-200">
                        <DroppableColumn 
                          column={column} 
                          getPriorityColor={getPriorityColor}
                          getTaskUrgency={getTaskUrgency}
                          formatDueDate={formatDueDate}
                          onViewIssues={handleViewTaskIssues}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-8">
                    <TaskListView
                      tasks={filteredTasks}
                      getPriorityColor={getPriorityColor}
                      getTaskUrgency={getTaskUrgency}
                      formatDueDate={formatDueDate}
                      onViewIssues={handleViewTaskIssues}
                    />
                  </div>
                )}
                <DragOverlay dropAnimation={dropAnimation}>
                  {activeId ? (
                    <div className="transform scale-105 rotate-2">
                      <SortableTask
                        task={(tasks || []).find(task => task._id === activeId)!}
                        getPriorityColor={getPriorityColor}
                        getTaskUrgency={getTaskUrgency}
                        formatDueDate={formatDueDate}
                        onViewIssues={handleViewTaskIssues}
                        mode={viewMode}
                      />
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>

              <NewTaskForm 
                open={showNewTaskForm} 
                onOpenChange={setShowNewTaskForm} 
              />

              {/* Task Issues Dialog handled in the Dialog component at the bottom */}
            </div>
          </main>
        </div>

      {/* Task Issues Dialog */}
      <Dialog open={showTaskIssues} onOpenChange={setShowTaskIssues} modal>
        <DialogContent className="max-w-4xl h-[80vh] overflow-auto">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-xl font-semibold">
              Requirements Gathering
            </DialogTitle>
            <DialogDescription>
              View and manage issues related to this task
            </DialogDescription>
          </DialogHeader>

          {selectedTaskId ? (
            <div className="flex-1 overflow-auto py-4">
              <TaskIssues
                taskId={selectedTaskId}
                taskTitle={selectedTaskTitle || ''}
                open={showTaskIssues}
                onOpenChange={setShowTaskIssues}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-gray-500">
              No task selected
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Tasks;
