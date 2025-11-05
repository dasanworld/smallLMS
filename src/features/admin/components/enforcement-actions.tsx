'use client';

import { useState } from 'react';
import { useExecuteEnforcementMutation } from '../hooks/useAdmin';
import { EnforcementAction, type Report } from '@/lib/shared/admin-types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EnforcementActionsProps {
  report: Report;
  onActionComplete?: () => void;
}

/**
 * 조치 실행 컴포넌트
 * 신고에 대한 조치(경고, 제출물 무효화, 계정 제한, 기각)를 실행합니다.
 */
export function EnforcementActions({ report, onActionComplete }: EnforcementActionsProps) {
  const [selectedAction, setSelectedAction] = useState<EnforcementAction | null>(null);
  const [details, setDetails] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const executeMutation = useExecuteEnforcementMutation();
  const { toast } = useToast();

  const handleActionSelect = (action: EnforcementAction) => {
    setSelectedAction(action);
    setShowConfirm(true);
  };

  const handleExecute = async () => {
    if (!selectedAction) return;

    try {
      await executeMutation.mutateAsync({
        reportId: report.id,
        action: selectedAction,
        details: details || undefined,
      });

      toast({
        title: '조치 완료',
        description: '조치가 성공적으로 실행되었습니다.',
      });

      setSelectedAction(null);
      setDetails('');
      setShowConfirm(false);
      onActionComplete?.();
    } catch (error) {
      toast({
        title: '오류',
        description: '조치 실행 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  const getActionLabel = (action: EnforcementAction) => {
    switch (action) {
      case EnforcementAction.Warn:
        return '경고 조치';
      case EnforcementAction.Invalidate:
        return '제출물 무효화';
      case EnforcementAction.Restrict:
        return '계정 제한';
      case EnforcementAction.Dismiss:
        return '신고 기각';
      default:
        return action;
    }
  };

  const getActionDescription = (action: EnforcementAction) => {
    switch (action) {
      case EnforcementAction.Warn:
        return '사용자에게 경고를 부여합니다.';
      case EnforcementAction.Invalidate:
        return '제출물을 무효화하고 점수를 초기화합니다.';
      case EnforcementAction.Restrict:
        return '사용자 계정에 제한을 부과합니다.';
      case EnforcementAction.Dismiss:
        return '신고를 기각하고 해결 처리합니다.';
      default:
        return '';
    }
  };

  const getActionIcon = (action: EnforcementAction) => {
    switch (action) {
      case EnforcementAction.Warn:
        return <AlertTriangle className="w-4 h-4" />;
      case EnforcementAction.Invalidate:
        return <XCircle className="w-4 h-4" />;
      case EnforcementAction.Restrict:
        return <AlertTriangle className="w-4 h-4" />;
      case EnforcementAction.Dismiss:
        return <CheckCircle2 className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (report.status === 'resolved') {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-slate-500">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" />
            <p>이 신고는 이미 해결되었습니다.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>조치 실행</CardTitle>
        <CardDescription>신고에 대한 조치를 선택하고 실행하세요</CardDescription>
      </CardHeader>
      <CardContent>
        {!showConfirm ? (
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleActionSelect(EnforcementAction.Warn)}
            >
              {getActionIcon(EnforcementAction.Warn)}
              <div className="ml-3 text-left">
                <div className="font-medium">{getActionLabel(EnforcementAction.Warn)}</div>
                <div className="text-xs text-slate-500">{getActionDescription(EnforcementAction.Warn)}</div>
              </div>
            </Button>

            {report.targetType === 'submission' && (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleActionSelect(EnforcementAction.Invalidate)}
              >
                {getActionIcon(EnforcementAction.Invalidate)}
                <div className="ml-3 text-left">
                  <div className="font-medium">{getActionLabel(EnforcementAction.Invalidate)}</div>
                  <div className="text-xs text-slate-500">
                    {getActionDescription(EnforcementAction.Invalidate)}
                  </div>
                </div>
              </Button>
            )}

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleActionSelect(EnforcementAction.Restrict)}
            >
              {getActionIcon(EnforcementAction.Restrict)}
              <div className="ml-3 text-left">
                <div className="font-medium">{getActionLabel(EnforcementAction.Restrict)}</div>
                <div className="text-xs text-slate-500">{getActionDescription(EnforcementAction.Restrict)}</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleActionSelect(EnforcementAction.Dismiss)}
            >
              {getActionIcon(EnforcementAction.Dismiss)}
              <div className="ml-3 text-left">
                <div className="font-medium">{getActionLabel(EnforcementAction.Dismiss)}</div>
                <div className="text-xs text-slate-500">{getActionDescription(EnforcementAction.Dismiss)}</div>
              </div>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">선택한 조치: {selectedAction && getActionLabel(selectedAction)}</h3>
              <p className="text-sm text-slate-600 mb-4">
                {selectedAction && getActionDescription(selectedAction)}
              </p>
            </div>

            <div>
              <Label htmlFor="details">조치 세부 내용 (선택사항)</Label>
              <Textarea
                id="details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="조치에 대한 추가 설명을 입력하세요..."
                className="mt-2"
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={handleExecute}
                disabled={executeMutation.isPending}
                className="flex-1"
              >
                {executeMutation.isPending ? '실행 중...' : '조치 실행'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowConfirm(false);
                  setSelectedAction(null);
                  setDetails('');
                }}
                disabled={executeMutation.isPending}
              >
                취소
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

