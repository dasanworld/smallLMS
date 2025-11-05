'use client';

import Link from 'next/link';
import { CheckCircle, Circle, AlertCircle } from 'lucide-react';
import type { SubmissionWithDetails } from '../hooks/useInstructorSubmissionsQuery';

type SubmissionsTableProps = {
  submissions: SubmissionWithDetails[];
  isLoading: boolean;
};

function getStatusIcon(status: string) {
  switch (status) {
    case 'graded':
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    case 'resubmission_required':
      return <AlertCircle className="w-4 h-4 text-amber-600" />;
    case 'submitted':
    default:
      return <Circle className="w-4 h-4 text-blue-600" />;
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'graded':
      return '채점완료';
    case 'resubmission_required':
      return '재제출 요청';
    case 'submitted':
    default:
      return '제출됨';
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'graded':
      return 'bg-green-50 border-green-200';
    case 'resubmission_required':
      return 'bg-amber-50 border-amber-200';
    case 'submitted':
    default:
      return 'bg-blue-50 border-blue-200';
  }
}

export function SubmissionsTable({ submissions, isLoading }: SubmissionsTableProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
        <p className="text-slate-600">제출물이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">학생</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">코스</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">과제</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">제출일</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">상태</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">점수</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">작업</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {submissions.map((submission) => (
            <tr key={submission.id} className="hover:bg-slate-50">
              <td className="px-6 py-4 text-sm">
                <div>
                  <p className="font-medium text-slate-900">{submission.studentName}</p>
                  <p className="text-xs text-slate-500">{submission.studentEmail}</p>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">{submission.courseTitle}</td>
              <td className="px-6 py-4 text-sm text-slate-600">{submission.assignmentTitle}</td>
              <td className="px-6 py-4 text-sm text-slate-600">
                {new Date(submission.submittedAt).toLocaleDateString('ko-KR')}
              </td>
              <td className="px-6 py-4">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(submission.status)}`}>
                  {getStatusIcon(submission.status)}
                  {getStatusLabel(submission.status)}
                </div>
              </td>
              <td className="px-6 py-4 text-sm font-medium text-slate-900">
                {submission.score !== null ? `${submission.score}/100` : '-'}
              </td>
              <td className="px-6 py-4 text-sm">
                <Link
                  href={`/submissions/${submission.id}/grade`}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  {submission.status === 'graded' ? '보기' : '채점하기'}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
