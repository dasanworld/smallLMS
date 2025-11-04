# Use Case 005: Assignment Submission/Resubmission - Implementation Complete

## Overview
Fully implemented Use Case 005 (과제 제출/재제출) for learners with complete backend, frontend, and API debugging capabilities.

## Implementation Summary

### ✅ Shared Types & Validation (`src/lib/shared/`)
- **submission-types.ts**: Core TypeScript interfaces for submissions
  - `SubmissionStatus`: Type union for submission states
  - `Submission`: Complete submission data structure
  - `SubmissionFormData`: Form input interface
  - `SubmissionResult`: API result wrapper

- **submission-validation.ts**: Zod validation schemas
  - `submissionFormSchema`: Form validation with text (required) and URL (optional)
  - `submissionIdSchema`: ID validation
  - `submissionUpdateSchema`: Update validation
  - `submissionStatusSchema`: Status enum validation

### ✅ Submissions Backend (`src/features/submissions/backend/`)
- **schema.ts**: API contracts with Zod
  - `SubmissionTableRowSchema`: Database row mapping
  - `SubmissionResponseSchema`: API response format
  - `SubmissionListResponseSchema`: List response format

- **service.ts**: Database operations
  - `getSubmissionsByLearner()`: Fetch learner's submissions
  - `getRecentFeedbackByLearner()`: Get recent graded submissions
  - `getSubmissionById()`: Single submission retrieval
  - `getSubmissionsByAssignment()`: Assignment submissions list
  - `getSubmissionByAssignmentAndUser()`: User's submission for assignment
  - `createSubmission()`: Create new submission
  - `updateSubmission()`: Update submission (for resubmission)

- **route.ts**: Hono API endpoints
  - `GET /api/submissions/:submissionId`: Fetch single submission
  - `GET /api/assignments/:assignmentId/submissions`: Get assignment submissions
  - `PUT /api/submissions/:submissionId`: Update submission (grading)

- **error.ts**: Error code definitions
  - `notFound`, `fetchError`, `validationError`
  - `unauthorized`, `conflictError`

### ✅ Learner Submissions Backend (`src/features/learner-submissions/backend/`)
- **schema.ts**: Learner-specific API contracts
  - `SubmissionRequestSchema`: Submit/resubmit request
  - `SubmissionResponseFromServiceSchema`: Successful submission response
  - `LearnerSubmissionResponseSchema`: Status query response

- **service.ts**: Learner submission logic with full validation
  - `checkSubmissionEligibility()`: Verify enrollment, course, assignment status
  - `validateSubmissionRequest()`: Validate text & URL fields
  - `validateSubmissionDeadline()`: Check deadline & late policy
  - `validateResubmissionPolicy()`: Check resubmission allowance
  - `submitAssignment()`: Main submission orchestrator
  - `getLearnerSubmissionStatus()`: Get submission state & eligibility

- **route.ts**: Learner-specific endpoints with comprehensive logging
  - `POST /api/assignments/:assignmentId/submit`: Submit/resubmit (requires courseId)
  - `GET /api/assignments/:assignmentId/my-submission`: Get submission status

- **error.ts**: Learner submission error codes
  - Specific codes for: enrollment, deadline, resubmission, closed assignments

### ✅ Frontend Components (`src/features/submissions/components/`)
- **submission-form.tsx**: React form component
  - Text area for content (required, max 5000 chars)
  - URL input for optional link
  - Client-side validation with error messages
  - Loading states and accessibility
  - Uses React Hook Form + Zod

- **submission-status.tsx**: Status display component
  - Shows submission state (submitted/graded/resubmission_required)
  - Displays submission time and late indicator
  - Shows score and feedback when graded
  - Indicates resubmission requirements
  - Formatted dates in Korean locale

### ✅ Learner Submissions Components (`src/features/learner-submissions/components/`)
- **assignment-submit.tsx**: Integrated submission component
  - Combines form and status display
  - Fetches submission eligibility
  - Displays appropriate UI based on state:
    - Form if can submit/resubmit
    - Status if submission exists
    - Error messages if cannot submit
  - Handles submit success/error states
  - Refetches status after successful submission

### ✅ React Query Hooks (`src/features/learner-submissions/hooks/`)
- **useLearnerSubmissions.ts**: Tanstack React Query hooks
  - `useSubmitAssignmentMutation()`: Submit/resubmit mutation
    - Sends POST to `/api/assignments/:assignmentId/submit`
    - Handles error messages from API
    - Optional success/error callbacks
  - `useLearnerSubmissionStatusQuery()`: Status query hook
    - Fetches from GET `/api/assignments/:assignmentId/my-submission`
    - 5-minute cache with stale-time
    - Disabled if missing assignmentId or courseId

### ✅ Page Integration
- **learner-assignment-detail.tsx**: Updated component
  - Now passes `courseId` to AssignmentSubmit
  - AssignmentSubmit handles all submission logic
  - Removed old navigation pattern
  
- **learner-assignment-detail page**: Updated route
  - Passes courseId to detail component
  - Full E2E flow from page → component → API

## API Endpoints

