export type SubmissionStatus = 'submitted' | 'graded' | 'resubmission_required';

export interface Submission {
  id: number;
  assignmentId: number;
  userId: string;
  contentText: string | null;
  contentLink: string | null;
  submittedAt: string;
  isLate: boolean;
  status: SubmissionStatus;
  score: number | null;
  feedback: string | null;
}

export interface SubmissionFormData {
  contentText: string;
  contentLink?: string;
}

export interface SubmissionResult {
  success: boolean;
  data?: Submission;
  error?: string;
}