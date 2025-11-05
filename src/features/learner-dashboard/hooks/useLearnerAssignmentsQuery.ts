'use client';

import { useQuery } from '@tanstack/react-query';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';

export type LearnerAssignmentWithStatus = {
  id: number;
  courseId: number;
  courseTitle: string;
  assignmentTitle: string;
  description: string | null;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded' | 'overdue';
  submitted: boolean;
  submittedAt: string | null;
  score: number | null;
  daysUntilDue: number;
};

export type LearnerAssignmentsResponse = {
  assignments: LearnerAssignmentWithStatus[];
  stats: {
    total: number;
    pending: number;
    submitted: number;
    graded: number;
    overdue: number;
  };
};

export const useLearnerAssignmentsQuery = (status?: string) => {
  const { isAuthenticated } = useCurrentUser();

  return useQuery({
    queryKey: ['learnerAssignments', status],
    queryFn: async (): Promise<LearnerAssignmentsResponse> => {
      const params = status ? `?status=${status}` : '';
      const response = await fetch(`/api/learner/assignments${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch assignments');
      }
      return response.json();
    },
    enabled: isAuthenticated,
  });
};
