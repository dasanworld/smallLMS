'use client';

import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import type { OnboardingRequest } from '@/features/auth/backend/onboarding/schema';
import type { OnboardingResponse } from '@/features/auth/backend/onboarding/schema';

type UseOnboardingMutationOptions = {
  onSuccess?: (data: OnboardingResponse) => void;
  onError?: (error: Error) => void;
};

export function useOnboarding(options?: UseOnboardingMutationOptions) {
  return useMutation({
    mutationFn: async (data: OnboardingRequest) => {
      // 온보딩 데이터 제출. same-origin이므로 쿠키가 자동 전송되지만,
      // 일부 환경에 대비해 withCredentials를 유지
      const response = await axios.post<OnboardingResponse>('/api/auth/onboarding', data, {
        withCredentials: true,
      });
      return response.data;
    },
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}
