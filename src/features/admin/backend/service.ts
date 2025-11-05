import type { SupabaseClient } from '@supabase/supabase-js';
import { failure, success, type HandlerResult } from '@/backend/http/response';
import { adminErrorCodes, type AdminServiceError } from './error';
import type { Report, MetadataItem } from './schema';
import { UserRole } from '@/lib/shared/user-types';

export const validateOperatorAccess = async (
  client: SupabaseClient,
  userId: string
): Promise<HandlerResult<boolean, AdminServiceError, unknown>> => {
  try {
    const { data, error } = await client
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('[validateOperatorAccess] Error:', error);
      return failure(500, adminErrorCodes.fetchError, 'Failed to fetch user profile');
    }

    if (!data || data.role !== UserRole.Operator) {
      console.warn('[validateOperatorAccess] User is not an operator:', userId);
      return failure(403, adminErrorCodes.operatorOnly, 'Operator role is required');
    }

    return success(true);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[validateOperatorAccess] Exception:', error);
    return failure(500, adminErrorCodes.fetchError, errorMessage);
  }
};

export const getReports = async (
  client: SupabaseClient,
  status?: string,
  limit = 20,
  offset = 0
): Promise<HandlerResult<{ reports: Report[]; total: number }, AdminServiceError, unknown>> => {
  try {
    let query = client.from('reports').select('*', { count: 'exact' });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('[getReports] Error:', error);
      return failure(500, adminErrorCodes.fetchError, 'Failed to fetch reports');
    }

    const reports = (data || []).map((r) => ({
      id: r.id,
      reporterId: r.reporter_id,
      targetType: r.target_type,
      targetId: r.target_id,
      reason: r.reason,
      details: r.details,
      status: r.status,
      createdAt: r.created_at,
      updatedAt: r.updated_at || r.created_at,
    }));

    return success({ reports, total: count || 0 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[getReports] Exception:', error);
    return failure(500, adminErrorCodes.fetchError, errorMessage);
  }
};

export const getReportById = async (
  client: SupabaseClient,
  reportId: number
): Promise<HandlerResult<Report, AdminServiceError, unknown>> => {
  try {
    const { data, error } = await client
      .from('reports')
      .select('*')
      .eq('id', reportId)
      .single();

    if (error) {
      console.error('[getReportById] Error:', error);
      return failure(404, adminErrorCodes.notFound, 'Report not found');
    }

    if (!data) {
      return failure(404, adminErrorCodes.notFound, 'Report not found');
    }

    const report: Report = {
      id: data.id,
      reporterId: data.reporter_id,
      targetType: data.target_type,
      targetId: data.target_id,
      reason: data.reason,
      details: data.details,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at || data.created_at,
    };

    return success(report);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[getReportById] Exception:', error);
    return failure(500, adminErrorCodes.fetchError, errorMessage);
  }
};

export const updateReportStatus = async (
  client: SupabaseClient,
  reportId: number,
  status: string
): Promise<HandlerResult<Report, AdminServiceError, unknown>> => {
  try {
    const { data, error } = await client
      .from('reports')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', reportId)
      .select()
      .single();

    if (error) {
      console.error('[updateReportStatus] Error:', error);
      return failure(500, adminErrorCodes.updateError, 'Failed to update report status');
    }

    if (!data) {
      return failure(404, adminErrorCodes.notFound, 'Report not found');
    }

    const report: Report = {
      id: data.id,
      reporterId: data.reporter_id,
      targetType: data.target_type,
      targetId: data.target_id,
      reason: data.reason,
      details: data.details,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at || data.created_at,
    };

    return success(report);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[updateReportStatus] Exception:', error);
    return failure(500, adminErrorCodes.updateError, errorMessage);
  }
};

export const getMetadata = async (
  client: SupabaseClient
): Promise<HandlerResult<{ categories: MetadataItem[]; difficulties: MetadataItem[] }, AdminServiceError, unknown>> => {
  try {
    const [categoriesResult, difficultiesResult] = await Promise.all([
      client.from('categories').select('*').order('name'),
      client.from('difficulties').select('*').order('name'),
    ]);

    if (categoriesResult.error) {
      console.error('[getMetadata] Categories error:', categoriesResult.error);
      return failure(500, adminErrorCodes.fetchError, 'Failed to fetch categories');
    }

    if (difficultiesResult.error) {
      console.error('[getMetadata] Difficulties error:', difficultiesResult.error);
      return failure(500, adminErrorCodes.fetchError, 'Failed to fetch difficulties');
    }

    const categories = (categoriesResult.data || []).map((c) => ({
      id: c.id,
      name: c.name,
      usageCount: c.usage_count || 0,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    }));

    const difficulties = (difficultiesResult.data || []).map((d) => ({
      id: d.id,
      name: d.name,
      usageCount: d.usage_count || 0,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    }));

    return success({ categories, difficulties });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[getMetadata] Exception:', error);
    return failure(500, adminErrorCodes.fetchError, errorMessage);
  }
};

export const createCategory = async (
  client: SupabaseClient,
  name: string
): Promise<HandlerResult<MetadataItem, AdminServiceError, unknown>> => {
  try {
    const { data, error } = await client
      .from('categories')
      .insert({ name })
      .select()
      .single();

    if (error) {
      console.error('[createCategory] Error:', error);
      return failure(500, adminErrorCodes.createError, 'Failed to create category');
    }

    if (!data) {
      return failure(500, adminErrorCodes.createError, 'Failed to create category');
    }

    const category: MetadataItem = {
      id: data.id,
      name: data.name,
      usageCount: 0,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return success(category);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[createCategory] Exception:', error);
    return failure(500, adminErrorCodes.createError, errorMessage);
  }
};

export const updateCategory = async (
  client: SupabaseClient,
  categoryId: number,
  name: string
): Promise<HandlerResult<MetadataItem, AdminServiceError, unknown>> => {
  try {
    const { data, error } = await client
      .from('categories')
      .update({ name, updated_at: new Date().toISOString() })
      .eq('id', categoryId)
      .select()
      .single();

    if (error) {
      console.error('[updateCategory] Error:', error);
      return failure(500, adminErrorCodes.updateError, 'Failed to update category');
    }

    if (!data) {
      return failure(404, adminErrorCodes.notFound, 'Category not found');
    }

    const category: MetadataItem = {
      id: data.id,
      name: data.name,
      usageCount: data.usage_count || 0,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return success(category);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[updateCategory] Exception:', error);
    return failure(500, adminErrorCodes.updateError, errorMessage);
  }
};

export const deleteCategory = async (
  client: SupabaseClient,
  categoryId: number
): Promise<HandlerResult<void, AdminServiceError, unknown>> => {
  try {
    const { data: category, error: fetchError } = await client
      .from('categories')
      .select('usage_count')
      .eq('id', categoryId)
      .single();

    if (fetchError || !category) {
      return failure(404, adminErrorCodes.notFound, 'Category not found');
    }

    if (category.usage_count > 0) {
      return failure(409, adminErrorCodes.inUse, 'Cannot delete category in use');
    }

    const { error } = await client.from('categories').delete().eq('id', categoryId);

    if (error) {
      console.error('[deleteCategory] Error:', error);
      return failure(500, adminErrorCodes.deleteError, 'Failed to delete category');
    }

    return success(undefined);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[deleteCategory] Exception:', error);
    return failure(500, adminErrorCodes.deleteError, errorMessage);
  }
};

export const createDifficulty = async (
  client: SupabaseClient,
  name: string
): Promise<HandlerResult<MetadataItem, AdminServiceError, unknown>> => {
  try {
    const { data, error } = await client
      .from('difficulties')
      .insert({ name })
      .select()
      .single();

    if (error) {
      console.error('[createDifficulty] Error:', error);
      return failure(500, adminErrorCodes.createError, 'Failed to create difficulty');
    }

    if (!data) {
      return failure(500, adminErrorCodes.createError, 'Failed to create difficulty');
    }

    const difficulty: MetadataItem = {
      id: data.id,
      name: data.name,
      usageCount: 0,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return success(difficulty);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[createDifficulty] Exception:', error);
    return failure(500, adminErrorCodes.createError, errorMessage);
  }
};

export const updateDifficulty = async (
  client: SupabaseClient,
  difficultyId: number,
  name: string
): Promise<HandlerResult<MetadataItem, AdminServiceError, unknown>> => {
  try {
    const { data, error } = await client
      .from('difficulties')
      .update({ name, updated_at: new Date().toISOString() })
      .eq('id', difficultyId)
      .select()
      .single();

    if (error) {
      console.error('[updateDifficulty] Error:', error);
      return failure(500, adminErrorCodes.updateError, 'Failed to update difficulty');
    }

    if (!data) {
      return failure(404, adminErrorCodes.notFound, 'Difficulty not found');
    }

    const difficulty: MetadataItem = {
      id: data.id,
      name: data.name,
      usageCount: data.usage_count || 0,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return success(difficulty);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[updateDifficulty] Exception:', error);
    return failure(500, adminErrorCodes.updateError, errorMessage);
  }
};

export const deleteDifficulty = async (
  client: SupabaseClient,
  difficultyId: number
): Promise<HandlerResult<void, AdminServiceError, unknown>> => {
  try {
    const { data: difficulty, error: fetchError } = await client
      .from('difficulties')
      .select('usage_count')
      .eq('id', difficultyId)
      .single();

    if (fetchError || !difficulty) {
      return failure(404, adminErrorCodes.notFound, 'Difficulty not found');
    }

    if (difficulty.usage_count > 0) {
      return failure(409, adminErrorCodes.inUse, 'Cannot delete difficulty in use');
    }

    const { error } = await client.from('difficulties').delete().eq('id', difficultyId);

    if (error) {
      console.error('[deleteDifficulty] Error:', error);
      return failure(500, adminErrorCodes.deleteError, 'Failed to delete difficulty');
    }

    return success(undefined);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[deleteDifficulty] Exception:', error);
    return failure(500, adminErrorCodes.deleteError, errorMessage);
  }
};

/**
 * 조치 실행 서비스 함수
 * 신고에 대한 조치(경고, 제출물 무효화, 계정 제한, 기각)를 실행하고 신고 상태를 해결로 변경합니다.
 */
export const executeEnforcementAction = async (
  client: SupabaseClient,
  reportId: number,
  action: string,
  details?: string
): Promise<HandlerResult<Report, AdminServiceError, unknown>> => {
  try {
    // 신고 정보 조회
    const { data: report, error: reportError } = await client
      .from('reports')
      .select('*')
      .eq('id', reportId)
      .single();

    if (reportError || !report) {
      return failure(404, adminErrorCodes.notFound, 'Report not found');
    }

    // 조치 실행 로직
    switch (action) {
      case 'warn':
        // 경고 조치: 로그만 기록 (추후 경고 테이블이 생기면 거기에 기록)
        console.log(`[executeEnforcementAction] Warning issued for report ${reportId}:`, details);
        break;

      case 'invalidate':
        // 제출물 무효화: submission의 status를 'submitted'로 되돌리거나 삭제
        if (report.target_type === 'submission') {
          const submissionId = parseInt(report.target_id, 10);
          if (!isNaN(submissionId)) {
            const { error: invalidateError } = await client
              .from('submissions')
              .update({ status: 'submitted', score: null, feedback: null })
              .eq('id', submissionId);

            if (invalidateError) {
              console.error('[executeEnforcementAction] Failed to invalidate submission:', invalidateError);
              return failure(500, adminErrorCodes.updateError, 'Failed to invalidate submission');
            }
          }
        }
        break;

      case 'restrict':
        // 계정 제한: profiles 테이블에 제한 플래그 추가 (현재는 로그만 기록)
        // 추후 계정 제한 테이블이 생기면 거기에 기록
        console.log(`[executeEnforcementAction] Account restriction for report ${reportId}:`, details);
        break;

      case 'dismiss':
        // 신고 기각: 추가 조치 없음
        break;

      default:
        return failure(400, adminErrorCodes.validationError, 'Invalid enforcement action');
    }

    // 신고 상태를 해결로 변경
    const { data: updatedReport, error: updateError } = await client
      .from('reports')
      .update({ status: 'resolved' })
      .eq('id', reportId)
      .select()
      .single();

    if (updateError) {
      console.error('[executeEnforcementAction] Error updating report status:', updateError);
      return failure(500, adminErrorCodes.updateError, 'Failed to update report status');
    }

    if (!updatedReport) {
      return failure(404, adminErrorCodes.notFound, 'Report not found after update');
    }

    const result: Report = {
      id: updatedReport.id,
      reporterId: updatedReport.reporter_id,
      targetType: updatedReport.target_type as 'user' | 'submission' | 'course',
      targetId: updatedReport.target_id,
      reason: updatedReport.reason || '',
      details: updatedReport.details || undefined,
      status: updatedReport.status as Report['status'],
      createdAt: updatedReport.created_at,
      updatedAt: updatedReport.updated_at || updatedReport.created_at,
    };

    return success(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[executeEnforcementAction] Exception:', error);
    return failure(500, adminErrorCodes.updateError, errorMessage);
  }
};
