'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

type EnrollmentButtonProps = {
  courseId: number;
  isEnrolled: boolean;
  onEnroll: () => Promise<void>;
  onCancel: () => Promise<void>;
  disabled?: boolean;
};

export function EnrollmentButton({
  courseId,
  isEnrolled,
  onEnroll,
  onCancel,
  disabled = false,
}: EnrollmentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [localIsEnrolled, setLocalIsEnrolled] = useState<boolean>(isEnrolled);
  const [successState, setSuccessState] = useState<null | 'enrolled' | 'cancelled'>(null);

  // 외부 상태 변경 시 로컬 상태 동기화
  useEffect(() => {
    setLocalIsEnrolled(isEnrolled);
  }, [isEnrolled]);

  const handleClick = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (localIsEnrolled) {
        await onCancel();
        toast({
          title: '수강 취소 완료',
          description: '해당 코스 수강이 취소되었습니다.',
        });
        setLocalIsEnrolled(false);
        setSuccessState('cancelled');
      } else {
        await onEnroll();
        toast({
          title: '수강신청 완료',
          description: '해당 코스 수강신청이 완료되었습니다.',
        });
        setLocalIsEnrolled(true);
        setSuccessState('enrolled');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  // 성공 라벨을 잠시 보여준 뒤 일반 라벨로 복귀
  useEffect(() => {
    if (!successState) return;
    const t = setTimeout(() => setSuccessState(null), 2000);
    return () => clearTimeout(t);
  }, [successState]);

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleClick}
        disabled={disabled || isLoading}
        className={`px-6 py-2 rounded-md font-medium text-white transition ${
          localIsEnrolled
            ? 'bg-red-600 hover:bg-red-700 disabled:bg-red-400'
            : 'bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400'
        } disabled:cursor-not-allowed`}
      >
        {isLoading
          ? '처리 중...'
          : successState === 'enrolled'
          ? '수강완료'
          : successState === 'cancelled'
          ? '취소 완료'
          : localIsEnrolled
          ? '수강 취소'
          : '수강신청'}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
