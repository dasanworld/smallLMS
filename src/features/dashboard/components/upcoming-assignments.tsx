'use client';

import Link from 'next/link';
import { Clock, AlertCircle } from 'lucide-react';
import type { UpcomingAssignment } from '@/lib/shared/dashboard-types';

interface UpcomingAssignmentsProps {
  assignments: UpcomingAssignment[];
}

export function UpcomingAssignmentsComponent({ assignments }: UpcomingAssignmentsProps) {
  if (assignments.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-amber-600" />
          <h2 className="text-lg font-semibold text-slate-900">마감 임박 과제</h2>
        </div>
        <div className="text-center py-12">
          <div className="text-slate-400 mb-2">✅</div>
          <p className="text-slate-500">마감 임박 과제가 없습니다</p>
          <p className="text-sm text-slate-400 mt-1">모든 과제를 완료했어요!</p>
        </div>
      </div>
    );
  }

  // D-day에 따라 색상 결정
  const getDayBadgeColor = (daysLeft: number) => {
    if (daysLeft === 0) return 'bg-red-100 text-red-700 border-red-200';
    if (daysLeft === 1) return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-amber-100 text-amber-700 border-amber-200';
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-600" />
          <h2 className="text-lg font-semibold text-slate-900">마감 임박 과제</h2>
        </div>
        <span className="text-sm text-slate-500">{assignments.length}개</span>
      </div>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {assignments.map((assignment) => (
          <Link
            key={assignment.assignmentId}
            href={`/my/courses/${assignment.assignmentId}/assignments/${assignment.assignmentId}`}
            className="block p-4 border border-slate-200 rounded-lg hover:border-amber-300 hover:bg-amber-50 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-start gap-2">
                  {assignment.daysLeft === 0 && (
                    <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <h3 className="font-medium text-slate-900">{assignment.title}</h3>
                    <p className="text-sm text-slate-600">{assignment.courseTitle}</p>
                  </div>
                </div>
              </div>
              <span
                className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full border ${getDayBadgeColor(
                  assignment.daysLeft
                )}`}
              >
                {assignment.daysLeft === 0 ? '오늘 마감' : `D-${assignment.daysLeft}`}
              </span>
            </div>
            <p className="text-sm text-slate-600">
              📅 {new Date(assignment.dueDate).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
