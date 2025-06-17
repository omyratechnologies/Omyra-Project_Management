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
import { Info } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const memberSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  fullName: z.string().min(1, "Full name is required").max(100, "Full name must be less than 100 characters"),
  role: z.enum(["admin", "project_manager", "team_member"]),
});

type MemberFormData = z.infer<typeof memberSchema>;

interface AddMemberFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddMemberForm({ open, onOpenChange }: AddMemberFormProps) {
  const [isPending, setIsPending] = useState(false);
  const { profile } = useAuth();
  const { toast } = useToast();

  const form = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      email: "",
      fullName: "",
      role: "team_member",
    },
  });

  const onSubmit = async (data: MemberFormData) => {
    setIsPending(true);
    try {
      // Note: This is a placeholder implementation
      // In a real application, you would call an API endpoint like:
      // await apiClient.inviteTeamMember(data);
      
      console.log("Would invite team member:", data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Invitation Sent",
        description: `Invitation sent to ${data.email}. They will receive an email to join the team.`,
      });
      
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to invite team member:", error);
      toast({
        title: "Error",
        description: "Failed to send invitation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
          <DialogDescription>
            Invite a new team member to your workspace. They will receive an invitation email.
          </DialogDescription>
        </DialogHeader>
        
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Note: This is a demo implementation. In a production environment, this would send an actual invitation email.
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="Enter email address" 
                      {...field} 
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
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter full name" {...field} />
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {profile?.role === 'admin' && (
                        <SelectItem value="admin">Admin</SelectItem>
                      )}
                      <SelectItem value="project_manager">Project Manager</SelectItem>
                      <SelectItem value="team_member">Team Member</SelectItem>
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
              <Button type="submit" disabled={isPending}>
                {isPending ? "Sending Invitation..." : "Send Invitation"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
