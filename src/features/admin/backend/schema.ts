import { z } from 'zod';
import { ReportStatus, EnforcementAction } from '@/lib/shared/admin-types';

export const reportSchema = z.object({
  id: z.number().int().positive(),
  reporterId: z.string().uuid(),
  targetType: z.enum(['user', 'submission', 'course']),
  targetId: z.string(),
  reason: z.string().min(1).max(500),
  details: z.string().max(2000).optional(),
  status: z.nativeEnum(ReportStatus),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const reportsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(reportSchema),
  total: z.number().int().nonnegative(),
});

export const reportDetailResponseSchema = z.object({
  success: z.boolean(),
  data: reportSchema,
});

export const metadataItemSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(100),
  usageCount: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const metadataResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    categories: z.array(metadataItemSchema),
    difficulties: z.array(metadataItemSchema),
  }),
});

export const enforcementRequestSchema = z.object({
  action: z.nativeEnum(EnforcementAction),
  details: z.string().max(2000).optional(),
});

export const updateReportStatusSchema = z.object({
  status: z.nativeEnum(ReportStatus),
});

export type Report = z.infer<typeof reportSchema>;
export type ReportsResponse = z.infer<typeof reportsResponseSchema>;
export type ReportDetailResponse = z.infer<typeof reportDetailResponseSchema>;
export type MetadataItem = z.infer<typeof metadataItemSchema>;
export type MetadataResponse = z.infer<typeof metadataResponseSchema>;
export type EnforcementRequest = z.infer<typeof enforcementRequestSchema>;
export type UpdateReportStatus = z.infer<typeof updateReportStatusSchema>;
