# Debug Report: Auth 401/bad_jwt and Onboarding Flow Stabilization

## Summary
- Symptom: `401 Unauthorized` and `bad_jwt` errors when calling API routes like `/api/auth/onboarding`, `/api/learner/dashboard`, `/api/auth/role`.
- Root causes:
  1. Server could not read Supabase session; `sb-<project>-auth-token` cookie is base64 JSON, not a raw JWT.
  2. Inconsistent Supabase URL (server pointed to local, client to cloud) led to connection/auth mismatch.
  3. Temporary attempts to bypass auth or to write into `auth.users` caused FK and PostgREST errors.

## Timeline of Issues and Fixes
1. 401 errors after signup (session not recognized) → Added GET `/api/auth/onboarding` and traced auth flow.
2. Cookie parsing: server attempted to read a non-existent/incorrect cookie name, or use raw cookie string as JWT → introduced correct extraction from `sb-<project>-auth-token` (base64-encoded JSON) and parsed `access_token`.
3. `bad_jwt` errors: some tokens were not valid JWTs → validated format (`a.b.c`) and used Authorization Bearer fallback when present.
4. Service-role fallback (temporary) caused DB writes to `auth.users` (system schema) → yielded `PGRST205` and FK errors. Removed this path.
5. FK violation on `profiles.id` → resolved by using real `authUserId` obtained via `supabase.auth.getUser(accessToken)` instead of temp IDs.
6. Env mismatch: server `SUPABASE_URL` pointed to localhost, client to cloud → unified to the cloud URL.

## Final Architecture Decisions
- Middleware (`withSupabase`):
  - Parse `sb-<project>-auth-token` cookie (base64 JSON) → extract `access_token` → create Supabase client with `Authorization: Bearer <token>` when available.
  - Fallback: read Bearer token from `Authorization` header.
- Onboarding route:
  - Extract access token (same as middleware) → `supabase.auth.getUser(accessToken)` → obtain `authUserId`.
  - Create `profiles` and `terms_agreements` for `authUserId`. Do NOT write to `auth.users` directly.
  - Return success. Errors are surfaced with structured responses.

## Testing Checklist
- Browser and API on same origin/port to ensure cookies are sent.
- Network tab shows Cookie header present for API requests.
- `GET /api/auth/onboarding` → 200 with `{ completed: boolean }`.
- `POST /api/auth/onboarding` with valid session → 200 and profile created.
- Protected routes (`/api/learner/dashboard`) → 200 with valid session; 401 otherwise.

## Lessons Learned
- Supabase Auth cookie value for `sb-<project>-auth-token` is base64-encoded JSON. Always decode and parse to obtain `access_token`.
- Avoid writing to `auth.users` via PostgREST. Always authenticate and use the user ID from Auth.
- Keep server/client Supabase URLs consistent.

## Follow-ups
- Extract cookie/token parsing into a shared utility to DRY middleware and routes.
- Replace remaining console-based debugging with structured logging (info/error) only where necessary.


