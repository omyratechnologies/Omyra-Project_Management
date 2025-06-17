import { useState, useMemo } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Calendar, User, Filter, Clock, CheckCircle, AlertTriangle, TrendingUp, X } from "lucide-react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useTasks, useUpdateTaskStatus } from "@/hooks/useTasks";
import { useAuth } from "@/contexts/AuthContext";
import { NewTaskForm } from "@/components/forms/NewTaskForm";

// Task item component with drag and drop
const SortableTask = ({ task, getPriorityColor, getTaskUrgency, formatDueDate }: { 
  task: any; 
  getPriorityColor: (priority: string) => string;
  getTaskUrgency: (task: any) => string;
  formatDueDate: (dateString: string) => string;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const urgency = getTaskUrgency(task);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer ${
        isDragging ? 'opacity-50 rotate-2 scale-105' : ''
      } ${urgency === 'overdue' ? 'border-red-300 bg-red-50' : urgency === 'urgent' ? 'border-orange-300 bg-orange-50' : ''}`}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-medium text-gray-900 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
          {task.title}
        </h3>
        <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
          {urgency === 'overdue' && <AlertTriangle className="w-4 h-4 text-red-500" />}
          {urgency === 'urgent' && <Clock className="w-4 h-4 text-orange-500" />}
          <Badge className={getPriorityColor(task.priority)} variant="secondary">
            {task.priority.toUpperCase()}
          </Badge>
        </div>
      </div>
      {task.description && (
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}
      <div className="space-y-2">
        {task.dueDate && (
          <div className={`flex items-center space-x-1 text-xs ${
            urgency === 'overdue' ? 'text-red-600 font-medium' : 
            urgency === 'urgent' ? 'text-orange-600 font-medium' : 'text-gray-500'
          }`}>
            <Calendar className="w-3 h-3" />
            <span>
              {urgency === 'overdue' ? 'Overdue: ' : 'Due: '}
              {formatDueDate(task.dueDate)}
            </span>
          </div>
        )}
        {task.assignedTo && (
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <User className="w-3 h-3" />
            <span>{task.assignedTo.fullName || task.assignedTo.email}</span>
          </div>
        )}
        {task.project && (
          <div className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded inline-block">
            {task.project.title}
          </div>
        )}
      </div>
    </div>
  );
};

// Droppable column component
const DroppableColumn = ({ 
  column, 
  getPriorityColor,
  getTaskUrgency,
  formatDueDate
}: { 
  column: { id: string; title: string; tasks: any[] }; 
  getPriorityColor: (priority: string) => string;
  getTaskUrgency: (task: any) => string;
  formatDueDate: (dateString: string) => string;
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const getColumnIcon = (columnId: string) => {
    switch (columnId) {
      case 'todo':
        return <Clock className="w-4 h-4 text-gray-600" />;
      case 'in_progress':
        return <TrendingUp className="w-4 h-4 text-blue-600" />;
      case 'done':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return null;
    }
  };

  const getColumnColor = (columnId: string) => {
    switch (columnId) {
      case 'todo':
        return 'from-gray-50 to-gray-100';
      case 'in_progress':
        return 'from-blue-50 to-blue-100';
      case 'done':
        return 'from-green-50 to-green-100';
      default:
        return 'from-gray-50 to-gray-100';
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className={`pb-4 bg-gradient-to-r ${getColumnColor(column.id)} rounded-t-lg`}>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getColumnIcon(column.id)}
            <span className="font-semibold">{column.title}</span>
          </div>
          <Badge variant="secondary" className="bg-white/80 text-gray-700 font-medium">
            {column.tasks.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          ref={setNodeRef}
          className={`space-y-3 min-h-[300px] p-2 rounded-lg transition-all duration-200 ${
            isOver ? 'bg-blue-50 border-2 border-blue-300 border-dashed' : ''
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
              />
            ))}
          </SortableContext>
          
          {column.tasks.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                {getColumnIcon(column.id)}
              </div>
              <p className="text-sm">No tasks in {column.title.toLowerCase()}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const Tasks = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const { data: tasks = [], isLoading: tasksLoading } = useTasks();
  const { mutate: updateTaskStatus } = useUpdateTaskStatus();
  const { profile } = useAuth();

  const isLoading = tasksLoading;

  // Calculate dynamic task statistics (using all tasks, not filtered)
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

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

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

  // Filter tasks based on search and priority
  const safeTasks = tasks || [];
  const filteredTasks = safeTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.assignedTo?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.project?.title || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    
    // Debug logging
    if (searchTerm && searchTerm.length > 0) {
      console.log(`Filtering task "${task.title}": searchMatch=${matchesSearch}, priorityMatch=${matchesPriority}`);
    }
    
    return matchesSearch && matchesPriority;
  });

  // Group filtered tasks by status
  const groupedTasks = {
    todo: filteredTasks.filter(t => t.status === 'todo'),
    in_progress: filteredTasks.filter(t => t.status === 'in_progress'),
    done: filteredTasks.filter(t => t.status === 'done')
  };

  const columns = [
    { id: "todo", title: "To Do", tasks: groupedTasks.todo },
    { id: "in_progress", title: "In Progress", tasks: groupedTasks.in_progress },
    { id: "done", title: "Done", tasks: groupedTasks.done },
  ];

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveId(null);
    
    if (!over) return;

    const activeTaskId = active.id as string;
    const overColumnId = over.id as string;
    
    // Find the task being dragged from all tasks (not filtered)
    const activeTask = (tasks || []).find(task => task._id === activeTaskId);
    if (!activeTask) return;
    
    // If the task is being dropped in a different column, update its status
    if (activeTask.status !== overColumnId) {
      updateTaskStatus({ id: activeTaskId, status: overColumnId as "todo" | "in_progress" | "review" | "done" });
    }
  };

  const canCreateTask = profile?.role === 'admin' || profile?.role === 'project_manager';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f3f4f6] flex w-full">
        <Sidebar collapsed={sidebarCollapsed} onToggle={setSidebarCollapsed} />
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
          <TopBar onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />
          <main className="flex-1 p-6 overflow-auto">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fde8] flex w-full">
      <Sidebar collapsed={sidebarCollapsed} onToggle={setSidebarCollapsed} />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <TopBar onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-8">

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Task Board</h1>
                <p className="text-gray-600">Manage and track tasks with real-time Kanban board</p>
              </div>
              {canCreateTask && (
                <Button 
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  onClick={() => setShowNewTaskForm(true)}
                >
                  <Plus className="w-4 h-4" />
                  <span>New Task</span>
                </Button>
              )}
            </div>

            {/* Dynamic Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-blue-800 mb-1">Total Tasks</p>
                      <p className="text-xl font-bold text-blue-900">{taskStats.totalTasks}</p>
                    </div>
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-yellow-50 to-yellow-100">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-yellow-800 mb-1">To Do</p>
                      <p className="text-xl font-bold text-yellow-900">{taskStats.todoTasks}</p>
                    </div>
                    <div className="p-2 bg-yellow-500 rounded-lg">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-orange-800 mb-1">In Progress</p>
                      <p className="text-xl font-bold text-orange-900">{taskStats.inProgressTasks}</p>
                    </div>
                    <div className="p-2 bg-orange-500 rounded-lg">
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-green-800 mb-1">Completed</p>
                      <p className="text-xl font-bold text-green-900">{taskStats.doneTasks}</p>
                    </div>
                    <div className="p-2 bg-green-500 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-red-100">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-red-800 mb-1">Overdue</p>
                      <p className="text-xl font-bold text-red-900">{taskStats.overdueTasks}</p>
                    </div>
                    <div className="p-2 bg-red-500 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-purple-800 mb-1">Success Rate</p>
                      <p className="text-xl font-bold text-purple-900">{taskStats.completionRate}%</p>
                    </div>
                    <div className="p-2 bg-purple-500 rounded-lg">
                      <TrendingUp className="w-4 h-4 text-white" />
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
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => {
                    console.log('Tasks search term changed:', e.target.value);
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
                {(searchTerm || priorityFilter !== "all") && (
                  <div className="absolute -bottom-6 left-0 text-xs text-gray-500">
                    {filteredTasks.length} of {(tasks || []).length} tasks
                    {searchTerm && ` matching "${searchTerm}"`}
                    {priorityFilter !== "all" && ` with priority "${priorityFilter}"`}
                  </div>
                )}
              </div>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-48 border-0 shadow-sm">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Kanban Board */}
            <DndContext
              sensors={sensors}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                {columns.map((column) => (
                  <div key={column.id}>
                    <DroppableColumn 
                      column={column} 
                      getPriorityColor={getPriorityColor}
                      getTaskUrgency={getTaskUrgency}
                      formatDueDate={formatDueDate}
                    />
                  </div>
                ))}
              </div>
              <DragOverlay>
                {activeId ? (
                  <SortableTask
                    task={(tasks || []).find(task => task._id === activeId)!}
                    getPriorityColor={getPriorityColor}
                    getTaskUrgency={getTaskUrgency}
                    formatDueDate={formatDueDate}
                  />
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        </main>

        <NewTaskForm 
          open={showNewTaskForm} 
          onOpenChange={setShowNewTaskForm} 
        />
      </div>
    </div>
  );
};

export default Tasks;
