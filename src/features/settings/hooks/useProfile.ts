'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UserProfile, UpdateProfileRequest } from '../types';

export const useProfile = () => {
  const queryClient = useQueryClient();

  const {
    data: profile,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['profile'],
    queryFn: async (): Promise<UserProfile> => {
      const response = await fetch('/api/settings/profile', {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('프로필을 가져올 수 없습니다');
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateProfileRequest): Promise<UserProfile> => {
      const response = await fetch('/api/settings/profile', {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('프로필 업데이트에 실패했습니다');
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['profile'], data);
    },
  });

  return {
    profile,
    isLoading,
    error,
    updateProfile: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,
  };
};
