'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AssignmentSubmit } from '@/features/learner-submissions/components/assignment-submit';
import { useLearnerAssignmentQuery } from '@/features/learner-assignments/hooks/useLearnerAssignments';

type AssignmentSubmitPageProps = {
  params: Promise<{ courseId: string; assignmentId: string }>;
};

export default function AssignmentSubmitPage({ params }: AssignmentSubmitPageProps) {
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
      <Link
        href={`/my/courses/${courseId}/assignments/${assignmentId}`}
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        과제로 돌아가기
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">{assignment.title}</h1>
        <p className="text-slate-600 mt-2">과제 제출</p>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-8">
        <AssignmentSubmit
          assignmentId={assignmentId}
          courseId={courseId}
          title={assignment.title}
        />
      </div>
    </div>
  );
}
