'use client';

import { useQuery } from '@tanstack/react-query';
import { useCurrentUser } from './useCurrentUser';

export type UserRole = 'learner' | 'instructor' | 'operator' | null;

export const useUserRole = () => {
  const { isAuthenticated, user } = useCurrentUser();

  const { data: role, isLoading } = useQuery({
    queryKey: ['userRole', user?.id],
    queryFn: async (): Promise<UserRole> => {
      const response = await fetch('/api/auth/role', {
        credentials: 'include',
      });
      if (!response.ok) {
        return null;
      }
      const data = await response.json();
      return data.role || null;
    },
    enabled: isAuthenticated && !!user?.id,
    staleTime: 1000 * 60 * 5,
  });

  return {
    role: role || null,
    isLoading,
    isLearner: role === 'learner',
    isInstructor: role === 'instructor',
    isOperator: role === 'operator',
  };
};
