'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';

type LogoutButtonProps = {
  className?: string;
  label?: string;
};

export function LogoutButton({ className, label = '로그아웃' }: LogoutButtonProps) {
  const router = useRouter();
  const { refresh } = useCurrentUser();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = useCallback(async () => {
    // Supabase 세션 종료 후 클라이언트 상태 갱신 및 홈으로 이동
    try {
      setIsLoading(true);
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
      await refresh();
      router.replace('/');
    } catch (error) {
      // 오류는 사용자에게 간단히 알리고 콘솔에 상세 기록
      // eslint-disable-next-line no-console
      console.error('[LogoutButton] signOut error', error);
      alert('로그아웃 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  }, [refresh, router]);

  return (
    <button
      onClick={() => void handleSignOut()}
      disabled={isLoading}
      className={
        'inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-60 ' +
        (className || '')
      }
      title={label}
      aria-label={label}
   >
      <span className="text-sm">{isLoading ? '로그아웃 중...' : label}</span>
    </button>
  );
}


