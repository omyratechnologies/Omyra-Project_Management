import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useTeam } from "@/hooks/useTeam";
import { apiClient } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";

const assignMemberSchema = z.object({
  userId: z.string().min(1, "Please select a team member"),
  roleInProject: z.enum(["lead", "member", "contributor"]),
});

type AssignMemberFormData = z.infer<typeof assignMemberSchema>;

interface AssignMemberToProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectTitle: string;
  existingMembers?: Array<{
    _id: string;
    user: { _id: string; fullName: string; email: string };
    roleInProject: string;
  }>;
}

export function AssignMemberToProjectForm({ 
  open, 
  onOpenChange, 
  projectId, 
  projectTitle,
  existingMembers = []
}: AssignMemberToProjectFormProps) {
  const { toast } = useToast();
  const { data: teamMembers = [] } = useTeam();
  const queryClient = useQueryClient();

  const form = useForm<AssignMemberFormData>({
    resolver: zodResolver(assignMemberSchema),
    defaultValues: {
      userId: "",
      roleInProject: "member",
    },
  });

  // Get members not already assigned to this project
  const assignedUserIds = existingMembers.map(member => member.user._id);
  const availableMembers = teamMembers.filter(member => 
    !assignedUserIds.includes(member.user._id)
  );

  const assignMemberMutation = useMutation({
    mutationFn: async (data: AssignMemberFormData) => {
      return await apiClient.addProjectMember(projectId, {
        userId: data.userId,
        roleInProject: data.roleInProject
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project-members', projectId] });
      toast({
        title: "Success",
        description: "Team member assigned to project successfully"
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Error assigning member:', error);
      toast({
        title: "Error",
        description: "Failed to assign team member to project",
        variant: "destructive"
      });
    }
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiClient.removeProjectMember(projectId, userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project-members', projectId] });
      toast({
        title: "Success",
        description: "Team member removed from project"
      });
    },
    onError: (error) => {
      console.error('Error removing member:', error);
      toast({
        title: "Error",
        description: "Failed to remove team member from project",
        variant: "destructive"
      });
    }
  });

  const onSubmit = async (data: AssignMemberFormData) => {
    assignMemberMutation.mutate(data);
  };

  const handleRemoveMember = (userId: string) => {
    removeMemberMutation.mutate(userId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Project Members</DialogTitle>
          <DialogDescription>
            Assign team members to "{projectTitle}" and manage their roles.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Members */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Current Members</h4>
            {existingMembers.length > 0 ? (
              <div className="space-y-2">
                {existingMembers.map((member) => (
                  <div key={member._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {member.user.fullName}
                      </p>
                      <p className="text-xs text-gray-500">{member.user.email}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">
                        {member.roleInProject}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveMember(member.user._id)}
                        disabled={removeMemberMutation.isPending}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No members assigned to this project yet.</p>
            )}
          </div>

          {/* Add New Member */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Add New Member</h4>
            {availableMembers.length > 0 ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="userId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Team Member</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a team member" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableMembers.map((member) => (
                              <SelectItem key={member._id} value={member.user._id}>
                                {member.fullName} ({member.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="roleInProject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role in Project</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="lead">Project Lead</SelectItem>
                            <SelectItem value="member">Team Member</SelectItem>
                            <SelectItem value="contributor">Contributor</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                    >
                      Close
                    </Button>
                    <Button type="submit" disabled={assignMemberMutation.isPending}>
                      {assignMemberMutation.isPending ? "Assigning..." : "Assign Member"}
                    </Button>
                  </div>
                </form>
              </Form>
            ) : (
              <p className="text-sm text-gray-500">All team members are already assigned to this project.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
