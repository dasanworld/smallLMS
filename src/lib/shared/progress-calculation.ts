export function calculateProgress(
  completedCount: number,
  totalCount: number
): number {
  if (totalCount === 0) return 0;
  return Math.round((completedCount / totalCount) * 100);
}

export function isUpcomingAssignment(dueDate: string): boolean {
  const now = new Date();
  const due = new Date(dueDate);
  const daysUntilDue = Math.ceil(
    (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  return daysUntilDue >= 0 && daysUntilDue <= 3;
}

export function getDaysLeft(dueDate: string): number {
  const now = new Date();
  const due = new Date(dueDate);
  return Math.ceil(
    (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
}

export function isRecentFeedback(gradedAt: string): boolean {
  const now = new Date();
  const graded = new Date(gradedAt);
  const daysSinceGraded = Math.floor(
    (now.getTime() - graded.getTime()) / (1000 * 60 * 60 * 24)
  );
  return daysSinceGraded >= 0 && daysSinceGraded <= 7;
}
