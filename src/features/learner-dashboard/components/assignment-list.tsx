'use client';

import Link from 'next/link';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';
import type { LearnerAssignmentWithStatus } from '../hooks/useLearnerAssignmentsQuery';

type AssignmentListProps = {
  assignments: LearnerAssignmentWithStatus[];
};

function getStatusIcon(status: string) {
  switch (status) {
    case 'graded':
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    case 'overdue':
      return <AlertCircle className="w-4 h-4 text-red-600" />;
    case 'submitted':
      return <Clock className="w-4 h-4 text-blue-600" />;
    default:
      return <Clock className="w-4 h-4 text-amber-600" />;
  }
}

function getStatusBadge(status: string) {
  const styles = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    submitted: 'bg-blue-50 text-blue-700 border-blue-200',
    graded: 'bg-green-50 text-green-700 border-green-200',
    overdue: 'bg-red-50 text-red-700 border-red-200',
  };
  return styles[status as keyof typeof styles] || styles.pending;
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'pending':
      return '미제출';
    case 'submitted':
      return '제출됨';
    case 'graded':
      return '채점완료';
    case 'overdue':
      return '마감됨';
    default:
      return status;
  }
}

export function AssignmentList({ assignments }: AssignmentListProps) {
  if (assignments.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
        <p className="text-slate-600">할당된 과제가 없습니다.</p>
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
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">점수</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {assignments.map((assignment) => (
            <tr key={assignment.id} className="hover:bg-slate-50">
              <td className="px-6 py-4 text-sm font-medium text-slate-900">
                <Link href={`/my/courses/${assignment.courseId}/assignments/${assignment.id}`} className="text-blue-600 hover:underline">
                  {assignment.assignmentTitle}
                </Link>
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">{assignment.courseTitle}</td>
              <td className="px-6 py-4 text-sm text-slate-600">
                <div>
                  <p>{new Date(assignment.dueDate).toLocaleDateString('ko-KR')}</p>
                  <p className="text-xs text-slate-500">
                    {assignment.daysUntilDue > 0 ? `${assignment.daysUntilDue}일 남음` : assignment.daysUntilDue < 0 ? `${Math.abs(assignment.daysUntilDue)}일 지남` : '오늘'}
                  </p>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(assignment.status)}`}>
                  {getStatusIcon(assignment.status)}
                  {getStatusLabel(assignment.status)}
                </div>
              </td>
              <td className="px-6 py-4 text-sm font-medium text-slate-900">
                {assignment.score !== null ? `${assignment.score}/100` : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
