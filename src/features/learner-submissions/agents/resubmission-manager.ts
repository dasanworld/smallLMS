import type { SupabaseClient } from '@supabase/supabase-js';
import { getSubmissionByAssignmentAndUser } from '@/features/submissions/backend/service';
import type { ResubmissionManagerAgent, ResubmissionManagerResult } from './types';

export const createResubmissionManagerAgent = (
  client: SupabaseClient
): ResubmissionManagerAgent => ({
  client,

  async check(
    assignmentId: number,
    userId: string,
    allowResubmission: boolean
  ): Promise<ResubmissionManagerResult> {
    console.log(
      `[ResubmissionManagerAgent] Checking resubmission policy for user ${userId}, assignment ${assignmentId}, allowResubmit=${allowResubmission}`
    );

    try {
      const existingResult = await getSubmissionByAssignmentAndUser(client, assignmentId, userId);

      if (!existingResult.ok) {
        console.log(
          `[ResubmissionManagerAgent] No existing submission found - first submission`
        );
        return {
          canSubmit: true,
          isFirstSubmission: true,
        };
      }

      const existingSubmission = existingResult.data;

      if (!allowResubmission) {
        console.log(
          `[ResubmissionManagerAgent] Resubmission not allowed for assignment ${assignmentId}`
        );
        return {
          canSubmit: false,
          isFirstSubmission: false,
          existingSubmissionId: existingSubmission.id,
          reason: 'Resubmissions are not allowed for this assignment',
        };
      }

      console.log(
        `[ResubmissionManagerAgent] Resubmission allowed for assignment ${assignmentId}`
      );
      return {
        canSubmit: true,
        isFirstSubmission: false,
        existingSubmissionId: existingSubmission.id,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[ResubmissionManagerAgent] Check failed:`, errorMessage);
      return {
        canSubmit: false,
        isFirstSubmission: false,
        reason: `Resubmission policy check error: ${errorMessage}`,
      };
    }
  },
});
