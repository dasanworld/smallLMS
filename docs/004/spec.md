# Use Case 004: 과제 상세 열람 (Learner)

## Primary Actor
학습자 (Learner)

## Precondition
- 사용자가 Learner 역할로 로그인된 상태
- 사용자가 해당 코스에 수강신청된 상태
- 과제가 published 상태

## Trigger
학습자가 수강 중인 코스의 과제 목록에서 특정 과제를 선택

## Main Scenario
1. 학습자가 내 코스 페이지에서 과제 목록에 접근
2. 학습자가 특정 과제를 클릭하여 상세 페이지로 이동
3. 시스템이 사용자의 수강신청 여부를 확인
4. 시스템이 과제의 게시 상태를 확인 (published만 접근 가능)
5. 시스템이 과제 상세 정보를 표시:
   - 과제 제목 및 설명
   - 마감일
   - 점수 비중
   - 지각 제출 허용 여부
   - 재제출 허용 여부
6. 시스템이 과제 상태에 따른 제출 UI를 표시:
   - published & 마감 전: 제출 버튼 활성화
   - closed: 제출 버튼 비활성화

## Edge Cases
- **미수강 학습자 접근**: 수강신청하지 않은 코스의 과제 접근 시 403 오류
- **Draft 과제 접근**: 아직 게시되지 않은 과제 접근 시 404 오류
- **Closed 과제**: 마감된 과제는 열람만 가능, 제출 기능 비활성화
- **삭제된 과제**: 존재하지 않는 과제 접근 시 404 오류

## Business Rules
- published 상태의 과제만 학습자에게 표시
- 수강신청한 학습자만 과제 상세 내용 열람 가능
- closed 상태의 과제는 제출 불가, 열람만 가능
- 과제 정보는 실시간으로 업데이트된 상태를 표시

## Sequence Diagram

```plantuml
@@startuml
actor User as "Learner"
participant FE as "Frontend"
participant BE as "Backend"
participant Database

User -> FE: 내 코스 페이지 접근
FE -> BE: GET /api/learner/courses/:courseId/assignments
BE -> Database: SELECT published assignments for course
Database -> BE: 과제 목록 반환
BE -> FE: 과제 목록 데이터
FE -> User: 과제 목록 표시

User -> FE: 특정 과제 상세 클릭
FE -> BE: GET /api/assignments/:assignmentId

BE -> Database: SELECT enrollment verification
alt 수강신청 미확인
    Database -> BE: 수강신청 없음
    BE -> FE: 403 Forbidden
    FE -> User: "수강신청이 필요합니다" 오류 메시지
else 수강신청 확인됨
    BE -> Database: SELECT assignment details
    alt 과제가 draft 상태
        Database -> BE: status = 'draft'
        BE -> FE: 404 Not Found
        FE -> User: "존재하지 않는 과제입니다" 오류 메시지
    else 과제가 published/closed
        Database -> BE: 과제 상세 정보
        BE -> FE: 과제 상세 데이터
        FE -> User: 과제 상세 화면 표시
        note left
          - 제목, 설명
          - 마감일, 점수 비중
          - 정책 (지각/재제출 허용)
          - 제출 UI (상태에 따라 활성/비활성)
        end note
    end
end
@enduml
```