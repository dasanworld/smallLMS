import { z } from 'zod';
import { ReportStatus, EnforcementAction } from './admin-types';

export const reportStatusSchema = z.nativeEnum(ReportStatus);

export const enforcementActionSchema = z.nativeEnum(EnforcementAction);

export const metadataItemSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(100),
  usageCount: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const reportSchema = z.object({
  id: z.number().int().positive(),
  reporterId: z.string().uuid(),
  targetType: z.enum(['user', 'submission', 'course']),
  targetId: z.string(),
  reason: z.string().min(1).max(500),
  details: z.string().max(2000).optional(),
  status: reportStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const enforcementResultSchema = z.object({
  id: z.number().int().positive(),
  reportId: z.number().int().positive(),
  action: enforcementActionSchema,
  targetId: z.string(),
  details: z.string().max(2000).optional(),
  executedAt: z.string().datetime(),
});

export const createMetadataItemSchema = z.object({
  name: z.string().min(1).max(100),
});

export const updateMetadataItemSchema = z.object({
  name: z.string().min(1).max(100).optional(),
});

export const enforceActionRequestSchema = z.object({
  action: enforcementActionSchema,
  details: z.string().max(2000).optional(),
});

export const updateReportStatusSchema = z.object({
  status: reportStatusSchema,
});
