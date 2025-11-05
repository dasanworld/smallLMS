import { Hono } from 'hono';
import { failure, respond, success } from '@/backend/http/response';
import { getLogger, getSupabase, type AppEnv } from '@/backend/hono/context';
import {
  validateOperatorAccess,
  getReports,
  getReportById,
  updateReportStatus,
  executeEnforcementAction,
  getMetadata,
  createCategory,
  updateCategory,
  deleteCategory,
  createDifficulty,
  updateDifficulty,
  deleteDifficulty,
} from './service';
import { adminErrorCodes } from './error';
import {
  updateReportStatusSchema,
  createMetadataItemSchema,
  updateMetadataItemSchema,
  enforceActionRequestSchema,
} from '@/lib/shared/admin-validation';

export const registerAdminRoutes = (app: Hono<AppEnv>) => {
  // GET /api/admin/reports - Get all reports
  app.get('/api/admin/reports', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        logger.warn('Unauthorized reports access - no user');
        return respond(c, failure(401, adminErrorCodes.unauthorized, 'User not authenticated'));
      }

      const accessCheck = await validateOperatorAccess(supabase, user.id);
      if (!accessCheck.ok) {
        logger.warn('Non-operator attempted to access reports', { userId: user.id });
        return respond(c, accessCheck);
      }

      const status = c.req.query('status');
      const limit = parseInt(c.req.query('limit') || '20', 10);
      const offset = parseInt(c.req.query('offset') || '0', 10);

      logger.info('Fetching reports', { status, limit, offset });
      const result = await getReports(supabase, status, limit, offset);
      return respond(c, result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error fetching reports', { error: errorMessage });
      return respond(
        c,
        failure(500, adminErrorCodes.fetchError, 'Failed to fetch reports')
      );
    }
  });

  // GET /api/admin/reports/:reportId - Get report details
  app.get('/api/admin/reports/:reportId', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        logger.warn('Unauthorized report access - no user');
        return respond(c, failure(401, adminErrorCodes.unauthorized, 'User not authenticated'));
      }

      const accessCheck = await validateOperatorAccess(supabase, user.id);
      if (!accessCheck.ok) {
        return respond(c, accessCheck);
      }

      const reportId = parseInt(c.req.param('reportId'), 10);
      if (isNaN(reportId)) {
        return respond(
          c,
          failure(400, adminErrorCodes.validationError, 'Invalid report ID')
        );
      }

      logger.info('Fetching report details', { reportId });
      const result = await getReportById(supabase, reportId);
      return respond(c, result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error fetching report', { error: errorMessage });
      return respond(
        c,
        failure(500, adminErrorCodes.fetchError, 'Failed to fetch report')
      );
    }
  });

  // PATCH /api/admin/reports/:reportId/status - Update report status
  app.patch('/api/admin/reports/:reportId/status', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return respond(c, failure(401, adminErrorCodes.unauthorized, 'User not authenticated'));
      }

      const accessCheck = await validateOperatorAccess(supabase, user.id);
      if (!accessCheck.ok) {
        return respond(c, accessCheck);
      }

      const reportId = parseInt(c.req.param('reportId'), 10);
      if (isNaN(reportId)) {
        return respond(
          c,
          failure(400, adminErrorCodes.validationError, 'Invalid report ID')
        );
      }

      const body = await c.req.json();
      const validation = updateReportStatusSchema.safeParse(body);
      if (!validation.success) {
        return respond(
          c,
          failure(400, adminErrorCodes.validationError, 'Invalid status')
        );
      }

      logger.info('Updating report status', { reportId, status: validation.data.status });
      const result = await updateReportStatus(supabase, reportId, validation.data.status);
      return respond(c, result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error updating report status', { error: errorMessage });
      return respond(
        c,
        failure(500, adminErrorCodes.updateError, 'Failed to update report status')
      );
    }
  });

  // POST /api/admin/reports/:reportId/action - Execute enforcement action
  app.post('/api/admin/reports/:reportId/action', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return respond(c, failure(401, adminErrorCodes.unauthorized, 'User not authenticated'));
      }

      const accessCheck = await validateOperatorAccess(supabase, user.id);
      if (!accessCheck.ok) {
        return respond(c, accessCheck);
      }

      const reportId = parseInt(c.req.param('reportId'), 10);
      if (isNaN(reportId)) {
        return respond(
          c,
          failure(400, adminErrorCodes.validationError, 'Invalid report ID')
        );
      }

      const body = await c.req.json();
      const validation = enforceActionRequestSchema.safeParse(body);
      if (!validation.success) {
        return respond(
          c,
          failure(400, adminErrorCodes.validationError, 'Invalid action request')
        );
      }

      logger.info('Executing enforcement action', {
        reportId,
        action: validation.data.action,
        details: validation.data.details,
      });
      const result = await executeEnforcementAction(
        supabase,
        reportId,
        validation.data.action,
        validation.data.details
      );
      return respond(c, result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error executing enforcement action', { error: errorMessage });
      return respond(
        c,
        failure(500, adminErrorCodes.updateError, 'Failed to execute enforcement action')
      );
    }
  });

  // GET /api/admin/metadata - Get all metadata
  app.get('/api/admin/metadata', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        logger.warn('Unauthorized metadata access - no user');
        return respond(c, failure(401, adminErrorCodes.unauthorized, 'User not authenticated'));
      }

      const accessCheck = await validateOperatorAccess(supabase, user.id);
      if (!accessCheck.ok) {
        return respond(c, accessCheck);
      }

      logger.info('Fetching metadata');
      const result = await getMetadata(supabase);
      return respond(c, result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error fetching metadata', { error: errorMessage });
      return respond(
        c,
        failure(500, adminErrorCodes.fetchError, 'Failed to fetch metadata')
      );
    }
  });

  // POST /api/admin/categories - Create category
  app.post('/api/admin/categories', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return respond(c, failure(401, adminErrorCodes.unauthorized, 'User not authenticated'));
      }

      const accessCheck = await validateOperatorAccess(supabase, user.id);
      if (!accessCheck.ok) {
        return respond(c, accessCheck);
      }

      const body = await c.req.json();
      const validation = createMetadataItemSchema.safeParse(body);
      if (!validation.success) {
        return respond(
          c,
          failure(400, adminErrorCodes.validationError, 'Invalid category data')
        );
      }

      logger.info('Creating category', { name: validation.data.name });
      const result = await createCategory(supabase, validation.data.name);
      if (result.ok) {
        return respond(c, success(result.data, 201));
      }
      return respond(c, result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error creating category', { error: errorMessage });
      return respond(
        c,
        failure(500, adminErrorCodes.createError, 'Failed to create category')
      );
    }
  });

  // PUT /api/admin/categories/:categoryId - Update category
  app.put('/api/admin/categories/:categoryId', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return respond(c, failure(401, adminErrorCodes.unauthorized, 'User not authenticated'));
      }

      const accessCheck = await validateOperatorAccess(supabase, user.id);
      if (!accessCheck.ok) {
        return respond(c, accessCheck);
      }

      const categoryId = parseInt(c.req.param('categoryId'), 10);
      if (isNaN(categoryId)) {
        return respond(
          c,
          failure(400, adminErrorCodes.validationError, 'Invalid category ID')
        );
      }

      const body = await c.req.json();
      const validation = updateMetadataItemSchema.safeParse(body);
      if (!validation.success || !validation.data.name) {
        return respond(
          c,
          failure(400, adminErrorCodes.validationError, 'Invalid category data')
        );
      }

      logger.info('Updating category', { categoryId, name: validation.data.name });
      const result = await updateCategory(supabase, categoryId, validation.data.name);
      return respond(c, result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error updating category', { error: errorMessage });
      return respond(
        c,
        failure(500, adminErrorCodes.updateError, 'Failed to update category')
      );
    }
  });

  // DELETE /api/admin/categories/:categoryId - Delete category
  app.delete('/api/admin/categories/:categoryId', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return respond(c, failure(401, adminErrorCodes.unauthorized, 'User not authenticated'));
      }

      const accessCheck = await validateOperatorAccess(supabase, user.id);
      if (!accessCheck.ok) {
        return respond(c, accessCheck);
      }

      const categoryId = parseInt(c.req.param('categoryId'), 10);
      if (isNaN(categoryId)) {
        return respond(
          c,
          failure(400, adminErrorCodes.validationError, 'Invalid category ID')
        );
      }

      logger.info('Deleting category', { categoryId });
      const result = await deleteCategory(supabase, categoryId);
      if (result.ok) {
        return respond(c, success({ success: true }));
      }
      return respond(c, result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error deleting category', { error: errorMessage });
      return respond(
        c,
        failure(500, adminErrorCodes.deleteError, 'Failed to delete category')
      );
    }
  });

  // POST /api/admin/difficulties - Create difficulty
  app.post('/api/admin/difficulties', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return respond(c, failure(401, adminErrorCodes.unauthorized, 'User not authenticated'));
      }

      const accessCheck = await validateOperatorAccess(supabase, user.id);
      if (!accessCheck.ok) {
        return respond(c, accessCheck);
      }

      const body = await c.req.json();
      const validation = createMetadataItemSchema.safeParse(body);
      if (!validation.success) {
        return respond(
          c,
          failure(400, adminErrorCodes.validationError, 'Invalid difficulty data')
        );
      }

      logger.info('Creating difficulty', { name: validation.data.name });
      const result = await createDifficulty(supabase, validation.data.name);
      if (result.ok) {
        return respond(c, success(result.data, 201));
      }
      return respond(c, result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error creating difficulty', { error: errorMessage });
      return respond(
        c,
        failure(500, adminErrorCodes.createError, 'Failed to create difficulty')
      );
    }
  });

  // PUT /api/admin/difficulties/:difficultyId - Update difficulty
  app.put('/api/admin/difficulties/:difficultyId', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return respond(c, failure(401, adminErrorCodes.unauthorized, 'User not authenticated'));
      }

      const accessCheck = await validateOperatorAccess(supabase, user.id);
      if (!accessCheck.ok) {
        return respond(c, accessCheck);
      }

      const difficultyId = parseInt(c.req.param('difficultyId'), 10);
      if (isNaN(difficultyId)) {
        return respond(
          c,
          failure(400, adminErrorCodes.validationError, 'Invalid difficulty ID')
        );
      }

      const body = await c.req.json();
      const validation = updateMetadataItemSchema.safeParse(body);
      if (!validation.success || !validation.data.name) {
        return respond(
          c,
          failure(400, adminErrorCodes.validationError, 'Invalid difficulty data')
        );
      }

      logger.info('Updating difficulty', { difficultyId, name: validation.data.name });
      const result = await updateDifficulty(supabase, difficultyId, validation.data.name);
      return respond(c, result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error updating difficulty', { error: errorMessage });
      return respond(
        c,
        failure(500, adminErrorCodes.updateError, 'Failed to update difficulty')
      );
    }
  });

  // DELETE /api/admin/difficulties/:difficultyId - Delete difficulty
  app.delete('/api/admin/difficulties/:difficultyId', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return respond(c, failure(401, adminErrorCodes.unauthorized, 'User not authenticated'));
      }

      const accessCheck = await validateOperatorAccess(supabase, user.id);
      if (!accessCheck.ok) {
        return respond(c, accessCheck);
      }

      const difficultyId = parseInt(c.req.param('difficultyId'), 10);
      if (isNaN(difficultyId)) {
        return respond(
          c,
          failure(400, adminErrorCodes.validationError, 'Invalid difficulty ID')
        );
      }

      logger.info('Deleting difficulty', { difficultyId });
      const result = await deleteDifficulty(supabase, difficultyId);
      if (result.ok) {
        return respond(c, success({ success: true }));
      }
      return respond(c, result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error deleting difficulty', { error: errorMessage });
      return respond(
        c,
        failure(500, adminErrorCodes.deleteError, 'Failed to delete difficulty')
      );
    }
  });
};
