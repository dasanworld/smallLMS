# Use Case 005: Sub-Agents Architecture Design

## Overview
제출/재제출 기능을 다음 8개의 독립적인 sub-agents로 분리하여 단일 책임 원칙(SRP)을 준수하고 테스트 가능성을 높입니다.

## Sub-Agents Architecture

```
┌─────────────────────────────────────────────────────────────┐
│           Main Orchestrator (submitAssignment)               │
└────────────┬────────────────────────────────────────────────┘
             │
     ┌───────┴───────┬───────────┬───────────┬───────────┐
     │               │           │           │           │
     ▼               ▼           ▼           ▼           ▼
┌──────────┐  ┌─────────┐  ┌──────────┐  ┌────────┐  ┌─────────┐
│ Auth     │  │Enroll   │  │Assignment│  │Deadline│  │Validate │
│Verifier  │  │ Checker │  │Verifier  │  │Checker │  │ Request │
└──────────┘  └─────────┘  └──────────┘  └────────┘  └─────────┘
     │            │             │           │           │
     └────────────┴─────────────┴───────────┴───────────┘
                          │
             ┌────────────┴────────────┐
             │                         │
             ▼                         ▼
        ┌──────────┐         ┌──────────────┐
        │Resubmit  │         │Submission    │
        │Manager   │         │Recorder      │
        └──────────┘         └──────────────┘
```

## Detailed Sub-Agents Specification

### 1. 🔐 Auth Verifier Agent
**책임**: 사용자 인증 검증
**위치**: `src/features/learner-submissions/agents/auth-verifier.ts`

```typescript
interface AuthVerifierAgent {
  verify(userId: string): Promise<{
    isAuthenticated: boolean;
    reason?: string;
  }>;
}
```

**기능**:
- Supabase auth 사용자 확인
- UUID 유효성 검증
- 토큰 유효성 확인

**에러 코드**:
- `UNAUTHORIZED`: 인증되지 않음
- `INVALID_USER_ID`: 잘못된 사용자 ID

---

### 2. 📚 Enrollment Checker Agent
**책임**: 과정 수강신청 여부 확인
**위치**: `src/features/learner-submissions/agents/enrollment-checker.ts`

```typescript
interface EnrollmentCheckerAgent {
  verify(userId: string, courseId: number): Promise<{
    isEnrolled: boolean;
    enrollmentId?: number;
    enrolledAt?: string;
  }>;
}
```

**기능**:
- enrollments 테이블 조회
- 사용자-과정 매핑 확인
- 수강신청 시점 반환

**에러 코드**:
- `NOT_ENROLLED`: 미수강신청
- `ENROLLMENT_FETCH_ERROR`: 조회 실패

---

### 3. 📋 Assignment Verifier Agent
**책임**: 과제 정보 및 유효성 검증
**위치**: `src/features/learner-submissions/agents/assignment-verifier.ts`

```typescript
interface AssignmentVerifierAgent {
  verify(assignmentId: number, courseId: number): Promise<{
    isValid: boolean;
    assignment?: AssignmentResponse;
    reason?: string;
  }>;
}
```

**기능**:
- 과제 존재 여부 확인
- 과제-과정 일치 확인
- 과제 상태 검증 (draft 제외)
- 과제 정책 정보 반환

**검증 항목**:
- ✅ Assignment exists
- ✅ Belongs to course
- ✅ Status is published/closed (not draft)
- ✅ Return: dueDate, allowLateSubmission, allowResubmission

**에러 코드**:
- `ASSIGNMENT_NOT_FOUND`: 과제 없음
- `ASSIGNMENT_NOT_IN_COURSE`: 과정 불일치
- `ASSIGNMENT_NOT_PUBLISHED`: 미공개 과제

---

### 4. ⏰ Deadline Checker Agent
**책임**: 마감일 및 지각 정책 검증
**위치**: `src/features/learner-submissions/agents/deadline-checker.ts`

```typescript
interface DeadlineCheckerAgent {
  check(assignmentId: number, allowLateSubmission: boolean): Promise<{
    isLate: boolean;
    isAllowed: boolean;
    reason?: string;
    deadline?: string;
  }>;
}
```

**기능**:
- 현재 시간 vs 마감일 비교
- 지각 정책 (allowLateSubmission) 확인
- 제출 가능 여부 판단

**로직**:
```
1. no deadline → always allowed
2. before deadline → allowed (isLate=false)
3. after deadline + allowLate → allowed (isLate=true)
4. after deadline + !allowLate → blocked
```

**에러 코드**:
- `DEADLINE_EXCEEDED`: 마감 초과, 지각 불허
- `INVALID_DEADLINE_CONFIG`: 마감일 설정 오류

---

