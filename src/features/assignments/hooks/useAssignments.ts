'use client';

import { useQuery } from '@tanstack/react-query';
import type { AssignmentResponse, AssignmentListResponse } from '@/features/assignments/backend/schema';

const ASSIGNMENTS_QUERY_KEY = ['assignments'] as const;

export const useAssignmentsByCourseQuery = (courseId: number, status?: string) => {
  return useQuery({
    queryKey: [...ASSIGNMENTS_QUERY_KEY, 'by-course', courseId, status],
    queryFn: async (): Promise<AssignmentListResponse> => {
      const url = new URL(`/api/courses/${courseId}/assignments`, window.location.origin);
      if (status) {
        url.searchParams.append('status', status);
      }

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`Failed to fetch assignments: ${response.statusText}`);
      }

      const json = await response.json();
      if (!json.ok) {
        throw new Error(json.error?.message || 'Failed to fetch assignments');
      }

      return json.data;
    },
  });
};

export const useAssignmentQuery = (assignmentId: number) => {
  return useQuery({
    queryKey: [...ASSIGNMENTS_QUERY_KEY, assignmentId],
    queryFn: async (): Promise<AssignmentResponse> => {
      const response = await fetch(`/api/assignments/${assignmentId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch assignment: ${response.statusText}`);
      }

      const json = await response.json();
      if (!json.ok) {
        throw new Error(json.error?.message || 'Failed to fetch assignment');
      }

      return json.data;
    },
  });
};
