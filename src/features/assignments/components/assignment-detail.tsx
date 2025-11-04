'use client';

import type { AssignmentResponse } from '@/features/assignments/backend/schema';

type AssignmentDetailProps = {
  assignment: AssignmentResponse;
};

export function AssignmentDetail({ assignment }: AssignmentDetailProps) {
  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '마감일 없음';
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isOverdue = assignment.dueDate && new Date(assignment.dueDate) < new Date();

  return (
    <div className="flex flex-col gap-6 rounded-lg border border-slate-200 p-6 shadow-sm">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-900">{assignment.title}</h1>
        <div className="flex gap-2">
          <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${
            assignment.status === 'published' 
              ? 'bg-emerald-100 text-emerald-800'
              : assignment.status === 'closed'
              ? 'bg-slate-100 text-slate-800'
              : 'bg-amber-100 text-amber-800'
          }`}>
            {assignment.status === 'published' ? '진행중' : assignment.status === 'closed' ? '마감' : '준비중'}
          </span>
          {isOverdue && assignment.status !== 'closed' && (
            <span className="inline-block bg-red-100 text-red-800 px-3 py-1 rounded text-sm font-medium">
              기한경과
            </span>
          )}
        </div>
      </div>

      <div className="border-t border-slate-200 pt-4">
        <h2 className="text-sm font-semibold text-slate-700 mb-2">과제 설명</h2>
        <p className="text-slate-600 whitespace-pre-wrap">{assignment.description || '설명이 없습니다.'}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-700">마감일</label>
          <p className="text-slate-900">{formatDate(assignment.dueDate)}</p>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-700">배점 비중</label>
          <p className="text-slate-900">{assignment.scoreWeighting}점</p>
        </div>
      </div>

      <div className="bg-slate-50 rounded-lg p-4 flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-slate-700">정책</h3>
        <div className="flex flex-col gap-2 text-sm">
          <label className="flex items-center gap-2">
            <span className={`inline-block w-4 h-4 rounded border ${
              assignment.allowLateSubmission 
                ? 'bg-emerald-500 border-emerald-500' 
                : 'border-slate-300'
            }`}></span>
            <span className="text-slate-600">지각 제출 허용</span>
          </label>
          <label className="flex items-center gap-2">
            <span className={`inline-block w-4 h-4 rounded border ${
              assignment.allowResubmission 
                ? 'bg-emerald-500 border-emerald-500' 
                : 'border-slate-300'
            }`}></span>
            <span className="text-slate-600">재제출 허용</span>
          </label>
        </div>
      </div>
    </div>
  );
}
