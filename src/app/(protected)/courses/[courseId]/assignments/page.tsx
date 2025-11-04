'use client';

import { useEffect, useState } from 'react';
import { AssignmentList } from '@/features/assignments/components/assignment-list';
import { useAssignmentsByCourseQuery } from '@/features/assignments/hooks/useAssignments';

type AssignmentListPageProps = {
  params: Promise<{ courseId: string }>;
};

export default function AssignmentListPage({ params }: AssignmentListPageProps) {
  const [courseId, setCourseId] = useState(0);

  useEffect(() => {
    params.then((p) => {
      setCourseId(parseInt(p.courseId, 10) || 0);
    });
  }, [params]);

  const { data, isLoading, error } = useAssignmentsByCourseQuery(courseId);

  if (!courseId) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <p className="text-center text-slate-600">코스 정보를 로드 중입니다...</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            {error instanceof Error ? error.message : '과제를 로드하는 중 오류가 발생했습니다'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">과제</h1>
      <AssignmentList assignments={data?.assignments || []} courseId={courseId} />
    </div>
  );
}
