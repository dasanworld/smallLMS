'use client';

import { CourseCard } from '@/features/courses/components/course-card';
import type { CourseSummary } from '@/lib/shared/course-types';

type CourseListProps = {
  courses: CourseSummary[];
  enrolledCourseIds?: number[];
  isLoading?: boolean;
  isEmpty?: boolean;
};

export function CourseList({ courses, enrolledCourseIds = [], isLoading, isEmpty }: CourseListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-32 bg-slate-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="py-12 text-center">
        <p className="text-slate-600">검색 결과가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          isEnrolled={enrolledCourseIds.includes(course.id)}
        />
      ))}
    </div>
  );
}
