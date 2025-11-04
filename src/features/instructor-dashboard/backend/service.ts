import type { SupabaseClient } from '@supabase/supabase-js';
import { failure, success, type HandlerResult } from '@/backend/http/response';
import { instructorDashboardErrorCodes, type InstructorDashboardServiceError } from '@/features/instructor-dashboard/backend/error';
import type { InstructorDashboardResponse } from '@/features/instructor-dashboard/backend/schema';

const COURSES_TABLE = 'courses';
const ENROLLMENTS_TABLE = 'enrollments';
const SUBMISSIONS_TABLE = 'submissions';
const ASSIGNMENTS_TABLE = 'assignments';
const PROFILES_TABLE = 'profiles';

export const getInstructorDashboard = async (
  client: SupabaseClient,
  userId: string
): Promise<HandlerResult<InstructorDashboardResponse, InstructorDashboardServiceError, unknown>> => {
  try {
    console.log(`[getInstructorDashboard] Fetching dashboard for instructor ${userId}`);

    const { data: courses, error: coursesError } = await client
      .from(COURSES_TABLE)
      .select('id, title, status')
      .eq('instructor_id', userId);

    if (coursesError) {
      console.error('[getInstructorDashboard] Error fetching courses:', coursesError);
      return failure(500, instructorDashboardErrorCodes.fetchError, coursesError.message);
    }

    if (!courses || courses.length === 0) {
      console.log('[getInstructorDashboard] No courses found');
      return success({
        courses: [],
        totalPendingGrades: 0,
        recentSubmissions: [],
        courseStats: { draft: 0, published: 0, archived: 0 },
      });
    }

    const courseIds = courses.map((c) => c.id);

    const { data: enrollments, error: enrollmentsError } = await client
      .from(ENROLLMENTS_TABLE)
      .select('course_id')
      .in('course_id', courseIds);

    if (enrollmentsError) {
      console.error('[getInstructorDashboard] Error fetching enrollments:', enrollmentsError);
    }

    const enrollmentCounts = new Map<number, number>();
    enrollments?.forEach((e: any) => {
      enrollmentCounts.set(e.course_id, (enrollmentCounts.get(e.course_id) || 0) + 1);
    });

    const { data: submissions, error: submissionsError } = await client
      .from(SUBMISSIONS_TABLE)
      .select(`
        id,
        status,
        submitted_at,
        user_id,
        assignment_id,
        ${ASSIGNMENTS_TABLE}:assignment_id(
          title,
          course_id
        ),
        ${PROFILES_TABLE}:user_id(
          name
        )
      `)
      .in('assignment_id', courseIds);

    if (submissionsError) {
      console.error('[getInstructorDashboard] Error fetching submissions:', submissionsError);
    }

    const pendingGrades = (submissions as any[])
      ?.filter((s) => s.status === 'submitted')
      .length || 0;

    const recentSubmissions = ((submissions as any[]) || [])
      .filter((s) => {
        const submitDate = new Date(s.submitted_at);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return submitDate >= sevenDaysAgo;
      })
      .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
      .slice(0, 10)
      .map((s: any) => ({
        submissionId: s.id,
        assignmentTitle: s.assignments?.title || 'Unknown',
        courseTitle: courses.find((c) => c.id === s.assignments?.course_id)?.title || 'Unknown',
        studentName: s.profiles?.name || 'Unknown',
        submittedAt: s.submitted_at,
        status: s.status,
      }));

    const courseStats = {
      draft: courses.filter((c) => c.status === 'draft').length,
      published: courses.filter((c) => c.status === 'published').length,
      archived: courses.filter((c) => c.status === 'archived').length,
    };

    const courseSummaries = courses.map((course) => ({
      id: course.id,
      title: course.title,
      status: course.status,
      enrollmentCount: enrollmentCounts.get(course.id) || 0,
      pendingGradesCount: (submissions as any[])?.filter((s) => s.assignments?.course_id === course.id && s.status === 'submitted').length || 0,
    }));

    return success({
      courses: courseSummaries,
      totalPendingGrades: pendingGrades,
      recentSubmissions,
      courseStats,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[getInstructorDashboard] Error:', errorMessage);
    return failure(500, instructorDashboardErrorCodes.fetchError, errorMessage);
  }
};
