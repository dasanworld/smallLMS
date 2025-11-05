'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LearnerAssignmentDetail } from '@/features/learner-assignments/components/learner-assignment-detail';
import { useLearnerAssignmentQuery } from '@/features/learner-assignments/hooks/useLearnerAssignments';
import { TopNav } from '@/components/top-nav';

type LearnerAssignmentDetailPageProps = {
  params: Promise<{ courseId: string; assignmentId: string }>;
};

export default function LearnerAssignmentDetailPage({ params }: LearnerAssignmentDetailPageProps) {
  const router = useRouter();
  const [courseId, setCourseId] = useState(0);
  const [assignmentId, setAssignmentId] = useState(0);

  useEffect(() => {
    params.then((p) => {
      setCourseId(parseInt(p.courseId, 10) || 0);
      setAssignmentId(parseInt(p.assignmentId, 10) || 0);
    });
  }, [params]);

  const { data: assignment, isLoading, error } = useLearnerAssignmentQuery(courseId, assignmentId);

  const handleSubmit = () => {
    router.push(`/my/courses/${courseId}/assignments/${assignmentId}/submit`);
  };

  if (!courseId || !assignmentId) {
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

      <LearnerAssignmentDetail
        assignment={assignment}
        courseId={courseId}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
