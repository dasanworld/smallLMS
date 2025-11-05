'use client';

import { Users, BookOpen, Shield } from 'lucide-react';
import { useUserRole } from '@/features/auth/hooks/useUserRole';

export function RoleBadge() {
  const { role, isLoading } = useUserRole();

  if (isLoading || !role) {
    return null;
  }

  const roleConfig = {
    learner: {
      label: '학습자',
      icon: <Users className="w-4 h-4" />,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200',
    },
    instructor: {
      label: '강사',
      icon: <BookOpen className="w-4 h-4" />,
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-200',
    },
    operator: {
      label: '운영자',
      icon: <Shield className="w-4 h-4" />,
      bgColor: 'bg-amber-100',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-200',
    },
  };

  const config = roleConfig[role as keyof typeof roleConfig];

  if (!config) {
    return null;
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${config.bgColor} ${config.textColor} ${config.borderColor}`}
    >
      {config.icon}
      <span>{config.label}</span>
    </div>
  );
}
