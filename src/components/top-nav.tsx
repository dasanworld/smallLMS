'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Home, LayoutDashboard, Mail } from 'lucide-react';
import { RoleBadge } from '@/components/role-badge';
import { LogoutButton } from '@/components/logout-button';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { cn } from '@/lib/utils';

interface TopNavProps {
  title?: string;
  actions?: React.ReactNode;
  showBack?: boolean;
  className?: string;
}

export function TopNav({ title, actions, showBack = true, className }: TopNavProps) {
  const router = useRouter();
  const { user, isLoading } = useCurrentUser();
  const emailLabel = isLoading ? '사용자 확인 중...' : user?.email ?? '이메일 정보 없음';

  const handleBack = () => {
    // 브라우저 히스토리가 없을 경우 대시보드로 이동
    try {
      if (window.history.length > 1) {
        router.back();
      } else {
        router.push('/dashboard');
      }
    } catch {
      router.push('/dashboard');
    }
  };

  return (
    <div className={cn('w-full bg-white border-b', className)}>
      <div className="max-w-7xl mx-auto px-6 py-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3 min-w-0">
          {showBack && (
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100 text-slate-700"
              aria-label="뒤로가기"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">뒤로</span>
            </button>
          )}
          {title && (
            <h1 className="text-lg font-semibold text-slate-900 truncate">
              {title}
            </h1>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 lg:justify-end">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100 text-slate-700"
            >
              <Home className="w-4 h-4" />
              <span className="text-sm">홈</span>
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100 text-slate-700"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="text-sm">대시보드</span>
            </Link>
            <div className="hidden sm:block">
              <RoleBadge />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-sm text-slate-900 truncate max-w-[180px]">
              <Mail className="w-4 h-4 text-slate-500" />
              {emailLabel}
            </span>
            <LogoutButton className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50" />
            {actions && <div className="sm:ml-2">{actions}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

