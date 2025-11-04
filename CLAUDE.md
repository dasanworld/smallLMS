# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Database
- `npx supabase start` - Start local Supabase
- `npx supabase reset` - Reset local database
- `npx supabase db push` - Push migrations to remote

## Architecture

This is a Next.js 15 full-stack application built with TypeScript using a feature-driven architecture.

### Backend (Hono API)
- **API Routes**: Located at `/api/[[...hono]]` - catches all API requests
- **Hono App**: Centralized in `src/backend/hono/app.ts` with singleton pattern
- **Middleware Stack**: Error boundary → App context → Supabase auth
- **Feature Routes**: Each feature registers routes in `src/features/[feature]/backend/route.ts`
- **Services**: Business logic in `src/features/[feature]/backend/service.ts`
- **Schemas**: Zod validation in `src/features/[feature]/backend/schema.ts`

### Frontend (Next.js App Router)
- **App Directory**: Uses App Router with `(protected)` route groups
- **Authentication**: Supabase auth with middleware-based route protection
- **State Management**: React Query for server state, Zustand for client state
- **UI Components**: Shadcn/ui with Radix primitives and Tailwind CSS
- **Forms**: React Hook Form with Zod validation

### Authentication Flow
- **Middleware**: `src/middleware.ts` handles route protection and redirects
- **Server Context**: `src/features/auth/server/load-current-user.ts` loads user on server
- **Client Context**: `src/features/auth/context/current-user-context.tsx` provides user state
- **Protected Routes**: Use `(protected)` layout for authenticated pages

### Database
- **Supabase**: PostgreSQL with Row Level Security
- **Migrations**: Located in `supabase/migrations/`
- **Types**: Generated types in `src/lib/supabase/types.ts`
- **Clients**: Server/client Supabase instances with SSR support

### Feature Structure
Each feature follows this pattern:
```
src/features/[feature]/
├── backend/
│   ├── route.ts      # API routes
│   ├── service.ts    # Business logic
│   ├── schema.ts     # Zod validation
│   └── error.ts      # Error definitions
├── components/       # React components
├── hooks/           # React Query hooks
├── lib/             # DTOs and utilities
└── types.ts         # TypeScript types
```

### Key Technologies
- **Next.js 15**: App Router, Server Components, Middleware
- **Hono**: Lightweight web framework for API routes
- **Supabase**: Authentication, database, real-time subscriptions
- **React Query**: Server state management and caching
- **Zod**: Runtime type validation
- **Tailwind CSS**: Utility-first styling
- **TypeScript**: Full type safety across stack

### Development Patterns
- Use Server Components by default, Client Components only when needed
- Feature-based organization with co-located backend/frontend code
- Standardized error handling with typed error responses
- Type-safe API contracts using Zod schemas
- Consistent file naming: kebab-case for files, PascalCase for components