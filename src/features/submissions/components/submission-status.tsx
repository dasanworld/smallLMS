'use client';

import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { CheckCircle2, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import type { Submission } from '@/lib/shared/submission-types';

interface SubmissionStatusProps {
  submission: Submission | null;
  isLate?: boolean;
  canResubmit?: boolean;
  deadline?: string | null;
}

export function SubmissionStatus({
  submission,
  isLate = false,
  canResubmit = false,
  deadline = null,
}: SubmissionStatusProps) {
  if (!submission) {
    return null;
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP p', { locale: ko });
    } catch {
      return dateString;
    }
  };

  const getStatusIcon = () => {
    switch (submission.status) {
      case 'submitted':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'graded':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'resubmission_required':
        return <RefreshCw className="w-5 h-5 text-orange-500" />;
      default:
        return null;
    }
  };

  const getStatusLabel = () => {
    switch (submission.status) {
      case 'submitted':
        return '제출됨';
      case 'graded':
        return '채점 완료';
      case 'resubmission_required':
        return '재제출 요청됨';
      default:
        return '알 수 없음';
    }
  };

  const getStatusColor = () => {
    switch (submission.status) {
      case 'submitted':
        return 'bg-blue-50 border-blue-200';
      case 'graded':
        return 'bg-green-50 border-green-200';
      case 'resubmission_required':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className={`border rounded-lg p-6 ${getStatusColor()}`}>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <p className="text-sm font-medium text-slate-600">상태</p>
            <p className="text-lg font-semibold text-slate-900">{getStatusLabel()}</p>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-current border-opacity-10">
          <div className="flex justify-between items-start">
            <span className="text-sm text-slate-600">제출 시간</span>
            <span className="text-sm font-medium text-slate-900">
              {formatDate(submission.submittedAt)}
            </span>
          </div>

          {isLate && (
            <div className="flex justify-between items-start">
              <span className="text-sm text-slate-600">제출 상태</span>
              <div className="flex items-center gap-1">
                <AlertCircle className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-orange-600">지각 제출</span>
              </div>
            </div>
          )}

          {submission.status === 'graded' && submission.score !== null && (
            <>
              <div className="flex justify-between items-start">
                <span className="text-sm text-slate-600">점수</span>
                <span className="text-sm font-bold text-slate-900">{submission.score}점</span>
              </div>

              {submission.feedback && (
                <div className="space-y-2 pt-3 border-t border-current border-opacity-10">
                  <p className="text-sm text-slate-600">피드백</p>
                  <div className="bg-white bg-opacity-50 p-3 rounded text-sm text-slate-700 whitespace-pre-wrap">
                    {submission.feedback}
                  </div>
                </div>
              )}
            </>
          )}

          {submission.status === 'resubmission_required' && (
            <div className="pt-3 border-t border-current border-opacity-10">
              <p className="text-sm text-orange-700">
                강사님이 재제출을 요청했습니다. 다시 제출해주세요.
              </p>
              {submission.feedback && (
                <div className="mt-2 bg-white bg-opacity-50 p-3 rounded text-sm text-slate-700 whitespace-pre-wrap">
                  {submission.feedback}
                </div>
              )}
            </div>
          )}

          {deadline && (
            <div className="flex justify-between items-start pt-3 border-t border-current border-opacity-10">
              <span className="text-sm text-slate-600">마감일</span>
              <span className="text-sm font-medium text-slate-900">
                {formatDate(deadline)}
              </span>
            </div>
          )}

          {canResubmit && (
            <div className="pt-3 border-t border-current border-opacity-10">
              <p className="text-sm text-blue-700">재제출이 가능합니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
