import type { SupabaseClient } from '@supabase/supabase-js';
import type { EnrollmentCheckerAgent, EnrollmentCheckerResult } from './types';

const ENROLLMENTS_TABLE = 'enrollments';

export const createEnrollmentCheckerAgent = (client: SupabaseClient): EnrollmentCheckerAgent => ({
  client,

  async verify(userId: string, courseId: number): Promise<EnrollmentCheckerResult> {
    console.log(`[EnrollmentCheckerAgent] Checking enrollment for user ${userId}, course ${courseId}`);

    try {
      const { data, error } = await client
        .from(ENROLLMENTS_TABLE)
        .select('id, enrolled_at')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .single();

      if (error || !data) {
        console.log(
          `[EnrollmentCheckerAgent] User ${userId} is not enrolled in course ${courseId}`
        );
        return {
          isEnrolled: false,
          reason: 'User is not enrolled in this course',
        };
      }

      console.log(
        `[EnrollmentCheckerAgent] User ${userId} verified enrolled in course ${courseId}`
      );
      return {
        isEnrolled: true,
        enrollmentId: data.id,
        enrolledAt: data.enrolled_at,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[EnrollmentCheckerAgent] Enrollment check failed:`, errorMessage);
      return {
        isEnrolled: false,
        reason: `Enrollment check error: ${errorMessage}`,
      };
    }
  },
});
