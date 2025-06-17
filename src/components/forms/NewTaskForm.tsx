import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateTask } from "@/hooks/useTasks";
import { useProjects } from "@/hooks/useProjects";
import { useTeam } from "@/hooks/useTeam";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  projectId: z.string().min(1, "Project is required"),
  assignedTo: z.string().optional(),
  dueDate: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface NewTaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewTaskForm({ open, onOpenChange }: NewTaskFormProps) {
  const { mutate: createTask, isPending } = useCreateTask();
  const { data: projects = [] } = useProjects();
  const { data: allTeamMembers = [] } = useTeam();

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      projectId: "",
      assignedTo: undefined,
      dueDate: "",
    },
  });

  const selectedProjectId = form.watch("projectId");
  
  // Get project members for the selected project
  const selectedProject = projects.find(p => p._id === selectedProjectId);
  const projectMembers = selectedProject?.members || [];
  
  // Convert project members to the format expected by the dropdown
  const availableMembers = projectMembers.map(pm => ({
    _id: pm._id,
    user: pm.user,
    fullName: pm.user.profile.fullName,
    email: pm.user.profile.email,
    role: pm.user.profile.role
  }));

  // Reset assignedTo when project changes
  useEffect(() => {
    if (selectedProjectId) {
      form.setValue("assignedTo", "");
    }
  }, [selectedProjectId, form]);

  const onSubmit = async (data: TaskFormData) => {
    const taskData = {
      title: data.title,
      description: data.description,
      priority: data.priority,
      projectId: data.projectId,
      assignedTo: data.assignedTo || undefined,
      dueDate: data.dueDate || undefined,
    };

    createTask(taskData, {
      onSuccess: () => {
        form.reset();
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Add a new task to your project. Assign it to team members and set priorities.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter task title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter task description (optional)"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="projectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a project" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project._id} value={project._id}>
                          {project.title}
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
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="assignedTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign To</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select team member (optional)" />
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
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
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
                {isPending ? "Creating..." : "Create Task"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