### Submit/Resubmit Assignment
```
POST /api/assignments/:assignmentId/submit?courseId={courseId}

Request:
{
  "contentText": "string (1-5000 chars)",
  "contentLink": "string (valid URL, optional)"
}

Response (201 Created):
{
  "success": true,
  "message": "Assignment submitted successfully",
  "submission": {
    "id": 123,
    "assignmentId": 456,
    "userId": "uuid",
    "contentText": "...",
    "contentLink": "...",
    "submittedAt": "2024-01-01T12:00:00Z",
    "isLate": false,
    "status": "submitted",
    "score": null,
    "feedback": null,
    ...
  }
}
```

### Get Submission Status
```
GET /api/assignments/:assignmentId/my-submission?courseId={courseId}

Response (200 OK):
{
  "submission": { /* submission object or null */ },
  "hasSubmission": boolean,
  "canSubmit": boolean,
  "canResubmit": boolean,
  "isLate": boolean,
  "deadline": "2024-01-05T23:59:59Z",
  "message": "string (if cannot submit)"
}
```

## Business Rules Implemented

### Submission Eligibility
- ✅ User must be enrolled in course
- ✅ Assignment must be published (not draft)
- ✅ Assignment must not be closed
- ✅ Assignment course must match provided courseId

### Deadline Handling
- ✅ No due date = always on time
- ✅ Before deadline = on-time submission
- ✅ After deadline + allow_late = late submission
- ✅ After deadline + !allow_late = submission blocked

### Resubmission Policy
- ✅ First submission always allowed if eligible
- ✅ Existing submission + allow_resubmission = can resubmit
- ✅ Existing submission + !allow_resubmission = blocked
- ✅ Resubmission updates existing record (not new)

### Validation
- ✅ Content text required (1-5000 chars)
- ✅ Content link optional (must be valid URL if provided)
- ✅ URL format validation with new URL() API

## Debugging Features

### Console Logging
All service functions include detailed logging:
- `[checkSubmissionEligibility]`: Enrollment, status checks
- `[validateSubmissionRequest]`: Data validation
- `[validateSubmissionDeadline]`: Deadline checks
- `[validateResubmissionPolicy]`: Resubmission checks
- `[submitAssignment]`: Main flow progress
- `[getLearnerSubmissionStatus]`: Status retrieval

### API Error Handling
- Specific HTTP status codes:
  - 400: Validation/business rule violations
  - 401: Not authenticated
  - 403: Not enrolled/unauthorized
  - 404: Assignment not found
  - 500: Server errors

- Error response format:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

## Testing Scenarios

### Happy Path
1. User enrolls in course
2. Instructor publishes assignment
3. Learner submits before deadline
4. Learner can view submission status
5. Instructor grades submission
6. Learner sees score and feedback

### Late Submission
1. User submits after deadline
2. Assignment has `allow_late_submission=true`
3. Submission succeeds with `is_late=true`
4. UI displays "지각 제출" indicator

### Resubmission
1. User submits assignment
2. Instructor requests resubmission
3. Assignment has `allow_resubmission=true`
4. User submits again via same form
5. Existing record is updated (not duplicate)

### Error Cases
- Not enrolled in course → 403
- Assignment still draft → Cannot submit
- Assignment closed → Cannot submit
- Deadline passed + !allow_late → 400
- Existing submission + !allow_resubmit → 400
- Invalid URL format → 400
- Empty content text → 400

## Integration Points

- **Enrollments**: Check enrollment status
- **Assignments**: Fetch assignment details, policies
- **Auth**: Verify authenticated user
- **Database**: Supabase PostgreSQL with RLS

## Performance

- Query caching: 5-minute stale-time for status
- Lazy loading: Status fetched only when needed
- Optimistic updates: Success message shown immediately
- Error recovery: Refetch on manual retry

## Accessibility

- Form labels with required indicators
- Error messages with icons
- Disabled state styling
- Loading indicators
- Korean language support
- Proper semantic HTML

## File Structure Created

```
src/
├── lib/shared/
│   ├── submission-types.ts
│   └── submission-validation.ts
├── features/
│   ├── submissions/
│   │   ├── backend/
│   │   │   ├── error.ts
│   │   │   ├── route.ts
│   │   │   ├── schema.ts
│   │   │   └── service.ts
│   │   └── components/
│   │       ├── submission-form.tsx
│   │       └── submission-status.tsx
│   ├── learner-submissions/
│   │   ├── backend/
│   │   │   ├── error.ts
│   │   │   ├── route.ts
│   │   │   ├── schema.ts
│   │   │   └── service.ts
│   │   ├── components/
│   │   │   └── assignment-submit.tsx
│   │   └── hooks/
│   │       └── useLearnerSubmissions.ts
│   └── learner-assignments/
│       └── components/
│           └── learner-assignment-detail.tsx (updated)
└── app/
    └── (protected)/my/courses/[courseId]/assignments/[assignmentId]/
        └── page.tsx (updated)
```

## Build & Test Results

✅ ESLint: No warnings or errors
✅ Type checking: All types valid
✅ Build: Successful production build
✅ No hardcoded values: All dynamic
✅ Complete implementation: All spec items covered

## Next Steps

To use this feature in the application:

1. Ensure Supabase database is configured with submissions table
2. Run migrations if needed: `npx supabase db push`
3. Test endpoints with API client (Postman, curl, etc.)
4. Verify learner can submit/resubmit assignments
5. Test deadline and policy validation
6. Verify grading workflow updates submission status

