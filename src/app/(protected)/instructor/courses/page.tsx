'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useInstructorCoursesQuery } from '@/features/courses/hooks/useCourses';
import { InstructorCourseList } from '@/features/courses/components/instructor-course-list';
import { CreateCourseDialog } from '@/features/courses/components/create-course-dialog';
import { TopNav } from '@/components/top-nav';
import { useAuthenticatedRole } from '@/features/auth/hooks/useAuthenticatedRole';

export default function InstructorCoursesPage() {
  const { isLoading: roleLoading } = useAuthenticatedRole('instructor');
  const { data: coursesData, isLoading, error } = useInstructorCoursesQuery();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (roleLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-slate-600">권한 확인 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <TopNav
        title="코스 관리"
        actions={(
          <button
            onClick={() => setIsDialogOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            새 코스 만들기
          </button>
        )}
      />
      <div className="h-4" />

      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          코스를 불러오는 중에 오류가 발생했습니다.
        </div>
      )}

      {coursesData && !isLoading && (
        <>
          {coursesData.courses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600 mb-4">아직 생성한 코스가 없습니다.</p>
              <button
                onClick={() => setIsDialogOpen(true)}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                첫 번째 코스를 만들어보세요
              </button>
            </div>
          ) : (
            <InstructorCourseList courses={coursesData.courses} />
          )}
        </>
      )}

      <CreateCourseDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  );
}
