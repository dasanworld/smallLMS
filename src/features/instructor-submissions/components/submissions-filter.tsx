'use client';

import { useState } from 'react';
import { Search, Filter } from 'lucide-react';

export type SubmissionFilters = {
  courseId?: number;
  assignmentId?: number;
  status?: string;
  search?: string;
};

type SubmissionsFilterProps = {
  courses: Array<{ id: number; title: string }>;
  assignments: Array<{ id: number; title: string; courseId: number }>;
  onFiltersChange: (filters: SubmissionFilters) => void;
};

export function SubmissionsFilter({ courses, assignments, onFiltersChange }: SubmissionsFilterProps) {
  const [filters, setFilters] = useState<SubmissionFilters>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFilterChange = (newFilters: SubmissionFilters) => {
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters = { ...filters, search: e.target.value };
    handleFilterChange(newFilters);
  };

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const courseId = e.target.value ? parseInt(e.target.value) : undefined;
    const newFilters = { ...filters, courseId, assignmentId: undefined };
    handleFilterChange(newFilters);
  };

  const handleAssignmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const assignmentId = e.target.value ? parseInt(e.target.value) : undefined;
    const newFilters = { ...filters, assignmentId };
    handleFilterChange(newFilters);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value || undefined;
    const newFilters = { ...filters, status };
    handleFilterChange(newFilters);
  };

  const filteredAssignments = filters.courseId
    ? assignments.filter((a) => a.courseId === filters.courseId)
    : assignments;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Filter className="w-5 h-5" />
          필터
        </h2>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          {showAdvanced ? '숨기기' : '전체 보기'}
        </button>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="학생 이름 또는 이메일 검색..."
            value={filters.search || ''}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none"
          />
        </div>

        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">코스</label>
              <select
                value={filters.courseId || ''}
                onChange={handleCourseChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="">모든 코스</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">과제</label>
              <select
                value={filters.assignmentId || ''}
                onChange={handleAssignmentChange}
                disabled={!filters.courseId}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none disabled:bg-slate-100"
              >
                <option value="">모든 과제</option>
                {filteredAssignments.map((assignment) => (
                  <option key={assignment.id} value={assignment.id}>
                    {assignment.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">상태</label>
              <select
                value={filters.status || ''}
                onChange={handleStatusChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="">모든 상태</option>
                <option value="submitted">제출됨</option>
                <option value="graded">채점완료</option>
                <option value="resubmission_required">재제출 요청</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
