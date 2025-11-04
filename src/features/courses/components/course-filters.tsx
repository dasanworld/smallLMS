'use client';

import { useState } from 'react';
import type { Category, Difficulty, SortOption } from '@/lib/shared/course-types';

type CourseFiltersProps = {
  categories: Category[];
  difficulties: Difficulty[];
  onFilterChange: (filters: { search?: string; category?: number; difficulty?: number; sortBy?: SortOption }) => void;
};

export function CourseFilters({ categories, difficulties, onFilterChange }: CourseFiltersProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const handleApplyFilters = () => {
    onFilterChange({
      search: search || undefined,
      category: category ? parseInt(category, 10) : undefined,
      difficulty: difficulty ? parseInt(difficulty, 10) : undefined,
      sortBy,
    });
  };

  const handleReset = () => {
    setSearch('');
    setCategory('');
    setDifficulty('');
    setSortBy('newest');
    onFilterChange({});
  };

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-200 p-4 bg-slate-50">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">검색</label>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="코스 제목으로 검색..."
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">카테고리</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          >
            <option value="">전체</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">난이도</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          >
            <option value="">전체</option>
            {difficulties.map((diff) => (
              <option key={diff.id} value={diff.id}>
                {diff.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">정렬</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        >
          <option value="newest">최신순</option>
          <option value="popular">인기순</option>
        </select>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleApplyFilters}
          className="flex-1 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition"
        >
          적용
        </button>
        <button
          onClick={handleReset}
          className="flex-1 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
        >
          초기화
        </button>
      </div>
    </div>
  );
}
