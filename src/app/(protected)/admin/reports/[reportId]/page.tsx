'use client';

import { use } from 'react';
import Link from 'next/link';
import { useReportDetailQuery, useUpdateReportStatusMutation } from '@/features/admin/hooks/useAdmin';
import { EnforcementActions } from '@/features/admin/components/enforcement-actions';
import { ReportStatus, type Report } from '@/lib/shared/admin-types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, AlertCircle, Calendar, User, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type ReportDetailPageProps = {
  params: Promise<{ reportId: string }>;
};

/**
 * 신고 상세 페이지
 * 신고 상세 정보를 표시하고 조치를 실행할 수 있습니다.
 */
export default function ReportDetailPage({ params }: ReportDetailPageProps) {
  const { reportId } = use(params);
  const reportIdNum = parseInt(reportId, 10);
  const { data: report, isLoading, error } = useReportDetailQuery(reportIdNum);
  const updateStatusMutation = useUpdateReportStatusMutation();
  const { toast } = useToast();

  const handleStatusChange = async (newStatus: ReportStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ reportId: reportIdNum, status: newStatus });
      toast({
        title: '성공',
        description: '신고 상태가 변경되었습니다.',
      });
    } catch (error) {
      toast({
        title: '오류',
        description: '상태 변경 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
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

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          <div className="h-12 bg-slate-200 rounded animate-pulse" />
          <div className="h-64 bg-slate-200 rounded animate-pulse" />
          <div className="h-64 bg-slate-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <p>신고를 불러오는 중 오류가 발생했습니다.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // report가 확실히 존재하고 모든 필수 필드가 있는지 확인
  if (!report.id || !report.reporterId || !report.targetType || !report.targetId || !report.reason || !report.status || !report.createdAt) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <p>신고 데이터가 올바르지 않습니다.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const fullReport: Report = {
    id: report.id,
    reporterId: report.reporterId,
    targetType: report.targetType,
    targetId: report.targetId,
    reason: report.reason,
    details: report.details,
    status: report.status,
    createdAt: report.createdAt,
    updatedAt: report.updatedAt || report.createdAt,
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* 헤더 */}
      <div className="mb-6">
        <Link href="/admin">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            목록으로 돌아가기
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">신고 상세</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 신고 정보 */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>신고 정보</CardTitle>
                <Badge variant={getStatusBadgeVariant(fullReport.status)}>
                  {getStatusLabel(fullReport.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                  <Target className="w-4 h-4" />
                  신고 대상
                </div>
                <p className="font-medium">
                  {getTargetTypeLabel(fullReport.targetType)} (ID: {fullReport.targetId})
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                  <User className="w-4 h-4" />
                  신고 사유
                </div>
                <p className="font-medium">{fullReport.reason}</p>
              </div>

              {fullReport.details && (
                <div>
                  <div className="text-sm text-slate-500 mb-1">상세 내용</div>
                  <p className="text-slate-700 whitespace-pre-wrap">{fullReport.details}</p>
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                  <Calendar className="w-4 h-4" />
                  신고 일시
                </div>
                <p className="text-slate-700">
                  {new Date(fullReport.createdAt).toLocaleString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              {fullReport.status !== 'resolved' && fullReport.status !== 'investigating' && (
                <div className="pt-4 border-t">
                  <Button
                    onClick={() => handleStatusChange(ReportStatus.Investigating)}
                    disabled={updateStatusMutation.isPending}
                    className="w-full"
                  >
                    조사 시작
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 조치 실행 */}
        <div>
          <EnforcementActions
            report={fullReport}
            onActionComplete={() => {
              // 조치 완료 후 처리할 로직 (필요시)
            }}
          />
        </div>
      </div>
    </div>
  );
}

