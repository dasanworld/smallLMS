'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { LearnerNav } from '@/features/learner-dashboard/components/learner-nav';
import { useSubmissionFeedbackQuery } from '@/features/grades/hooks/useGrades';
import { AssignmentFeedback } from '@/features/grades/components/assignment-feedback';

type FeedbackDetailPageProps = {
  params: Promise<{ submissionId: string }>;
};

export default function FeedbackDetailPage({ params }: FeedbackDetailPageProps) {
  const [submissionId, setSubmissionId] = useState<number>(0);

  useEffect(() => {
    void params.then((p) => {
      setSubmissionId(parseInt(p.submissionId, 10) || 0);
    });
  }, [params]);

  const { data, isLoading, error } = useSubmissionFeedbackQuery(submissionId, {
    enabled: submissionId > 0,
  });

  return (
    <div className="min-h-screen bg-white">
      <LearnerNav />
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-6">
          <Link href="/my/grades" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700">
            <ArrowLeft className="w-4 h-4" />
            성적 목록으로
          </Link>
        </div>

        {(!submissionId || isLoading) && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-slate-200 rounded-lg animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-700">피드백을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.</p>
          </div>
        )}

        {data && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">과제 피드백</h1>
            <AssignmentFeedback submission={data} />
          </div>
        )}
      </div>
    </div>
  );
}


