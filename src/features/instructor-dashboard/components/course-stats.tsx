'use client';

import type { CourseStats as CourseStatsType } from '@/features/instructor-dashboard/backend/schema';
import { BookOpen, FileText, Archive } from 'lucide-react';

interface CourseStatsProps {
  courseStats: CourseStatsType;
}

export function CourseStats({ courseStats }: CourseStatsProps) {
  return (
    <div className="border rounded-lg p-6 bg-white">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">코스 통계</h3>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-slate-600">작성 중</p>
            <p className="text-2xl font-bold text-slate-900">{courseStats.draft}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-slate-600">공개 중</p>
            <p className="text-2xl font-bold text-slate-900">{courseStats.published}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <Archive className="w-6 h-6 text-slate-600" />
          </div>
          <div>
            <p className="text-sm text-slate-600">보관</p>
            <p className="text-2xl font-bold text-slate-900">{courseStats.archived}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
