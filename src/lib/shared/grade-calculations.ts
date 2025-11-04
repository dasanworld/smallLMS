import type { LearnerGradeSummary, CourseGradeTotal, GradeStatus } from './grade-types';

export const calculateCourseTotal = (
  submissions: LearnerGradeSummary[],
  courseId: number
): number | null => {
  const courseSubmissions = submissions.filter((s) => s.courseId === courseId && s.status === 'graded' && s.score !== null);

  if (courseSubmissions.length === 0) return null;

  const totalWeightedScore = courseSubmissions.reduce((sum, sub) => {
    return sum + (sub.score! * sub.scoreWeighting);
  }, 0);

  const totalWeighting = courseSubmissions.reduce((sum, sub) => sum + sub.scoreWeighting, 0);

  if (totalWeighting === 0) return null;

  return Math.round((totalWeightedScore / totalWeighting) * 100) / 100;
};

export const getGradeStatus = (submissionStatus: string): GradeStatus => {
  switch (submissionStatus) {
    case 'submitted':
      return 'submitted';
    case 'graded':
      return 'graded';
    case 'resubmission_required':
      return 'resubmission_required';
    default:
      return 'not_submitted';
  }
};

export const formatGradeDisplay = (score: number | null): string => {
  if (score === null) return 'N/A';
  return Math.round(score * 100) / 100 + '점';
};

export const calculateCourseGradeTotals = (submissions: LearnerGradeSummary[]): CourseGradeTotal[] => {
  const courseMap = new Map<number, { title: string; submissions: LearnerGradeSummary[] }>();

  submissions.forEach((sub) => {
    if (!courseMap.has(sub.courseId)) {
      courseMap.set(sub.courseId, { title: sub.courseTitle, submissions: [] });
    }
    courseMap.get(sub.courseId)!.submissions.push(sub);
  });

  return Array.from(courseMap.entries()).map(([courseId, { title, submissions: subs }]) => ({
    courseId,
    courseTitle: title,
    totalScore: calculateCourseTotal(submissions, courseId),
    assignmentCount: new Set(subs.map((s) => s.assignmentId)).size,
    completedCount: subs.filter((s) => s.status === 'graded').length,
  }));
};
