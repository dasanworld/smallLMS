'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useCreateCourseMutation, useCategoriesQuery, useDifficultiesQuery } from '@/features/courses/hooks/useCourses';
import type { CreateCourseInput } from '@/features/courses/backend/service';

interface CreateCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCourseDialog({ open, onOpenChange }: CreateCourseDialogProps) {
  const [formData, setFormData] = useState<CreateCourseInput>({
    title: '',
    description: '',
    curriculum: '',
    categoryId: undefined,
    difficultyId: undefined,
  });

  const [error, setError] = useState<string>('');
  const { mutate: createCourse, isPending } = useCreateCourseMutation();
  const { data: categories = [] } = useCategoriesQuery();
  const { data: difficulties = [] } = useDifficultiesQuery();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('코스 제목은 필수입니다.');
      return;
    }

    createCourse(formData, {
      onSuccess: () => {
        setFormData({
          title: '',
          description: '',
          curriculum: '',
          categoryId: undefined,
          difficultyId: undefined,
        });
        onOpenChange(false);
      },
      onError: (error: any) => {
        setError(error.response?.data?.error?.message || '코스 생성에 실패했습니다.');
      },
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-slate-900">새 코스 만들기</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="text-slate-500 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700 text-sm">
              {error}
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
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="예: JavaScript 기초"
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
              placeholder="코스 설명을 입력하세요"
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
              placeholder="강의 내용을 정리하세요"
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
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              {isPending ? '생성 중...' : '만들기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
