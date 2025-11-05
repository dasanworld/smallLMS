'use client';

import { useState } from 'react';
import { useInstructorCoursesQuery } from '@/features/courses/hooks/useCourses';
import { useInstructorAssignmentsQuery } from '@/features/instructor-submissions/hooks/useInstructorAssignmentsQuery';
import { AssignmentsTable } from '@/features/instructor-submissions/components/assignments-table';
import { CreateAssignmentDialog } from '@/features/instructor-submissions/components/create-assignment-dialog';
import { TopNav } from '@/components/top-nav';
import { useAuthenticatedRole } from '@/features/auth/hooks/useAuthenticatedRole';
import { Plus, FileText } from 'lucide-react';

export default function InstructorAssignmentsPage() {
  const { isLoading: roleLoading } = useAuthenticatedRole('instructor');
  const { data: coursesData } = useInstructorCoursesQuery();
  const [selectedCourseId, setSelectedCourseId] = useState<number>();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { data: assignmentsData, isLoading: assignmentsLoading } = useInstructorAssignmentsQuery(selectedCourseId);

  if (roleLoading) {
    return null;
  }

  const courses = coursesData?.courses || [];
  const assignments = assignmentsData?.assignments || [];

  const publishedCount = assignments.filter((a) => a.status === 'published').length;
  const draftCount = assignments.filter((a) => a.status === 'draft').length;
  const totalStudents = new Set(assignments.flatMap((a) => a.submissionStats.total)).size;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <TopNav title="과제 관리" />
        <div className="h-6" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-2">게시된 과제</p>
                <p className="text-3xl font-bold text-green-600">{publishedCount}</p>
              </div>
              <FileText className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-2">작성 중인 과제</p>
                <p className="text-3xl font-bold text-amber-600">{draftCount}</p>
              </div>
              <FileText className="w-8 h-8 text-amber-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-2">총 과제</p>
                <p className="text-3xl font-bold text-blue-600">{assignments.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">필터</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700">초기화</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">코스 선택</label>
              <select
                value={selectedCourseId || ''}
                onChange={(e) => setSelectedCourseId(e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="">모든 코스</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setIsCreateOpen(true)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                새 과제 만들기
              </button>
            </div>
          </div>
        </div>

        <AssignmentsTable assignments={assignments} isLoading={assignmentsLoading} />

        <CreateAssignmentDialog
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          courses={courses.map((c) => ({ id: c.id, title: c.title }))}
        />
      </div>
    </div>
  );
}
