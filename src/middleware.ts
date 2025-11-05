import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";
import {
  LOGIN_PATH,
  isAuthEntryPath,
  shouldProtectPath,
} from "@/constants/auth";
import { match } from "ts-pattern";

const copyCookies = (from: NextResponse, to: NextResponse) => {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set({
      name: cookie.name,
      value: cookie.value,
      path: cookie.path,
      expires: cookie.expires,
      httpOnly: cookie.httpOnly,
      maxAge: cookie.maxAge,
      sameSite: cookie.sameSite,
      secure: cookie.secure,
    });
  });

  return to;
};

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;

  // 공용 경로는 미들웨어 인증 로직을 건너뜁니다(성능/안정성).
  // 실제 보호는 shouldProtectPath가 true인 경우에만 수행합니다.
  // 루트('/'), 로그인/회원가입 등은 즉시 통과시켜 초기 500을 예방합니다.
  if (!shouldProtectPath(pathname)) {
    return response;
  }

  // Edge(Middleware) 환경에서 환경변수가 누락되면 즉시 통과시켜 500을 방지합니다.
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    // 환경변수가 없는 경우에도 보호 경로에서는 로그인으로 유도하여 500을 방지
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = LOGIN_PATH;
    loginUrl.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const supabase = createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set({ name, value, ...(options || {}) });
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 보호 경로인데 사용자 없으면 로그인으로 리다이렉트
  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = LOGIN_PATH;
    loginUrl.searchParams.set("redirectedFrom", pathname);
    return copyCookies(response, NextResponse.redirect(loginUrl));
  }

  // 역할 기반 리다이렉트는 페이지 레벨에서 처리(미들웨어 안정성/성능)
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
