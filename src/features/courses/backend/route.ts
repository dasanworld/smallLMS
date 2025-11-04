import type { Hono } from 'hono';
import { failure, respond, type ErrorResult } from '@/backend/http/response';
import { getLogger, getSupabase, type AppEnv } from '@/backend/hono/context';
import { getCourses, getCourseById, getCategories, getDifficulties } from '@/features/courses/backend/service';
import { courseFiltersSchema } from '@/lib/shared/course-validation';
import { coursesErrorCodes, type CoursesServiceError } from '@/features/courses/backend/error';

export const registerCoursesRoutes = (app: Hono<AppEnv>) => {
  app.get('/api/courses', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const search = c.req.query('search');
    const category = c.req.query('category');
    const difficulty = c.req.query('difficulty');
    const sortBy = c.req.query('sortBy') as 'newest' | 'popular' | undefined;

    const params = {
      search,
      category: category ? parseInt(category, 10) : undefined,
      difficulty: difficulty ? parseInt(difficulty, 10) : undefined,
      sortBy: sortBy || ('newest' as const),
    };

    const result = await getCourses(supabase, params);

    if (!result.ok) {
      const errorResult = result as ErrorResult<CoursesServiceError, unknown>;
      logger.error('Failed to fetch courses', {
        code: errorResult.error.code,
        message: errorResult.error.message,
      });
    }

    return respond(c, result);
  });

  app.get('/api/courses/:courseId', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const courseId = c.req.param('courseId');

    if (!courseId || isNaN(parseInt(courseId, 10))) {
      return respond(c, failure(400, coursesErrorCodes.validationError, 'Invalid course ID'));
    }

    const result = await getCourseById(supabase, parseInt(courseId, 10));

    if (!result.ok) {
      const errorResult = result as ErrorResult<CoursesServiceError, unknown>;
      logger.error('Failed to fetch course', {
        code: errorResult.error.code,
        message: errorResult.error.message,
      });
    }

    return respond(c, result);
  });

  app.get('/api/categories', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const result = await getCategories(supabase);

    if (!result.ok) {
      const errorResult = result as ErrorResult<CoursesServiceError, unknown>;
      logger.error('Failed to fetch categories', {
        code: errorResult.error.code,
        message: errorResult.error.message,
      });
    }

    return respond(c, result);
  });

  app.get('/api/difficulties', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const result = await getDifficulties(supabase);

    if (!result.ok) {
      const errorResult = result as ErrorResult<CoursesServiceError, unknown>;
      logger.error('Failed to fetch difficulties', {
        code: errorResult.error.code,
        message: errorResult.error.message,
      });
    }

    return respond(c, result);
  });
};
