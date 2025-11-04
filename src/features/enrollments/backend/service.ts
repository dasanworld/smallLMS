import type { SupabaseClient } from '@supabase/supabase-js';
import { failure, success, type HandlerResult } from '@/backend/http/response';
import { EnrollmentResponseSchema, EnrollmentStatusResponseSchema, type EnrollmentResponse, type EnrollmentStatusResponse } from '@/features/enrollments/backend/schema';
import { enrollmentsErrorCodes, type EnrollmentsServiceError } from '@/features/enrollments/backend/error';

const ENROLLMENTS_TABLE = 'enrollments';
const COURSES_TABLE = 'courses';

export const createEnrollment = async (
  client: SupabaseClient,
  userId: string,
  courseId: number,
): Promise<HandlerResult<EnrollmentResponse, EnrollmentsServiceError, unknown>> => {
  try {
    const { data: courseData, error: courseError } = await client
      .from(COURSES_TABLE)
      .select('id, status')
      .eq('id', courseId)
      .eq('status', 'published')
      .single();

    if (courseError || !courseData) {
      return failure(404, enrollmentsErrorCodes.courseNotFound, 'Course not found or not published');
    }

    const { data: existingEnrollment, error: checkError } = await client
      .from(ENROLLMENTS_TABLE)
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      return failure(500, enrollmentsErrorCodes.creationError, checkError.message);
    }

    if (existingEnrollment) {
      return failure(409, enrollmentsErrorCodes.alreadyEnrolled, 'Already enrolled in this course');
    }

    const { data: enrollment, error: insertError } = await client
      .from(ENROLLMENTS_TABLE)
      .insert({ user_id: userId, course_id: courseId })
      .select('id, user_id, course_id, enrolled_at')
      .single();

    if (insertError) {
      return failure(500, enrollmentsErrorCodes.creationError, insertError.message);
    }

    const response: EnrollmentResponse = {
      success: true,
      message: 'Successfully enrolled in the course',
      enrollment: {
        id: enrollment.id,
        userId: enrollment.user_id,
        courseId: enrollment.course_id,
        enrolledAt: enrollment.enrolled_at,
      },
    };

    return success(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return failure(500, enrollmentsErrorCodes.creationError, errorMessage);
  }
};

export const cancelEnrollment = async (
  client: SupabaseClient,
  userId: string,
  courseId: number,
): Promise<HandlerResult<EnrollmentResponse, EnrollmentsServiceError, unknown>> => {
  try {
    const { data: enrollment, error: checkError } = await client
      .from(ENROLLMENTS_TABLE)
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .maybeSingle();

    if (checkError) {
      return failure(500, enrollmentsErrorCodes.cancellationError, checkError.message);
    }

    if (!enrollment) {
      return failure(404, enrollmentsErrorCodes.notEnrolled, 'Enrollment not found');
    }

    const { error: deleteError } = await client
      .from(ENROLLMENTS_TABLE)
      .delete()
      .eq('user_id', userId)
      .eq('course_id', courseId);

    if (deleteError) {
      return failure(500, enrollmentsErrorCodes.cancellationError, deleteError.message);
    }

    const response: EnrollmentResponse = {
      success: true,
      message: 'Successfully cancelled enrollment',
    };

    return success(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return failure(500, enrollmentsErrorCodes.cancellationError, errorMessage);
  }
};

export const checkEnrollmentStatus = async (
  client: SupabaseClient,
  userId: string,
  courseId: number,
): Promise<HandlerResult<EnrollmentStatusResponse, EnrollmentsServiceError, unknown>> => {
  try {
    const { data: enrollment, error } = await client
      .from(ENROLLMENTS_TABLE)
      .select('id, user_id, course_id, enrolled_at')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .maybeSingle();

    if (error) {
      return failure(500, enrollmentsErrorCodes.validationError, error.message);
    }

    const response: EnrollmentStatusResponse = {
      isEnrolled: !!enrollment,
      ...(enrollment && {
        enrollment: {
          id: enrollment.id,
          userId: enrollment.user_id,
          courseId: enrollment.course_id,
          enrolledAt: enrollment.enrolled_at,
        },
      }),
    };

    return success(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return failure(500, enrollmentsErrorCodes.validationError, errorMessage);
  }
};
