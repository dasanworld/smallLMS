# Sub-Agents Quick Reference

Based on CLAUDE.md architecture: **Next.js 15 + Hono API + Supabase + Feature-Driven Structure**

## 8 Specialized Sub-Agents

| # | Agent | Purpose | When to Use |
|---|-------|---------|------------|
| 1️⃣ | **feature-planner** | Analyze specs, create implementation plans | Starting new use case |
| 2️⃣ | **backend-builder** | Generate error.ts, schema.ts, service.ts, route.ts | Backend files needed |
| 3️⃣ | **frontend-builder** | Generate React components, hooks, forms | Frontend components needed |
| 4️⃣ | **type-validator** | Verify type consistency across layers | After backend/frontend generation |
| 5️⃣ | **error-fixer** | Run build/lint and fix all errors | TypeScript/ESLint errors |
| 6️⃣ | **integration-connector** | Register routes, connect with existing app | Feature needs integration |
| 7️⃣ | **api-documenter** | Generate API documentation | After endpoints implemented |
| 8️⃣ | **performance-optimizer** | Optimize queries and code | Performance concerns |

## Recommended Workflows

### 📋 Full Use Case Implementation (Standard)
```
feature-planner → backend-builder → frontend-builder → 
error-fixer → type-validator → integration-connector → api-documenter
```

### 🐛 Quick Bug Fix
```
error-fixer
```

### ✨ Feature Enhancement
```
feature-planner → backend-builder → frontend-builder → 
error-fixer → type-validator → integration-connector
```

### ⚡ Performance Optimization
```
performance-optimizer → backend-builder → error-fixer
```

## Standard Agent Request Format

```
Agent: [agent-name]
Task: [specific task description]
Context: [project-specific details, file references]
Expected Output: [what you want returned]
```

### Example Request

```
Agent: feature-planner
Task: Plan Use Case 004 (Instructor Dashboard) implementation
Context: Reference docs/004/spec.md, docs/004/plan.md, docs/database.md, docs/prd.md
Expected Output: Complete implementation plan with file structure, 
all components to create, and implementation order
```

## Key Architecture Points (from CLAUDE.md)

✅ **Backend**: Each feature has `error.ts`, `schema.ts`, `service.ts`, `route.ts`  
✅ **Frontend**: Components in `/components`, hooks in `/hooks`  
✅ **Shared**: Types in `src/lib/shared/`  
✅ **Validation**: Zod schemas for runtime type safety  
✅ **Commands**: `npm run dev`, `npm run build`, `npm run lint`  
✅ **Tech Stack**: Next.js 15 + Hono + Supabase + React Query + Tailwind  

---

Full details available in **AGENTS.md** in repository root.
