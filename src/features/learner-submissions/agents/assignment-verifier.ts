import type { SupabaseClient } from '@supabase/supabase-js';
import { getAssignmentById } from '@/features/assignments/backend/service';
import type { AssignmentVerifierAgent, AssignmentVerifierResult } from './types';

export const createAssignmentVerifierAgent = (client: SupabaseClient): AssignmentVerifierAgent => ({
  client,

  async verify(assignmentId: number, courseId: number): Promise<AssignmentVerifierResult> {
    console.log(
      `[AssignmentVerifierAgent] Verifying assignment ${assignmentId} for course ${courseId}`
    );

    try {
      const result = await getAssignmentById(client, assignmentId);

      if (!result.ok) {
        console.log(`[AssignmentVerifierAgent] Assignment ${assignmentId} not found`);
        return {
          isValid: false,
          reason: 'Assignment not found',
        };
      }

      const assignment = result.data;

      if (assignment.courseId !== courseId) {
        console.log(
          `[AssignmentVerifierAgent] Assignment ${assignmentId} does not belong to course ${courseId}`
        );
        return {
          isValid: false,
          reason: 'Assignment does not belong to this course',
        };
      }

      if (assignment.status === 'draft') {
        console.log(`[AssignmentVerifierAgent] Assignment ${assignmentId} is in draft status`);
        return {
          isValid: false,
          reason: 'Assignment is not yet published',
        };
      }

      if (assignment.status === 'archived') {
        console.log(`[AssignmentVerifierAgent] Assignment ${assignmentId} is archived`);
        return {
          isValid: false,
          reason: 'Assignment has been archived',
        };
      }

      console.log(
        `[AssignmentVerifierAgent] Assignment ${assignmentId} verified successfully`
      );
      return {
        isValid: true,
        assignment,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[AssignmentVerifierAgent] Verification failed:`, errorMessage);
      return {
        isValid: false,
        reason: `Assignment verification error: ${errorMessage}`,
      };
    }
  },
});
