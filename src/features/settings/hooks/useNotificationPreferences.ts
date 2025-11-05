'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { NotificationPreferences } from '../types';

export const useNotificationPreferences = () => {
  const queryClient = useQueryClient();

  const {
    data: preferences,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['notificationPreferences'],
    queryFn: async (): Promise<NotificationPreferences> => {
      const response = await fetch('/api/settings/notifications', {
        credentials: 'include',
      });
      if (!response.ok) {
        return {
          emailNotifications: true,
          assignmentReminders: true,
          gradeNotifications: true,
          courseUpdates: true,
          pushNotifications: false,
        };
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: NotificationPreferences): Promise<NotificationPreferences> => {
      const response = await fetch('/api/settings/notifications', {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('알림 설정 업데이트에 실패했습니다');
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['notificationPreferences'], data);
    },
  });

  return {
    preferences: preferences || {
      emailNotifications: true,
      assignmentReminders: true,
      gradeNotifications: true,
      courseUpdates: true,
      pushNotifications: false,
    },
    isLoading,
    error,
    updatePreferences: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,
  };
};
