'use client';

import { LearnerNav } from '@/features/learner-dashboard/components/learner-nav';
import { RoleBadge } from '@/components/role-badge';
import { useAuthenticatedRole } from '@/features/auth/hooks/useAuthenticatedRole';
import { FileText } from 'lucide-react';
import Link from 'next/link';
import { useLearnerAssignmentsAllQuery } from '@/features/learner-assignments/hooks/useLearnerAssignments';

type AssignmentsPageProps = {
  params: Promise<Record<string, never>>;
};

export default function AssignmentsPage({ params }: AssignmentsPageProps) {
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
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-10 h-10 text-blue-600" />
              과제 목록
            </h1>
            <p className="text-slate-600 mt-2">모든 코스의 과제를 확인하고 제출하세요</p>
          </div>
          <RoleBadge />
        </div>

        <AssignmentsListContent />
      </div>
    </div>
  );
}

function AssignmentsListContent() {
  const { data, isLoading, error, refetch, isFetching } = useLearnerAssignmentsAllQuery();
  const assignments = data?.assignments ?? [];
  // 주의: 데이터는 React Query를 통해 관리되며, 브라우저 콘솔 출력은 사용하지 않습니다.
  // UI는 빈 배열/로딩/에러 상태에 따라 적절히 분기합니다.

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-slate-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-700">과제를 불러오지 못했습니다. 잠시 후 다시 시도하세요.</p>
        <button
          onClick={() => void refetch()}
          disabled={isFetching}
          className="mt-4 px-4 py-2 rounded border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          {isFetching ? '새로고침 중...' : '새로고침'}
        </button>
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
        <p className="text-slate-600">수강 중인 과제가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">과제</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">코스</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">마감</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">상태</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">제출</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {assignments.map((a) => {
            const isPublish = a.status === 'published';
            return (
              <tr key={a.id}>
                <td className="px-6 py-3 text-sm text-slate-900">{a.title}</td>
                <td className="px-6 py-3 text-sm text-slate-600">{a.courseTitle}</td>
                <td className="px-6 py-3 text-sm text-slate-600">{a.dueDate ? new Date(a.dueDate).toLocaleDateString('ko-KR') : '-'}</td>
                <td className="px-6 py-3 text-sm text-slate-600">{a.status}</td>
                <td className="px-6 py-3 text-sm">
                  {isPublish ? (
                    <Link
                      href={`/my/courses/${a.courseId}/assignments/${a.id}/submit`}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-blue-300 text-blue-700 hover:bg-blue-50"
                      title="과제 제출"
                    >
                      제출
                    </Link>
                  ) : (
                    <button
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-400 cursor-not-allowed"
                      disabled
                      title="공개된 과제만 제출할 수 있습니다"
                    >
                      제출 불가
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

