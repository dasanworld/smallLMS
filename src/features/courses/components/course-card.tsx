'use client';

import Link from 'next/link';
import type { CourseSummary } from '@/lib/shared/course-types';

type CourseCardProps = {
  course: CourseSummary;
  isEnrolled?: boolean;
};

export function CourseCard({ course, isEnrolled }: CourseCardProps) {
  return (
    <Link href={`/courses/${course.id}`}>
      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-semibold text-slate-900 line-clamp-2">{course.title}</h3>
          {isEnrolled && (
            <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-medium px-2 py-1 rounded">
              수강중
            </span>
          )}
        </div>
        <p className="text-sm text-slate-600 line-clamp-2">{course.description}</p>
        <div className="flex gap-2 text-xs">
          {course.category && (
            <span className="inline-block bg-slate-100 text-slate-700 px-2 py-1 rounded">
              {course.category.name}
            </span>
          )}
          {course.difficulty && (
            <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded">
              {course.difficulty.name}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
