'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Home, LayoutDashboard } from 'lucide-react';
import { RoleBadge } from '@/components/role-badge';
import { cn } from '@/lib/utils';

interface TopNavProps {
  title?: string;
  actions?: React.ReactNode;
  showBack?: boolean;
  className?: string;
}

export function TopNav({ title, actions, showBack = true, className }: TopNavProps) {
  const router = useRouter();

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
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
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
          <div className="ml-2">
            <RoleBadge />
          </div>
          {actions && <div className="ml-2">{actions}</div>}
        </div>
      </div>
    </div>
  );
}


