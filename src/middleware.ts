import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";
import { env } from "@/constants/env";
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

  const supabase = createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set({ name, value, ...options });
            response.cookies.set({ name, value, ...options });
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const decision = match({ user, pathname: request.nextUrl.pathname })
    .when(
      ({ user: currentUser, pathname }) =>
        !currentUser && shouldProtectPath(pathname),
      ({ pathname }) => {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = LOGIN_PATH;
        loginUrl.searchParams.set("redirectedFrom", pathname);

        return copyCookies(response, NextResponse.redirect(loginUrl));
      }
    )
    .when(
      ({ user: currentUser, pathname }) =>
        currentUser && 
        (pathname === "/dashboard" || pathname === "/instructor/dashboard" || pathname === "/admin"),
      async ({ user: currentUser, pathname }) => {
        // 대시보드 페이지 접근 시 역할에 따라 리다이렉트
        const supabaseAuth = createServerClient<Database>(
          env.NEXT_PUBLIC_SUPABASE_URL,
          env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          {
            cookies: {
              getAll() {
                return request.cookies.getAll();
              },
              setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value, options }) => {
                  request.cookies.set({ name, value, ...options });
                  response.cookies.set({ name, value, ...options });
                });
              },
            },
          }
        );

        const { data: profile, error: profileError } = await supabaseAuth
          .from("profiles")
          .select("role")
          .eq("id", currentUser.id)
          .single<{ role: string }>();

        if (profileError || !profile) {
          return response;
        }

        const role = profile.role;

        // 현재 경로와 역할이 맞지 않으면 리다이렉트
        if (role === "learner" && pathname !== "/dashboard") {
          const redirectUrl = request.nextUrl.clone();
          redirectUrl.pathname = "/dashboard";
          return copyCookies(response, NextResponse.redirect(redirectUrl));
        }

        if (role === "instructor" && pathname !== "/instructor/dashboard") {
          const redirectUrl = request.nextUrl.clone();
          redirectUrl.pathname = "/instructor/dashboard";
          return copyCookies(response, NextResponse.redirect(redirectUrl));
        }

        if (role === "operator" && pathname !== "/admin") {
          const redirectUrl = request.nextUrl.clone();
          redirectUrl.pathname = "/admin";
          return copyCookies(response, NextResponse.redirect(redirectUrl));
        }

        return response;
      }
    )
    .otherwise(() => response);

  return decision;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
