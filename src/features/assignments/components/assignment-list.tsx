'use client';

import Link from 'next/link';
import type { AssignmentResponse } from '@/features/assignments/backend/schema';

type AssignmentListProps = {
  assignments: AssignmentResponse[];
  courseId: number;
  isLearnerView?: boolean;
};

export function AssignmentList({ assignments, courseId, isLearnerView = false }: AssignmentListProps) {
  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '마감일 없음';
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDaysUntilDue = (dueDate: string | null): number | null => {
    if (!dueDate) return null;
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const isOverdue = (dueDate: string | null): boolean => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  if (assignments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 p-8 text-center">
        <p className="text-slate-600">과제가 없습니다.</p>
      </div>
    );
  }

  const href = (assignmentId: number) => {
    return isLearnerView
      ? `/my/courses/${courseId}/assignments/${assignmentId}`
      : `/courses/${courseId}/assignments/${assignmentId}`;
  };

  return (
    <div className="flex flex-col gap-3">
      {assignments.map((assignment) => {
        const daysUntilDue = getDaysUntilDue(assignment.dueDate);
        const overdue = isOverdue(assignment.dueDate);

        return (
          <Link key={assignment.id} href={href(assignment.id)}>
            <div className="flex flex-col gap-2 rounded-lg border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-semibold text-slate-900">{assignment.title}</h3>
                <div className="flex gap-1">
                  {assignment.status === 'closed' && (
                    <span className="inline-block bg-slate-100 text-slate-800 text-xs font-medium px-2 py-1 rounded">
                      마감
                    </span>
                  )}
                  {overdue && assignment.status !== 'closed' && (
                    <span className="inline-block bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
                      기한경과
                    </span>
                  )}
                  {!overdue && daysUntilDue !== null && daysUntilDue <= 3 && (
                    <span className="inline-block bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded">
                      임박
                    </span>
                  )}
                </div>
              </div>

              <p className="text-sm text-slate-600 line-clamp-2">{assignment.description}</p>

              <div className="flex justify-between items-center text-xs">
                <div className="flex gap-2 text-slate-600">
                  <span>배점: {assignment.scoreWeighting}점</span>
                  {assignment.dueDate && (
                    <span>마감: {formatDate(assignment.dueDate)}</span>
                  )}
                </div>
                {daysUntilDue !== null && (
                  <span className={`font-medium ${overdue ? 'text-red-600' : daysUntilDue <= 3 ? 'text-orange-600' : 'text-slate-600'}`}>
                    {overdue ? '마감됨' : `${daysUntilDue}일 남음`}
                  </span>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
