'use client';

import { ReportsManagement } from '@/features/admin/components/reports-management';
import { MetadataManagement } from '@/features/admin/components/metadata-management';
import { RoleBadge } from '@/components/role-badge';

/**
 * 운영자 대시보드 페이지
 * 신고 관리와 메타데이터 관리를 통합하여 제공합니다.
 */
export default function AdminPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">운영자 대시보드</h1>
          <p className="text-slate-600 mt-2">신고 처리 및 메타데이터를 관리하세요</p>
        </div>
        <RoleBadge />
      </div>

      <div className="space-y-8">
        <ReportsManagement />
        <MetadataManagement />
      </div>
    </div>
  );
}

