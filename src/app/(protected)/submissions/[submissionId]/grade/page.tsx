'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';

type GradePageProps = {
  params: Promise<{ submissionId: string }>;
};

interface Submission {
  id: number;
  assignmentId: number;
  userId: string;
  contentText: string;
  contentLink?: string;
  submittedAt: string;
  isLate: boolean;
  status: 'submitted' | 'graded' | 'resubmission_required';
  score?: number | null;
  feedback?: string | null;
}

interface GradeFormData {
  score: number;
  feedback: string;
  status: 'graded' | 'resubmission_required';
}

export default function GradePage({ params }: GradePageProps) {
  const router = useRouter();
  const [submissionId, setSubmissionId] = useState(0);
  const [formData, setFormData] = useState<GradeFormData>({
    score: 0,
    feedback: '',
    status: 'graded',
  });
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    params.then((p) => {
      setSubmissionId(parseInt(p.submissionId, 10) || 0);
    });
  }, [params]);

  const { data: submission, isLoading, error } = useQuery({
    queryKey: ['submission', submissionId],
    queryFn: async () => {
      const response = await fetch(`/api/submissions/${submissionId}`);
      if (!response.ok) {
        throw new Error('제출물을 불러올 수 없습니다');
      }
      const data = await response.json();
      return data as Submission;
    },
    enabled: submissionId > 0,
  });

  const { mutate: submitGrade, isPending: isSubmitting } = useMutation({
    mutationFn: async (data: GradeFormData) => {
      const response = await fetch(`/api/submissions/${submissionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: data.score,
          feedback: data.feedback,
          status: data.status,
        }),
      });
      if (!response.ok) {
        throw new Error('채점 저장에 실패했습니다');
      }
      return response.json();
    },
    onSuccess: () => {
      setSubmitSuccess(true);
      setTimeout(() => {
        router.back();
      }, 1500);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.score < 0 || formData.score > 100) {
      alert('점수는 0~100 사이여야 합니다');
      return;
    }
    if (!formData.feedback.trim()) {
      alert('피드백을 입력해주세요');
      return;
    }
    submitGrade(formData);
  };

  if (!submissionId) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <p className="text-center text-slate-600">로드 중입니다...</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="h-96 bg-slate-200 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            {error instanceof Error ? error.message : '제출물을 찾을 수 없습니다'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        돌아가기
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">제출물 채점</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <p className="text-sm text-slate-600">제출일시</p>
          <p className="text-lg font-semibold text-slate-900 mt-2">
            {new Date(submission.submittedAt).toLocaleString('ko-KR')}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <p className="text-sm text-slate-600">상태</p>
          <p className="text-lg font-semibold text-slate-900 mt-2">
            {submission.isLate ? '지각 제출' : '정상 제출'}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <p className="text-sm text-slate-600">현재 점수</p>
          <p className="text-lg font-semibold text-slate-900 mt-2">
            {submission.score !== null && submission.score !== undefined
              ? `${submission.score}/100`
              : '미채점'}
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-8 mb-8">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">제출 내용</h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-700">텍스트</p>
            <div className="mt-2 bg-slate-50 border border-slate-200 rounded p-4">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{submission.contentText}</p>
            </div>
          </div>
          {submission.contentLink && (
            <div>
              <p className="text-sm font-medium text-slate-700">링크</p>
              <a
                href={submission.contentLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 text-blue-600 hover:text-blue-700 break-all"
              >
                {submission.contentLink}
              </a>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg p-8">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">채점</h2>

        {submitSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-900">채점이 저장되었습니다</p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              점수 (0~100) *
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.score}
              onChange={(e) => setFormData({ ...formData, score: parseInt(e.target.value) || 0 })}
              disabled={isSubmitting}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none disabled:bg-slate-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              피드백 *
            </label>
            <textarea
              value={formData.feedback}
              onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
              disabled={isSubmitting}
              rows={6}
              placeholder="학생에게 제공할 피드백을 입력하세요"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none disabled:bg-slate-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              처리 방식 *
            </label>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  value="graded"
                  checked={formData.status === 'graded'}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as 'graded' | 'resubmission_required' })
                  }
                  disabled={isSubmitting}
                  className="w-4 h-4"
                />
                <div>
                  <p className="text-sm font-medium text-slate-900">채점 완료</p>
                  <p className="text-xs text-slate-600">점수를 확정하고 마칩니다</p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  value="resubmission_required"
                  checked={formData.status === 'resubmission_required'}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as 'graded' | 'resubmission_required' })
                  }
                  disabled={isSubmitting}
                  className="w-4 h-4"
                />
                <div>
                  <p className="text-sm font-medium text-slate-900">재제출 요청</p>
                  <p className="text-xs text-slate-600">학생이 다시 제출하도록 요청합니다</p>
                </div>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSubmitting ? '저장 중...' : '채점 저장'}
          </button>
        </div>
      </form>
    </div>
  );
}
