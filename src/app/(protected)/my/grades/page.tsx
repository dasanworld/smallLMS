'use client';

import { GradesOverview } from '@/features/grades/components/grades-overview';
import { LearnerNav } from '@/features/learner-dashboard/components/learner-nav';
import { useQueryClient, useIsFetching } from '@tanstack/react-query';
import { RotateCw } from 'lucide-react';

export default function LearnerGradesPage() {
  const queryClient = useQueryClient();
  const isFetching = useIsFetching({ queryKey: ['learnerGrades'] }) > 0;

  return (
    <div className="min-h-screen bg-white">
      <LearnerNav />
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">성적</h1>
          <button
            onClick={() => void queryClient.invalidateQueries({ queryKey: ['learnerGrades'] })}
            disabled={isFetching}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            title="새로고침"
          >
            <RotateCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            <span className="text-sm">{isFetching ? '새로고침 중...' : '새로고침'}</span>
          </button>
        </div>
        <GradesOverview />
      </div>
    </div>
  );
}
