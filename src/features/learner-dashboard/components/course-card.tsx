'use client';

import Link from 'next/link';
import { BookOpen, Users } from 'lucide-react';
import type { LearnerCourseWithProgress } from '../hooks/useLearnerCoursesQuery';

type CourseCardProps = {
  course: LearnerCourseWithProgress;
};

export function CourseCard({ course }: CourseCardProps) {
  const progressColor = course.progress < 50 ? 'bg-red-500' : course.progress < 80 ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <Link href={`/my/courses/${course.id}/assignments`}>
      <div className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 mb-1">{course.title}</h3>
            <p className="text-sm text-slate-600 flex items-center gap-2">
              <Users className="w-4 h-4" />
              {course.instructor}
            </p>
          </div>
          <BookOpen className="w-5 h-5 text-blue-600" />
        </div>

        {course.description && (
          <p className="text-sm text-slate-600 mb-4 line-clamp-2">{course.description}</p>
        )}

        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-slate-600">학습 진도</span>
              <span className="text-xs font-semibold text-slate-900">{course.progress}%</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className={`h-full ${progressColor} transition-all`} style={{ width: `${course.progress}%` }} />
            </div>
          </div>

          <div className="flex justify-between text-xs text-slate-600">
            <span>과제: {course.completed_assignments}/{course.total_assignments}</span>
            {course.grade !== null && <span className="font-semibold text-slate-900">{course.grade}점</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}
