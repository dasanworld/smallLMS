export interface Enrollment {
  id: number;
  userId: string;
  courseId: number;
  enrolledAt: string;
}

export interface EnrollmentStatus {
  isEnrolled: boolean;
  enrollment?: Enrollment;
}
