'use client';

import { useEffect, useState } from 'react';
import { AssignmentDetail } from '@/features/assignments/components/assignment-detail';
import { useAssignmentQuery } from '@/features/assignments/hooks/useAssignments';
import { TopNav } from '@/components/top-nav';

type AssignmentDetailPageProps = {
  params: Promise<{ assignmentId: string }>;
};

export default function AssignmentDetailPage({ params }: AssignmentDetailPageProps) {
  const [assignmentId, setAssignmentId] = useState(0);

  useEffect(() => {
    params.then((p) => {
      setAssignmentId(parseInt(p.assignmentId, 10) || 0);
    });
  }, [params]);

  const { data: assignment, isLoading, error } = useAssignmentQuery(assignmentId);

  if (!assignmentId) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <p className="text-center text-slate-600">과제 정보를 로드 중입니다...</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="h-96 bg-slate-200 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            {error instanceof Error ? error.message : '과제를 찾을 수 없습니다'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <TopNav title="과제 상세" />
      <div className="h-4" />
      <AssignmentDetail assignment={assignment} />
    </div>
  );
}
