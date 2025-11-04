import type { SupabaseClient } from '@supabase/supabase-js';
import { failure, success, type HandlerResult } from '@/backend/http/response';
import { learnerSubmissionsErrorCodes, type LearnerSubmissionsServiceError } from '@/features/learner-submissions/backend/error';
import { type SubmissionResponseFromService, type LearnerSubmissionResponse } from '@/features/learner-submissions/backend/schema';
import { getAssignmentById } from '@/features/assignments/backend/service';
import { checkEnrollmentStatus } from '@/features/enrollments/backend/service';
import { 
  getSubmissionByAssignmentAndUser, 
  createSubmission, 
  updateSubmission 
} from '@/features/submissions/backend/service';

/**
 * Check if user is eligible to submit to an assignment
 * Verifies enrollment, assignment status, and policies
 */
export const checkSubmissionEligibility = async (
  client: SupabaseClient,
  userId: string,
  assignmentId: number,
  courseId: number,
): Promise<HandlerResult<{ eligible: boolean; reason?: string }, LearnerSubmissionsServiceError, unknown>> => {
  try {
    console.log(`[checkSubmissionEligibility] Checking eligibility for user ${userId}, assignment ${assignmentId}, course ${courseId}`);

    // Check if user is enrolled in the course
    const enrollmentResult = await checkEnrollmentStatus(client, userId, courseId);
    if (!enrollmentResult.ok) {
      console.log(`[checkSubmissionEligibility] Enrollment check failed:`, enrollmentResult);
      return failure(500, learnerSubmissionsErrorCodes.fetchError, 'Failed to check enrollment status');
    }

    if (!enrollmentResult.data.isEnrolled) {
      console.log(`[checkSubmissionEligibility] User ${userId} is not enrolled in course ${courseId}`);
      return success({ eligible: false, reason: 'Not enrolled in course' });
    }

    // Get assignment details
    const assignmentResult = await getAssignmentById(client, assignmentId);
    if (!assignmentResult.ok) {
      console.log(`[checkSubmissionEligibility] Assignment fetch failed:`, assignmentResult);
      return failure(404, learnerSubmissionsErrorCodes.notFound, 'Assignment not found');
    }

    const assignment = assignmentResult.data;

    // Check if assignment belongs to the course
    if (assignment.courseId !== courseId) {
      console.log(`[checkSubmissionEligibility] Assignment ${assignmentId} does not belong to course ${courseId}`);
      return failure(400, learnerSubmissionsErrorCodes.validationError, 'Assignment does not belong to the specified course');
    }

    // Check assignment status - must be published or closed, not draft
    if (assignment.status === 'draft') {
      console.log(`[checkSubmissionEligibility] Assignment ${assignmentId} is in draft status`);
      return success({ eligible: false, reason: 'Assignment is not yet published' });
    }

    // Check if assignment is closed (closed assignments don't accept new submissions)
    if (assignment.status === 'closed') {
      console.log(`[checkSubmissionEligibility] Assignment ${assignmentId} is closed`);
      return success({ eligible: false, reason: 'Assignment is closed for submissions' });
    }

    console.log(`[checkSubmissionEligibility] User ${userId} is eligible to submit to assignment ${assignmentId}`);
    return success({ eligible: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[checkSubmissionEligibility] Error:`, error);
    return failure(500, learnerSubmissionsErrorCodes.fetchError, errorMessage);
  }
};

/**
 * Validate submission request data
 * Checks content text and optional content link format
 */
export const validateSubmissionRequest = async (
  client: SupabaseClient,
  assignmentId: number,
  contentText: string,
  contentLink?: string,
): Promise<HandlerResult<{ valid: boolean; reason?: string }, LearnerSubmissionsServiceError, unknown>> => {
  try {
    console.log(`[validateSubmissionRequest] Validating submission for assignment ${assignmentId}`);

    // Check if content text is provided and not empty
    if (!contentText || contentText.trim().length === 0) {
      console.log(`[validateSubmissionRequest] Content text is empty`);
      return success({ valid: false, reason: 'Content text is required' });
    }

    // Validate content link if provided
    if (contentLink) {
      try {
        new URL(contentLink);
        console.log(`[validateSubmissionRequest] Content link is valid: ${contentLink}`);
      } catch (urlError) {
        console.log(`[validateSubmissionRequest] Invalid content link: ${contentLink}`);
        return success({ valid: false, reason: 'Content link must be a valid URL' });
      }
    }

    console.log(`[validateSubmissionRequest] Submission data is valid`);
    return success({ valid: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[validateSubmissionRequest] Error:`, error);
    return failure(500, learnerSubmissionsErrorCodes.validationFailed, errorMessage);
  }
};

/**
 * Validate submission deadline and late submission policy
 * Checks if submission is late and if late submissions are allowed
 */
export const validateSubmissionDeadline = async (
  client: SupabaseClient,
  assignmentId: number,
): Promise<HandlerResult<{ isLate: boolean; allowed: boolean; reason?: string }, LearnerSubmissionsServiceError, unknown>> => {
  try {
    console.log(`[validateSubmissionDeadline] Checking deadline for assignment ${assignmentId}`);

    // Get assignment details including due date and late submission policy
    const assignmentResult = await getAssignmentById(client, assignmentId);
    if (!assignmentResult.ok) {
      console.log(`[validateSubmissionDeadline] Assignment fetch failed:`, assignmentResult);
      return failure(404, learnerSubmissionsErrorCodes.notFound, 'Assignment not found');
    }

    const assignment = assignmentResult.data;
    const currentTime = new Date();

    // If no due date is set, submission is always allowed and not late
    if (!assignment.dueDate) {
      console.log(`[validateSubmissionDeadline] No due date set for assignment ${assignmentId}`);
      return success({ isLate: false, allowed: true });
    }

    const dueDate = new Date(assignment.dueDate);
    const isLate = currentTime > dueDate;

    console.log(`[validateSubmissionDeadline] Current time: ${currentTime.toISOString()}, Due date: ${dueDate.toISOString()}, Is late: ${isLate}`);

    if (!isLate) {
      // Submission is on time
      return success({ isLate: false, allowed: true });
    }

    // Submission is late - check if late submissions are allowed
    if (assignment.allowLateSubmission) {
      console.log(`[validateSubmissionDeadline] Late submission allowed for assignment ${assignmentId}`);
      return success({ isLate: true, allowed: true });
    } else {
      console.log(`[validateSubmissionDeadline] Late submission not allowed for assignment ${assignmentId}`);
      return success({ 
        isLate: true, 
        allowed: false, 
        reason: 'Assignment deadline has passed and late submissions are not allowed' 
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[validateSubmissionDeadline] Error:`, error);
    return failure(500, learnerSubmissionsErrorCodes.fetchError, errorMessage);
  }
};

/**
 * Validate resubmission policy
 * Checks if user can resubmit and if resubmissions are allowed
 */
export const validateResubmissionPolicy = async (
  client: SupabaseClient,
  assignmentId: number,
  userId: string,
): Promise<HandlerResult<{ allowed: boolean; isFirstSubmission: boolean; reason?: string }, LearnerSubmissionsServiceError, unknown>> => {
  try {
    console.log(`[validateResubmissionPolicy] Checking resubmission policy for user ${userId}, assignment ${assignmentId}`);

    // Get assignment details
    const assignmentResult = await getAssignmentById(client, assignmentId);
    if (!assignmentResult.ok) {
      console.log(`[validateResubmissionPolicy] Assignment fetch failed:`, assignmentResult);
      return failure(404, learnerSubmissionsErrorCodes.notFound, 'Assignment not found');
    }

    const assignment = assignmentResult.data;

    // Check if user already has a submission
    const existingSubmissionResult = await getSubmissionByAssignmentAndUser(client, assignmentId, userId);
    
    if (!existingSubmissionResult.ok) {
      // No existing submission found - this is a first submission
      console.log(`[validateResubmissionPolicy] No existing submission found - first submission allowed`);
      return success({ allowed: true, isFirstSubmission: true });
    }

    // User already has a submission - check resubmission policy
    if (assignment.allowResubmission) {
      console.log(`[validateResubmissionPolicy] Resubmission allowed for assignment ${assignmentId}`);
      return success({ allowed: true, isFirstSubmission: false });
    } else {
      console.log(`[validateResubmissionPolicy] Resubmission not allowed for assignment ${assignmentId}`);
      return success({ 
        allowed: false, 
        isFirstSubmission: false, 
        reason: 'Resubmissions are not allowed for this assignment' 
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[validateResubmissionPolicy] Error:`, error);
    return failure(500, learnerSubmissionsErrorCodes.fetchError, errorMessage);
  }
};

/**
 * Main submission handler
 * Orchestrates all validation and creates/updates submission
 */
export const submitAssignment = async (
  client: SupabaseClient,
  userId: string,
  assignmentId: number,
  courseId: number,
  contentText: string,
  contentLink?: string,
): Promise<HandlerResult<SubmissionResponseFromService, LearnerSubmissionsServiceError, unknown>> => {
  try {
    console.log(`[submitAssignment] Starting submission process for user ${userId}, assignment ${assignmentId}, course ${courseId}`);

    // Step 1: Check submission eligibility
    const eligibilityResult = await checkSubmissionEligibility(client, userId, assignmentId, courseId);
    if (!eligibilityResult.ok) {
      return failure(500, learnerSubmissionsErrorCodes.fetchError, 'Failed to check eligibility');
    }

    if (!eligibilityResult.data.eligible) {
      console.log(`[submitAssignment] User not eligible: ${eligibilityResult.data.reason}`);
      return failure(403, learnerSubmissionsErrorCodes.unauthorized, eligibilityResult.data.reason || 'Not eligible to submit');
    }

    // Step 2: Validate submission request data
    const validationResult = await validateSubmissionRequest(client, assignmentId, contentText, contentLink);
    if (!validationResult.ok) {
      return failure(500, learnerSubmissionsErrorCodes.validationFailed, 'Failed to validate submission');
    }

    if (!validationResult.data.valid) {
      console.log(`[submitAssignment] Validation failed: ${validationResult.data.reason}`);
      return failure(400, learnerSubmissionsErrorCodes.validationFailed, validationResult.data.reason || 'Invalid submission data');
    }

    // Step 3: Check deadline and late submission policy
    const deadlineResult = await validateSubmissionDeadline(client, assignmentId);
    if (!deadlineResult.ok) {
      return failure(500, learnerSubmissionsErrorCodes.fetchError, 'Failed to check deadline');
    }

    if (!deadlineResult.data.allowed) {
      console.log(`[submitAssignment] Deadline check failed: ${deadlineResult.data.reason}`);
      return failure(400, learnerSubmissionsErrorCodes.deadlineExceeded, deadlineResult.data.reason || 'Submission deadline exceeded');
    }

    const isLate = deadlineResult.data.isLate;

    // Step 4: Check resubmission policy
    const resubmissionResult = await validateResubmissionPolicy(client, assignmentId, userId);
    if (!resubmissionResult.ok) {
      return failure(500, learnerSubmissionsErrorCodes.fetchError, 'Failed to check resubmission policy');
    }

    if (!resubmissionResult.data.allowed) {
      console.log(`[submitAssignment] Resubmission not allowed: ${resubmissionResult.data.reason}`);
      return failure(400, learnerSubmissionsErrorCodes.resubmissionNotAllowed, resubmissionResult.data.reason || 'Resubmission not allowed');
    }

    const isFirstSubmission = resubmissionResult.data.isFirstSubmission;

    // Step 5: Create or update submission
    let submissionResult;

    if (isFirstSubmission) {
      console.log(`[submitAssignment] Creating first submission`);
      submissionResult = await createSubmission(
        client,
        assignmentId,
        userId,
        contentText,
        contentLink || null,
        isLate
      );
    } else {
      console.log(`[submitAssignment] Updating existing submission`);
      // Get existing submission ID
      const existingSubmissionResult = await getSubmissionByAssignmentAndUser(client, assignmentId, userId);
      if (!existingSubmissionResult.ok) {
        return failure(500, learnerSubmissionsErrorCodes.fetchError, 'Failed to find existing submission for update');
      }

      submissionResult = await updateSubmission(client, existingSubmissionResult.data.id, {
        contentText,
        contentLink: contentLink || null,
        status: 'submitted' as const,
      });
    }

    if (!submissionResult.ok) {
      console.log(`[submitAssignment] Submission creation/update failed:`, submissionResult.error);
      return failure(500, learnerSubmissionsErrorCodes.fetchError, 'Failed to save submission');
    }

    const response: SubmissionResponseFromService = {
      success: true,
      message: isFirstSubmission ? 'Assignment submitted successfully' : 'Assignment resubmitted successfully',
      submission: submissionResult.data,
    };

    console.log(`[submitAssignment] Submission completed successfully for user ${userId}, assignment ${assignmentId}`);
    return success(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[submitAssignment] Error:`, error);
    return failure(500, learnerSubmissionsErrorCodes.fetchError, errorMessage);
  }
};

/**
 * Get user's submission for an assignment with context
 */
export const getLearnerSubmissionStatus = async (
  client: SupabaseClient,
  userId: string,
  assignmentId: number,
  courseId: number,
): Promise<HandlerResult<LearnerSubmissionResponse, LearnerSubmissionsServiceError, unknown>> => {
  try {
    console.log(`[getLearnerSubmissionStatus] Getting submission status for user ${userId}, assignment ${assignmentId}, course ${courseId}`);

    // Get assignment details for context
    const assignmentResult = await getAssignmentById(client, assignmentId);
    if (!assignmentResult.ok) {
      return failure(404, learnerSubmissionsErrorCodes.notFound, 'Assignment not found');
    }

    const assignment = assignmentResult.data;

    // Check eligibility
    const eligibilityResult = await checkSubmissionEligibility(client, userId, assignmentId, courseId);
    const canSubmit = eligibilityResult.ok && eligibilityResult.data.eligible;

    // Check if user has existing submission
    const existingSubmissionResult = await getSubmissionByAssignmentAndUser(client, assignmentId, userId);
    const hasSubmission = existingSubmissionResult.ok;

    // Check deadline status
    const deadlineResult = await validateSubmissionDeadline(client, assignmentId);
    const isLate = deadlineResult.ok ? deadlineResult.data.isLate : false;

    // Check resubmission policy
    const resubmissionResult = await validateResubmissionPolicy(client, assignmentId, userId);
    const canResubmit = resubmissionResult.ok && resubmissionResult.data.allowed && !resubmissionResult.data.isFirstSubmission;

    const response: LearnerSubmissionResponse = {
      submission: hasSubmission ? existingSubmissionResult.data : undefined,
      hasSubmission,
      canSubmit: canSubmit && (!hasSubmission || canResubmit),
      canResubmit,
      isLate,
      deadline: assignment.dueDate,
      message: !canSubmit && eligibilityResult.ok ? eligibilityResult.data.reason : undefined,
    };

    console.log(`[getLearnerSubmissionStatus] Submission status retrieved successfully`);
    return success(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[getLearnerSubmissionStatus] Error:`, error);
    return failure(500, learnerSubmissionsErrorCodes.fetchError, errorMessage);
  }
};