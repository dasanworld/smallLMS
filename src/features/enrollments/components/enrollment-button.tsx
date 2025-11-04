'use client';

import { useState } from 'react';

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

  const handleClick = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (isEnrolled) {
        await onCancel();
      } else {
        await onEnroll();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleClick}
        disabled={disabled || isLoading}
        className={`px-6 py-2 rounded-md font-medium text-white transition ${
          isEnrolled
            ? 'bg-red-600 hover:bg-red-700 disabled:bg-red-400'
            : 'bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400'
        } disabled:cursor-not-allowed`}
      >
        {isLoading ? '처리 중...' : isEnrolled ? '수강 취소' : '수강신청'}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
