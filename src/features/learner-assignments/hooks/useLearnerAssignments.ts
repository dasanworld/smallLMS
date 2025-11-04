'use client';

import { useQuery } from '@tanstack/react-query';
import type { AssignmentResponse, AssignmentListResponse } from '@/features/assignments/backend/schema';

const LEARNER_ASSIGNMENTS_QUERY_KEY = ['learner-assignments'] as const;

export const useLearnerAssignmentsByCourseQuery = (courseId: number) => {
  return useQuery({
    queryKey: [...LEARNER_ASSIGNMENTS_QUERY_KEY, 'by-course', courseId],
    queryFn: async (): Promise<AssignmentListResponse> => {
      const response = await fetch(`/api/learner/courses/${courseId}/assignments`);
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('이 과정에 등록되지 않았습니다.');
        }
        throw new Error(`Failed to fetch learner assignments: ${response.statusText}`);
      }

      const json = await response.json();
      if (!json.ok) {
        throw new Error(json.error?.message || 'Failed to fetch learner assignments');
      }

      return json.data;
    },
  });
};

export const useLearnerAssignmentQuery = (courseId: number, assignmentId: number) => {
  return useQuery({
    queryKey: [...LEARNER_ASSIGNMENTS_QUERY_KEY, courseId, assignmentId],
    queryFn: async (): Promise<AssignmentResponse> => {
      const response = await fetch(`/api/learner/courses/${courseId}/assignments/${assignmentId}`);
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('이 과정에 등록되지 않았습니다.');
        }
        if (response.status === 404) {
          throw new Error('과제를 찾을 수 없습니다.');
        }
        throw new Error(`Failed to fetch learner assignment: ${response.statusText}`);
      }

      const json = await response.json();
      if (!json.ok) {
        throw new Error(json.error?.message || 'Failed to fetch learner assignment');
      }

      return json.data;
    },
  });
};
