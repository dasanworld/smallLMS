'use client';

import { useState } from 'react';
import { Edit2, Trash2, Upload, Archive } from 'lucide-react';
import type { CourseSummary } from '@/lib/shared/course-types';
import { EditCourseDialog } from './edit-course-dialog';
import { UpdateStatusDialog } from './update-status-dialog';

interface InstructorCourseListProps {
  courses: CourseSummary[];
}

export function InstructorCourseList({ courses }: InstructorCourseListProps) {
  const [selectedCourse, setSelectedCourse] = useState<CourseSummary | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">초안</span>;
      case 'published':
        return <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">공개</span>;
      case 'archived':
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">보관</span>;
      default:
        return null;
    }
  };

  const getStatusActions = (status: string) => {
    switch (status) {
      case 'draft':
        return ['published', 'archived'];
      case 'published':
        return ['archived'];
      case 'archived':
        return [];
      default:
        return [];
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white">
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-slate-900 flex-1">{course.title}</h3>
                {getStatusBadge(course.status)}
              </div>

              {course.description && (
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">{course.description}</p>
              )}

              <div className="space-y-2 mb-4 text-xs text-slate-500">
                {course.category && <p>카테고리: {course.category.name}</p>}
                {course.difficulty && <p>난이도: {course.difficulty.name}</p>}
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <button
                  onClick={() => {
                    setSelectedCourse(course);
                    setIsEditDialogOpen(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  수정
                </button>

                {getStatusActions(course.status).length > 0 && (
                  <button
                    onClick={() => {
                      setSelectedCourse(course);
                      setIsStatusDialogOpen(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-green-600 hover:bg-green-50 rounded transition-colors"
                  >
                    {course.status === 'draft' ? (
                      <>
                        <Upload className="w-4 h-4" />
                        게시
                      </>
                    ) : (
                      <>
                        <Archive className="w-4 h-4" />
                        보관
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedCourse && (
        <>
          <EditCourseDialog
            course={selectedCourse}
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
          />
          <UpdateStatusDialog
            course={selectedCourse}
            open={isStatusDialogOpen}
            onOpenChange={setIsStatusDialogOpen}
          />
        </>
      )}
    </>
  );
}
