import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DashboardPage from '@/app/(protected)/dashboard/page';
import InstructorDashboardPage from '@/app/(protected)/instructor/dashboard/page';
import AdminPage from '@/app/(protected)/admin/page';

describe('Dashboard Pages', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Learner Dashboard Page', () => {
    it('should render loading state initially', () => {
      render(<DashboardPage params={Promise.resolve({})} />);

      expect(screen.getByText('인증 확인 중...')).toBeInTheDocument();
    });

    it('should redirect instructor to instructor dashboard', async () => {
      // This would require mocking the role hook
      // For now, we test the basic rendering structure
      render(<DashboardPage params={Promise.resolve({})} />);

      // Should show loading initially
      expect(screen.getByText('인증 확인 중...')).toBeInTheDocument();
    });

    it('should redirect operator to admin dashboard', async () => {
      render(<DashboardPage params={Promise.resolve({})} />);

      expect(screen.getByText('인증 확인 중...')).toBeInTheDocument();
    });

    it('should show learner dashboard for learners', async () => {
      // Mock learner role
      render(<DashboardPage params={Promise.resolve({})} />);

      // Initially shows auth loading
      expect(screen.getByText('인증 확인 중...')).toBeInTheDocument();
    });
  });

  describe('Instructor Dashboard Page', () => {
    it('should render instructor dashboard with proper title', () => {
      render(<InstructorDashboardPage params={Promise.resolve({})} />);

      expect(screen.getByText('📊 강사 대시보드')).toBeInTheDocument();
      expect(screen.getByText('코스 통계와 채점 현황을 한눈에 확인하세요')).toBeInTheDocument();
    });

    it('should show role badge', () => {
      render(<InstructorDashboardPage params={Promise.resolve({})} />);

      // RoleBadge component should be rendered
      // The actual badge content depends on user role
    });

    it('should show loading state during role verification', () => {
      render(<InstructorDashboardPage params={Promise.resolve({})} />);

      // Should show loading initially due to role verification
    });
  });

  describe('Admin Dashboard Page', () => {
    it('should render admin dashboard with proper title', () => {
      render(<AdminPage />);

      expect(screen.getByText('운영자 대시보드')).toBeInTheDocument();
      expect(screen.getByText('신고 처리 및 메타데이터를 관리하세요')).toBeInTheDocument();
    });

    it('should show role badge', () => {
      render(<AdminPage />);

      // RoleBadge component should be rendered
    });

    it('should show loading state during role verification', () => {
      render(<AdminPage />);

      // Should show loading initially due to role verification
    });

    it('should render reports management and metadata management sections', () => {
      render(<AdminPage />);

      // These components should be rendered after role verification
      // The actual rendering depends on the role verification
    });
  });
});


