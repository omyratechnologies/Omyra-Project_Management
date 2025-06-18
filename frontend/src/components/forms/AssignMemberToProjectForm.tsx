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

interface ProjectMember {
  _id: string;
  user: { 
    _id: string; 
    email: string;
    profile?: {
      fullName: string;
      email: string;
      role: string;
    };
  };
  roleInProject: string;
}

interface AssignMemberToProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectTitle: string;
  existingMembers?: ProjectMember[];
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
  const assignedUserIds = existingMembers
    .filter(member => member?.user?._id)
    .map(member => member.user._id.toString());

  const availableMembers = teamMembers.filter(member => {
    // Don't filter if we can't determine the ID
    const memberUserId = member?.userId || member?.id;
    return memberUserId && !assignedUserIds.includes(memberUserId.toString());
  });

  const assignMemberMutation = useMutation({
    mutationFn: async (data: AssignMemberFormData) => {
      try {
        // Find the team member to get their actual user ID
        const selectedMember = availableMembers.find(member => member.id.toString() === data.userId);
        if (!selectedMember) {
          throw new Error("Selected member not found");
        }

        console.log('Available members:', availableMembers);
        console.log('Selected member:', selectedMember);
        console.log('Sending data:', {
          userId: selectedMember.userId || selectedMember.id,
          roleInProject: data.roleInProject
        });

        const response = await apiClient.addProjectMember(projectId, {
          userId: selectedMember.userId || selectedMember.id,
          roleInProject: data.roleInProject
        });
        return response;
      } catch (error: any) {
        console.error('API Error:', error.response?.data);
        throw error;
      }
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
    onError: (error: any) => {
      console.error('Error assigning member:', error);
      const errorMessage = error.response?.data?.message || "Failed to assign team member to project";
      toast({
        title: "Error",
        description: errorMessage,
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
    onError: (error: any) => {
      console.error('Error removing member:', error);
      const errorMessage = error.response?.data?.message || "Failed to remove team member from project";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  });

  const onSubmit = async (data: AssignMemberFormData) => {
    if (!data.userId) {
      toast({
        title: "Error",
        description: "Please select a team member",
        variant: "destructive"
      });
      return;
    }
    assignMemberMutation.mutate(data);
  };

  const handleRemoveMember = (userId: string) => {
    if (!userId) {
      toast({
        title: "Error",
        description: "Invalid member ID",
        variant: "destructive"
      });
      return;
    }
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
                        {member.user?.profile?.fullName || member.user?.email?.split('@')[0] || 'Unknown User'}
                      </p>
                      <p className="text-xs text-gray-500">{member.user?.email || member.user?.profile?.email || 'No email'}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">
                        {member.roleInProject || 'member'}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveMember(member.user?._id)}
                        disabled={removeMemberMutation.isPending || !member.user?._id}
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
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a team member" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableMembers.map((member) => (
                              <SelectItem 
                                key={member.id} 
                                value={member.id}
                              >
                                {member.fullName || 'Unknown'} ({member.email || 'No email'})
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
                        <Select onValueChange={field.onChange} value={field.value}>
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
