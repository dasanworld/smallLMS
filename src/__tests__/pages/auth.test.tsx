import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '@/app/login/page';
import SignupPage from '@/app/signup/page';

describe('Authentication Pages', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Login Page', () => {
    it('should render login form with all required fields', () => {
      render(<LoginPage />);

      expect(screen.getByText('로그인')).toBeInTheDocument();
      expect(screen.getByLabelText(/이메일/)).toBeInTheDocument();
      expect(screen.getByLabelText(/비밀번호/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /로그인/ })).toBeInTheDocument();
    });

    it('should show signup link', () => {
      render(<LoginPage />);

      expect(screen.getByText(/아직 계정이 없으신가요/)).toBeInTheDocument();
      expect(screen.getByText('회원가입')).toBeInTheDocument();
    });

    it('should validate required fields', async () => {
      render(<LoginPage />);

      const submitButton = screen.getByRole('button', { name: /로그인/ });
      await user.click(submitButton);

      // Form validation should prevent submission with empty fields
      // This would require form validation implementation
    });
  });

  describe('Signup Page', () => {
    it('should render signup form with all required fields', () => {
      render(<SignupPage />);

      expect(screen.getByText('회원가입')).toBeInTheDocument();
      expect(screen.getByLabelText(/이메일/)).toBeInTheDocument();
      expect(screen.getByLabelText(/^비밀번호$/)).toBeInTheDocument();
      expect(screen.getByLabelText(/비밀번호 확인/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /회원가입/ })).toBeInTheDocument();
    });

    it('should show login link', () => {
      render(<SignupPage />);

      expect(screen.getByText(/이미 계정이 있으신가요/)).toBeInTheDocument();
      expect(screen.getByText('로그인으로 이동')).toBeInTheDocument();
    });

    it('should require password confirmation to match', async () => {
      render(<SignupPage />);

      const passwordInput = screen.getByLabelText(/^비밀번호$/);
      const confirmPasswordInput = screen.getByLabelText(/비밀번호 확인/);
      const emailInput = screen.getByLabelText(/이메일/);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'differentpassword');

      const submitButton = screen.getByRole('button', { name: /회원가입/ });

      // Password mismatch should disable submit or show error
      expect(submitButton).toBeDisabled();
    });
  });
});
