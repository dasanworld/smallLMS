"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { RoleSelector } from "@/features/auth/components/role-selector";
import { ProfileForm, type ProfileFormValues } from "@/features/auth/components/profile-form";
import { TermsAgreement } from "@/features/auth/components/terms-agreement";
import { useOnboarding } from "@/features/auth/hooks/useOnboarding";
import { UserRole } from "@/lib/shared/user-types";

const defaultAuthState = {
  email: "",
  password: "",
  confirmPassword: "",
};

type SignupStep = "auth" | "role" | "profile" | "terms";

type SignupPageProps = {
  params: Promise<Record<string, never>>;
};

export default function SignupPage({ params }: SignupPageProps) {
  void params;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: userCurrent, isAuthenticated, isLoading, refresh } = useCurrentUser();
  
  const [step, setStep] = useState<SignupStep>("auth");
  const [authState, setAuthState] = useState(defaultAuthState);
  const [selectedRole, setSelectedRole] = useState<UserRole.Learner | UserRole.Instructor | "">("");
  const [profileData, setProfileData] = useState<ProfileFormValues | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const { mutate: completeOnboarding, isPending: isOnboardingPending } = useOnboarding({
    // 온보딩 성공 시 이전 경로(또는 홈)로 이동
    onSuccess: () => {
      const redirectedFrom = searchParams.get("redirectedFrom") ?? "/";
      router.replace(redirectedFrom);
    },
    // 실패 시 사용자에게 오류 메시지 표시
    onError: (error) => {
      setErrorMessage(error.message ?? "온보딩에 실패했습니다.");
      setIsSubmitting(false);
    },
  });

  useEffect(() => {
    // 인증이 완료되면 다음 단계(역할 선택)로 자동 이동
    if (isAuthenticated && step === "auth") {
      setStep("role");
    }
  }, [isAuthenticated, step]);

  const isAuthSubmitDisabled = useMemo(
    () =>
      !authState.email.trim() ||
      !authState.password.trim() ||
      authState.password !== authState.confirmPassword,
    [authState.confirmPassword, authState.email, authState.password]
  );

  const handleAuthChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = event.target;
      setAuthState((previous) => ({ ...previous, [name]: value }));
    },
    []
  );

    const handleAuthSubmit = useCallback(
      async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        setErrorMessage(null);
        setInfoMessage(null);

        if (authState.password !== authState.confirmPassword) {
          setErrorMessage("비밀번호가 일치하지 않습니다.");
          setIsSubmitting(false);
          return;
        }

        const supabase = getSupabaseBrowserClient();

        try {
          const result = await supabase.auth.signUp({
            email: authState.email,
            password: authState.password,
          });

          if (result.error) {
            setErrorMessage(result.error.message ?? "회원가입에 실패했습니다.");
            setIsSubmitting(false);
            return;
          }

          await refresh();

          if (result.data.session) {
            setStep("role");
            setIsSubmitting(false);
          } else {
            setInfoMessage(
              "확인 이메일을 보냈습니다. 이메일 인증 후 로그인해 주세요."
            );
            router.prefetch("/login");
            setAuthState(defaultAuthState);
            setIsSubmitting(false);
          }
        } catch (error) {
          setErrorMessage("회원가입 처리 중 문제가 발생했습니다.");
          setIsSubmitting(false);
        }
      },
      [authState.confirmPassword, authState.email, authState.password, refresh, router]
    );

  const handleRoleSubmit = useCallback(() => {
    if (selectedRole) {
      setStep("profile");
    }
  }, [selectedRole]);

  const handleProfileSubmit = useCallback((values: ProfileFormValues) => {
    setProfileData(values);
    setStep("terms");
  }, []);

  const handleTermsSubmit = useCallback(async () => {
    if (!selectedRole || !profileData) {
      setErrorMessage("필수 정보가 누락되었습니다.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const onboardingData = {
      role: selectedRole,
      name: profileData.name,
      phoneNumber: profileData.phoneNumber || undefined,
      termsAgreed: true,
    };
    completeOnboarding(onboardingData);
  }, [selectedRole, profileData, completeOnboarding]);

  if (isAuthenticated && step === "auth") {
    return null;
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center gap-10 px-6 py-16">
      <header className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-3xl font-semibold">회원가입</h1>
        <p className="text-slate-500">
          {step === "auth" && "이메일로 계정을 생성하세요."}
          {step === "role" && "당신의 역할을 선택해주세요."}
          {step === "profile" && "기본 프로필 정보를 입력해주세요."}
          {step === "terms" && "약관에 동의하고 가입을 완료하세요."}
        </p>
      </header>

      <div className="grid w-full gap-8 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 p-6 shadow-sm">
          {step === "auth" && (
            <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
              <label className="flex flex-col gap-2 text-sm text-slate-700">
                이메일
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  value={authState.email}
                  onChange={handleAuthChange}
                  className="rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-slate-700">
                비밀번호
                <input
                  type="password"
                  name="password"
                  autoComplete="new-password"
                  required
                  value={authState.password}
                  onChange={handleAuthChange}
                  className="rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-slate-700">
                비밀번호 확인
                <input
                  type="password"
                  name="confirmPassword"
                  autoComplete="new-password"
                  required
                  value={authState.confirmPassword}
                  onChange={handleAuthChange}
                  className="rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
                />
              </label>
              {errorMessage ? (
                <p className="text-sm text-rose-500">{errorMessage}</p>
              ) : null}
              {infoMessage ? (
                <p className="text-sm text-emerald-600">{infoMessage}</p>
              ) : null}
              <button
                type="submit"
                disabled={isSubmitting || isAuthSubmitDisabled}
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {isSubmitting ? "등록 중" : "다음"}
              </button>
              <p className="text-xs text-slate-500">
                이미 계정이 있으신가요?{" "}
                <Link
                  href="/login"
                  className="font-medium text-slate-700 underline hover:text-slate-900"
                >
                  로그인으로 이동
                </Link>
              </p>
            </form>
          )}

          {step === "role" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleRoleSubmit();
              }}
              className="flex flex-col gap-6"
            >
              <RoleSelector
                value={selectedRole}
                onChange={setSelectedRole}
                disabled={isSubmitting}
              />
              {errorMessage ? (
                <p className="text-sm text-rose-500">{errorMessage}</p>
              ) : null}
              <button
                type="submit"
                disabled={isSubmitting || !selectedRole}
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                다음
              </button>
            </form>
          )}

          {step === "profile" && (
            <ProfileForm
              onSubmit={handleProfileSubmit}
              disabled={isSubmitting}
            />
          )}

          {step === "terms" && (
            <div className="flex flex-col gap-4">
              <TermsAgreement
                onSubmit={() => handleTermsSubmit()}
                disabled={isSubmitting || isOnboardingPending}
              />
              {errorMessage ? (
                <p className="text-sm text-rose-500">{errorMessage}</p>
              ) : null}
            </div>
          )}
        </div>

        <figure className="overflow-hidden rounded-xl border border-slate-200">
          <Image
            src="https://picsum.photos/seed/signup/640/640"
            alt="회원가입"
            width={640}
            height={640}
            className="h-full w-full object-cover"
            priority
          />
        </figure>
      </div>
    </div>
  );
}
