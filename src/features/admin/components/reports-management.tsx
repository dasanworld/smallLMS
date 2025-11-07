'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useReportsQuery, useUpdateReportStatusMutation } from '../hooks/useAdmin';
import { ReportStatus } from '@/lib/shared/admin-types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Eye, Search } from 'lucide-react';

/**
 * 신고 관리 컴포넌트
 * 신고 목록을 표시하고 상태별 필터링 및 상태 변경 기능을 제공합니다.
 */
export function ReportsManagement() {
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const { data, isLoading, error } = useReportsQuery(statusFilter);
  const updateStatusMutation = useUpdateReportStatusMutation();

  const handleStatusChange = async (reportId: number, newStatus: ReportStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ reportId, status: newStatus });
    } catch (error) {
      console.error('Failed to update report status:', error);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'received':
        return 'default';
      case 'investigating':
        return 'secondary';
      case 'resolved':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'received':
        return '접수됨';
      case 'investigating':
        return '조사 중';
      case 'resolved':
        return '해결됨';
      default:
        return status;
    }
  };

  const getTargetTypeLabel = (targetType: string) => {
    switch (targetType) {
      case 'course':
        return '코스';
      case 'submission':
        return '제출물';
      case 'user':
        return '사용자';
      default:
        return targetType;
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <p>신고 목록을 불러오는 중 오류가 발생했습니다.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>신고 관리</CardTitle>
        <CardDescription>신고 목록을 확인하고 상태를 관리하세요</CardDescription>
      </CardHeader>
      <CardContent>
        {/* 필터 버튼 */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={statusFilter === undefined ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(undefined)}
          >
            전체
          </Button>
          <Button
            variant={statusFilter === 'received' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('received')}
          >
            접수됨
          </Button>
          <Button
            variant={statusFilter === 'investigating' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('investigating')}
          >
            조사 중
          </Button>
          <Button
            variant={statusFilter === 'resolved' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('resolved')}
          >
            해결됨
          </Button>
        </div>

        {/* 신고 목록 */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-slate-200 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : !data || data.reports.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>처리할 신고가 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.reports.map((report) => (
              <div
                key={report.id}
                className="border rounded-lg p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant={getStatusBadgeVariant(report.status)}>
                        {getStatusLabel(report.status)}
                      </Badge>
                      <Badge variant="outline">{getTargetTypeLabel(report.targetType)}</Badge>
                      <span className="text-sm text-slate-500">
                        {new Date(report.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <p className="font-medium text-slate-900 mb-1">{report.reason}</p>
                    {report.details && (
                      <p className="text-sm text-slate-600 line-clamp-2">{report.details}</p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Link href={`/admin/reports/${report.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        상세보기
                      </Button>
                    </Link>
                    {report.status === 'received' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleStatusChange(report.id, ReportStatus.Investigating)}
                        disabled={updateStatusMutation.isPending}
                      >
                        조사 시작
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}



