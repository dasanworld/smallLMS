'use client';

import { useQuery } from '@tanstack/react-query';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';

export type InstructorAssignmentWithStats = {
  id: number;
  courseId: number;
  courseTitle: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  scoreWeighting: number;
  allowLateSubmission: boolean;
  allowResubmission: boolean;
  status: 'draft' | 'published' | 'closed';
  createdAt: string;
  updatedAt: string;
  submissionStats: {
    total: number;
    submitted: number;
    graded: number;
    pending: number;
  };
};

export type InstructorAssignmentsResponse = {
  assignments: InstructorAssignmentWithStats[];
};

export const useInstructorAssignmentsQuery = (courseId?: number) => {
  const { isAuthenticated } = useCurrentUser();

  const queryParams = new URLSearchParams();
  if (courseId) queryParams.append('courseId', courseId.toString());

  return useQuery({
    queryKey: ['instructorAssignments', courseId],
    queryFn: async (): Promise<InstructorAssignmentsResponse> => {
      const response = await fetch(
        `/api/instructor/assignments${queryParams.toString() ? '?' + queryParams.toString() : ''}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch assignments');
      }
      return response.json();
    },
    enabled: isAuthenticated,
  });
};
