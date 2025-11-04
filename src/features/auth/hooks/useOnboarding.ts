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
      const response = await axios.post<OnboardingResponse>('/api/auth/onboarding', data);
      return response.data;
    },
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}
