'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Edit2, Eye, MoreVertical } from 'lucide-react';
import type { InstructorAssignmentWithStats } from '../hooks/useInstructorAssignmentsQuery';
import { EditAssignmentDialog } from './edit-assignment-dialog';

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
