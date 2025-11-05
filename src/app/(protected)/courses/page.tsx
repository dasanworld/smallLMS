'use client';

import { useState } from 'react';
import { CourseList } from '@/features/courses/components/course-list';
import { CourseFilters } from '@/features/courses/components/course-filters';
import { useCoursesQuery, useCategoriesQuery, useDifficultiesQuery } from '@/features/courses/hooks/useCourses';
import { useEnrollmentStatusQuery } from '@/features/enrollments/hooks/useEnrollments';
import { RoleBadge } from '@/components/role-badge';
import type { CourseListParams } from '@/lib/shared/course-types';

export default function CoursesPage() {
  const [params, setParams] = useState<CourseListParams>({ sortBy: 'newest' });
  
  const { data: courseData, isLoading: coursesLoading } = useCoursesQuery(params);
  const { data: categories } = useCategoriesQuery();
  const { data: difficulties } = useDifficultiesQuery();

  const courses = courseData?.courses || [];
  const enrolledCourseIds = courses
    .filter((course) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { data } = useEnrollmentStatusQuery(course.id);
      return data?.isEnrolled;
    })
    .map((c) => c.id);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">코스 카탈로그</h1>
          <p className="text-slate-600">원하는 코스를 찾아 수강신청하세요</p>
        </div>
        <RoleBadge />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <CourseFilters
            categories={categories || []}
            difficulties={difficulties || []}
            onFilterChange={setParams}
          />
        </div>

        <div className="lg:col-span-3">
          <CourseList
            courses={courses}
            enrolledCourseIds={enrolledCourseIds}
            isLoading={coursesLoading}
            isEmpty={!coursesLoading && courses.length === 0}
          />
        </div>
      </div>
    </div>
  );
}
