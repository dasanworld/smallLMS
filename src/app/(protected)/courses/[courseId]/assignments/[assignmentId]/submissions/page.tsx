'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

type SubmissionsPageProps = {
  params: Promise<{ courseId: string; assignmentId: string }>;
};

interface Submission {
  id: number;
  userId: string;
  contentText: string;
  contentLink?: string;
  submittedAt: string;
  isLate: boolean;
  status: 'submitted' | 'graded' | 'resubmission_required';
  score?: number | null;
  feedback?: string | null;
  studentName: string;
}

export default function SubmissionsPage({ params }: SubmissionsPageProps) {
  const [courseId, setCourseId] = useState(0);
  const [assignmentId, setAssignmentId] = useState(0);

  useEffect(() => {
    params.then((p) => {
      setCourseId(parseInt(p.courseId, 10) || 0);
      setAssignmentId(parseInt(p.assignmentId, 10) || 0);
    });
  }, [params]);

  const { data: submissions, isLoading, error } = useQuery({
    queryKey: ['submissions', assignmentId],
    queryFn: async () => {
      const response = await fetch(`/api/assignments/${assignmentId}/submissions`);
      if (!response.ok) {
        throw new Error('제출물을 불러올 수 없습니다');
      }
      const data = await response.json();
      return data.submissions as Submission[];
    },
    enabled: assignmentId > 0,
  });

  const getStatusBadge = (status: string, isLate: boolean) => {
    if (isLate && status === 'submitted') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
          <Clock className="w-3 h-3" />
          지각
        </span>
      );
    }
    if (status === 'graded') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
          <CheckCircle className="w-3 h-3" />
          채점됨
        </span>
      );
    }
    if (status === 'resubmission_required') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
          <AlertCircle className="w-3 h-3" />
          재제출 필요
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
        <Clock className="w-3 h-3" />
        미채점
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!courseId || !assignmentId) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <p className="text-center text-slate-600">로드 중입니다...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <Link
        href={`/courses/${courseId}/assignments/${assignmentId}`}
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        과제로 돌아가기
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">제출물 목록</h1>
        <p className="text-slate-600 mt-2">학생들의 제출 현황을 확인하세요</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            {error instanceof Error ? error.message : '제출물을 불러올 수 없습니다'}
          </p>
        </div>
      ) : !submissions || submissions.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
          <p className="text-slate-600">아직 제출한 학생이 없습니다</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">학생</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">제출일시</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">상태</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">점수</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">작업</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission) => (
                  <tr key={submission.id} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm text-slate-900">{submission.studentName}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{formatDate(submission.submittedAt)}</td>
                    <td className="px-6 py-4 text-sm">
                      {getStatusBadge(submission.status, submission.isLate)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900">
                      {submission.score !== null && submission.score !== undefined
                        ? `${submission.score}/100`
                        : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Link
                        href={`/submissions/${submission.id}/grade`}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded bg-blue-600 text-white text-xs hover:bg-blue-700 transition-colors"
                      >
                        채점하기
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
