'use client';

import Link from 'next/link';
import type { CourseProgress } from '@/lib/shared/dashboard-types';

interface CourseProgressProps {
  courses: CourseProgress[];
}

export function CourseProgressComponent({ courses }: CourseProgressProps) {
  if (courses.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">내 코스</h2>
        <p className="text-center text-slate-500">수강신청한 코스가 없습니다</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">내 코스</h2>
      <div className="space-y-4">
        {courses.map((course) => (
          <Link
            key={course.courseId}
            href={`/courses/${course.courseId}`}
            className="block p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-medium text-slate-900">{course.courseTitle}</h3>
              <span className="text-sm font-semibold text-slate-600">{course.progressPercentage}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${course.progressPercentage}%` }}
              />
            </div>
            <p className="text-sm text-slate-600">
              {course.completedAssignments}/{course.totalAssignments} 완료
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
