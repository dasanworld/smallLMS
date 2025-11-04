# AGENTS.md

Specialised sub-agents for LMS project automation. All agents follow the Next.js 15 + Hono + Supabase architecture defined in CLAUDE.md.

## Core Project Context

This LMS uses **feature-driven architecture** where each feature has:
- **Backend**: `error.ts`, `schema.ts`, `service.ts`, `route.ts` in `src/features/[feature]/backend/`
- **Frontend**: Components in `src/features/[feature]/components/`, hooks in `src/features/[feature]/hooks/`
- **Shared**: Types in `src/lib/shared/` and feature-specific types in `src/features/[feature]/types.ts`
- **Validation**: Zod schemas for runtime type safety

All commands available: `npm run dev`, `npm run build`, `npm run start`, `npm run lint`

---

## Available Sub-Agents

### 1. `feature-planner` (Feature Planning Agent)

**Purpose**: Analyze specification documents and create detailed implementation plans aligned with project architecture.

**When to use**:
- Starting a new use case implementation
- Need to understand all requirements before coding
- Create component/file structure plan
- Validate nothing is missed from spec/plan

**Takes**:
- Spec files (@docs/XXX/spec.md)
- Plan files (@docs/XXX/plan.md)
- Database schema (docs/database.md)
- PRD (docs/prd.md)

**Returns**:
- Complete file structure with paths
- Backend files needed (error.ts, schema.ts, service.ts, route.ts)
- Frontend components and hooks needed
- Shared types and validation schemas
- Database queries required
- Integration points with existing features
- Implementation order and dependencies

**Example**:
```
Agent: feature-planner
Task: Plan Use Case 004 (Instructor Dashboard) implementation
Context: Reference docs/004/spec.md, docs/004/plan.md, docs/database.md
Expected Output: Complete implementation plan with file structure, 
all components to create, and implementation order
```

---

### 2. `backend-builder` (Backend Code Generation Agent)

**Purpose**: Generate backend files following feature-driven architecture patterns.

**When to use**:
- Need to create error.ts, schema.ts, service.ts, route.ts
- Create Zod validation schemas
- Implement database service functions
- Generate Hono route handlers with logging

**Takes**:
- Feature name and requirements
- Database schema (docs/database.md)
- Existing error patterns (enrollments, courses examples)
- Existing service patterns (courses, enrollments service.ts)

**Returns**:
- `error.ts` with typed error codes following `Record<ErrorType, string>` pattern
- `schema.ts` with Zod schemas for request/response validation
- `service.ts` with async functions using Supabase client
- `route.ts` with Hono route handlers and logger integration

**Example**:
```
Agent: backend-builder
Task: Generate backend structure for submissions feature
Context: Create error handling, schemas, services for assignment submissions
Database: assignments table with assignments_id, status, created_at, updated_at
Expected Output: Complete error.ts, schema.ts, service.ts, route.ts files
```

---

### 3. `frontend-builder` (Frontend Code Generation Agent)

**Purpose**: Generate React components and hooks following Next.js App Router patterns.

**When to use**:
- Create React components (use 'use client' directive)
- Generate React Query hooks
- Create forms with React Hook Form + Zod validation
- Build UI with Tailwind CSS and shadcn/ui patterns

**Takes**:
- Component requirements and types
- Existing component examples (course-card, course-filters, etc.)
- Backend schemas and API response types
- Design specifications

**Returns**:
- React components with proper TypeScript types
- React Query hooks with proper queryKey and error handling
- Forms with validation using React Hook Form
- Tailwind CSS styled components
- Proper error and loading states

**Example**:
```
Agent: frontend-builder
Task: Generate components for instructor dashboard
Context: Display instructor's courses, pending submissions count, recent submissions
Need: CourseCard, PendingSubmissionsWidget, RecentSubmissionsTable components
Expected Output: Complete React components with hooks and validation
```

---

### 4. `type-validator` (Type Consistency Checker Agent)

**Purpose**: Ensure type consistency between backend, frontend, and shared layers.

**When to use**:
- After backend implementation, validate frontend types match
- Check Zod schema alignment with TypeScript interfaces
- Validate React Query hook response types
- Ensure API request/response types are consistent

**Takes**:
- Backend schema file (schema.ts)
- Backend service function file (service.ts)
- Frontend hook file (hooks/)
- Frontend component files (components/)

**Returns**:
- Type consistency validation report
- Identified mismatches between backend and frontend
- Suggestions for type corrections
- Verified type alignment across layers

**Example**:
```
Agent: type-validator
Task: Validate type consistency for submissions feature
Context: Check submissions backend (schema.ts, service.ts) matches 
frontend hooks (useSubmissions.ts) and components
Expected Output: Type validation report with any issues found and fixes
```

---

### 5. `error-fixer` (Build & Lint Error Resolution Agent)

**Purpose**: Detect and automatically fix TypeScript, ESLint, and build errors.

**When to use**:
- After code generation, run build and fix all errors
- TypeScript compilation fails
- ESLint warnings prevent successful build
- Import paths or type references are broken

**Takes**:
- Current codebase state
- Error messages from `npm run build` or `npm run lint`

