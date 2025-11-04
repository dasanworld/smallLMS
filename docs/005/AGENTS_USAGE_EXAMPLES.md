# Sub-Agents Usage Examples

## Overview
각 sub-agent를 독립적으로 또는 조합하여 사용하는 예제입니다.

## 1️⃣ Auth Verifier Agent

### 사용 사례: 사용자 인증 검증

```typescript
import { createAuthVerifierAgent } from '@/features/learner-submissions/agents';

const verifyUserAuth = async (client: SupabaseClient, userId: string) => {
  const authVerifier = createAuthVerifierAgent(client);
  const result = await authVerifier.verify(userId);

  if (!result.isAuthenticated) {
    console.error('User not authenticated:', result.reason);
    return null;
  }

  console.log('User verified:', result.userId);
  return result.userId;
};
```

### 로깅 출력
```
[AuthVerifierAgent] Verifying user f47ac10b-58cc-4372-a567-0e02b2c3d479
[AuthVerifierAgent] User f47ac10b-58cc-4372-a567-0e02b2c3d479 verified successfully
```

---

## 2️⃣ Enrollment Checker Agent

### 사용 사례: 수강신청 확인

```typescript
import { createEnrollmentCheckerAgent } from '@/features/learner-submissions/agents';

const checkEnrollment = async (
  client: SupabaseClient,
  userId: string,
  courseId: number
) => {
  const enrollChecker = createEnrollmentCheckerAgent(client);
  const result = await enrollChecker.verify(userId, courseId);

  if (!result.isEnrolled) {
    console.warn('User not enrolled:', result.reason);
    return false;
  }

  console.log(`User enrolled since ${result.enrolledAt}`);
  return true;
};
```

### 로깅 출력
```
[EnrollmentCheckerAgent] Checking enrollment for user abc..., course 123
[EnrollmentCheckerAgent] User abc... verified enrolled in course 123
```

---

## 3️⃣ Assignment Verifier Agent

### 사용 사례: 과제 유효성 검증

```typescript
import { createAssignmentVerifierAgent } from '@/features/learner-submissions/agents';

const verifyAssignment = async (
  client: SupabaseClient,
  assignmentId: number,
  courseId: number
) => {
  const assignVerifier = createAssignmentVerifierAgent(client);
  const result = await assignVerifier.verify(assignmentId, courseId);

  if (!result.isValid) {
    console.error('Assignment invalid:', result.reason);
    return null;
  }

  console.log('Assignment valid:', result.assignment);
  return result.assignment;
};
```

### 로깅 출력
```
[AssignmentVerifierAgent] Verifying assignment 456 for course 123
[AssignmentVerifierAgent] Assignment 456 verified successfully
```

---

## 4️⃣ Deadline Checker Agent

### 사용 사례: 마감일 검증

```typescript
import { createDeadlineCheckerAgent } from '@/features/learner-submissions/agents';

const checkDeadline = async (
  client: SupabaseClient,
  assignmentId: number,
  allowLateSubmission: boolean
) => {
  const deadlineChecker = createDeadlineCheckerAgent(client);
  const result = await deadlineChecker.check(assignmentId, allowLateSubmission);

  if (!result.isAllowed) {
    console.warn('Submission not allowed:', result.reason);
    return false;
  }

  if (result.isLate) {
    console.warn('Submission is late but allowed');
  } else {
    console.log('Submission is on time');
  }

  return true;
};
```

### 시나리오별 로깅

**마감 전 제출**
```
[DeadlineCheckerAgent] Current: 2024-01-02T10:00:00Z, Due: 2024-01-05T23:59:59Z
[DeadlineCheckerAgent] Submission is on time
```

**지각 제출 (허용)**
```
[DeadlineCheckerAgent] Current: 2024-01-06T10:00:00Z, Due: 2024-01-05T23:59:59Z
[DeadlineCheckerAgent] Late submission is allowed
```

**지각 제출 (불허)**
```
[DeadlineCheckerAgent] Submission is late and late submission not allowed
```

---

## 5️⃣ Validation Request Agent

### 사용 사례: 제출 데이터 검증

```typescript
import { createValidationRequestAgent } from '@/features/learner-submissions/agents';

const validateSubmissionData = async (
  contentText: string,
  contentLink?: string
) => {
  const validator = createValidationRequestAgent();
  const result = await validator.validate({
    contentText,
    contentLink,
  });

  if (!result.isValid) {
    console.error('Validation errors:', result.errors);
    return false;
  }

  console.log('Validation passed');
  return true;
};

// 사용 예제
await validateSubmissionData('My answer is here', 'https://example.com');
// [ValidationRequestAgent] Validation passed

await validateSubmissionData('', 'invalid-url');
// [ValidationRequestAgent] Validation failed: 
// { contentText: 'String must contain at least 1 character(s)',
//   contentLink: 'Invalid url' }
```

---

## 6️⃣ Resubmission Manager Agent

### 사용 사례: 재제출 정책 확인

