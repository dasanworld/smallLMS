import type { SupabaseClient } from '@supabase/supabase-js';
import { getAssignmentById } from '@/features/assignments/backend/service';
import type { DeadlineCheckerAgent, DeadlineCheckerResult } from './types';

export const createDeadlineCheckerAgent = (client: SupabaseClient): DeadlineCheckerAgent => ({
  client,

  async check(assignmentId: number, allowLateSubmission: boolean): Promise<DeadlineCheckerResult> {
    console.log(
      `[DeadlineCheckerAgent] Checking deadline for assignment ${assignmentId}, allowLate=${allowLateSubmission}`
    );

    try {
      const result = await getAssignmentById(client, assignmentId);

      if (!result.ok) {
        console.log(`[DeadlineCheckerAgent] Assignment ${assignmentId} not found`);
        return {
          isLate: false,
          isAllowed: false,
          reason: 'Assignment not found',
        };
      }

      const assignment = result.data;
      const currentTime = new Date();

      if (!assignment.dueDate) {
        console.log(`[DeadlineCheckerAgent] No due date set for assignment ${assignmentId}`);
        return {
          isLate: false,
          isAllowed: true,
          deadline: undefined,
        };
      }

      const dueDate = new Date(assignment.dueDate);
      const isLate = currentTime > dueDate;

      console.log(
        `[DeadlineCheckerAgent] Current: ${currentTime.toISOString()}, Due: ${dueDate.toISOString()}, IsLate: ${isLate}`
      );

      if (!isLate) {
        console.log(`[DeadlineCheckerAgent] Submission is on time`);
        return {
          isLate: false,
          isAllowed: true,
          deadline: assignment.dueDate,
        };
      }

      if (!allowLateSubmission) {
        console.log(
          `[DeadlineCheckerAgent] Submission is late and late submission not allowed`
        );
        return {
          isLate: true,
          isAllowed: false,
          reason: 'Assignment deadline has passed and late submissions are not allowed',
          deadline: assignment.dueDate,
        };
      }

      console.log(`[DeadlineCheckerAgent] Late submission is allowed`);
      return {
        isLate: true,
        isAllowed: true,
        deadline: assignment.dueDate,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[DeadlineCheckerAgent] Deadline check failed:`, errorMessage);
      return {
        isLate: false,
        isAllowed: false,
        reason: `Deadline check error: ${errorMessage}`,
      };
    }
  },
});
