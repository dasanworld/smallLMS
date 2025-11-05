'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useUpdateCourseMutation, useCategoriesQuery, useDifficultiesQuery, useInstructorCourseQuery } from '@/features/courses/hooks/useCourses';
import type { CourseSummary } from '@/lib/shared/course-types';
import type { UpdateCourseInput } from '@/features/courses/backend/service';

interface EditCourseDialogProps {
  course: CourseSummary;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCourseDialog({ course, open, onOpenChange }: EditCourseDialogProps) {
  // 코스 상세(커리큘럼 포함)를 조회하여 수정 폼에 채웁니다
  const { data: courseDetail, isLoading: detailLoading, error: detailError } = useInstructorCourseQuery(course.id);
  const [formData, setFormData] = useState<UpdateCourseInput>({
    title: course.title,
    description: course.description || '',
    curriculum: '',
    categoryId: course.categoryId || undefined,
    difficultyId: course.difficultyId || undefined,
  });

  const [error, setError] = useState<string>('');
  const { mutate: updateCourse, isPending } = useUpdateCourseMutation();
  const { data: categories = [] } = useCategoriesQuery();
  const { data: difficulties = [] } = useDifficultiesQuery();

  useEffect(() => {
    if (!open) return;
    // 다이얼로그가 열릴 때, 코스 상세가 있으면 상세값(커리큘럼 포함)으로 초기화
    // 아직 로딩 중이면 기본 Summary 값으로 설정 후, 로딩 완료 시 상세로 갱신
    setFormData({
      title: courseDetail?.title ?? course.title,
      description: courseDetail?.description ?? course.description ?? '',
      curriculum: courseDetail?.curriculum ?? '',
      categoryId: courseDetail?.categoryId ?? course.categoryId ?? undefined,
      difficultyId: courseDetail?.difficultyId ?? course.difficultyId ?? undefined,
    });
  }, [open, course, courseDetail]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title?.trim()) {
      setError('코스 제목은 필수입니다.');
      return;
    }

    updateCourse(
      { courseId: course.id, input: formData },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
        onError: (error: any) => {
          setError(error.response?.data?.error?.message || '코스 수정에 실패했습니다.');
        },
      }
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-slate-900">코스 수정</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="text-slate-500 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 상세 로딩 상태 안내 */}
          {detailLoading && (
            <div className="bg-slate-50 border border-slate-200 rounded p-3 text-slate-600 text-sm">
              코스 정보를 불러오는 중입니다...
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          {detailError && (
            <div className="bg-amber-50 border border-amber-200 rounded p-3 text-amber-800 text-sm">
              코스 상세 정보를 불러오지 못했습니다. 기본 정보로 편집할 수 있습니다.
            </div>
          )}

          {course.status === 'published' && (
            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-blue-700 text-sm">
              공개된 코스는 제목, 카테고리, 난이도를 변경할 수 없습니다.
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              코스 제목 *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              disabled={course.status === 'published'}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              설명
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              커리큘럼
            </label>
            <textarea
              value={formData.curriculum}
              onChange={(e) => setFormData({ ...formData, curriculum: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              카테고리
            </label>
            <select
              value={formData.categoryId || ''}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value ? parseInt(e.target.value) : undefined })}
              disabled={course.status === 'published'}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">선택하세요</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              난이도
            </label>
            <select
              value={formData.difficultyId || ''}
              onChange={(e) => setFormData({ ...formData, difficultyId: e.target.value ? parseInt(e.target.value) : undefined })}
              disabled={course.status === 'published'}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">선택하세요</option>
              {difficulties.map((diff) => (
                <option key={diff.id} value={diff.id}>
                  {diff.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1 px-4 py-2 border rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:bg-blue-400"
            >
              {isPending ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