### 5. ✔️ Validation Request Agent
**책임**: 제출 데이터 검증
**위치**: `src/features/learner-submissions/agents/validation-request.ts`

```typescript
interface ValidationRequestAgent {
  validate(request: SubmissionRequest): Promise<{
    isValid: boolean;
    errors?: Record<string, string>;
  }>;
}
```

**기능**:
- contentText 필수 여부 확인
- contentText 길이 검증 (1-5000)
- contentLink URL 형식 검증
- 공백 제거 후 재검증

**Zod 스키마 활용**:
- submissionFormSchema 사용
- 상세 에러 메시지 반환

**에러 코드**:
- `VALIDATION_FAILED`: 유효성 검사 실패
- `EMPTY_CONTENT`: 내용 비어있음
- `INVALID_URL`: URL 형식 오류

---

### 6. 🔄 Resubmission Manager Agent
**책임**: 재제출 정책 및 기존 제출물 관리
**위치**: `src/features/learner-submissions/agents/resubmission-manager.ts`

```typescript
interface ResubmissionManagerAgent {
  check(assignmentId: number, userId: string, allowResubmission: boolean): Promise<{
    canSubmit: boolean;
    isFirstSubmission: boolean;
    existingSubmissionId?: number;
    reason?: string;
  }>;
}
```

**기능**:
- 기존 제출물 조회
- isFirstSubmission 판단
- allowResubmission 정책 확인
- 제출 가능 여부 결정

**로직**:
```
1. no submission → first submission (always allowed)
2. submission exists + allowResubmit → allowed
3. submission exists + !allowResubmit → blocked
```

**반환값**:
- canSubmit: 제출 가능 여부
- isFirstSubmission: 첫 제출 여부
- existingSubmissionId: 기존 제출물 ID (수정시)

**에러 코드**:
- `RESUBMISSION_NOT_ALLOWED`: 재제출 불허
- `EXISTING_SUBMISSION_FETCH_ERROR`: 조회 실패

---

### 7. 💾 Submission Recorder Agent
**책임**: 제출물 DB 저장 및 상태 관리
**위치**: `src/features/learner-submissions/agents/submission-recorder.ts`

```typescript
interface SubmissionRecorderAgent {
  record(params: {
    assignmentId: number;
    userId: string;
    contentText: string;
    contentLink?: string;
    isLate: boolean;
    isFirstSubmission: boolean;
    existingSubmissionId?: number;
  }): Promise<{
    submission: SubmissionResponse;
    isNew: boolean;
  }>;
}
```

**기능**:
- INSERT (첫 제출): createSubmission()
- UPDATE (재제출): updateSubmission()
- status='submitted'로 설정
- 타이밍 정보 기록 (submitted_at)

**반환값**:
- submission: 저장된 제출물 정보
- isNew: 새로 생성 vs 수정

**에러 코드**:
- `SUBMISSION_SAVE_FAILED`: 저장 실패
- `UNIQUE_CONSTRAINT_VIOLATION`: 중복 제출

---

### 8. 📊 Status Query Agent
**책임**: 제출 상태 조회 및 종합 정보 제공
**위치**: `src/features/learner-submissions/agents/status-query.ts`

```typescript
interface StatusQueryAgent {
  getStatus(userId: string, assignmentId: number, courseId: number): Promise<{
    submission?: SubmissionResponse;
    hasSubmission: boolean;
    canSubmit: boolean;
    canResubmit: boolean;
    isLate: boolean;
    deadline?: string;
    message?: string;
  }>;
}
```

**기능**:
- 기존 제출물 조회
- 모든 제출 가능 조건 확인
- UI에 필요한 모든 정보 종합
- 상태별 메시지 생성

**활용하는 다른 agents**:
- EnrollmentChecker
- AssignmentVerifier
- DeadlineChecker
- ResubmissionManager

---

## Orchestrator Pattern

### Main Flow: submitAssignment()

