'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import type { CreateAssignmentInput, UpdateAssignmentInput } from '@/features/assignments/backend/service';

export interface AssignmentResponse {
  id: number;
  courseId: number;
  title: string;
  description: string | null;
  dueDate: string;
  scoreWeighting: number;
  allowLateSubmission: boolean;
  allowResubmission: boolean;
  status: 'draft' | 'published' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export function useAssignmentsByCourseQuery(courseId: number) {
  return useQuery({
    queryKey: ['assignments-by-course', courseId],
    queryFn: async () => {
      const response = await axios.get<{ data: { assignments: AssignmentResponse[] } }>(`/api/courses/${courseId}/assignments`);
      return response.data.data;
    },
    enabled: courseId > 0,
  });
}

export function useCreateAssignmentMutation(courseId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateAssignmentInput) => {
      const response = await axios.post<{ data: AssignmentResponse }>(`/api/courses/${courseId}/assignments`, input);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments-by-course', courseId] });
    },
  });
}

export function useUpdateAssignmentMutation(courseId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ assignmentId, input }: { assignmentId: number; input: UpdateAssignmentInput }) => {
      const response = await axios.put<{ data: AssignmentResponse }>(`/api/courses/${courseId}/assignments/${assignmentId}`, input);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments-by-course', courseId] });
    },
  });
}

export function useUpdateAssignmentStatusMutation(courseId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ assignmentId, status }: { assignmentId: number; status: 'draft' | 'published' | 'closed' }) => {
      const response = await axios.patch<{ data: AssignmentResponse }>(`/api/courses/${courseId}/assignments/${assignmentId}/status`, { status });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments-by-course', courseId] });
    },
  });
}

export function useAssignmentQuery(assignmentId: number) {
  return useQuery({
    queryKey: ['assignment', assignmentId],
    queryFn: async () => {
      const response = await axios.get<{ data: AssignmentResponse }>(`/api/assignments/${assignmentId}`);
      return response.data.data;
    },
    enabled: assignmentId > 0,
  });
}
