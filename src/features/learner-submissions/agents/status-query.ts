import type { SupabaseClient } from '@supabase/supabase-js';
import { getSubmissionByAssignmentAndUser } from '@/features/submissions/backend/service';
import { createAuthVerifierAgent } from './auth-verifier';
import { createEnrollmentCheckerAgent } from './enrollment-checker';
import { createAssignmentVerifierAgent } from './assignment-verifier';
import { createDeadlineCheckerAgent } from './deadline-checker';
import { createResubmissionManagerAgent } from './resubmission-manager';
import type { StatusQueryAgent, StatusQueryResult } from './types';

export const createStatusQueryAgent = (client: SupabaseClient): StatusQueryAgent => ({
  client,

  async getStatus(
    userId: string,
    assignmentId: number,
    courseId: number
  ): Promise<StatusQueryResult> {
    console.log(
      `[StatusQueryAgent] Getting status for user ${userId}, assignment ${assignmentId}, course ${courseId}`
    );

    try {
      const authVerifier = createAuthVerifierAgent(client);
      const enrollChecker = createEnrollmentCheckerAgent(client);
      const assignVerifier = createAssignmentVerifierAgent(client);
      const deadlineChecker = createDeadlineCheckerAgent(client);
      const resubmitMgr = createResubmissionManagerAgent(client);

      const [authResult, enrollResult, assignResult, existingSubmissionResult] = await Promise.all([
        authVerifier.verify(userId),
        enrollChecker.verify(userId, courseId),
        assignVerifier.verify(assignmentId, courseId),
        getSubmissionByAssignmentAndUser(client, assignmentId, userId),
      ]);

      const hasSubmission = existingSubmissionResult.ok;
      const submission = hasSubmission ? existingSubmissionResult.data : undefined;

      let canSubmit = true;
      let message: string | undefined;

      if (!authResult.isAuthenticated) {
        canSubmit = false;
        message = 'User not authenticated';
      } else if (!enrollResult.isEnrolled) {
        canSubmit = false;
        message = 'Not enrolled in this course';
      } else if (!assignResult.isValid) {
        canSubmit = false;
        message = assignResult.reason;
      } else {
        const deadlineResult = await deadlineChecker.check(
          assignmentId,
          assignResult.assignment?.allowLateSubmission || false
        );

        if (!deadlineResult.isAllowed) {
          canSubmit = false;
          message = deadlineResult.reason;
        } else {
          const resubmitResult = await resubmitMgr.check(
            assignmentId,
            userId,
            assignResult.assignment?.allowResubmission || false
          );

          canSubmit = resubmitResult.canSubmit;
          message = resubmitResult.reason;
        }
      }

      const resubmitResult = await resubmitMgr.check(
        assignmentId,
        userId,
        assignResult.assignment?.allowResubmission || false
      );
      const canResubmit = resubmitResult.canSubmit && !resubmitResult.isFirstSubmission;

      const deadlineResult = await deadlineChecker.check(
        assignmentId,
        assignResult.assignment?.allowLateSubmission || false
      );
      const isLate = deadlineResult.isLate;

      const result: StatusQueryResult = {
        submission,
        hasSubmission,
        canSubmit,
        canResubmit,
        isLate,
        deadline: assignResult.assignment?.dueDate || null,
        message,
      };

      console.log(
        `[StatusQueryAgent] Status retrieved - canSubmit=${canSubmit}, canResubmit=${canResubmit}, hasSubmission=${hasSubmission}`
      );
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[StatusQueryAgent] Status query failed:`, errorMessage);

      return {
        hasSubmission: false,
        canSubmit: false,
        canResubmit: false,
        isLate: false,
        deadline: null,
        message: `Status query error: ${errorMessage}`,
      };
    }
  },
});
