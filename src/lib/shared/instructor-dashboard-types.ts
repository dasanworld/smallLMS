export interface InstructorCourseSummary {
  id: number;
  title: string;
  status: 'draft' | 'published' | 'archived';
  enrollmentCount: number;
  pendingGradesCount: number;
}

export interface RecentSubmission {
  submissionId: number;
  assignmentTitle: string;
  courseTitle: string;
  studentName: string;
  submittedAt: string;
  status: string;
}

export interface CourseStats {
  draft: number;
  published: number;
  archived: number;
}

export interface InstructorDashboard {
  courses: InstructorCourseSummary[];
  totalPendingGrades: number;
  recentSubmissions: RecentSubmission[];
  courseStats: CourseStats;
}
