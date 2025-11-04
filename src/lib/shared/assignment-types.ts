export type AssignmentStatus = 'draft' | 'published' | 'archived' | 'closed';

export interface Assignment {
  id: number;
  courseId: number;
  title: string;
  description: string | null;
  dueDate: string | null;
  scoreWeighting: number;
  allowLateSubmission: boolean;
  allowResubmission: boolean;
  status: AssignmentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentSummary extends Assignment {}

export interface AssignmentDetail extends Assignment {}
