import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartConfig, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useProjects } from "@/hooks/useProjects";
import { useTasks } from "@/hooks/useTasks";
import { useTeam } from "@/hooks/useTeam";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from "recharts";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calendar, Target } from "lucide-react";

export const DashboardCharts = () => {
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const { data: tasks = [], isLoading: tasksLoading } = useTasks();
  const { data: teamMembers = [], isLoading: teamLoading } = useTeam();

  const isLoading = projectsLoading || tasksLoading || teamLoading;

  // Chart data calculations
  const chartData = useMemo(() => {
    const safeTasks = tasks || [];
    const safeProjects = projects || [];
    const safeTeamMembers = teamMembers || [];

    // Task Status Distribution
    const taskStatusData = [
      { 
        name: 'To Do', 
        value: safeTasks.filter(t => t.status === 'todo').length,
        color: '#ef4444' // red-500
      },
      { 
        name: 'In Progress', 
        value: safeTasks.filter(t => t.status === 'in_progress').length,
        color: '#f59e0b' // amber-500
      },
      { 
        name: 'Done', 
        value: safeTasks.filter(t => t.status === 'done').length,
        color: '#10b981' // emerald-500
      }
    ];

    // Project Status Distribution
    const projectStatusData = [
      { 
        name: 'Planning', 
        value: safeProjects.filter(p => p.status === 'planning').length,
        color: '#6366f1' // indigo-500
      },
      { 
        name: 'Active', 
        value: safeProjects.filter(p => p.status === 'active').length,
        color: '#10b981' // emerald-500
      },
      { 
        name: 'On Hold', 
        value: safeProjects.filter(p => p.status === 'on_hold').length,
        color: '#f59e0b' // amber-500
      },
      { 
        name: 'Completed', 
        value: safeProjects.filter(p => p.status === 'completed').length,
        color: '#06b6d4' // cyan-500
      }
    ];

    // Weekly Progress (last 7 days)
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = date.toLocaleDateString('en', { weekday: 'short' });
      
      const tasksCompleted = safeTasks.filter(t => {
        if (t.status !== 'done') return false;
        const updatedDate = new Date(t.updatedAt);
        return updatedDate.toDateString() === date.toDateString();
      }).length;

      weeklyData.push({
        day: dayName,
        tasks: tasksCompleted,
        date: date.toISOString()
      });
    }

    // Team Productivity
    const teamProductivity = safeTeamMembers.map(member => {
      const memberTasks = safeTasks.filter(t => t.assignedTo?._id === member._id);
      const completedTasks = memberTasks.filter(t => t.status === 'done').length;
      const totalTasks = memberTasks.length;
      
      return {
        name: member.fullName.split(' ')[0], // First name only
        completed: completedTasks,
        total: totalTasks,
        percentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      };
    }).sort((a, b) => b.percentage - a.percentage).slice(0, 5);

    return {
      taskStatusData,
      projectStatusData,
      weeklyData,
      teamProductivity
    };
  }, [tasks, projects, teamMembers]);

  // Chart configurations
  const taskChartConfig: ChartConfig = {
    value: {
      label: "Tasks",
    },
  };

  const weeklyChartConfig: ChartConfig = {
    tasks: {
      label: "Tasks Completed",
      color: "hsl(var(--primary))",
    },
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Task Status Distribution */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-blue-600" />
            <span>Task Distribution</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={taskChartConfig} className="h-64">
            <PieChart>
              <Pie
                data={chartData.taskStatusData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
              >
                {chartData.taskStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ChartContainer>
          <div className="flex flex-wrap gap-2 mt-4">
            {chartData.taskStatusData.map((item) => (
              <Badge 
                key={item.name} 
                variant="outline" 
                className="flex items-center space-x-1"
              >
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span>{item.name}: {item.value}</span>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Progress */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span>Weekly Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={weeklyChartConfig} className="h-64">
            <AreaChart data={chartData.weeklyData}>
              <XAxis dataKey="day" />
              <YAxis />
              <Area 
                type="monotone" 
                dataKey="tasks" 
                stroke="#10b981" 
                fill="#10b981" 
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Project Status */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            <span>Project Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={taskChartConfig} className="h-64">
            <BarChart data={chartData.projectStatusData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.projectStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
              <ChartTooltip content={<ChartTooltipContent />} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Team Productivity */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-indigo-600" />
            <span>Top Performers</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {chartData.teamProductivity.length > 0 ? (
              chartData.teamProductivity.map((member, index) => (
                <div key={member.name} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{member.name}</p>
                      <p className="text-sm text-gray-600">{member.completed}/{member.total} tasks</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-300"
                        style={{ width: `${member.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700 w-10 text-right">
                      {member.percentage}%
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No team data available</p>
                <p className="text-sm">Assign tasks to team members to see productivity metrics</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
