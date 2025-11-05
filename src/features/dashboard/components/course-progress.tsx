'use client';

import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import type { CourseProgress } from '@/lib/shared/dashboard-types';

interface CourseProgressProps {
  courses: CourseProgress[];
}

export function CourseProgressComponent({ courses }: CourseProgressProps) {
  if (courses.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-slate-900">내 코스</h2>
        </div>
        <div className="text-center py-12">
          <div className="text-slate-400 mb-2">📚</div>
          <p className="text-slate-500">수강신청한 코스가 없습니다</p>
          <Link
            href="/courses"
            className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            코스 탐색하기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-slate-900">내 코스</h2>
        </div>
        <span className="text-sm text-slate-500">{courses.length}개 수강 중</span>
      </div>
      <div className="space-y-3">
        {courses.map((course) => (
          <Link
            key={course.courseId}
            href={`/courses/${course.courseId}`}
            className="block p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-medium text-slate-900">{course.courseTitle}</h3>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs">
                  과제 제출 {course.submittedAssignments}/{course.totalAssignments}
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-50 text-green-700 text-xs">
                  과제 완료 {course.completedAssignments}/{course.totalAssignments}
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-xs">
                  총 {course.totalAssignments}
                </span>
              </div>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${course.progressPercentage}%` }}
              />
            </div>
            <div className="text-sm text-slate-600">진행률 {course.progressPercentage}%</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
