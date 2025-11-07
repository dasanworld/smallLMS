'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutDashboard, BookOpen, ListChecks, TrendingUp, Settings } from 'lucide-react';
import { LogoutButton } from '@/components/logout-button';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';

const navItems = [
  { href: '/dashboard', label: '대시보드', icon: LayoutDashboard },
  { href: '/my/courses-list', label: '수강 중인 코스', icon: BookOpen },
  { href: '/my/assignments', label: '과제', icon: ListChecks },
  { href: '/my/progress', label: '진도 현황', icon: TrendingUp },
  { href: '/my/grades', label: '성적', icon: ListChecks },
  { href: '/my/settings', label: '설정', icon: Settings },
];

export function LearnerNav() {
  const pathname = usePathname();
  const { user, isLoading } = useCurrentUser();
  const emailLabel = isLoading ? '사용자 확인 중...' : user?.email ?? '이메일 정보 없음';

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
          <div className="flex items-center gap-2 overflow-x-auto">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-base font-semibold text-slate-900 hover:text-blue-700 hover:bg-blue-50 transition-colors whitespace-nowrap"
            >
              <Home className="w-4 h-4" />
              <span>홈</span>
            </Link>
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-900 font-medium'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </div>
          <div className="flex items-center gap-3 min-w-[200px] lg:justify-end">
            <span className="text-sm text-slate-600 truncate max-w-[200px] lg:max-w-none">{emailLabel}</span>
            <LogoutButton className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50" />
          </div>
        </div>
      </div>
    </nav>
  );
}
