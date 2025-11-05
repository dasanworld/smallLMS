'use client';

import { useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import axios from 'axios';
import { CourseList } from '@/features/courses/components/course-list';
import { CourseFilters } from '@/features/courses/components/course-filters';
import { useCoursesQuery, useCategoriesQuery, useDifficultiesQuery } from '@/features/courses/hooks/useCourses';
import { useEnrollmentStatusQuery } from '@/features/enrollments/hooks/useEnrollments';
import { TopNav } from '@/components/top-nav';
import type { CourseListParams } from '@/lib/shared/course-types';

export default function CoursesPage() {
  const [params, setParams] = useState<CourseListParams>({ sortBy: 'newest' });
  
  const { data: courseData, isLoading: coursesLoading } = useCoursesQuery(params);
  const { data: categories } = useCategoriesQuery();
  const { data: difficulties } = useDifficultiesQuery();

  const courses = courseData?.courses || [];
  // 각 코스의 수강 상태를 병렬로 조회 (Hook 규칙 준수: useQueries는 단일 Hook 호출)
  const enrollmentResults = useQueries({
    queries: courses.map((course) => ({
      queryKey: ['enrollment-status', course.id],
      queryFn: async () => {
        const res = await axios.get<{ isEnrolled: boolean }>(`/api/enrollments/${course.id}/status`);
        return res.data ?? { isEnrolled: false };
      },
      enabled: course.id > 0,
    })),
  });
  const enrolledCourseIds = courses
    .filter((course, idx) => enrollmentResults[idx]?.data?.isEnrolled)
    .map((c) => c.id);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <TopNav title="코스 카탈로그" />
      <div className="h-6" />

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
