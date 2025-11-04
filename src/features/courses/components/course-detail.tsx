'use client';

import type { CourseDetail } from '@/lib/shared/course-types';

type CourseDetailProps = {
  course: CourseDetail;
  children?: React.ReactNode;
};

export function CourseDetailComponent({ course, children }: CourseDetailProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="rounded-lg border border-slate-200 p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{course.title}</h1>
            <p className="text-slate-600">{course.description}</p>
          </div>
          <div>{children}</div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 py-4 border-t border-b border-slate-200">
          {course.category && (
            <div>
              <p className="text-sm text-slate-500">카테고리</p>
              <p className="font-medium">{course.category.name}</p>
            </div>
          )}
          {course.difficulty && (
            <div>
              <p className="text-sm text-slate-500">난이도</p>
              <p className="font-medium">{course.difficulty.name}</p>
            </div>
          )}
        </div>

        {course.curriculum && (
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">커리큘럼</h2>
            <div className="prose max-w-none text-slate-600">
              {course.curriculum}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
