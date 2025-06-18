import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  Users,
  TrendingUp,
  BarChart2,
  Clock,
  Tag,
  Globe,
  Lock,
  Building,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { safeFormatDistanceToNow } from "@/utils/dateUtils";

interface ProjectDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: any;
  projectProgress: number;
}

export function ProjectDetails({
  open,
  onOpenChange,
  project,
  projectProgress,
}: ProjectDetailsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-100 text-emerald-800";
      case "planning":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "on_hold":
        return "bg-amber-100 text-amber-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            {project.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Priority */}
          <div className="flex items-center justify-between">
            <Badge className={getStatusColor(project.status)}>
              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </Badge>
            {project.priority && (
              <Badge className={getPriorityColor(project.priority)}>
                {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)} Priority
              </Badge>
            )}
          </div>

          {/* Description */}
          <div className="text-sm text-gray-600">{project.description}</div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progress</span>
              <span>{projectProgress}%</span>
            </div>
            <Progress value={projectProgress} className="h-2" />
          </div>

          {/* Client Information */}
          {project.client && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-sm">
                <Building className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-900">Client:</span>
                <span className="text-blue-800">{typeof project.client === 'string' ? project.client : project.client?.companyName || 'Unknown Client'}</span>
              </div>
              {project.client && typeof project.client === 'object' && project.client.contactPerson && (
                <div className="text-xs text-blue-700 mt-1 ml-6">
                  Contact: {project.client.contactPerson.name} ({project.client.contactPerson.email})
                </div>
              )}
            </div>
          )}

          {/* Project Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Start: {project.startDate ? format(new Date(project.startDate), 'MMM d, yyyy') : 'Not set'}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>End: {project.endDate ? format(new Date(project.endDate), 'MMM d, yyyy') : 'Not set'}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>Team Size: {project.members?.length || 0} members</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <BarChart2 className="w-4 h-4" />
              <span>Budget: ${project.budget?.toLocaleString() || 'Not set'}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Tag className="w-4 h-4" />
              <span>Category: {project.category || 'Uncategorized'}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              {project.isPublic ? (
                <Globe className="w-4 h-4" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              <span>{project.isPublic ? 'Public' : 'Private'} Project</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Building className="w-4 h-4" />
              <span>Client: {typeof project.client === 'string' ? project.client : project.client?.companyName || 'Not specified'}</span>
            </div>
          </div>

          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <div className="space-y-2">
              <span className="text-sm font-medium">Tags</span>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Project Timeline */}
          <div className="space-y-2">
            <span className="text-sm font-medium">Timeline</span>
            <div className="text-sm text-gray-600">
              {project.startDate && (
                <div>
                  Started {safeFormatDistanceToNow(project.startDate)}
                </div>
              )}
              {project.endDate && (
                <div>
                  {new Date(project.endDate) > new Date() ? 'Due' : 'Ended'}{' '}
                  {safeFormatDistanceToNow(project.endDate)}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
