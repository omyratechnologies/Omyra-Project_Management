import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUpdateTeamMember } from "@/hooks/useTeam";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, UserPlus, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";

// Helper functions
const canModifyRole = (currentUserRole?: string, targetUserRole?: string) => {
  if (!currentUserRole || !targetUserRole) return false;
  if (currentUserRole === 'admin') return true;
  if (currentUserRole === 'project_manager' && targetUserRole === 'team_member') return true;
  return false;
};

// Schema for adding new members (all fields required)
const addMemberSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  fullName: z.string().min(1, "Full name is required").max(100, "Full name must be less than 100 characters"),
  role: z.enum(["admin", "project_manager", "team_member"]),
});

// Schema for editing existing members (optional fields except role)
const editMemberSchema = z.object({
  email: z.string().email("Please enter a valid email address").optional(),
  fullName: z.string().max(100, "Full name must be less than 100 characters").optional().or(z.literal("")),
  role: z.enum(["admin", "project_manager", "team_member"]),
});

type MemberFormData = z.infer<typeof addMemberSchema>;

interface AddMemberFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
  member?: any; // The member to edit
  onMemberUpdated?: () => void;
}

export function AddMemberForm({ open, onOpenChange, projectId, member, onMemberUpdated }: AddMemberFormProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const updateMember = useUpdateTeamMember();

  // Dynamic role options based on current user's role
  const availableRoles = useMemo(() => {
    const roles = [
      { value: "team_member", label: "Team Member", description: "Can view and work on assigned tasks" }
    ];

    if (profile?.role === 'admin' || profile?.role === 'project_manager') {
      roles.push({ 
        value: "project_manager", 
        label: "Project Manager", 
        description: "Can manage projects and team members" 
      });
    }

    if (profile?.role === 'admin') {
      roles.push({ 
        value: "admin", 
        label: "Administrator", 
        description: "Full access to all system features" 
      });
    }

    return roles;
  }, [profile?.role]);

  const form = useForm<MemberFormData>({
    resolver: zodResolver(member ? editMemberSchema : addMemberSchema),
    defaultValues: {
      email: member?.email || "",
      fullName: member?.fullName || "",
      role: member?.role || "team_member",
    },
  });

  // Reset form when member changes
  useEffect(() => {
    if (member) {
      form.reset({
        email: member.email,
        fullName: member.fullName,
        role: member.role,
      });
    } else {
      form.reset({
        email: "",
        fullName: "",
        role: "team_member",
      });
    }
  }, [member, form]);

  // Mutation for sending team invitation or updating member
  const addMemberMutation = useMutation({
    mutationFn: async (data: MemberFormData) => {
      if (member) {
        // Update existing member
        return updateMember.mutateAsync({
          id: member.id,
          data: {
            fullName: data.fullName,
            role: data.role,
          },
        });
      } else {
        // Add new member
        return apiClient.sendTeamInvitation({
          email: data.email,
          fullName: data.fullName,
          role: data.role,
          organizationName: "Omyra Project Nexus",
          projectId: projectId
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
      toast({
        title: member ? "Member Updated" : "Invitation Sent",
        description: member
          ? "Team member has been updated successfully!"
          : "Team invitation has been sent successfully!",
      });
      onOpenChange(false);
      if (onMemberUpdated) {
        onMemberUpdated();
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || `Failed to ${member ? 'update' : 'invite'} team member`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: MemberFormData) => {
    addMemberMutation.mutate(data);
  };

  // Check if user has permission to add members
  const canAddMembers = profile?.role === 'admin' || profile?.role === 'project_manager';

  if (!canAddMembers) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Access Denied</DialogTitle>
            <DialogDescription>
              You don't have permission to add team members. Only administrators and project managers can add new team members.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{member ? "Edit Team Member" : "Add Team Member"}</DialogTitle>
          <DialogDescription>
            {member
              ? "Update the team member's information below."
              : "Send an invitation to add a new team member."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Email{member ? " (cannot be changed)" : ""}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="member@example.com"
                      disabled={!!member}
                      aria-label="Email address"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Full Name{member ? " (optional)" : ""}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="John Doe"
                      aria-label="Full name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!canModifyRole(profile?.role, member?.role)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableRoles.map((role) => (
                        <SelectItem
                          key={role.value}
                          value={role.value}
                          className="flex items-center space-x-2"
                        >
                          <span>{role.label}</span>
                          <span className="text-xs text-gray-500">
                            - {role.description}
                          </span>
                        </SelectItem>
                      ))}
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
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700"
                disabled={addMemberMutation.isPending}
              >
                {addMemberMutation.isPending ? (
                  <div className="flex items-center">
                    <span className="mr-2">
                      {member ? "Updating..." : "Sending Invitation..."}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <UserPlus className="w-4 h-4 mr-2" />
                    <span>{member ? "Update Member" : "Send Invitation"}</span>
                  </div>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
