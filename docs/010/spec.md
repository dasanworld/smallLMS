# Use Case 010: 제출물 채점 & 피드백 (Instructor)

## Primary Actor
강사 (Instructor)

## Precondition
- 사용자가 Instructor 역할로 로그인된 상태
- 학습자가 제출한 과제가 존재 (status='submitted')

## Trigger
강사가 제출물 목록에서 특정 제출물을 선택하여 채점

## Main Scenario
1. 강사가 과제의 제출물 목록 페이지에 접근
2. 시스템이 제출물 목록을 표시 (필터링 옵션 포함)
3. 강사가 채점할 제출물을 선택
4. 시스템이 제출물 상세 정보를 표시:
   - 학습자 정보
   - 제출 내용 (텍스트, 링크)
   - 제출 시간 및 지각 여부
5. 강사가 채점 정보를 입력:
   - 점수 (0-100)
   - 피드백 (필수)
   - 재제출 요청 여부 선택
6. 시스템이 제출물 상태를 업데이트:
   - 점수 입력 시: status='graded'
   - 재제출 요청 시: status='resubmission_required'
7. 시스템이 학습자에게 피드백을 제공

## Edge Cases
- **권한 없음**: 다른 강사의 과제 제출물 채점 시도 시 403 오류
- **점수 범위 초과**: 0-100 범위를 벗어난 점수 입력 시 오류
- **피드백 누락**: 필수 피드백 미입력 시 저장 차단
- **이미 채점된 제출물**: 이미 graded 상태인 제출물 재채점 시 업데이트
- **삭제된 제출물**: 존재하지 않는 제출물 접근 시 404 오류

## Business Rules
- 소유 과제의 제출물만 채점 가능
- 점수는 0-100 정수 범위 내에서 설정
- 피드백은 필수 입력 사항
- 재제출 요청 시 기존 점수와 피드백은 유지
- 재제출 완료 후 재채점 가능

## Sequence Diagram

```plantuml
@startuml
actor User as "Instructor"
participant FE as "Frontend"
participant BE as "Backend"
participant Database

User -> FE: 과제 제출물 목록 페이지 접근
FE -> BE: GET /api/assignments/:assignmentId/submissions
BE -> Database: SELECT assignment ownership verification
alt 권한 없음
    Database -> BE: 소유자 불일치
    BE -> FE: 403 Forbidden
    FE -> User: "채점 권한이 없습니다" 오류
else 권한 있음
    BE -> Database: SELECT submissions with learner info
    Database -> BE: 제출물 목록 반환
    BE -> FE: 제출물 데이터
    FE -> User: 제출물 목록 표시 (필터: 미채점/지각/재제출요청)
end

User -> FE: 특정 제출물 선택하여 채점
FE -> BE: GET /api/submissions/:submissionId
BE -> Database: SELECT submission details with learner info
Database -> BE: 제출물 상세 정보
BE -> FE: 제출물 데이터
FE -> User: 제출물 상세 및 채점 폼 표시
note left
  - 학습자 정보
  - 제출 내용 (텍스트/링크)
  - 제출 시간, 지각 여부
  - 채점 입력 폼
end note

User -> FE: 점수 및 피드백 입력
alt 재제출 요청
    User -> FE: "재제출 요청" 버튼 클릭
    FE -> BE: PATCH /api/submissions/:submissionId/resubmit
    BE -> Database: UPDATE submission SET status='resubmission_required'
    Database -> BE: 업데이트 완료
    BE -> FE: 200 OK
    FE -> User: "재제출이 요청되었습니다" 메시지
else 점수 입력
    User -> FE: 점수 및 피드백 입력 후 저장
    FE -> BE: PATCH /api/submissions/:submissionId/grade
    BE -> BE: 입력 데이터 검증 (점수 범위, 피드백 필수)
    alt 유효성 오류
        BE -> FE: 400 Bad Request
        FE -> User: 오류 메시지 표시
    else 유효한 데이터
        BE -> Database: UPDATE submission SET score, feedback, status='graded'
        Database -> BE: 채점 완료
        BE -> FE: 200 OK
        FE -> User: "채점이 완료되었습니다" 메시지
    end
end

note over Database: Learner 대시보드와 성적 페이지에 자동 반영
@enduml

```