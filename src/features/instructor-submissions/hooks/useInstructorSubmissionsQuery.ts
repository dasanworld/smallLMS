'use client';

import { useQuery } from '@tanstack/react-query';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';

export type SubmissionWithDetails = {
  id: number;
  assignmentId: number;
  assignmentTitle: string;
  courseId: number;
  courseTitle: string;
  userId: string;
  studentName: string;
  studentEmail: string;
  status: 'submitted' | 'graded' | 'resubmission_required';
  submittedAt: string;
  score: number | null;
  feedback: string | null;
  contentText: string;
  contentLink: string | null;
};

export type InstructorSubmissionsResponse = {
  submissions: SubmissionWithDetails[];
};

export const useInstructorSubmissionsQuery = (filters?: {
  courseId?: number;
  assignmentId?: number;
  status?: string;
  search?: string;
}) => {
  const { isAuthenticated } = useCurrentUser();

  const queryParams = new URLSearchParams();
  if (filters?.courseId) queryParams.append('courseId', filters.courseId.toString());
  if (filters?.assignmentId) queryParams.append('assignmentId', filters.assignmentId.toString());
  if (filters?.status) queryParams.append('status', filters.status);
  if (filters?.search) queryParams.append('search', filters.search);

  return useQuery({
    queryKey: ['instructorSubmissions', filters],
    queryFn: async (): Promise<InstructorSubmissionsResponse> => {
      const response = await fetch(`/api/instructor/submissions?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch submissions');
      }
      return response.json();
    },
    enabled: isAuthenticated,
  });
};
