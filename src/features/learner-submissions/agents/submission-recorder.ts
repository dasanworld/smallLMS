import type { SupabaseClient } from '@supabase/supabase-js';
import {
  createSubmission,
  updateSubmission,
} from '@/features/submissions/backend/service';
import type {
  SubmissionRecorderAgent,
  SubmissionRecorderParams,
  SubmissionRecorderResult,
} from './types';

export const createSubmissionRecorderAgent = (client: SupabaseClient): SubmissionRecorderAgent => ({
  client,

  async record(params: SubmissionRecorderParams): Promise<SubmissionRecorderResult> {
    const {
      assignmentId,
      userId,
      contentText,
      contentLink,
      isLate,
      isFirstSubmission,
      existingSubmissionId,
    } = params;

    console.log(
      `[SubmissionRecorderAgent] Recording submission - assignment ${assignmentId}, user ${userId}, isFirst=${isFirstSubmission}`
    );

    try {
      let result;

      if (isFirstSubmission) {
        console.log(`[SubmissionRecorderAgent] Creating new submission`);
        result = await createSubmission(client, assignmentId, userId, contentText, contentLink || null, isLate);

        if (!result.ok) {
          throw new Error(
            `Failed to create submission: ${result.error?.message || 'Unknown error'}`
          );
        }

        console.log(
          `[SubmissionRecorderAgent] Submission created successfully - ID: ${result.data.id}`
        );
        return {
          submission: result.data,
          isNew: true,
        };
      } else {
        if (!existingSubmissionId) {
          throw new Error('existingSubmissionId required for resubmission');
        }

        console.log(
          `[SubmissionRecorderAgent] Updating existing submission - ID: ${existingSubmissionId}`
        );
        result = await updateSubmission(client, existingSubmissionId, {
          contentText,
          contentLink: contentLink || null,
          status: 'submitted' as const,
        });

        if (!result.ok) {
          throw new Error(
            `Failed to update submission: ${result.error?.message || 'Unknown error'}`
          );
        }

        console.log(
          `[SubmissionRecorderAgent] Submission updated successfully - ID: ${result.data.id}`
        );
        return {
          submission: result.data,
          isNew: false,
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[SubmissionRecorderAgent] Recording failed:`, errorMessage);
      throw new Error(`Submission recording failed: ${errorMessage}`);
    }
  },
});
