import type { SupabaseClient } from '@supabase/supabase-js';
import type { AssignmentResponse } from '@/features/assignments/backend/schema';
import type { SubmissionResponse } from '@/features/submissions/backend/schema';

export interface AgentResult<T> {
  success: boolean;
  data?: T;
  reason?: string;
}

export interface AuthVerifierResult {
  isAuthenticated: boolean;
  userId?: string;
  reason?: string;
}

export interface EnrollmentCheckerResult {
  isEnrolled: boolean;
  enrollmentId?: number;
  enrolledAt?: string;
  reason?: string;
}

export interface AssignmentVerifierResult {
  isValid: boolean;
  assignment?: AssignmentResponse;
  reason?: string;
}

export interface DeadlineCheckerResult {
  isLate: boolean;
  isAllowed: boolean;
  reason?: string;
  deadline?: string;
}

export interface ValidationRequestResult {
  isValid: boolean;
  errors?: Record<string, string>;
}

export interface ResubmissionManagerResult {
  canSubmit: boolean;
  isFirstSubmission: boolean;
  existingSubmissionId?: number;
  reason?: string;
}

export interface SubmissionRecorderParams {
  assignmentId: number;
  userId: string;
  contentText: string;
  contentLink?: string | null;
  isLate: boolean;
  isFirstSubmission: boolean;
  existingSubmissionId?: number;
}

export interface SubmissionRecorderResult {
  submission: SubmissionResponse;
  isNew: boolean;
}

export interface StatusQueryResult {
  submission?: SubmissionResponse;
  hasSubmission: boolean;
  canSubmit: boolean;
  canResubmit: boolean;
  isLate: boolean;
  deadline?: string | null;
  message?: string;
}

export interface Agent {
  client: SupabaseClient;
}

export interface AuthVerifierAgent extends Agent {
  verify(userId: string): Promise<AuthVerifierResult>;
}

export interface EnrollmentCheckerAgent extends Agent {
  verify(userId: string, courseId: number): Promise<EnrollmentCheckerResult>;
}

export interface AssignmentVerifierAgent extends Agent {
  verify(assignmentId: number, courseId: number): Promise<AssignmentVerifierResult>;
}

export interface DeadlineCheckerAgent extends Agent {
  check(assignmentId: number, allowLateSubmission: boolean): Promise<DeadlineCheckerResult>;
}

export interface ValidationRequestAgent {
  validate(request: { contentText: string; contentLink?: string }): Promise<ValidationRequestResult>;
}

export interface ResubmissionManagerAgent extends Agent {
  check(assignmentId: number, userId: string, allowResubmission: boolean): Promise<ResubmissionManagerResult>;
}

export interface SubmissionRecorderAgent extends Agent {
  record(params: SubmissionRecorderParams): Promise<SubmissionRecorderResult>;
}

export interface StatusQueryAgent extends Agent {
  getStatus(userId: string, assignmentId: number, courseId: number): Promise<StatusQueryResult>;
}