```typescript
import { createResubmissionManagerAgent } from '@/features/learner-submissions/agents';

const checkResubmissionPolicy = async (
  client: SupabaseClient,
  assignmentId: number,
  userId: string,
  allowResubmission: boolean
) => {
  const resubmitMgr = createResubmissionManagerAgent(client);
  const result = await resubmitMgr.check(assignmentId, userId, allowResubmission);

  if (!result.canSubmit) {
    console.warn('Cannot submit:', result.reason);
    return false;
  }

  if (result.isFirstSubmission) {
    console.log('First submission - always allowed');
  } else {
    console.log('Resubmission allowed - existing submission ID:', result.existingSubmissionId);
  }

  return true;
};
```

### 시나리오별 로깅

**첫 제출**
```
[ResubmissionManagerAgent] No existing submission found - first submission
```

**재제출 가능**
```
[ResubmissionManagerAgent] Resubmission allowed for assignment 456
```

**재제출 불가**
```
[ResubmissionManagerAgent] Resubmission not allowed for assignment 456
Reason: Resubmissions are not allowed for this assignment
```

---

## 7️⃣ Submission Recorder Agent

### 사용 사례: 제출물 저장

```typescript
import { createSubmissionRecorderAgent } from '@/features/learner-submissions/agents';

const recordSubmission = async (
  client: SupabaseClient,
  assignmentId: number,
  userId: string,
  contentText: string,
  isLate: boolean,
  isFirstSubmission: boolean,
  existingSubmissionId?: number
) => {
  const recorder = createSubmissionRecorderAgent(client);

  try {
    const result = await recorder.record({
      assignmentId,
      userId,
      contentText,
      contentLink: 'https://example.com',
      isLate,
      isFirstSubmission,
      existingSubmissionId,
    });

    console.log('Submission recorded:', {
      id: result.submission.id,
      isNew: result.isNew,
    });

    return result.submission;
  } catch (error) {
    console.error('Recording failed:', error.message);
  }
};
```

### 로깅 출력

**첫 제출**
```
[SubmissionRecorderAgent] Creating new submission
[SubmissionRecorderAgent] Submission created successfully - ID: 789
```

**재제출**
```
[SubmissionRecorderAgent] Updating existing submission - ID: 789
[SubmissionRecorderAgent] Submission updated successfully - ID: 789
```

---

## 8️⃣ Status Query Agent

### 사용 사례: 종합 상태 조회

```typescript
import { createStatusQueryAgent } from '@/features/learner-submissions/agents';

const getSubmissionStatus = async (
  client: SupabaseClient,
  userId: string,
  assignmentId: number,
  courseId: number
) => {
  const statusQuery = createStatusQueryAgent(client);
  const status = await statusQuery.getStatus(userId, assignmentId, courseId);

  console.log('Submission Status:', {
    hasSubmission: status.hasSubmission,
    canSubmit: status.canSubmit,
    canResubmit: status.canResubmit,
    isLate: status.isLate,
    message: status.message,
  });

  if (status.submission) {
    console.log('Current Submission:', status.submission);
  }

  return status;
};

// 사용 예제
const status = await getSubmissionStatus(client, userId, 456, 123);
// Submission Status: {
//   hasSubmission: true,
//   canSubmit: false,
//   canResubmit: true,
//   isLate: true,
//   message: undefined,
//   submission: { id: 789, ... }
// }
```

---

## 🎯 Orchestrator: 전체 제출 플로우

### 사용 사례: 완전한 제출 프로세스

```typescript
import { submitAssignmentWithAgents } from '@/features/learner-submissions/agents';

const submitAssignment = async (
  client: SupabaseClient,
  userId: string,
  assignmentId: number,
  courseId: number,
  contentText: string,
  contentLink?: string
) => {
  const result = await submitAssignmentWithAgents(
    client,
    userId,
    assignmentId,
    courseId,
    contentText,
    contentLink
  );

  if (!result.ok) {
    console.error('Submission failed:', result.error.message);
    return null;
  }

  console.log('Submission successful:', result.data);
  return result.data.submission;
};
```

### 전체 로깅 흐름

```
[Orchestrator] Starting submission orchestration - user abc..., assignment 456, course 123
[Orchestrator] Step 1: Auth Verification
[AuthVerifierAgent] Verifying user abc...
[AuthVerifierAgent] User abc... verified successfully
[Orchestrator] Step 2: Enrollment Check
[EnrollmentCheckerAgent] Checking enrollment for user abc..., course 123
[EnrollmentCheckerAgent] User abc... verified enrolled in course 123
[Orchestrator] Step 3: Assignment Verification
[AssignmentVerifierAgent] Verifying assignment 456 for course 123
[AssignmentVerifierAgent] Assignment 456 verified successfully
[Orchestrator] Step 4: Deadline Check
[DeadlineCheckerAgent] Checking deadline for assignment 456
[DeadlineCheckerAgent] Current: 2024-01-02T10:00:00Z, Due: 2024-01-05T23:59:59Z
[DeadlineCheckerAgent] Submission is on time
[Orchestrator] Step 5: Data Validation
[ValidationRequestAgent] Validating submission request
[ValidationRequestAgent] Validation passed
[Orchestrator] Step 6: Resubmission Check
[ResubmissionManagerAgent] Checking resubmission policy for user abc...
[ResubmissionManagerAgent] No existing submission found - first submission
[Orchestrator] Step 7: Record Submission
[SubmissionRecorderAgent] Creating new submission
[SubmissionRecorderAgent] Submission created successfully - ID: 789
[Orchestrator] Submission completed successfully - ID: 789
```

