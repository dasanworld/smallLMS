export interface CourseProgress {
  courseId: number;
  courseTitle: string;
  progressPercentage: number;
  submittedAssignments: number;
  completedAssignments: number;
  totalAssignments: number;
}

export interface UpcomingAssignment {
  assignmentId: number;
  courseTitle: string;
  title: string;
  dueDate: string;
  daysLeft: number;
}

export interface RecentFeedback {
  submissionId: number;
  assignmentTitle: string;
  courseTitle: string;
  score: number;
  feedback: string;
  gradedAt: string;
}

export interface LearnerDashboard {
  courses: CourseProgress[];
  upcomingAssignments: UpcomingAssignment[];
  recentFeedback: RecentFeedback[];
}
