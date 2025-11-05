'use client';

import { useQuery } from '@tanstack/react-query';

export type InstructorProfile = {
  id: string;
  role: 'learner' | 'instructor' | 'operator';
  name: string;
  phone_number: string | null;
  created_at: string;
};

export const useInstructorProfileQuery = () => {
  return useQuery({
    queryKey: ['instructor-profile'],
    queryFn: async (): Promise<InstructorProfile> => {
      const res = await fetch('/api/instructor/profile');
      if (!res.ok) {
        throw new Error('프로필을 불러오지 못했습니다');
      }
      const json = await res.json();
      // API는 { profile } 형태로 반환
      return json.profile as InstructorProfile;
    },
  });
};


