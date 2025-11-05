import type { Hono } from 'hono';
import { getSupabase, getLogger, type AppEnv } from '@/backend/hono/context';
import { respond, success, failure } from '@/backend/http/response';

export const registerInstructorSubmissionsRoutes = (app: Hono<AppEnv>) => {
  app.get('/api/instructor/submissions', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return respond(c, failure(401, 'UNAUTHORIZED', 'Not authenticated'));
      }

      const courseId = c.req.query('courseId');
      const assignmentId = c.req.query('assignmentId');
      const status = c.req.query('status');
      const search = c.req.query('search');

      let query = supabase
        .from('submissions')
        .select(`
          id,
          assignment_id,
          user_id,
          content_text,
          content_link,
          submitted_at,
          status,
          score,
          feedback,
          assignments:assignment_id(
            id,
            title,
            course_id,
            courses:course_id(
              id,
              title,
              instructor_id
            )
          ),
          profiles:user_id(
            id,
            name
          )
        `)
        .eq('assignments.courses.instructor_id', user.id);

      if (courseId) {
        query = query.eq('assignments.course_id', parseInt(courseId));
      }

      if (assignmentId) {
        query = query.eq('assignment_id', parseInt(assignmentId));
      }

      if (status) {
        query = query.eq('status', status);
      }

      const { data: submissions, error } = await query;

      if (error) {
        logger.error('Failed to fetch submissions', error);
        return respond(c, failure(500, 'SERVER_ERROR', 'Failed to fetch submissions'));
      }

      const filtered = submissions
        ?.filter((sub: any) => {
          if (!search) return true;
          const searchLower = search.toLowerCase();
          const name = sub.profiles?.name || '';
          return name.toLowerCase().includes(searchLower);
        })
        .map((sub: any) => ({
          id: sub.id,
          assignmentId: sub.assignment_id,
          assignmentTitle: sub.assignments?.title,
          courseId: sub.assignments?.courses?.id,
          courseTitle: sub.assignments?.courses?.title,
          userId: sub.user_id,
          studentName: sub.profiles?.name,
          studentEmail: null,
          status: sub.status,
          submittedAt: sub.submitted_at,
          score: sub.score,
          feedback: sub.feedback,
          contentText: sub.content_text,
          contentLink: sub.content_link,
        })) || [];

      return respond(c, success({ submissions: filtered }, 200));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Instructor submissions route error', errorMessage);
      return respond(c, failure(500, 'SERVER_ERROR', errorMessage));
    }
  });

  app.get('/api/instructor/assignments', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return respond(c, failure(401, 'UNAUTHORIZED', 'Not authenticated'));
      }

      const courseId = c.req.query('courseId');

      let query = supabase
        .from('assignments')
        .select(`
          id,
          course_id,
          title,
          description,
          due_date,
          score_weighting,
          allow_late_submission,
          allow_resubmission,
          status,
          created_at,
          updated_at,
          courses:course_id(
            id,
            title,
            instructor_id
          )
        `)
        .eq('courses.instructor_id', user.id);

      if (courseId) {
        query = query.eq('course_id', parseInt(courseId));
      }

      const { data: assignments, error } = await query;

      if (error) {
        logger.error('Failed to fetch assignments', error);
        return respond(c, failure(500, 'SERVER_ERROR', 'Failed to fetch assignments'));
      }

      const withStats = await Promise.all(
        (assignments || []).map(async (assignment: any) => {
          const { data: submissions } = await supabase
            .from('submissions')
            .select('id, status')
            .eq('assignment_id', assignment.id);

          const total = submissions?.length || 0;
          const submitted = submissions?.filter(s => s.status === 'submitted').length || 0;
          const graded = submissions?.filter(s => s.status === 'graded').length || 0;

          return {
            id: assignment.id,
            courseId: assignment.course_id,
            courseTitle: assignment.courses?.title,
            title: assignment.title,
            description: assignment.description,
            dueDate: assignment.due_date,
            scoreWeighting: assignment.score_weighting,
            allowLateSubmission: assignment.allow_late_submission,
            allowResubmission: assignment.allow_resubmission,
            status: assignment.status,
            createdAt: assignment.created_at,
            updatedAt: assignment.updated_at,
            submissionStats: {
              total,
              submitted,
              graded,
              pending: total - graded,
            },
          };
        })
      );

      return respond(c, success({ assignments: withStats }, 200));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Instructor assignments route error', errorMessage);
      return respond(c, failure(500, 'SERVER_ERROR', errorMessage));
    }
  });

  app.get('/api/instructor/profile', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return respond(c, failure(401, 'UNAUTHORIZED', 'Not authenticated'));
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        logger.error('Failed to fetch profile', error);
        return respond(c, failure(500, 'SERVER_ERROR', 'Failed to fetch profile'));
      }

      return respond(c, success({ profile }, 200));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Instructor profile route error', errorMessage);
      return respond(c, failure(500, 'SERVER_ERROR', errorMessage));
    }
  });

  app.patch('/api/instructor/profile', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return respond(c, failure(401, 'UNAUTHORIZED', 'Not authenticated'));
      }

      const body = await c.req.json();
      const { name, phoneNumber } = body;

      const { data: profile, error } = await supabase
        .from('profiles')
        .update({
          name: name || undefined,
          phone_number: phoneNumber || undefined,
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        logger.error('Failed to update profile', error);
        return respond(c, failure(500, 'SERVER_ERROR', 'Failed to update profile'));
      }

      return respond(c, success({ profile }, 200));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Update profile route error', errorMessage);
      return respond(c, failure(500, 'SERVER_ERROR', errorMessage));
    }
  });
};
