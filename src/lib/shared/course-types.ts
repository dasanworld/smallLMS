export enum CourseStatus {
  Draft = 'draft',
  Published = 'published',
  Archived = 'archived',
  Closed = 'closed',
}

export interface Category {
  id: number;
  name: string;
}

export interface Difficulty {
  id: number;
  name: string;
}

export interface CourseSummary {
  id: number;
  title: string;
  description: string | null;
  status: CourseStatus;
  instructorId: string;
  categoryId: number | null;
  difficultyId: number | null;
  createdAt: string;
  updatedAt: string;
  category?: Category | null;
  difficulty?: Difficulty | null;
}

export interface CourseDetail extends CourseSummary {
  curriculum: string | null;
}

export interface CourseListParams {
  search?: string;
  category?: number;
  difficulty?: number;
  sortBy?: 'newest' | 'popular';
}

export type SortOption = 'newest' | 'popular';
