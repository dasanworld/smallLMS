# Use Case 012: 운영 (Operator)

## Primary Actor
운영자 (Operator)

## Precondition
- 사용자가 Operator 역할로 로그인된 상태

## Trigger
운영자가 신고 처리 또는 메타데이터 관리를 위해 운영 페이지에 접근

## Main Scenario
### 신고 처리
1. 운영자가 신고 관리 페이지에 접근
2. 시스템이 신고 목록을 표시 (상태별 필터링 가능)
3. 운영자가 특정 신고를 선택하여 상세 확인
4. 운영자가 조사 상태로 변경하고 조사 시작
5. 운영자가 조사 결과에 따른 액션 수행:
   - 경고 조치
   - 제출물 무효화
   - 계정 제한
6. 운영자가 신고를 해결 상태로 변경

### 메타데이터 관리
1. 운영자가 메타데이터 관리 페이지에 접근
2. 시스템이 카테고리/난이도 목록을 표시
3. 운영자가 새 항목 추가 또는 기존 항목 수정/삭제
4. 시스템이 변경사항을 반영

## Edge Cases
- **권한 없음**: Operator 역할이 아닌 사용자의 운영 페이지 접근 시 403 오류
- **사용 중인 메타데이터 삭제**: 현재 사용 중인 카테고리/난이도 삭제 시도 시 경고
- **중복 신고**: 동일한 대상에 대한 중복 신고 처리
- **삭제된 대상 신고**: 신고 대상이 이미 삭제된 경우 처리 방안

## Business Rules
- Operator 역할만 운영 기능에 접근 가능
- 신고 처리 상태: received → investigating → resolved 순서로 진행
- 사용 중인 메타데이터는 비활성화 처리 권장 (삭제 대신)
- 신고 처리 이력은 모두 보존되어야 함
- 심각한 위반 시 즉시 계정 제한 가능

## Sequence Diagram

```plantuml
@startuml
actor User as "Operator"
participant FE as "Frontend"
participant BE as "Backend"
participant Database

== 신고 처리 ==
User -> FE: 신고 관리 페이지 접근
FE -> BE: GET /api/admin/reports
BE -> Database: SELECT reports with status filters
Database -> BE: 신고 목록 반환
BE -> FE: 신고 데이터
FE -> User: 신고 목록 표시 (상태별 필터)

User -> FE: 특정 신고 선택
FE -> BE: GET /api/admin/reports/:reportId
BE -> Database: SELECT report details with target info
Database -> BE: 신고 상세 정보
BE -> FE: 신고 상세 데이터
FE -> User: 신고 상세 및 조사 도구 표시

User -> FE: 조사 시작 - 상태를 "investigating"으로 변경
FE -> BE: PATCH /api/admin/reports/:reportId/status
note right: {"status": "investigating"}
BE -> Database: UPDATE report SET status='investigating'
Database -> BE: 상태 변경 완료
BE -> FE: 200 OK
FE -> User: "조사가 시작되었습니다" 메시지

alt 신고 내용이 사실인 경우
    User -> FE: 제재 조치 선택 (경고/제출물 무효화/계정 제한)
    FE -> BE: POST /api/admin/reports/:reportId/action
    note right: {"action": "warn|invalidate|restrict", "details": "..."}
    BE -> Database: Execute enforcement action
    Database -> BE: 조치 완료
    BE -> Database: UPDATE report SET status='resolved'
    Database -> BE: 신고 해결 완료
    BE -> FE: 200 OK
    FE -> User: "조치가 완료되었습니다" 메시지
else 신고 내용이 거짓인 경우
    User -> FE: "신고 기각" 선택
    FE -> BE: PATCH /api/admin/reports/:reportId/status
    note right: {"status": "resolved", "action": "dismissed"}
    BE -> Database: UPDATE report SET status='resolved'
    Database -> BE: 신고 해결 완료
    BE -> FE: 200 OK
    FE -> User: "신고가 기각되었습니다" 메시지
end

== 메타데이터 관리 ==
User -> FE: 메타데이터 관리 페이지 접근
FE -> BE: GET /api/admin/metadata
BE -> Database: SELECT categories, difficulties
Database -> BE: 메타데이터 목록
BE -> FE: 메타데이터 데이터
FE -> User: 카테고리/난이도 목록 표시

alt 새 항목 추가
    User -> FE: "새 카테고리/난이도 추가" 클릭
    FE -> User: 입력 폼 표시
    User -> FE: 새 항목 이름 입력 및 저장
    FE -> BE: POST /api/admin/categories or /api/admin/difficulties
    BE -> Database: INSERT new metadata item
    Database -> BE: 생성 완료
    BE -> FE: 201 Created
    FE -> User: "새 항목이 추가되었습니다" 메시지
    
else 기존 항목 수정/삭제
    User -> FE: 기존 항목 선택 및 수정/삭제
    FE -> BE: PUT/DELETE /api/admin/categories/:id
    BE -> Database: Check if item is in use
    alt 사용 중인 항목 삭제 시도
        Database -> BE: 사용 중인 항목
        BE -> FE: 409 Conflict
        FE -> User: "사용 중인 항목은 삭제할 수 없습니다" 경고
    else 수정/삭제 가능
        BE -> Database: UPDATE/DELETE metadata item
        Database -> BE: 변경 완료
        BE -> FE: 200 OK
        FE -> User: "변경이 완료되었습니다" 메시지
    end
end
@enduml
```