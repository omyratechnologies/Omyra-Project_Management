import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useTaskIssuesCount } from '../../hooks/useTasks';

interface TaskIssueCountProps {
  taskId: string;
}

export const TaskIssueCount: React.FC<TaskIssueCountProps> = ({ taskId }) => {
  const { data: issueCount, isLoading } = useTaskIssuesCount(taskId);

  if (isLoading) {
    return <Skeleton className="h-4 w-6 inline-block" />;
  }

  return (
    <span className="tabular-nums">
      Issues ({issueCount || 0})
    </span>
  );
};
