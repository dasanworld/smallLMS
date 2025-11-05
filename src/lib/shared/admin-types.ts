export enum ReportStatus {
  Received = 'received',
  Investigating = 'investigating',
  Resolved = 'resolved',
}

export enum EnforcementAction {
  Warn = 'warn',
  Invalidate = 'invalidate',
  Restrict = 'restrict',
  Dismiss = 'dismiss',
}

export interface Report {
  id: number;
  reporterId: string;
  targetType: 'user' | 'submission' | 'course';
  targetId: string;
  reason: string;
  details?: string;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
}

export interface EnforcementResult {
  id: number;
  reportId: number;
  action: EnforcementAction;
  targetId: string;
  details?: string;
  executedAt: string;
}

export interface MetadataItem {
  id: number;
  name: string;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category extends MetadataItem {}

export interface Difficulty extends MetadataItem {}
