'use client';

import { formatGradeDisplay } from '@/lib/shared/grade-calculations';
import type { CourseTotal } from '@/features/grades/backend/schema';
import type { GradeSummary } from '@/features/grades/backend/schema';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface CourseGradesProps {
  courseTotal: CourseTotal;
  submissions: GradeSummary[];
}

export function CourseGrades({ courseTotal, submissions }: CourseGradesProps) {
  const courseSubmissions = submissions.filter((s) => s.courseId === courseTotal.courseId);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'graded':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'submitted':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'resubmission_required':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="border rounded-lg p-6 bg-white">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{courseTotal.courseTitle}</h3>
          <p className="text-sm text-slate-600 mt-1">
            {courseTotal.completedCount} / {courseTotal.assignmentCount} 과제 채점 완료
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-600">코스 총점</p>
          <p className="text-3xl font-bold text-slate-900">
            {courseTotal.totalScore ? courseTotal.totalScore.toFixed(1) : 'N/A'}
          </p>
        </div>
      </div>

      <div className="space-y-3 border-t pt-4">
        {courseSubmissions.map((submission) => (
          <div key={submission.submissionId} className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3 flex-1">
              {getStatusIcon(submission.status)}
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">{submission.assignmentTitle}</p>
                <p className="text-xs text-slate-600">
                  {submission.status === 'graded' ? '채점 완료' : submission.status === 'submitted' ? '채점 대기' : '재제출 요청'}
                  {submission.isLate && ' · 지각 제출'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900">{formatGradeDisplay(submission.score)}</p>
              <p className="text-xs text-slate-500">({submission.scoreWeighting}%)</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
