'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Edit2, Eye, MoreVertical } from 'lucide-react';
import type { InstructorAssignmentWithStats } from '../hooks/useInstructorAssignmentsQuery';
import { EditAssignmentDialog } from './edit-assignment-dialog';
import { useQueryClient } from '@tanstack/react-query';

type AssignmentsTableProps = {
  assignments: InstructorAssignmentWithStats[];
  isLoading: boolean;
};

function getStatusLabel(status: string) {
  switch (status) {
    case 'draft':
      return '작성중';
    case 'published':
      return '게시됨';
    case 'closed':
      return '마감됨';
    default:
      return status;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'draft':
      return 'bg-slate-100 text-slate-700';
    case 'published':
      return 'bg-green-100 text-green-700';
    case 'closed':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}

export function AssignmentsTable({ assignments, isLoading }: AssignmentsTableProps) {
  const [editing, setEditing] = useState<{ assignmentId: number; courseId: number } | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const togglePublish = async (assignment: InstructorAssignmentWithStats) => {
    if (assignment.status === 'closed') return; // 마감된 과제는 변경 불가
    const nextStatus = assignment.status === 'published' ? 'draft' : 'published';
    try {
      setBusyId(assignment.id);
      const res = await fetch(`/api/courses/${assignment.courseId}/assignments/${assignment.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) {
        throw new Error('Failed to update status');
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['instructorAssignments'] }),
        queryClient.invalidateQueries({ queryKey: ['instructorAssignments', assignment.courseId] }),
        queryClient.invalidateQueries({ queryKey: ['assignments-by-course', assignment.courseId] }),
      ]);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[AssignmentsTable] togglePublish error', e);
      alert('상태 변경 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setBusyId(null);
    }
  };
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
        <p className="text-slate-600">과제가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">과제명</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">코스</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">마감일</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">상태</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">제출 현황</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">작업</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {assignments.map((assignment) => (
            <tr key={assignment.id} className="hover:bg-slate-50">
              <td className="px-6 py-4 text-sm font-medium text-slate-900">{assignment.title}</td>
              <td className="px-6 py-4 text-sm text-slate-600">{assignment.courseTitle}</td>
              <td className="px-6 py-4 text-sm text-slate-600">
                {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString('ko-KR') : '-'}
              </td>
              <td className="px-6 py-4">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                  {getStatusLabel(assignment.status)}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="space-y-1">
                  <div className="text-sm">
                    <span className="font-medium">{assignment.submissionStats.submitted}</span>
                    <span className="text-slate-600">/{assignment.submissionStats.total} 제출</span>
                  </div>
                  <div className="text-xs text-slate-600">
                    {assignment.submissionStats.pending > 0 && (
                      <span className="text-amber-600 font-medium">
                        {assignment.submissionStats.pending}건 미채점
                      </span>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditing({ assignmentId: assignment.id, courseId: assignment.courseId })}
                    className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="편집"
                    type="button"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => void togglePublish(assignment)}
                    disabled={busyId === assignment.id || assignment.status === 'closed'}
                    className={`${
                      assignment.status === 'published'
                        ? 'px-2 py-1 rounded-lg border border-amber-300 text-amber-700 hover:bg-amber-50 disabled:opacity-60'
                        : 'px-2 py-1 rounded-lg border border-green-300 text-green-700 hover:bg-green-50 disabled:opacity-60'
                    }`}
                    title={assignment.status === 'published' ? '비공개 전환' : '공개 전환'}
                    type="button"
                  >
                    {busyId === assignment.id
                      ? '처리 중...'
                      : assignment.status === 'published'
                        ? '비공개'
                        : '공개'}
                  </button>
                  <Link
                    href={`/courses/${assignment.courseId}/assignments/${assignment.id}/submissions`}
                    className="p-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="제출물 보기"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editing && (
        <EditAssignmentDialog
          open={true}
          onOpenChange={(open) => {
            if (!open) setEditing(null);
          }}
          assignmentId={editing.assignmentId}
          courseId={editing.courseId}
        />
      )}
    </div>
  );
}
