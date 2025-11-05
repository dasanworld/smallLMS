'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useUserRole, type UserRole } from './useUserRole';

/**
 * 특정 역할을 요구하는 페이지에서 사용
 * 역할이 맞지 않으면 적절한 페이지로 리다이렉트
 */
export const useAuthenticatedRole = (requiredRole: UserRole | UserRole[]) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { role, isLoading } = useUserRole();

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['userRole'] });
  }, [queryClient]);

  useEffect(() => {
    if (isLoading) return;

    if (!role) {
      // 역할 정보가 없으면 로그인 페이지로
      router.replace('/login');
      return;
    }

    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

    if (!roles.includes(role)) {
      // 역할이 맞지 않으면 적절한 대시보드로 리다이렉트
      if (role === 'learner') {
        router.replace('/dashboard');
      } else if (role === 'instructor') {
        router.replace('/instructor/dashboard');
      } else if (role === 'operator') {
        router.replace('/admin');
      }
    }
  }, [role, isLoading, requiredRole, router]);

  return {
    role,
    isLoading,
    hasAccess: !isLoading && (Array.isArray(requiredRole) ? requiredRole.includes(role) : role === requiredRole),
  };
};
