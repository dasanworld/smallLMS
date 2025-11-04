export type GradeStatus = 'not_submitted' | 'submitted' | 'graded' | 'resubmission_required';

export interface LearnerGradeSummary {
  submissionId: number;
  assignmentId: number;
  assignmentTitle: string;
  courseId: number;
  courseTitle: string;
  score: number | null;
  status: GradeStatus;
  isLate: boolean;
  feedback: string | null;
  submittedAt: string;
  scoreWeighting: number;
}

export interface CourseGradeTotal {
  courseId: number;
  courseTitle: string;
  totalScore: number | null;
  assignmentCount: number;
  completedCount: number;
}

export interface LearnerGrades {
  submissions: LearnerGradeSummary[];
  courseTotals: CourseGradeTotal[];
  message?: string;
}
