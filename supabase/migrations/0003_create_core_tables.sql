-- Migration: Create core tables for LMS schema
-- Creates all tables as specified in docs/database.md

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

-- Add table comments for documentation
COMMENT ON TABLE profiles IS '사용자 프로필 테이블 - Supabase Auth와 연결됨';
COMMENT ON TABLE terms_agreements IS '약관 동의 이력 테이블';
COMMENT ON TABLE categories IS '코스 카테고리 메타데이터 테이블';
COMMENT ON TABLE difficulties IS '난이도 메타데이터 테이블';
COMMENT ON TABLE courses IS '코스 정보 테이블';
COMMENT ON TABLE enrollments IS '수강 등록 테이블 - 학습자와 코스의 매핑';
COMMENT ON TABLE assignments IS '과제 정보 테이블';
COMMENT ON TABLE submissions IS '과제 제출물 테이블';
COMMENT ON TABLE reports IS '신고 관리 테이블';

-- Add column comments for important fields
COMMENT ON COLUMN profiles.role IS '사용자 역할: learner, instructor, operator';
COMMENT ON COLUMN courses.instructor_id IS '강사 ID - 강사 탈퇴 시 NULL로 설정';
COMMENT ON COLUMN courses.status IS '코스 상태: draft, published, archived, closed';
COMMENT ON COLUMN assignments.score_weighting IS '과제 점수 비중 (0-100%)';
COMMENT ON COLUMN assignments.allow_late_submission IS '지각 제출 허용 여부';
COMMENT ON COLUMN assignments.allow_resubmission IS '재제출 허용 여부';
COMMENT ON COLUMN submissions.is_late IS '지각 제출 여부';
COMMENT ON COLUMN submissions.status IS '제출물 상태: submitted, graded, resubmission_required';
COMMENT ON COLUMN reports.target_type IS '신고 대상 타입: course, assignment, submission, user';
COMMENT ON COLUMN reports.target_id IS '신고 대상 ID (TEXT로 저장하여 다양한 ID 타입 지원)';