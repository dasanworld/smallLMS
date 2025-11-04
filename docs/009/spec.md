# Use Case 009: 과제 관리 (Instructor)

## Primary Actor
강사 (Instructor)

## Precondition
- 사용자가 Instructor 역할로 로그인된 상태
- 사용자가 소유한 코스가 존재

## Trigger
강사가 과제 생성, 수정, 또는 제출물 관리를 위해 과제 관리 페이지에 접근

## Main Scenario
1. 강사가 특정 코스의 과제 관리 페이지에 접근
2. 시스템이 해당 코스의 과제 목록을 표시 (모든 상태)
3. 강사가 "새 과제 생성" 또는 "기존 과제 수정"을 선택
4. 시스템이 과제 정보 입력 폼을 제시:
   - 제목 (필수)
   - 설명
   - 마감일
   - 점수 비중 (0-100%)
   - 지각 제출 허용 여부
   - 재제출 허용 여부
5. 강사가 과제 정보를 입력하고 저장 (draft 상태)
6. 강사가 상태 전환을 수행:
   - draft → published: 학습자에게 노출
   - published → closed: 제출 마감
7. 강사가 제출물 테이블에서 필터링 및 채점 관리

## Edge Cases
- **권한 없음**: 다른 강사의 코스 과제 접근 시 403 오류
- **제목 누락**: 필수 필드 누락 시 저장 차단
- **잘못된 점수 비중**: 0-100 범위를 벗어난 값 입력 시 오류
- **마감일 과거**: 현재보다 과거 날짜 설정 시 경고
- **수강생 있는 과제 삭제**: 제출물이 있는 과제 삭제 시도 시 경고

## Business Rules
- 소유 코스의 과제만 생성/수정 가능
- 점수 비중은 0-100% 범위 내에서 설정
- published 상태에서만 학습자가 과제를 볼 수 있음
- 마감일 이후 자동으로 closed 상태로 전환 (시스템 배치)
- closed 상태에서는 제출 불가, 채점만 가능

## Sequence Diagram

```plantuml
@startuml
actor User as "Instructor"
participant FE as "Frontend"
participant BE as "Backend"
participant Database

User -> FE: 코스 과제 관리 페이지 접근
FE -> BE: GET /api/courses/:courseId/assignments
BE -> Database: SELECT assignments WHERE course_id = :courseId
alt 권한 확인
    BE -> Database: SELECT course WHERE instructor_id = :userId
    alt 권한 없음
        Database -> BE: 소유자 불일치
        BE -> FE: 403 Forbidden
        FE -> User: "접근 권한이 없습니다" 오류
    else 권한 있음
        Database -> BE: 과제 목록 반환
        BE -> FE: 과제 데이터
        FE -> User: 과제 목록 표시 (상태별)
    end
end

alt 새 과제 생성
    User -> FE: "새 과제 생성" 클릭
    FE -> User: 과제 생성 폼 표시
    
    User -> FE: 과제 정보 입력 및 저장
    FE -> BE: POST /api/assignments
    BE -> BE: 입력 데이터 검증
    alt 유효성 오류
        BE -> FE: 400 Bad Request
        FE -> User: 오류 메시지 표시
    else 유효한 데이터
        BE -> Database: INSERT assignment (status='draft')
        Database -> BE: 과제 생성 완료
        BE -> FE: 생성 성공 응답
        FE -> User: "과제가 생성되었습니다" 메시지
    end

else 과제 수정
    User -> FE: 기존 과제 선택 및 수정
    FE -> BE: GET /api/assignments/:assignmentId
    BE -> Database: SELECT assignment details
    Database -> BE: 과제 정보 반환
    BE -> FE: 과제 데이터
    FE -> User: 과제 수정 폼 표시
    
    User -> FE: 정보 수정 및 저장
    FE -> BE: PUT /api/assignments/:assignmentId
    BE -> Database: UPDATE assignment
    Database -> BE: 수정 완료
    BE -> FE: 수정 성공 응답
    FE -> User: "과제가 수정되었습니다" 메시지
end

User -> FE: 상태 변경 (draft/published/closed)
FE -> BE: PATCH /api/assignments/:assignmentId/status
BE -> Database: UPDATE assignment status
Database -> BE: 상태 변경 완료
BE -> FE: 200 OK
FE -> User: 상태 변경 완료 메시지

User -> FE: 제출물 테이블 보기
FE -> BE: GET /api/assignments/:assignmentId/submissions
BE -> Database: SELECT submissions with filters
Database -> BE: 제출물 목록 반환
BE -> FE: 제출물 데이터
FE -> User: 제출물 테이블 표시 (필터링 옵션 포함)
@enduml
```