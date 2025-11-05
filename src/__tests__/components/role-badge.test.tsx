import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock the useUserRole hook at the top level
vi.mock('@/features/auth/hooks/useUserRole', () => ({
  useUserRole: vi.fn(),
}));

import { RoleBadge } from '@/components/role-badge';
import { useUserRole } from '@/features/auth/hooks/useUserRole';

const mockUseUserRole = vi.mocked(useUserRole);

describe('RoleBadge Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render learner badge correctly', () => {
    mockUseUserRole.mockReturnValue({ role: 'learner', isLoading: false });

    render(<RoleBadge />);

    expect(screen.getByText('학습자')).toBeInTheDocument();
    // Check for Users icon (lucide-users class)
    expect(document.querySelector('.lucide-users')).toBeInTheDocument();
  });

  it('should render instructor badge correctly', () => {
    mockUseUserRole.mockReturnValue({ role: 'instructor', isLoading: false });

    render(<RoleBadge />);

    expect(screen.getByText('강사')).toBeInTheDocument();
    // Check for BookOpen icon (lucide-book-open class)
    expect(document.querySelector('.lucide-book-open')).toBeInTheDocument();
  });

  it('should render operator badge correctly', () => {
    mockUseUserRole.mockReturnValue({ role: 'operator', isLoading: false });

    render(<RoleBadge />);

    expect(screen.getByText('운영자')).toBeInTheDocument();
    // Check for Shield icon (lucide-shield class)
    expect(document.querySelector('.lucide-shield')).toBeInTheDocument();
  });

  it('should not render when loading', () => {
    mockUseUserRole.mockReturnValue({ role: null, isLoading: true });

    const { container } = render(<RoleBadge />);
    expect(container.firstChild).toBeNull();
  });

  it('should not render when role is not available', () => {
    mockUseUserRole.mockReturnValue({ role: null, isLoading: false });

    const { container } = render(<RoleBadge />);
    expect(container.firstChild).toBeNull();
  });
});
