'use client';

import { AssignmentDetail } from '@/features/assignments/components/assignment-detail';
import { AssignmentSubmit } from '@/features/learner-submissions/components/assignment-submit';
import type { AssignmentResponse } from '@/features/assignments/backend/schema';

type LearnerAssignmentDetailProps = {
  assignment: AssignmentResponse;
  courseId: number;
  isSubmitButtonDisabled?: boolean;
  onSubmit?: () => void;
};

export function LearnerAssignmentDetail({ 
  assignment,
  courseId,
  isSubmitButtonDisabled = false,
  onSubmit 
}: LearnerAssignmentDetailProps) {
  const isOverdue = assignment.dueDate && new Date(assignment.dueDate) < new Date();
  const canSubmit = assignment.status === 'published' && (!isOverdue || assignment.allowLateSubmission);

  return (
    <div className="flex flex-col gap-6">
      <AssignmentDetail assignment={assignment} />

      {assignment.status === 'published' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            {canSubmit 
              ? '아래에서 과제를 제출하세요.' 
              : '마감일이 지났으며, 지각 제출이 허용되지 않습니다.'}
          </p>
        </div>
      )}

      {assignment.status === 'closed' && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <p className="text-sm text-slate-600">
            이 과제는 마감되었습니다. 더 이상 제출할 수 없습니다.
          </p>
        </div>
      )}

      {/* Submission Component */}
      <AssignmentSubmit
        assignmentId={assignment.id}
        courseId={courseId}
        title={assignment.title}
      />
    </div>
  );
}
