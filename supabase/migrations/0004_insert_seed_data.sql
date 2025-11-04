-- Migration: Insert seed data for LMS metadata
-- Inserts basic categories and difficulties for the system

-- Insert default categories
INSERT INTO categories (name) VALUES
    ('프로그래밍'),
    ('데이터 사이언스'),
    ('웹 개발'),
    ('모바일 개발'),
    ('DevOps'),
    ('AI/머신러닝'),
    ('디자인'),
    ('비즈니스'),
    ('마케팅'),
    ('기타')
ON CONFLICT (name) DO NOTHING;

-- Insert default difficulties
INSERT INTO difficulties (name) VALUES
    ('입문'),
    ('초급'),
    ('중급'),
    ('고급'),
    ('전문가')
ON CONFLICT (name) DO NOTHING;

-- Add comments
COMMENT ON TABLE categories IS '코스 카테고리 - 기본 카테고리들이 시드 데이터로 삽입됨';
COMMENT ON TABLE difficulties IS '난이도 레벨 - 5단계 난이도가 시드 데이터로 삽입됨';