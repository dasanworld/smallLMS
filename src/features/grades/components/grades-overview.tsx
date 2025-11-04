'use client';

import { useLearnerGradesQuery } from '@/features/grades/hooks/useGrades';
import { CourseGrades } from './course-grades';
import { AssignmentFeedback } from './assignment-feedback';
import { AlertCircle, AlertTriangle } from 'lucide-react';

export function GradesOverview() {
  const { data: gradesData, isLoading, error } = useLearnerGradesQuery();

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-red-900">오류</h3>
            <p className="text-sm text-red-700 mt-1">성적을 불러올 수 없습니다.</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-slate-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!gradesData || gradesData.submissions.length === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-900">제출 과제 없음</p>
            <p className="text-sm text-amber-700 mt-1">
              {gradesData.message || '아직 제출한 과제가 없습니다.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-6">성적 및 피드백</h2>

        {gradesData.courseTotals.map((courseTotal) => (
          <div key={courseTotal.courseId} className="mb-8">
            <CourseGrades courseTotal={courseTotal} submissions={gradesData.submissions} />
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">피드백 상세</h3>
        <div className="space-y-4">
          {gradesData.submissions
            .filter((s) => s.status === 'graded' && s.feedback)
            .map((submission) => (
              <AssignmentFeedback key={submission.submissionId} submission={submission} />
            ))}
        </div>
      </div>
    </div>
  );
}
