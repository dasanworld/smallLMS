'use client';

import { LearnerNav } from '@/features/learner-dashboard/components/learner-nav';
import { RoleBadge } from '@/components/role-badge';
import { useAuthenticatedRole } from '@/features/auth/hooks/useAuthenticatedRole';
import { ProfileSection } from '@/features/settings/components/profile-section';
import { NotificationsSection } from '@/features/settings/components/notifications-section';
import { Settings } from 'lucide-react';

type SettingsPageProps = {
  params: Promise<Record<string, never>>;
};

export default function SettingsPage({ params }: SettingsPageProps) {
  void params;

  const { isLoading } = useAuthenticatedRole('learner');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-slate-600">권한 확인 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <LearnerNav />
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-2">
              <Settings className="w-10 h-10 text-slate-600" />
              설정
            </h1>
            <p className="text-slate-600 mt-2">계정 및 알림 설정을 관리하세요</p>
          </div>
          <RoleBadge />
        </div>

        <div className="space-y-6">
          <ProfileSection />
          <NotificationsSection />
        </div>
      </div>
    </div>
  );
}

