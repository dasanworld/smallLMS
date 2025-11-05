'use client';

import { useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Users, Zap, Shield, ArrowRight } from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';

const features = [
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: '코스 관리',
    description: '강사는 코스를 개설하고, 학습자는 관심있는 코스를 탐색하고 수강신청합니다',
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: '과제 관리',
    description: '과제를 생성하고 학습자의 제출물을 채점하며 피드백을 제공합니다',
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: '즉시 피드백',
    description: '학습자는 실시간으로 성적과 피드백을 확인할 수 있습니다',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: '역할 기반 관리',
    description: '강사, 학습자, 운영자 역할로 명확하게 구분된 기능을 제공합니다',
  },
];

const stats = [
  { label: '완성된 유스케이스', value: '12개' },
  { label: '페이지', value: '18개' },
  { label: 'API 엔드포인트', value: '20+' },
];

export default function Home() {
  const { user, isAuthenticated, isLoading, refresh } = useCurrentUser();
  const router = useRouter();

  const handleSignOut = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    await refresh();
    router.replace('/');
  }, [refresh, router]);

  const authActions = useMemo(() => {
    if (isLoading) {
      return null;
    }

    if (isAuthenticated && user) {
      return (
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-300">{user.email}</span>
          <Link
            href="/dashboard"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            대시보드로 이동
          </Link>
          <button
            onClick={handleSignOut}
            className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-300 hover:border-slate-400 hover:bg-slate-800 transition-colors"
          >
            로그아웃
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50 transition-colors"
        >
          로그인
        </Link>
        <Link
          href="/signup"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50 transition-colors"
        >
          회원가입
        </Link>
      </div>
    );
  }, [handleSignOut, isAuthenticated, isLoading, user]);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-slate-200 sticky top-0 z-50 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <span className="text-lg font-bold text-slate-900">SmallLMS</span>
          </div>
          {authActions}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="space-y-6 text-center">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900">
              경량 LMS로 시작하세요
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              강사와 학습자를 위한 완전한 학습 관리 시스템.
              <br />
              코스 관리부터 과제 제출, 성적 관리까지 모든 것을 한 곳에서 관리하세요.
            </p>
            <div className="flex items-center justify-center gap-4 pt-4">
              {!isAuthenticated && (
                <>
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                  >
                    시작하기
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-6 py-3 text-base font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    로그인
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-20 pt-20 border-t border-slate-200">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-blue-600">{stat.value}</div>
                <div className="text-sm text-slate-600 mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-slate-200 py-20 bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-slate-900">주요 기능</h2>
            <p className="text-slate-600">SmallLMS가 제공하는 완전한 학습 관리 기능</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-slate-200 bg-slate-50 p-6 hover:border-blue-200 hover:bg-blue-50 transition-colors shadow-sm hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <div className="text-blue-600 flex-shrink-0">{feature.icon}</div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-slate-900">{feature.title}</h3>
                    <p className="text-slate-600">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Flow */}
      <section className="border-t border-slate-200 py-20 bg-slate-50">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-bold mb-12 text-center text-slate-900">역할별 경험</h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Learner */}
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-8 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-900">
                <Users className="w-5 h-5 text-blue-600" />
                학습자
              </h3>
              <ul className="space-y-3">
                {[
                  '회원가입 후 역할 선택',
                  '코스 카탈로그에서 관심있는 코스 탐색',
                  '수강신청 및 과제 확인',
                  '과제 제출 및 재제출',
                  '성적과 피드백 확인',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-slate-700">
                    <span className="text-blue-600 font-bold mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Instructor */}
            <div className="rounded-xl border border-purple-200 bg-purple-50 p-8 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-900">
                <BookOpen className="w-5 h-5 text-purple-600" />
                강사
              </h3>
              <ul className="space-y-3">
                {[
                  '회원가입 후 강사 역할 선택',
                  '코스 생성 및 상태 관리',
                  '과제 생성 및 게시',
                  '학생 제출물 채점 및 피드백 작성',
                  '대시보드에서 채점 현황 확인',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-slate-700">
                    <span className="text-purple-600 font-bold mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-slate-200 py-20 bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-slate-50 p-12 text-center shadow-md">
            <h2 className="text-3xl font-bold mb-4 text-slate-900">지금 시작하세요</h2>
            <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
              SmallLMS와 함께 효과적인 온라인 학습 환경을 만들어보세요.
            </p>
            {!isAuthenticated && (
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-3 text-base font-medium text-white hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
              >
                무료로 시작하기
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 bg-white">
        <div className="mx-auto max-w-6xl px-6 text-center text-slate-600 text-sm">
          <p>SmallLMS © 2024. 경량 학습 관리 시스템.</p>
        </div>
      </footer>
    </div>
  );
}
