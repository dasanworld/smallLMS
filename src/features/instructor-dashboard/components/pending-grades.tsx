'use client';

import type { InstructorCourseSummary } from '@/features/instructor-dashboard/backend/schema';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface PendingGradesProps {
  totalPendingGrades: number;
  courses: InstructorCourseSummary[];
}

export function PendingGrades({ totalPendingGrades, courses }: PendingGradesProps) {
  const coursesWithPending = courses.filter((c) => c.pendingGradesCount > 0);

  return (
    <div className="border rounded-lg p-6 bg-white">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">채점 대기</h3>
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200">
          <div className="flex items-center gap-3">
            {totalPendingGrades > 0 ? (
              <AlertCircle className="w-8 h-8 text-orange-600 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0" />
            )}
            <div>
              <p className="text-sm text-slate-600">총 채점 대기 수</p>
              <p className="text-3xl font-bold text-slate-900">{totalPendingGrades}</p>
            </div>
          </div>
        </div>

        {coursesWithPending.length > 0 && (
          <div className="space-y-2 pt-4 border-t">
            <p className="text-sm font-medium text-slate-900">코스별 채점 대기</p>
            {coursesWithPending.map((course) => (
              <div key={course.id} className="flex justify-between items-center py-2 px-3 bg-slate-50 rounded">
                <span className="text-sm text-slate-700">{course.title}</span>
                <span className="text-sm font-semibold text-orange-600">{course.pendingGradesCount}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