```typescript
async function submitAssignment(
  client: SupabaseClient,
  userId: string,
  assignmentId: number,
  courseId: number,
  contentText: string,
  contentLink?: string
): Promise<HandlerResult<...>> {
  try {
    // 1. Auth Verification
    const authVerifier = createAuthVerifierAgent(client);
    const authResult = await authVerifier.verify(userId);
    if (!authResult.isAuthenticated) throw new Error(authResult.reason);

    // 2. Enrollment Check
    const enrollChecker = createEnrollmentCheckerAgent(client);
    const enrollResult = await enrollChecker.verify(userId, courseId);
    if (!enrollResult.isEnrolled) throw new Error('Not enrolled');

    // 3. Assignment Verification
    const assignVerifier = createAssignmentVerifierAgent(client);
    const assignResult = await assignVerifier.verify(assignmentId, courseId);
    if (!assignResult.isValid) throw new Error(assignResult.reason);

    // 4. Deadline Check
    const deadlineChecker = createDeadlineCheckerAgent(client);
    const deadlineResult = await deadlineChecker.check(
      assignmentId,
      assignResult.assignment!.allowLateSubmission
    );
    if (!deadlineResult.isAllowed) throw new Error(deadlineResult.reason);

    // 5. Data Validation
    const validator = createValidationRequestAgent();
    const validResult = await validator.validate({
      contentText,
      contentLink
    });
    if (!validResult.isValid) throw new Error('Validation failed');

    // 6. Resubmission Check
    const resubmitMgr = createResubmissionManagerAgent(client);
    const resubResult = await resubmitMgr.check(
      assignmentId,
      userId,
      assignResult.assignment!.allowResubmission
    );
    if (!resubResult.canSubmit) throw new Error(resubResult.reason);

    // 7. Record Submission
    const recorder = createSubmissionRecorderAgent(client);
    const recordResult = await recorder.record({
      assignmentId,
      userId,
      contentText,
      contentLink,
      isLate: deadlineResult.isLate,
      isFirstSubmission: resubResult.isFirstSubmission,
      existingSubmissionId: resubResult.existingSubmissionId
    });

    // 8. Return Success
    return success({
      success: true,
      message: resubResult.isFirstSubmission 
        ? 'Submitted successfully'
        : 'Resubmitted successfully',
      submission: recordResult.submission
    });
  } catch (error) {
    return failure(400, 'SUBMISSION_FAILED', error.message);
  }
}
```

## Benefits of Sub-Agents

### 1. 단일 책임 원칙 (SRP)
- 각 agent는 명확한 단일 책임
- 변경의 이유가 하나

### 2. 테스트 용이성
```typescript
// 각 agent 단독 테스트 가능
describe('DeadlineCheckerAgent', () => {
  it('should allow submission before deadline', async () => {
    const result = await deadlineChecker.check(assignmentId, true);
    expect(result.isAllowed).toBe(true);
  });
});
```

### 3. 재사용성
```typescript
// 다른 use cases에서 재사용
// UC006: Submission Grading - AssignmentVerifier 재사용
// UC007: Learner Dashboard - StatusQueryAgent 재사용
```

### 4. 디버깅 용이
- 각 agent별 로깅
- 장애점 식별 명확
- 단계별 상태 확인

### 5. 독립적 수정
- 정책 변경시 해당 agent만 수정
- 다른 부분에 영향 최소화
- 회귀 테스트 범위 축소

## Error Handling Strategy

각 agent는 자신의 responsibility에 맞는 에러 반환:

```typescript
// 성공
{ isAuthenticated: true }

// 실패
{ isAuthenticated: false, reason: "User not found" }
```

Orchestrator에서 우선순위별 처리:

```
1. Auth 실패 → 401 Unauthorized
2. Enrollment 실패 → 403 Forbidden
3. Assignment 실패 → 404 Not Found
4. Deadline 실패 → 400 Bad Request
5. Validation 실패 → 400 Bad Request
6. Resubmission 실패 → 400 Bad Request
7. Recording 실패 → 500 Internal Error
```

## Implementation Files

생성할 파일 구조:

```
src/features/learner-submissions/agents/
├── index.ts                          # Export all agents
├── auth-verifier.ts                  # Auth Verifier Agent
├── enrollment-checker.ts              # Enrollment Checker Agent
├── assignment-verifier.ts             # Assignment Verifier Agent
├── deadline-checker.ts                # Deadline Checker Agent
├── validation-request.ts              # Validation Request Agent
├── resubmission-manager.ts            # Resubmission Manager Agent
├── submission-recorder.ts             # Submission Recorder Agent
├── status-query.ts                    # Status Query Agent
├── types.ts                           # Shared agent types
└── orchestrator.ts                    # Main orchestrator
```

## Testing Strategy

각 agent별 unit test + integration test:

```typescript
// Unit Test Example
describe('DeadlineCheckerAgent', () => {
  it('should calculate isLate correctly', async () => {
    const mockAssignment = { dueDate: pastDate };
    // test implementation
  });
});

// Integration Test Example
describe('submitAssignment Flow', () => {
  it('should complete full submission flow', async () => {
    // test all agents together
  });
});
```

## Migration Path

기존 코드 → Sub-Agents 적용:

1. **Phase 1**: Agent 인터페이스 정의
2. **Phase 2**: 각 Agent 구현
3. **Phase 3**: Orchestrator 리팩토링
4. **Phase 4**: 기존 service.ts 제거
5. **Phase 5**: 통합 테스트

---

## 다음 단계

1. Sub-agents 구현 여부 결정
2. 구현한다면 Phase별 일정 수립
3. 기존 service.ts와 호환성 유지 계획
