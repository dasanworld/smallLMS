import { z } from 'zod';
import { AssignmentResponseSchema } from '@/features/assignments/backend/schema';

export const LearnerAssignmentDetailResponseSchema = AssignmentResponseSchema;

export type LearnerAssignmentDetailResponse = z.infer<typeof LearnerAssignmentDetailResponseSchema>;

export const LearnerAssignmentListResponseSchema = z.object({
  assignments: z.array(AssignmentResponseSchema),
});

export type LearnerAssignmentListResponse = z.infer<typeof LearnerAssignmentListResponseSchema>;
