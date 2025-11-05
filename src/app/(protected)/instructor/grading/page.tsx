'use client';

import { useState } from 'react';
import { useInstructorCoursesQuery } from '@/features/courses/hooks/useCourses';
import { useInstructorSubmissionsQuery } from '@/features/instructor-submissions/hooks/useInstructorSubmissionsQuery';
import { useInstructorAssignmentsQuery } from '@/features/instructor-submissions/hooks/useInstructorAssignmentsQuery';
import { SubmissionsFilter, type SubmissionFilters } from '@/features/instructor-submissions/components/submissions-filter';
import { SubmissionsTable } from '@/features/instructor-submissions/components/submissions-table';
import { TopNav } from '@/components/top-nav';
import { useAuthenticatedRole } from '@/features/auth/hooks/useAuthenticatedRole';
import { CheckCircle, Clock } from 'lucide-react';

export default function InstructorGradingPage() {
  const { isLoading: roleLoading } = useAuthenticatedRole('instructor');
  const { data: coursesData } = useInstructorCoursesQuery();
  const { data: assignmentsData } = useInstructorAssignmentsQuery();
  const [filters, setFilters] = useState<SubmissionFilters>({});
  const { data: submissionsData, isLoading: submissionsLoading, error } = useInstructorSubmissionsQuery(filters);

  if (roleLoading) {
    return null;
  }

  const courses = coursesData?.courses || [];
  const assignments = assignmentsData?.assignments || [];
  const submissions = submissionsData?.submissions || [];

  const pendingCount = submissions.filter((s) => s.status === 'submitted').length;
  const gradedCount = submissions.filter((s) => s.status === 'graded').length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <TopNav title="제출물 채점" />
        <div className="h-6" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-2">채점 대기 중</p>
                <p className="text-3xl font-bold text-blue-600">{pendingCount}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-2">채점 완료</p>
                <p className="text-3xl font-bold text-green-600">{gradedCount}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <SubmissionsFilter
          courses={courses}
          assignments={assignments.map((a) => ({ id: a.id, title: a.title, courseId: a.courseId }))}
          onFiltersChange={setFilters}
        />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6">
            제출물을 불러오는 중에 오류가 발생했습니다.
          </div>
        )}

        <SubmissionsTable submissions={submissions} isLoading={submissionsLoading} />
      </div>
    </div>
  );
}
