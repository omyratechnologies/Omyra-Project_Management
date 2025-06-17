import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown,
  Target,
  Users,
  Clock,
  Award,
  Activity,
  Calendar,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon
} from "lucide-react";
import { useDashboardAnalytics } from "@/hooks/useDashboardAnalytics";

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export const ModernAnalyticsDashboard = () => {
  const { analytics, isLoading } = useDashboardAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="h-32 animate-pulse bg-gradient-to-r from-gray-100 to-gray-200" />
          ))}
        </div>
        <Card className="h-96 animate-pulse bg-gradient-to-r from-gray-100 to-gray-200" />
      </div>
    );
  }

  // Prepare chart data
  const taskStatusData = Object.entries(analytics.tasks.byStatus).map(([status, count]) => ({
    name: status.replace('_', ' ').toUpperCase(),
    value: count,
    percentage: Math.round((count / analytics.overview.totalTasks) * 100)
  }));

  const projectStatusData = Object.entries(analytics.projects.byStatus).map(([status, count]) => ({
    name: status.replace('_', ' ').toUpperCase(),
    value: count
  }));

  const completionTrendData = analytics.tasks.completionTrends.map(trend => ({
    ...trend,
    date: new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));

  const performanceMetrics = [
    {
      title: "Productivity Score",
      value: analytics.performance.productivityScore,
      max: 100,
      icon: <Target className="w-5 h-5" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      trend: analytics.performance.velocityTrend
    },
    {
      title: "Team Utilization",
      value: analytics.team.teamUtilization,
      max: 100,
      icon: <Users className="w-5 h-5" />,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      trend: 'stable' as const
    },
    {
      title: "Project Success Rate",
      value: analytics.projects.successRate,
      max: 100,
      icon: <Award className="w-5 h-5" />,
      color: "text-green-600",
      bgColor: "bg-green-50",
      trend: 'up' as const
    },
    {
      title: "Task Efficiency",
      value: analytics.performance.efficiencyRating,
      max: 100,
      icon: <Activity className="w-5 h-5" />,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      trend: analytics.performance.velocityTrend
    }
  ];

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Performance Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {performanceMetrics.map((metric, index) => (
          <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${metric.bgColor}`}>
                  <div className={metric.color}>
                    {metric.icon}
                  </div>
                </div>
                {getTrendIcon(metric.trend)}
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{metric.value}%</div>
                  <p className="text-sm text-gray-600 font-medium">{metric.title}</p>
                </div>
                
                <Progress value={metric.value} className="h-2" />
                
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0%</span>
                  <span>{metric.max}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Dashboard */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full lg:w-fit grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center space-x-2">
            <LineChartIcon className="w-4 h-4" />
            <span>Trends</span>
          </TabsTrigger>
          <TabsTrigger value="breakdown" className="flex items-center space-x-2">
            <PieChartIcon className="w-4 h-4" />
            <span>Breakdown</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Task Completion Trends */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <LineChartIcon className="w-5 h-5 text-blue-600" />
                  <span>Task Completion Trends</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={completionTrendData}>
                    <defs>
                      <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="createdGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
                    <YAxis stroke="#6B7280" fontSize={12} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Area type="monotone" dataKey="completed" stroke="#10B981" fillOpacity={1} fill="url(#completedGradient)" name="Completed" />
                    <Area type="monotone" dataKey="created" stroke="#3B82F6" fillOpacity={1} fill="url(#createdGradient)" name="Created" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Team Performance */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  <span>Top Performers</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.team.mostActiveMembers.map((member, index) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                          <span className="text-sm font-semibold text-blue-600">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{member.name}</p>
                          <p className="text-sm text-gray-500">{member.tasksCompleted} tasks completed</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-white">
                        {member.tasksCompleted}
                      </Badge>
                    </div>
                  ))}
                  
                  {analytics.team.mostActiveMembers.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No team activity data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Deadlines */}
          {analytics.projects.upcomingDeadlines.length > 0 && (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-red-600" />
                  <span>Upcoming Project Deadlines</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analytics.projects.upcomingDeadlines.map((project) => (
                    <div key={project.projectId} className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-medium text-gray-900 truncate">{project.title}</h4>
                        <Badge 
                          variant={project.daysLeft <= 3 ? "destructive" : project.daysLeft <= 7 ? "default" : "outline"}
                          className="text-xs"
                        >
                          {project.daysLeft}d left
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Progress</span>
                          <span>{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                        <p className="text-xs text-gray-500">
                          Due: {new Date(project.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={completionTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip />
                  <Line type="monotone" dataKey="completed" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }} />
                  <Line type="monotone" dataKey="created" stroke="#3B82F6" strokeWidth={3} dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Breakdown Tab */}
        <TabsContent value="breakdown" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Task Status Breakdown */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Task Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={taskStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {taskStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Project Status Breakdown */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Project Status Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={projectStatusData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="name" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
