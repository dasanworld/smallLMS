'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, ListChecks, TrendingUp, Settings } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: '홈', icon: Home },
  { href: '/my/courses-list', label: '수강 중인 코스', icon: BookOpen },
  { href: '/my/assignments', label: '과제', icon: ListChecks },
  { href: '/my/progress', label: '진도 현황', icon: TrendingUp },
  { href: '/my/grades', label: '성적', icon: ListChecks },
  { href: '/my/settings', label: '설정', icon: Settings },
];

export function LearnerNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center gap-1 overflow-x-auto">
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
      </div>
    </nav>
  );
}
