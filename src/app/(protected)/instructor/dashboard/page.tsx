'use client';

import Link from 'next/link';
import { DashboardOverview } from '@/features/instructor-dashboard/components/dashboard-overview';
import { RoleBadge } from '@/components/role-badge';
import { useAuthenticatedRole } from '@/features/auth/hooks/useAuthenticatedRole';
import { BookOpen, FileText, CheckCircle, User, Home } from 'lucide-react';

type InstructorDashboardPageProps = {
  params: Promise<Record<string, never>>;
};

export default function InstructorDashboardPage({ params }: InstructorDashboardPageProps) {
  void params;

  const { isLoading } = useAuthenticatedRole('instructor');

  if (isLoading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <Home className="w-5 h-5" />
                <span className="font-medium">홈</span>
              </Link>
              <div className="h-4 w-px bg-slate-300" />
              <span className="text-sm text-slate-500">강사 대시보드</span>
            </div>
            <RoleBadge />
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-2">
            📊 강사 대시보드
          </h1>
          <p className="text-slate-600 mt-2">코스 통계와 채점 현황을 한눈에 확인하세요</p>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">빠른 작업</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/instructor/courses"
              className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <BookOpen className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-medium text-slate-900">코스 관리</div>
                <div className="text-sm text-slate-600">코스 생성 및 관리</div>
              </div>
            </Link>

            <Link
              href="/instructor/assignments"
              className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
            >
              <FileText className="w-5 h-5 text-purple-600" />
              <div>
                <div className="font-medium text-slate-900">과제 관리</div>
                <div className="text-sm text-slate-600">과제 생성 및 게시</div>
              </div>
            </Link>

            <Link
              href="/instructor/grading"
              className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
            >
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-medium text-slate-900">제출물 채점</div>
                <div className="text-sm text-slate-600">학생 제출물 평가</div>
              </div>
            </Link>

            <Link
              href="/instructor/profile"
              className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:border-amber-300 hover:bg-amber-50 transition-colors"
            >
              <User className="w-5 h-5 text-amber-600" />
              <div>
                <div className="font-medium text-slate-900">프로필</div>
                <div className="text-sm text-slate-600">강사 정보 관리</div>
              </div>
            </Link>
          </div>
        </div>

        <DashboardOverview />
      </div>
    </div>
  );
}
