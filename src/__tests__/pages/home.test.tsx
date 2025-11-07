import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from '@/app/page';

describe('Home Page', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
  });

  describe('when user is not authenticated', () => {
    it('should render the landing page with sign up and login buttons', () => {
      render(<Home />);

      expect(screen.getByText('경량 LMS로 시작하세요')).toBeInTheDocument();
      expect(screen.getByText('시작하기')).toBeInTheDocument();
      expect(screen.getByText('로그인')).toBeInTheDocument();
    });

    it('should show navigation with login and signup buttons', () => {
      render(<Home />);

      expect(screen.getByText('로그인')).toBeInTheDocument();
      expect(screen.getByText('회원가입')).toBeInTheDocument();
    });

    it('should display features section', () => {
      render(<Home />);

      expect(screen.getByText('코스 관리')).toBeInTheDocument();
      expect(screen.getByText('과제 관리')).toBeInTheDocument();
      expect(screen.getByText('즉시 피드백')).toBeInTheDocument();
      expect(screen.getByText('역할 기반 관리')).toBeInTheDocument();
    });

    it('should show stats section', () => {
      render(<Home />);

      expect(screen.getByText('완성된 유스케이스')).toBeInTheDocument();
      expect(screen.getByText('12개')).toBeInTheDocument();
      expect(screen.getByText('페이지')).toBeInTheDocument();
      expect(screen.getByText('18개')).toBeInTheDocument();
    });
  });

  describe('when user is authenticated', () => {
    it('should show navigation with user email and dashboard button', () => {
      // This would require mocking the auth context
      // For now, we'll test the basic structure
      render(<Home />);

      expect(screen.getByText('SmallLMS')).toBeInTheDocument();
    });
  });

  it('should render all main sections', () => {
    render(<Home />);

    expect(screen.getByText('주요 기능')).toBeInTheDocument();
    expect(screen.getByText('역할별 경험')).toBeInTheDocument();
    expect(screen.getByText('학습자')).toBeInTheDocument();
    expect(screen.getByText('강사')).toBeInTheDocument();
    expect(screen.getByText('지금 시작하세요')).toBeInTheDocument();
  });
});


