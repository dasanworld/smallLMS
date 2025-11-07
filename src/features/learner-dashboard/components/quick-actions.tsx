'use client';

import Link from 'next/link';
import { Search, BookOpen, FileText, BarChart, Target, MessageSquare } from 'lucide-react';

interface QuickAction {
  href: string;
  label: string;
  description: string;
  icon: React.ElementType;
  color: {
    icon: string;
    border: string;
    bg: string;
  };
}

const quickActions: QuickAction[] = [
  {
    href: '/courses',
    label: '코스 탐색',
    description: '새로운 코스 찾기',
    icon: Search,
    color: {
      icon: 'text-blue-600',
      border: 'border-blue-300',
      bg: 'bg-blue-50',
    },
  },
  {
    href: '/my/courses-list',
    label: '내 코스',
    description: '수강 중인 코스 보기',
    icon: BookOpen,
    color: {
      icon: 'text-purple-600',
      border: 'border-purple-300',
      bg: 'bg-purple-50',
    },
  },
  {
    href: '/my/assignments',
    label: '과제 제출',
    description: '제출할 과제 확인',
    icon: FileText,
    color: {
      icon: 'text-green-600',
      border: 'border-green-300',
      bg: 'bg-green-50',
    },
  },
  {
    href: '/my/progress',
    label: '학습 진도',
    description: '진도율 확인',
    icon: BarChart,
    color: {
      icon: 'text-amber-600',
      border: 'border-amber-300',
      bg: 'bg-amber-50',
    },
  },
  {
    href: '/my/grades',
    label: '성적 확인',
    description: '성적 및 피드백 보기',
    icon: Target,
    color: {
      icon: 'text-red-600',
      border: 'border-red-300',
      bg: 'bg-red-50',
    },
  },
  {
    href: '/my/feedback',
    label: '피드백',
    description: '최근 피드백 확인',
    icon: MessageSquare,
    color: {
      icon: 'text-indigo-600',
      border: 'border-indigo-300',
      bg: 'bg-indigo-50',
    },
  },
];

export function QuickActions() {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">빠른 작업</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className={`flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:${action.color.border} hover:${action.color.bg} transition-colors`}
            >
              <Icon className={`w-5 h-5 ${action.color.icon}`} />
              <div>
                <div className="font-medium text-slate-900">{action.label}</div>
                <div className="text-sm text-slate-600">{action.description}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}



