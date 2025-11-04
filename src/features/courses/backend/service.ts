import type { SupabaseClient } from '@supabase/supabase-js';
import { failure, success, type HandlerResult } from '@/backend/http/response';
import { CourseTableRowSchema, CategoryTableRowSchema, DifficultyTableRowSchema, type CourseSummaryResponse, type CourseDetailResponse, type CourseListResponse } from '@/features/courses/backend/schema';
import { coursesErrorCodes, type CoursesServiceError } from '@/features/courses/backend/error';
import type { CourseListParams } from '@/lib/shared/course-types';

const COURSES_TABLE = 'courses';
const CATEGORIES_TABLE = 'categories';
const DIFFICULTIES_TABLE = 'difficulties';
const ENROLLMENTS_TABLE = 'enrollments';

export const getCourses = async (
  client: SupabaseClient,
  params: CourseListParams,
): Promise<HandlerResult<CourseListResponse, CoursesServiceError, unknown>> => {
  try {
    let query = client
      .from(COURSES_TABLE)
      .select('*, categories(id, name), difficulties(id, name)', { count: 'exact' })
      .eq('status', 'published');

    if (params.search) {
      query = query.ilike('title', `%${params.search}%`);
    }
    if (params.category) {
      query = query.eq('category_id', params.category);
    }
    if (params.difficulty) {
      query = query.eq('difficulty_id', params.difficulty);
    }

    const order = params.sortBy === 'newest' ? 'created_at' : 'updated_at';
    query = query.order(order, { ascending: params.sortBy !== 'newest' });

    const { data, error, count } = await query;

    if (error) {
      return failure(500, coursesErrorCodes.fetchError, error.message);
    }

    const courses: CourseSummaryResponse[] = (data || []).map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      status: row.status,
      instructorId: row.instructor_id,
      categoryId: row.category_id,
      difficultyId: row.difficulty_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      category: row.categories ? { id: row.categories.id, name: row.categories.name } : null,
      difficulty: row.difficulties ? { id: row.difficulties.id, name: row.difficulties.name } : null,
    }));

    return success({ courses, total: count || 0 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return failure(500, coursesErrorCodes.fetchError, errorMessage);
  }
};

export const getCourseById = async (
  client: SupabaseClient,
  courseId: number,
): Promise<HandlerResult<CourseDetailResponse, CoursesServiceError, unknown>> => {
  try {
    const { data, error } = await client
      .from(COURSES_TABLE)
      .select('*, categories(id, name), difficulties(id, name)')
      .eq('id', courseId)
      .eq('status', 'published')
      .single();

    if (error) {
      return failure(404, coursesErrorCodes.notFound, 'Course not found');
    }

    if (!data) {
      return failure(404, coursesErrorCodes.notFound, 'Course not found');
    }

    const course: CourseDetailResponse = {
      id: data.id,
      title: data.title,
      description: data.description,
      curriculum: data.curriculum,
      status: data.status,
      instructorId: data.instructor_id,
      categoryId: data.category_id,
      difficultyId: data.difficulty_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      category: data.categories ? { id: data.categories.id, name: data.categories.name } : null,
      difficulty: data.difficulties ? { id: data.difficulties.id, name: data.difficulties.name } : null,
    };

    return success(course);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return failure(500, coursesErrorCodes.fetchError, errorMessage);
  }
};

export const getCategories = async (
  client: SupabaseClient,
): Promise<HandlerResult<Array<{ id: number; name: string }>, CoursesServiceError, unknown>> => {
  try {
    const { data, error } = await client.from(CATEGORIES_TABLE).select('id, name').order('name');

    if (error) {
      return failure(500, coursesErrorCodes.fetchError, error.message);
    }

    return success(data || []);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return failure(500, coursesErrorCodes.fetchError, errorMessage);
  }
};

export const getDifficulties = async (
  client: SupabaseClient,
): Promise<HandlerResult<Array<{ id: number; name: string }>, CoursesServiceError, unknown>> => {
  try {
    const { data, error } = await client.from(DIFFICULTIES_TABLE).select('id, name').order('name');

    if (error) {
      return failure(500, coursesErrorCodes.fetchError, error.message);
    }

    return success(data || []);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return failure(500, coursesErrorCodes.fetchError, errorMessage);
  }
};

export const getCoursesByLearner = async (
  client: SupabaseClient,
  userId: string,
): Promise<HandlerResult<CourseListResponse, CoursesServiceError, unknown>> => {
  try {
    const { data, error } = await client
      .from(ENROLLMENTS_TABLE)
      .select(
        `
        courses(
          id,
          title,
          description,
          status,
          instructor_id,
          category_id,
          difficulty_id,
          created_at,
          updated_at,
          categories(id, name),
          difficulties(id, name)
        )
      `,
        { count: 'exact' }
      )
      .eq('user_id', userId);

    if (error) {
      return failure(500, coursesErrorCodes.fetchError, error.message);
    }

    const courses: CourseSummaryResponse[] = (data || [])
      .filter((enrollment) => enrollment.courses !== null)
      .map((enrollment) => {
        const row = enrollment.courses as any;
        return {
          id: row.id,
          title: row.title,
          description: row.description,
          status: row.status,
          instructorId: row.instructor_id,
          categoryId: row.category_id,
          difficultyId: row.difficulty_id,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          category: row.categories ? { id: row.categories.id, name: row.categories.name } : null,
          difficulty: row.difficulties ? { id: row.difficulties.id, name: row.difficulties.name } : null,
        };
      });

    return success({ courses, total: data?.length || 0 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return failure(500, coursesErrorCodes.fetchError, errorMessage);
  }
};
