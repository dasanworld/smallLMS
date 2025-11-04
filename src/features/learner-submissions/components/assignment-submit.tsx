'use client';

import { useState } from 'react';
import { SubmissionForm } from '@/features/submissions/components/submission-form';
import { SubmissionStatus } from '@/features/submissions/components/submission-status';
import { useSubmitAssignmentMutation, useLearnerSubmissionStatusQuery } from '@/features/learner-submissions/hooks/useLearnerSubmissions';
import type { SubmissionFormInput } from '@/lib/shared/submission-validation';
import { AlertCircle, AlertTriangle } from 'lucide-react';

interface AssignmentSubmitProps {
  assignmentId: number;
  courseId: number;
  title: string;
}

export function AssignmentSubmit({
  assignmentId,
  courseId,
  title,
}: AssignmentSubmitProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const {
    data: submissionStatus,
    isLoading: isStatusLoading,
    error: statusError,
    refetch: refetchStatus,
  } = useLearnerSubmissionStatusQuery(assignmentId, courseId);

  const {
    mutate: submitAssignment,
    isPending: isSubmitting,
    error: mutationError,
  } = useSubmitAssignmentMutation(assignmentId, courseId, {
    onSuccess: () => {
      setSubmitError(null);
      setSubmitSuccess('과제가 정상적으로 제출되었습니다!');
      refetchStatus();
    },
    onError: (error) => {
      setSubmitSuccess(null);
      setSubmitError(error instanceof Error ? error.message : '제출에 실패했습니다.');
    },
  });

  const handleFormSubmit = (data: SubmissionFormInput) => {
    setSubmitError(null);
    setSubmitSuccess(null);
    submitAssignment(data);
  };

  if (statusError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-red-900">오류</h3>
            <p className="text-sm text-red-700 mt-1">
              과제 정보를 불러올 수 없습니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isStatusLoading) {
    return (
      <div className="space-y-6">
        <div className="h-64 bg-slate-200 rounded-lg animate-pulse" />
      </div>
    );
  }

  const canSubmit = submissionStatus?.canSubmit ?? false;
  const canResubmit = submissionStatus?.canResubmit ?? false;
  const hasSubmission = submissionStatus?.hasSubmission ?? false;
  const submission = submissionStatus?.submission;
  const message = submissionStatus?.message;
  const deadline = submissionStatus?.deadline ?? null;
  const isLate = submissionStatus?.isLate ?? false;

  const showForm = canSubmit || canResubmit;
  const disableForm = !showForm || isSubmitting;

  return (
    <div className="space-y-6">
      {/* Status Messages */}
      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-900">제출 실패</p>
              <p className="text-sm text-red-700 mt-1">{submitError}</p>
            </div>
          </div>
        </div>
      )}

      {submitSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex gap-3">
            <div className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5">✓</div>
            <div>
              <p className="text-sm font-medium text-green-900">성공</p>
              <p className="text-sm text-green-700 mt-1">{submitSuccess}</p>
            </div>
          </div>
        </div>
      )}

      {mutationError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-900">오류</p>
              <p className="text-sm text-red-700 mt-1">
                {mutationError instanceof Error ? mutationError.message : '제출 처리 중 오류가 발생했습니다.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cannot Submit Message */}
      {!showForm && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-900">제출 불가</p>
              <p className="text-sm text-amber-700 mt-1">
                {message || '현재 이 과제에 제출할 수 없습니다.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Existing Submission Status */}
      {hasSubmission && submission && (
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-4">제출 현황</h3>
          <SubmissionStatus
            submission={{
              id: submission.id,
              assignmentId: submission.assignmentId,
              userId: submission.userId,
              contentText: submission.contentText,
              contentLink: submission.contentLink,
              submittedAt: submission.submittedAt,
              isLate: submission.isLate,
              status: submission.status,
              score: submission.score,
              feedback: submission.feedback,
            }}
            isLate={isLate}
            canResubmit={canResubmit}
            deadline={deadline}
          />
        </div>
      )}

      {/* Submission Form */}
      {showForm && (
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-4">
            {canResubmit && hasSubmission ? '재제출' : '제출'}
          </h3>
          <SubmissionForm
            isLoading={isStatusLoading}
            isSubmitting={isSubmitting}
            onSubmit={handleFormSubmit}
            disabled={disableForm}
            submitButtonText={canResubmit && hasSubmission ? '재제출' : '제출'}
          />
        </div>
      )}

      {/* Resubmission Guidance */}
      {hasSubmission && canResubmit && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <div className="flex gap-3">
            <div className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5">ℹ</div>
            <div>
              <p className="text-sm font-medium text-blue-900">재제출 가능</p>
              <p className="text-sm text-blue-700 mt-1">
                위의 폼에서 수정된 과제를 제출할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
