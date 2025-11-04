'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import type { EnrollmentStatus } from '@/lib/shared/enrollment-types';

type EnrollmentMutationOptions = {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
};

export function useCreateEnrollmentMutation(options?: EnrollmentMutationOptions) {
  return useMutation({
    mutationFn: async (courseId: number) => {
      const response = await axios.post('/api/enrollments', { courseId });
      return response.data;
    },
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}

export function useCancelEnrollmentMutation(options?: EnrollmentMutationOptions) {
  return useMutation({
    mutationFn: async (courseId: number) => {
      const response = await axios.delete(`/api/enrollments/${courseId}`);
      return response.data;
    },
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}

export function useEnrollmentStatusQuery(courseId: number, enabled = true) {
  return useQuery({
    queryKey: ['enrollment-status', courseId],
    queryFn: async () => {
      const response = await axios.get<{ data: EnrollmentStatus }>(`/api/enrollments/${courseId}/status`);
      return response.data.data;
    },
    enabled: enabled && courseId > 0,
  });
}