---

## 🧪 Agent 조합 패턴

### 패턴 1: 사전 검증

```typescript
const preValidateSubmission = async (
  client: SupabaseClient,
  userId: string,
  assignmentId: number,
  courseId: number
) => {
  const authVerifier = createAuthVerifierAgent(client);
  const enrollChecker = createEnrollmentCheckerAgent(client);
  const assignVerifier = createAssignmentVerifierAgent(client);

  const [auth, enroll, assign] = await Promise.all([
    authVerifier.verify(userId),
    enrollChecker.verify(userId, courseId),
    assignVerifier.verify(assignmentId, courseId),
  ]);

  return {
    isValid: auth.isAuthenticated && enroll.isEnrolled && assign.isValid,
    errors: [auth.reason, enroll.reason, assign.reason].filter(Boolean),
  };
};
```

### 패턴 2: 마감일 기반 필터링

```typescript
const filterByDeadline = async (
  client: SupabaseClient,
  assignments: AssignmentResponse[]
) => {
  const deadlineChecker = createDeadlineCheckerAgent(client);

  const results = await Promise.all(
    assignments.map((a) =>
      deadlineChecker.check(a.id, a.allowLateSubmission)
    )
  );

  return assignments.filter((_, i) => results[i].isAllowed);
};
```

### 패턴 3: 상태 모니터링

```typescript
const monitorSubmissionStatus = async (
  client: SupabaseClient,
  userId: string,
  assignmentIds: number[],
  courseId: number
) => {
  const statusQuery = createStatusQueryAgent(client);

  const statuses = await Promise.all(
    assignmentIds.map((aid) => statusQuery.getStatus(userId, aid, courseId))
  );

  return {
    canSubmit: statuses.filter((s) => s.canSubmit).length,
    canResubmit: statuses.filter((s) => s.canResubmit).length,
    submitted: statuses.filter((s) => s.hasSubmission).length,
  };
};
```

---

## 🔧 에러 처리 패턴

```typescript
const safeSubmission = async (...args: Parameters<typeof submitAssignmentWithAgents>) => {
  try {
    const result = await submitAssignmentWithAgents(...args);

    if (!result.ok) {
      const errorCode = result.error.code;

      switch (errorCode) {
        case 'UNAUTHORIZED':
          throw new Error('Please log in again');
        case 'NOT_ENROLLED':
          throw new Error('You are not enrolled in this course');
        case 'ASSIGNMENT_NOT_FOUND':
          throw new Error('Assignment not found');
        case 'DEADLINE_EXCEEDED':
          throw new Error('Submission deadline has passed');
        case 'RESUBMISSION_NOT_ALLOWED':
          throw new Error('You cannot resubmit this assignment');
        case 'SUBMISSION_VALIDATION_FAILED':
          throw new Error('Please check your submission content');
        default:
          throw new Error('Submission failed. Please try again.');
      }
    }

    return result.data;
  } catch (error) {
    console.error('Submission error:', error);
    throw error;
  }
};
```

---

## 📊 성능 최적화

### 병렬 검증
```typescript
// 순차 처리 (느림)
const auth = await authVerifier.verify(userId);
const enroll = await enrollChecker.verify(userId, courseId);
const assign = await assignVerifier.verify(assignmentId, courseId);

// 병렬 처리 (빠름)
const [auth, enroll, assign] = await Promise.all([
  authVerifier.verify(userId),
  enrollChecker.verify(userId, courseId),
  assignVerifier.verify(assignmentId, courseId),
]);
```

### 캐싱 전략
```typescript
const memoizedStatusQuery = (() => {
  const cache = new Map<string, StatusQueryResult>();

  return async (userId: string, assignmentId: number, courseId: number) => {
    const key = `${userId}:${assignmentId}:${courseId}`;

    if (cache.has(key)) {
      console.log('Returning cached status');
      return cache.get(key)!;
    }

    const statusQuery = createStatusQueryAgent(client);
    const result = await statusQuery.getStatus(userId, assignmentId, courseId);

    cache.set(key, result);
    setTimeout(() => cache.delete(key), 5 * 60 * 1000); // 5분 캐시

    return result;
  };
})();
```

---

## 🎓 학습 경로

1. **기본**: 각 Agent를 독립적으로 사용해보기
2. **중급**: 여러 Agent를 조합하여 사용하기
3. **고급**: Orchestrator를 커스터마이징하기
4. **전문**: 새로운 Agent 추가하기

