

## 1\. 🔄 데이터베이스 관점의 데이터플로우

1.  **[신규 사용자]** 가입 시, Supabase Auth에 인증 정보가 생성됩니다. 이 인증 ID를 참조하여 `profiles` 테이블에 `role`('learner' 또는 'instructor'), `name`, `phone_number`를 포함한 레코드가 생성됩니다. 동시에 `terms_agreements`에 약관 동의 이력이 기록됩니다.
2.  **[Instructor]** 는 `profiles`의 `id`를 `instructor_id`로 하여 `courses` 레코드를 생성(status='draft')합니다. 이때 `categories`와 `difficulties` 테이블의 `id`를 참조하여 메타데이터를 설정합니다.
3.  **[Instructor]** 는 `courses`의 `id`를 `course_id`로 하여 `assignments` 레코드를 생성(status='draft')합니다.
4.  **[Instructor]** 는 `courses`와 `assignments`의 `status`를 'published'로 변경하여 노출을 시작합니다.
5.  **[Learner]** 는 `courses` 테이블을 조회(status='published')하여 탐색합니다. '수강신청' 시, `profiles`의 `id`와 `courses`의 `id`를 묶어 `enrollments` 테이블에 레코드가 생성됩니다.
6.  **[Learner]** 는 `enrollments`를 통해 본인의 `courses`를 조회하고, 이에 연결된 `assignments`(status='published')를 확인합니다.
7.  **[Learner]** 가 과제 제출 시, `assignments`의 `id`와 `profiles`의 `id`를 참조하여 `submissions` 레코드가 생성됩니다. 이때 `content_text`, `content_link`, `submitted_at`이 기록되고 마감일(`assignments.due_date`) 비교 후 `is_late` 플래그가 설정되며 `status`는 'submitted'가 됩니다.
8.  **[Instructor]** 는 `assignments`에 연결된 `submissions` 목록(status='submitted')을 조회합니다. 채점 시, `submissions` 레코드를 `UPDATE`하여 `score`, `feedback`을 기록하고 `status`를 'graded' 또는 'resubmission\_required'로 변경합니다.
9.  **[Learner]** 는 `submissions` 테이블에서 자신의 `score`와 `feedback`을 조회합니다. `status`가 'resubmission\_required'인 경우, 7번 플로우를 다시 수행(재제출)할 수 있습니다.
10. **[Operator]** 는 `reports` 테이블에 신고 내역을 생성(INSERT)하고, `status`를 변경(UPDATE)하며 관리합니다. 또한 `categories`와 `difficulties` 테이블의 레코드를 CRUD(INSERT, UPDATE, DELETE)합니다.

-----

## 2\. 🗃️ 데이터베이스 스키마 (PostgreSQL)

유저플로우에 명시된 데이터를 기반으로 한 최소한의 PostgreSQL 스키마입니다.

### 1\. Custom Types (Enums)

먼저, 반복적으로 사용되는 상태 값들을 ENUM 타입으로 정의합니다.

```sql
-- 사용자 역할
CREATE TYPE user_role AS ENUM ('learner', 'instructor', 'operator');

-- 코스 및 과제 상태s
CREATE TYPE content_status AS ENUM ('draft', 'published', 'archived', 'closed');

-- 제출물 상태
CREATE TYPE submission_status AS ENUM ('submitted', 'graded', 'resubmission_required');

-- 신고 처리 상태
CREATE TYPE report_status AS ENUM ('received', 'investigating', 'resolved');
```

### 2\. Tables

```sql
-- 1. 사용자 프로필 (Supabase Auth와 연결)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE, -- Supabase auth.users.id와 연결
    role user_role NOT NULL,
    name TEXT NOT NULL,
    phone_number TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. 약관 동의 이력
CREATE TABLE terms_agreements (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    agreed_at TIMESTAMPTZ DEFAULT now()
);

-- 3. 메타데이터: 카테고리
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- 4. 메타데이터: 난이도
CREATE TABLE difficulties (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- 5. 코스
CREATE TABLE courses (
    id BIGSERIAL PRIMARY KEY,
    instructor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL, -- 강사 탈퇴 시 코스 유지
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    difficulty_id INT REFERENCES difficulties(id) ON DELETE SET NULL,
    
    title TEXT NOT NULL,
    description TEXT,
    curriculum TEXT, -- 커리큘럼 정보
    status content_status NOT NULL DEFAULT 'draft',
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. 수강 등록 (Learner-Course 매핑)
CREATE TABLE enrollments (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE(user_id, course_id) -- 중복 수강신청 방지
);

-- 7. 과제
CREATE TABLE assignments (
    id BIGSERIAL PRIMARY KEY,
    course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ,
    score_weighting INT NOT NULL DEFAULT 0 CHECK (score_weighting >= 0 AND score_weighting <= 100),
    
    allow_late_submission BOOLEAN NOT NULL DEFAULT FALSE,
    allow_resubmission BOOLEAN NOT NULL DEFAULT FALSE,
    
    status content_status NOT NULL DEFAULT 'draft', -- 'draft', 'published', 'closed' 사용
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. 제출물
CREATE TABLE submissions (
    id BIGSERIAL PRIMARY KEY,
    assignment_id BIGINT NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    content_text TEXT NOT NULL, -- 필수 제출
    content_link TEXT, -- 선택 제출
    
    submitted_at TIMESTAMPTZ DEFAULT now(),
    is_late BOOLEAN NOT NULL DEFAULT FALSE,
    
    status submission_status NOT NULL DEFAULT 'submitted',
    
    score INT CHECK (score >= 0 AND score <= 100), -- 채점 시 입력
    feedback TEXT, -- 채점 시 입력
    
    UNIQUE(assignment_id, user_id) -- 과제당 1개의 제출물만 허용 (재제출은 이 레코드를 UPDATE)
);

-- 9. 운영: 신고
CREATE TABLE reports (
    id BIGSERIAL PRIMARY KEY,
    reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    target_type TEXT NOT NULL, -- 'course', 'assignment', 'submission', 'user'
    target_id TEXT NOT NULL,   -- 관련 ID (UUID 또는 BIGINT이므로 TEXT로 저장)
    
    reason TEXT,
    details TEXT,
    
    status report_status NOT NULL DEFAULT 'received',
    
    created_at TIMESTAMPTZ DEFAULT now()
);
```