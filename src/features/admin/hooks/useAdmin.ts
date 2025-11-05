import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import type { Report, MetadataItem } from '../backend/schema';

const adminAPI = {
  getReports: async (status?: string, limit = 20, offset = 0) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    const response = await fetch(`/api/admin/reports?${params}`);
    if (!response.ok) throw new Error('Failed to fetch reports');
    const data = await response.json();
    return data.data;
  },

  getReportDetail: async (reportId: number) => {
    const response = await fetch(`/api/admin/reports/${reportId}`);
    if (!response.ok) throw new Error('Failed to fetch report');
    const data = await response.json();
    return data.data;
  },

  updateReportStatus: async (reportId: number, status: string) => {
    const response = await fetch(`/api/admin/reports/${reportId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update report status');
    const data = await response.json();
    return data.data;
  },

  executeEnforcementAction: async (reportId: number, action: string, details?: string) => {
    const response = await fetch(`/api/admin/reports/${reportId}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, details }),
    });
    if (!response.ok) throw new Error('Failed to execute enforcement action');
    const data = await response.json();
    return data.data;
  },

  getMetadata: async () => {
    const response = await fetch('/api/admin/metadata');
    if (!response.ok) throw new Error('Failed to fetch metadata');
    const data = await response.json();
    return data.data;
  },

  createCategory: async (name: string) => {
    const response = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) throw new Error('Failed to create category');
    const data = await response.json();
    return data.data;
  },

  updateCategory: async (categoryId: number, name: string) => {
    const response = await fetch(`/api/admin/categories/${categoryId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) throw new Error('Failed to update category');
    const data = await response.json();
    return data.data;
  },

  deleteCategory: async (categoryId: number) => {
    const response = await fetch(`/api/admin/categories/${categoryId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete category');
    const data = await response.json();
    return data.data;
  },

  createDifficulty: async (name: string) => {
    const response = await fetch('/api/admin/difficulties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) throw new Error('Failed to create difficulty');
    const data = await response.json();
    return data.data;
  },

  updateDifficulty: async (difficultyId: number, name: string) => {
    const response = await fetch(`/api/admin/difficulties/${difficultyId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) throw new Error('Failed to update difficulty');
    const data = await response.json();
    return data.data;
  },

  deleteDifficulty: async (difficultyId: number) => {
    const response = await fetch(`/api/admin/difficulties/${difficultyId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete difficulty');
    const data = await response.json();
    return data.data;
  },
};

export const useReportsQuery = (
  status?: string,
  limit = 20,
  offset = 0,
  options?: UseQueryOptions<any>
) => {
  return useQuery({
    queryKey: ['admin', 'reports', status, limit, offset],
    queryFn: () => adminAPI.getReports(status, limit, offset),
    ...options,
  });
};

export const useReportDetailQuery = (reportId: number, options?: UseQueryOptions<Report>) => {
  return useQuery({
    queryKey: ['admin', 'report', reportId],
    queryFn: () => adminAPI.getReportDetail(reportId),
    enabled: !!reportId,
    ...options,
  });
};

export const useUpdateReportStatusMutation = (
  options?: UseMutationOptions<Report, Error, { reportId: number; status: string }>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reportId, status }) => adminAPI.updateReportStatus(reportId, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'report', data.id] });
    },
    ...options,
  });
};

export const useMetadataQuery = (options?: UseQueryOptions<any>) => {
  return useQuery({
    queryKey: ['admin', 'metadata'],
    queryFn: () => adminAPI.getMetadata(),
    ...options,
  });
};

export const useCreateCategoryMutation = (
  options?: UseMutationOptions<MetadataItem, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name) => adminAPI.createCategory(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'metadata'] });
    },
    ...options,
  });
};

export const useUpdateCategoryMutation = (
  options?: UseMutationOptions<MetadataItem, Error, { categoryId: number; name: string }>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ categoryId, name }) => adminAPI.updateCategory(categoryId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'metadata'] });
    },
    ...options,
  });
};

export const useDeleteCategoryMutation = (
  options?: UseMutationOptions<void, Error, number>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId) => adminAPI.deleteCategory(categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'metadata'] });
    },
    ...options,
  });
};

export const useCreateDifficultyMutation = (
  options?: UseMutationOptions<MetadataItem, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name) => adminAPI.createDifficulty(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'metadata'] });
    },
    ...options,
  });
};

export const useUpdateDifficultyMutation = (
  options?: UseMutationOptions<MetadataItem, Error, { difficultyId: number; name: string }>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ difficultyId, name }) => adminAPI.updateDifficulty(difficultyId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'metadata'] });
    },
    ...options,
  });
};

export const useDeleteDifficultyMutation = (
  options?: UseMutationOptions<void, Error, number>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (difficultyId) => adminAPI.deleteDifficulty(difficultyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'metadata'] });
    },
    ...options,
  });
};

export const useExecuteEnforcementMutation = (
  options?: UseMutationOptions<Report, Error, { reportId: number; action: string; details?: string }>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reportId, action, details }) =>
      adminAPI.executeEnforcementAction(reportId, action, details),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'report', data.id] });
    },
    ...options,
  });
};