**Returns**:
- Fixed files with errors resolved
- Build succeeding without warnings
- ESLint passing with 0 warnings

**Tools used**:
- `npm run build` - TypeScript checking
- `npm run lint` - ESLint checking
- Read/Edit tools to fix identified issues

**Example**:
```
Agent: error-fixer
Task: Run build and fix all errors
Context: After code generation, ensure zero build/lint errors
Expected Output: Build and lint both pass with no errors or warnings
```

---

### 6. `integration-connector` (Feature Integration Agent)

**Purpose**: Register new feature routes in Hono app and connect to existing systems.

**When to use**:
- Register new route file in src/backend/hono/app.ts
- Connect new frontend page to layout
- Add new hooks to providers
- Create navigation links between pages

**Takes**:
- New feature route file
- New frontend pages
- Existing integration patterns

**Returns**:
- Updated app.ts with new route registration
- Updated layout.tsx with new pages
- Updated navigation/menu items
- Verified integration points

**Example**:
```
Agent: integration-connector
Task: Integrate submissions feature with existing app
Context: Register submissionsRoutes in app.ts, add pages to layout
Expected Output: Complete integration with all routes registered and accessible
```

---

### 7. `api-documenter` (API Documentation Agent)

**Purpose**: Generate API documentation from implemented routes and schemas.

**When to use**:
- Document newly implemented API endpoints
- Create OpenAPI/Swagger specifications
- Generate request/response examples
- Document error codes and scenarios

**Takes**:
- route.ts files with endpoint implementations
- schema.ts files with request/response schemas
- error.ts files with error codes

**Returns**:
- API endpoint documentation (paths, methods, parameters)
- Request/response schema examples
- Error code documentation
- Usage examples
- OpenAPI/Swagger spec (optional)

**Example**:
```
Agent: api-documenter
Task: Generate API documentation for submissions endpoints
Context: Document POST /api/submissions, GET /api/submissions/:id, 
PUT /api/submissions/:id endpoints
Expected Output: Complete API documentation with examples
```

---

### 8. `performance-optimizer` (Database & Query Optimization Agent)

**Purpose**: Analyze and optimize database queries and performance-critical code.

**When to use**:
- Complex queries with multiple joins needed
- Query performance is slow
- Need to optimize N+1 query problems
- Identify missing database indexes

**Takes**:
- Database schema (docs/database.md)
- Service functions (service.ts files)
- Performance requirements/constraints

**Returns**:
- Optimized Supabase queries with proper joins
- Index recommendations
- Query performance suggestions
- N+1 problem solutions

**Example**:
```
Agent: performance-optimizer
Task: Optimize dashboard queries
Context: getLearnerDashboard needs to fetch courses, assignments, submissions efficiently
Database: Multiple tables with foreign keys
Expected Output: Optimized service functions using Supabase select with relations
```

---

## Recommended Workflow by Task Type

### 📋 Implementing a Complete Use Case
```
1. feature-planner    → Create detailed implementation plan
2. backend-builder    → Generate all backend files
3. frontend-builder   → Generate all frontend components
4. error-fixer        → Run build and fix errors
5. type-validator     → Validate type consistency
6. integration-connector → Register routes and connect
7. api-documenter     → Document endpoints
```

### 🐛 Quick Bug Fix
```
1. error-fixer        → Run build and fix errors
```

### ✨ Feature Enhancement
```
1. feature-planner    → Plan additions
2. backend-builder    → Generate new backend pieces
3. frontend-builder   → Generate new components
4. error-fixer        → Fix errors
5. type-validator     → Validate types
6. integration-connector → Connect new pieces
```

### ⚡ Performance Optimization
```
1. performance-optimizer → Analyze and suggest optimizations
2. backend-builder       → Regenerate optimized service functions
3. error-fixer           → Fix any issues
```

---

## Agent Request Format

Use this standardized format when requesting agent tasks:

```
Agent: [agent-name]
Task: [specific task description]
Context: [project-specific details, file references]
Expected Output: [what you want returned]
```

### Example: Full Use Case Implementation

```
Agent: feature-planner
Task: Plan Use Case 005 (Assignment Submission) implementation
Context: Reference docs/005/spec.md, docs/005/plan.md, docs/database.md, docs/prd.md
Expected Output: Complete implementation plan with all required files, 
database queries, and integration points

Agent: backend-builder
Task: Generate backend for assignment submissions
Context: Use plan from feature-planner, follow patterns from enrollments/submissions backends
Expected Output: error.ts, schema.ts, service.ts, route.ts with proper logging

Agent: frontend-builder
Task: Generate frontend for assignment submissions
Context: Create submission form component, submission status display, feedback view
Expected Output: React components with hooks and validation

Agent: error-fixer
Task: Run build and fix all errors
Context: Ensure zero build/lint errors after generation
Expected Output: Build and lint both pass

Agent: type-validator
Task: Validate type consistency
Context: Verify backend schemas match frontend types across all layers
Expected Output: Type validation report

Agent: integration-connector
Task: Integrate submissions feature with app
Context: Register routes in app.ts, add pages to layout
Expected Output: Feature fully integrated and accessible
```
