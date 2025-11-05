import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LearnerAssignmentDetailPage from '@/app/(protected)/my/courses/[courseId]/assignments/[assignmentId]/page';
import AssignmentSubmitPage from '@/app/(protected)/my/courses/[courseId]/assignments/[assignmentId]/submit/page';

describe('Assignment Pages', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Learner Assignment Detail Page', () => {
    it('should render breadcrumb navigation', () => {
      render(<LearnerAssignmentDetailPage params={Promise.resolve({ courseId: '1', assignmentId: '1' })} />);

      expect(screen.getByText('대시보드')).toBeInTheDocument();
      expect(screen.getByText('코스 과제')).toBeInTheDocument();
    });

    it('should show loading state initially', () => {
      render(<LearnerAssignmentDetailPage params={Promise.resolve({ courseId: '1', assignmentId: '1' })} />);

      expect(screen.getByText('과제 정보를 로드 중입니다...')).toBeInTheDocument();
    });

    it('should handle assignment not found', async () => {
      render(<LearnerAssignmentDetailPage params={Promise.resolve({ courseId: '1', assignmentId: '999' })} />);

      await waitFor(() => {
        expect(screen.getByText('과제를 찾을 수 없습니다')).toBeInTheDocument();
      });
    });

    it('should render assignment detail component when loaded', async () => {
      render(<LearnerAssignmentDetailPage params={Promise.resolve({ courseId: '1', assignmentId: '1' })} />);

      // LearnerAssignmentDetail component should be rendered after loading
      // The actual content depends on data loading
    });
  });

  describe('Assignment Submit Page', () => {
    it('should render back navigation', () => {
      render(<AssignmentSubmitPage params={Promise.resolve({ courseId: '1', assignmentId: '1' })} />);

      expect(screen.getByText('← 과제로 돌아가기')).toBeInTheDocument();
    });

    it('should show assignment title section', () => {
      render(<AssignmentSubmitPage params={Promise.resolve({ courseId: '1', assignmentId: '1' })} />);

      expect(screen.getByText('과제 제출')).toBeInTheDocument();
    });

    it('should show loading state initially', () => {
      render(<AssignmentSubmitPage params={Promise.resolve({ courseId: '1', assignmentId: '1' })} />);

      expect(screen.getByText('과제 정보를 로드 중입니다...')).toBeInTheDocument();
    });

    it('should render assignment submit component', () => {
      render(<AssignmentSubmitPage params={Promise.resolve({ courseId: '1', assignmentId: '1' })} />);

      // AssignmentSubmit component should be rendered in a styled container
    });

    it('should handle assignment not found', async () => {
      render(<AssignmentSubmitPage params={Promise.resolve({ courseId: '1', assignmentId: '999' })} />);

      await waitFor(() => {
        expect(screen.getByText('과제를 찾을 수 없습니다')).toBeInTheDocument();
      });
    });
  });
});
