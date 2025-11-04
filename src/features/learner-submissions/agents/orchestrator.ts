import type { SupabaseClient } from '@supabase/supabase-js';
import { failure, success, type HandlerResult } from '@/backend/http/response';
import { learnerSubmissionsErrorCodes, type LearnerSubmissionsServiceError } from '@/features/learner-submissions/backend/error';
import type { SubmissionResponseFromService } from '@/features/learner-submissions/backend/schema';
import { createAuthVerifierAgent } from './auth-verifier';
import { createEnrollmentCheckerAgent } from './enrollment-checker';
import { createAssignmentVerifierAgent } from './assignment-verifier';
import { createDeadlineCheckerAgent } from './deadline-checker';
import { createValidationRequestAgent } from './validation-request';
import { createResubmissionManagerAgent } from './resubmission-manager';
import { createSubmissionRecorderAgent } from './submission-recorder';

export const submitAssignmentWithAgents = async (
  client: SupabaseClient,
  userId: string,
  assignmentId: number,
  courseId: number,
  contentText: string,
  contentLink?: string
): Promise<HandlerResult<SubmissionResponseFromService, LearnerSubmissionsServiceError, unknown>> => {
  try {
    console.log(
      `[Orchestrator] Starting submission orchestration - user ${userId}, assignment ${assignmentId}, course ${courseId}`
    );

    // Create agents
    const authVerifier = createAuthVerifierAgent(client);
    const enrollChecker = createEnrollmentCheckerAgent(client);
    const assignVerifier = createAssignmentVerifierAgent(client);
    const deadlineChecker = createDeadlineCheckerAgent(client);
    const validator = createValidationRequestAgent();
    const resubmitMgr = createResubmissionManagerAgent(client);
    const recorder = createSubmissionRecorderAgent(client);

    // Step 1: Auth Verification
    console.log(`[Orchestrator] Step 1: Auth Verification`);
    const authResult = await authVerifier.verify(userId);
    if (!authResult.isAuthenticated) {
      console.warn(`[Orchestrator] Auth verification failed:`, authResult.reason);
      return failure(401, learnerSubmissionsErrorCodes.unauthorized, authResult.reason || 'Not authenticated');
    }

    // Step 2: Enrollment Check
    console.log(`[Orchestrator] Step 2: Enrollment Check`);
    const enrollResult = await enrollChecker.verify(userId, courseId);
    if (!enrollResult.isEnrolled) {
      console.warn(`[Orchestrator] Enrollment check failed:`, enrollResult.reason);
      return failure(403, learnerSubmissionsErrorCodes.notEnrolled, enrollResult.reason || 'Not enrolled');
    }

    // Step 3: Assignment Verification
    console.log(`[Orchestrator] Step 3: Assignment Verification`);
    const assignResult = await assignVerifier.verify(assignmentId, courseId);
    if (!assignResult.isValid) {
      console.warn(`[Orchestrator] Assignment verification failed:`, assignResult.reason);
      return failure(404, learnerSubmissionsErrorCodes.notFound, assignResult.reason || 'Assignment not found');
    }

    const assignment = assignResult.assignment!;

    // Step 4: Deadline Check
    console.log(`[Orchestrator] Step 4: Deadline Check`);
    const deadlineResult = await deadlineChecker.check(assignmentId, assignment.allowLateSubmission);
    if (!deadlineResult.isAllowed) {
      console.warn(`[Orchestrator] Deadline check failed:`, deadlineResult.reason);
      return failure(400, learnerSubmissionsErrorCodes.deadlineExceeded, deadlineResult.reason || 'Deadline exceeded');
    }

    const isLate = deadlineResult.isLate;

    // Step 5: Data Validation
    console.log(`[Orchestrator] Step 5: Data Validation`);
    const validResult = await validator.validate({ contentText, contentLink });
    if (!validResult.isValid) {
      console.warn(`[Orchestrator] Data validation failed:`, validResult.errors);
      const errorMsg = Object.values(validResult.errors || {}).join('; ');
      return failure(400, learnerSubmissionsErrorCodes.validationFailed, errorMsg || 'Validation failed');
    }

    // Step 6: Resubmission Check
    console.log(`[Orchestrator] Step 6: Resubmission Check`);
    const resubResult = await resubmitMgr.check(assignmentId, userId, assignment.allowResubmission);
    if (!resubResult.canSubmit) {
      console.warn(`[Orchestrator] Resubmission check failed:`, resubResult.reason);
      return failure(400, learnerSubmissionsErrorCodes.resubmissionNotAllowed, resubResult.reason || 'Cannot submit');
    }

    const isFirstSubmission = resubResult.isFirstSubmission;
    const existingSubmissionId = resubResult.existingSubmissionId;

    // Step 7: Record Submission
    console.log(`[Orchestrator] Step 7: Record Submission`);
    try {
      const recordResult = await recorder.record({
        assignmentId,
        userId,
        contentText,
        contentLink: contentLink || null,
        isLate,
        isFirstSubmission,
        existingSubmissionId,
      });

      const response: SubmissionResponseFromService = {
        success: true,
        message: isFirstSubmission
          ? 'Assignment submitted successfully'
          : 'Assignment resubmitted successfully',
        submission: recordResult.submission,
      };

      console.log(
        `[Orchestrator] Submission completed successfully - ID: ${recordResult.submission.id}`
      );
      return success(response);
    } catch (recordError) {
      const errorMsg = recordError instanceof Error ? recordError.message : 'Unknown error';
      console.error(`[Orchestrator] Recording failed:`, errorMsg);
      return failure(500, learnerSubmissionsErrorCodes.fetchError, errorMsg);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Orchestrator] Unexpected error:`, errorMessage);
    return failure(500, learnerSubmissionsErrorCodes.fetchError, 'Submission processing failed');
  }
};
