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

export const getCoursesByInstructor = async (
  client: SupabaseClient,
  userId: string,
): Promise<HandlerResult<CourseListResponse, CoursesServiceError, unknown>> => {
  try {
    console.log(`[getCoursesByInstructor] Fetching courses for instructor ${userId}`);

    const { data, error, count } = await client
      .from(COURSES_TABLE)
      .select('*, categories(id, name), difficulties(id, name)', { count: 'exact' })
      .eq('instructor_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[getCoursesByInstructor] Error fetching courses:', error);
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

    console.log(`[getCoursesByInstructor] Retrieved ${courses.length} courses`);
    return success({ courses, total: count || 0 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[getCoursesByInstructor] Error:', errorMessage);
    return failure(500, coursesErrorCodes.fetchError, errorMessage);
  }
};

export const getInstructorCourseById = async (
  client: SupabaseClient,
  courseId: number,
  userId: string,
): Promise<HandlerResult<CourseDetailResponse, CoursesServiceError, unknown>> => {
  try {
    console.log(`[getInstructorCourseById] Fetching course ${courseId} for instructor ${userId}`);

    const { data, error } = await client
      .from(COURSES_TABLE)
      .select('*, categories(id, name), difficulties(id, name)')
      .eq('id', courseId)
      .eq('instructor_id', userId)
      .single();

    if (error || !data) {
      console.log('[getInstructorCourseById] Course not found or unauthorized');
      return failure(404, coursesErrorCodes.notFound, 'Course not found or unauthorized');
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
    console.error('[getInstructorCourseById] Error:', errorMessage);
    return failure(500, coursesErrorCodes.fetchError, errorMessage);
  }
};

export interface CreateCourseInput {
  title: string;
  description?: string;
  curriculum?: string;
  categoryId?: number;
  difficultyId?: number;
}

export interface UpdateCourseInput {
  title?: string;
  description?: string;
  curriculum?: string;
  categoryId?: number;
  difficultyId?: number;
}

export const createCourse = async (
  client: SupabaseClient,
  userId: string,
  input: CreateCourseInput,
): Promise<HandlerResult<CourseDetailResponse, CoursesServiceError, unknown>> => {
  try {
    console.log(`[createCourse] Creating course for instructor ${userId}`);

    if (!input.title || input.title.trim() === '') {
      console.log('[createCourse] Title is required');
      return failure(400, coursesErrorCodes.validationError, 'Course title is required');
    }

    const { data, error } = await client
      .from(COURSES_TABLE)
      .insert({
        title: input.title.trim(),
        description: input.description?.trim() || null,
        curriculum: input.curriculum?.trim() || null,
        category_id: input.categoryId || null,
        difficulty_id: input.difficultyId || null,
        instructor_id: userId,
        status: 'draft',
      })
      .select('*, categories(id, name), difficulties(id, name)')
      .single();

    if (error) {
      console.error('[createCourse] Error creating course:', error);
      return failure(500, coursesErrorCodes.createError, error.message);
    }

    if (!data) {
      return failure(500, coursesErrorCodes.createError, 'Failed to create course');
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

    console.log(`[createCourse] Course created: ${data.id}`);
    return success(course);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[createCourse] Error:', errorMessage);
    return failure(500, coursesErrorCodes.createError, errorMessage);
  }
};

export const updateCourse = async (
  client: SupabaseClient,
  courseId: number,
  userId: string,
  input: UpdateCourseInput,
): Promise<HandlerResult<CourseDetailResponse, CoursesServiceError, unknown>> => {
  try {
    console.log(`[updateCourse] Updating course ${courseId} for instructor ${userId}`);

    const { data: existing } = await client
      .from(COURSES_TABLE)
      .select('status, instructor_id')
      .eq('id', courseId)
      .single();

    if (!existing || existing.instructor_id !== userId) {
      console.log('[updateCourse] Course not found or unauthorized');
      return failure(403, coursesErrorCodes.unauthorized, 'Not authorized to update this course');
    }

    const updateData: any = {};
    if (input.title !== undefined) {
      if (existing.status === 'published') {
        return failure(400, coursesErrorCodes.validationError, 'Cannot modify title of published course');
      }
      if (!input.title.trim()) {
        return failure(400, coursesErrorCodes.validationError, 'Course title cannot be empty');
      }
      updateData.title = input.title.trim();
    }
    if (input.description !== undefined) {
      updateData.description = input.description.trim() || null;
    }
    if (input.curriculum !== undefined) {
      updateData.curriculum = input.curriculum.trim() || null;
    }
    if (input.categoryId !== undefined) {
      if (existing.status === 'published') {
        return failure(400, coursesErrorCodes.validationError, 'Cannot modify category of published course');
      }
      updateData.category_id = input.categoryId || null;
    }
    if (input.difficultyId !== undefined) {
      if (existing.status === 'published') {
        return failure(400, coursesErrorCodes.validationError, 'Cannot modify difficulty of published course');
      }
      updateData.difficulty_id = input.difficultyId || null;
    }
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await client
      .from(COURSES_TABLE)
      .update(updateData)
      .eq('id', courseId)
      .select('*, categories(id, name), difficulties(id, name)')
      .single();

    if (error) {
      console.error('[updateCourse] Error updating course:', error);
      return failure(500, coursesErrorCodes.updateError, error.message);
    }

    if (!data) {
      return failure(500, coursesErrorCodes.updateError, 'Failed to update course');
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

    console.log(`[updateCourse] Course updated: ${courseId}`);
    return success(course);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[updateCourse] Error:', errorMessage);
    return failure(500, coursesErrorCodes.updateError, errorMessage);
  }
};

export const updateCourseStatus = async (
  client: SupabaseClient,
  courseId: number,
  userId: string,
  status: 'draft' | 'published' | 'archived',
): Promise<HandlerResult<{ status: string }, CoursesServiceError, unknown>> => {
  try {
    console.log(`[updateCourseStatus] Updating course ${courseId} status to ${status}`);

    const { data: existing } = await client
      .from(COURSES_TABLE)
      .select('status, instructor_id')
      .eq('id', courseId)
      .single();

    if (!existing || existing.instructor_id !== userId) {
      console.log('[updateCourseStatus] Course not found or unauthorized');
      return failure(403, coursesErrorCodes.unauthorized, 'Not authorized to update this course');
    }

    if (existing.status === 'archived' && status !== 'archived') {
      console.log('[updateCourseStatus] Cannot change archived course status');
      return failure(400, coursesErrorCodes.validationError, 'Cannot change archived course status');
    }

    const { error } = await client
      .from(COURSES_TABLE)
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', courseId);

    if (error) {
      console.error('[updateCourseStatus] Error updating course status:', error);
      return failure(500, coursesErrorCodes.updateError, error.message);
    }

    console.log(`[updateCourseStatus] Course status updated: ${courseId} -> ${status}`);
    return success({ status });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[updateCourseStatus] Error:', errorMessage);
    return failure(500, coursesErrorCodes.updateError, errorMessage);
  }
};
