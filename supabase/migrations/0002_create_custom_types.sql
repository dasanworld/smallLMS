-- Migration: Create custom types (enums) for LMS schema
-- Creates all the enum types used throughout the application

-- 사용자 역할
CREATE TYPE user_role AS ENUM ('learner', 'instructor', 'operator');

-- 코스 및 과제 상태
CREATE TYPE content_status AS ENUM ('draft', 'published', 'archived', 'closed');

-- 제출물 상태
CREATE TYPE submission_status AS ENUM ('submitted', 'graded', 'resubmission_required');

-- 신고 처리 상태
CREATE TYPE report_status AS ENUM ('received', 'investigating', 'resolved');

-- Add comments for documentation
COMMENT ON TYPE user_role IS 'User roles: learner (학습자), instructor (강사), operator (운영자)';
COMMENT ON TYPE content_status IS 'Content status: draft (초안), published (게시됨), archived (보관됨), closed (종료됨)';
COMMENT ON TYPE submission_status IS 'Submission status: submitted (제출됨), graded (채점완료), resubmission_required (재제출필요)';
COMMENT ON TYPE report_status IS 'Report status: received (접수됨), investigating (조사중), resolved (해결됨)';