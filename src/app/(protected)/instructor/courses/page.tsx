'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useInstructorCoursesQuery } from '@/features/courses/hooks/useCourses';
import { InstructorCourseList } from '@/features/courses/components/instructor-course-list';
import { CreateCourseDialog } from '@/features/courses/components/create-course-dialog';
import { RoleBadge } from '@/components/role-badge';

export default function InstructorCoursesPage() {
  const { data: coursesData, isLoading, error } = useInstructorCoursesQuery();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">코스 관리</h1>
          <p className="text-slate-600 mt-2">강사님의 코스를 관리하세요</p>
        </div>
        <div className="flex items-center gap-4">
          <RoleBadge />
          <button
            onClick={() => setIsDialogOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            새 코스 만들기
          </button>
        </div>
      </div>

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
