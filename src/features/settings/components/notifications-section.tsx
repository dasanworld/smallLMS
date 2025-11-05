'use client';

import { Bell, Mail, AlertCircle, BookOpen, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useNotificationPreferences } from '../hooks/useNotificationPreferences';

export function NotificationsSection() {
  const { preferences, isLoading, error, updatePreferences, isUpdating } = useNotificationPreferences();

  const notificationOptions = [
    {
      key: 'emailNotifications' as const,
      icon: Mail,
      label: '이메일 알림',
      description: '중요한 소식을 이메일로 받습니다',
    },
    {
      key: 'assignmentReminders' as const,
      icon: AlertCircle,
      label: '과제 리마인더',
      description: '과제 마감일을 알려드립니다',
    },
    {
      key: 'gradeNotifications' as const,
      icon: BookOpen,
      label: '성적 알림',
      description: '성적이 평가되면 알려드립니다',
    },
    {
      key: 'courseUpdates' as const,
      icon: Bell,
      label: '강의 업데이트',
      description: '새로운 강의 자료가 추가되면 알려드립니다',
    },
    {
      key: 'pushNotifications' as const,
      icon: Volume2,
      label: '푸시 알림',
      description: '실시간 푸시 알림을 받습니다',
    },
  ];

  const handleToggle = (key: keyof typeof preferences) => {
    updatePreferences({
      ...preferences,
      [key]: !preferences[key],
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            알림 설정
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          알림 설정
        </CardTitle>
        <CardDescription>어떤 알림을 받을지 선택하세요</CardDescription>
      </CardHeader>
      <CardContent>
        {error && <p className="text-red-600 mb-4">알림 설정을 불러올 수 없습니다</p>}

        <div className="space-y-4">
          {notificationOptions.map(({ key, icon: Icon, label, description }) => (
            <div key={key} className="flex items-start justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="flex items-start gap-3 flex-1">
                <Icon className="w-5 h-5 text-slate-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <label className="text-sm font-medium text-slate-900 block cursor-pointer">{label}</label>
                  <p className="text-xs text-slate-600 mt-0.5">{description}</p>
                </div>
              </div>
              <Checkbox
                checked={preferences[key]}
                onCheckedChange={() => handleToggle(key)}
                disabled={isUpdating}
                className="mt-1"
              />
            </div>
          ))}
        </div>

        {isUpdating && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">설정을 저장 중입니다...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
