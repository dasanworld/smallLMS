'use client';

import type { UpcomingAssignment } from '@/lib/shared/dashboard-types';

interface UpcomingAssignmentsProps {
  assignments: UpcomingAssignment[];
}

export function UpcomingAssignmentsComponent({ assignments }: UpcomingAssignmentsProps) {
  if (assignments.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">마감 임박 과제</h2>
        <p className="text-center text-slate-500">마감 임박 과제가 없습니다</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">마감 임박 과제</h2>
      <div className="space-y-3">
        {assignments.map((assignment) => (
          <div key={assignment.assignmentId} className="p-4 border border-slate-200 rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-medium text-slate-900">{assignment.title}</h3>
                <p className="text-sm text-slate-600">{assignment.courseTitle}</p>
              </div>
              <span className="inline-block px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-700">
                D-{assignment.daysLeft}
              </span>
            </div>
            <p className="text-sm text-slate-600">{new Date(assignment.dueDate).toLocaleDateString('ko-KR')}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
