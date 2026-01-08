import { render, screen, userEvent, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import PasswordResetRequestScreen from '../../src/app/(auth)/password-reset-request';
import { supabase } from '../../src/lib/supabase';
import { submitForgotPasswordForm } from '../utils/form-helpers';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../src/lib/supabase');

import Toast from 'react-native-toast-message';

describe('PasswordResetRequestScreen', () => {
  const mockPush = jest.fn();
  const mockAuth = jest.mocked(supabase.auth);

  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(useRouter).mockReturnValue({ push: mockPush } as any);
  });

  describe('validation', () => {
    it('shows inline validation errors on invalid submit', async () => {
      const user = userEvent.setup();
      render(<PasswordResetRequestScreen />);

      await user.press(screen.getByText('Send Reset Link'));

      expect(screen.getByText('Please enter a valid email')).toBeTruthy();
    });
  });

  describe('submission', () => {
    it('calls resetPasswordForEmail with email and redirectTo', async () => {
      mockAuth.resetPasswordForEmail.mockResolvedValue({ error: null } as any);
      render(<PasswordResetRequestScreen />);

      await submitForgotPasswordForm('test@example.com');

      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('test@example.com', {
        redirectTo: `${process.env.EXPO_PUBLIC_APP_URL}/password-reset-confirm`,
      });
    });

    it('shows success toast after email sent', async () => {
      mockAuth.resetPasswordForEmail.mockResolvedValue({ error: null } as any);
      render(<PasswordResetRequestScreen />);

      await submitForgotPasswordForm('test@example.com');

      expect(Toast.show).toHaveBeenCalledWith({
        type: 'success',
        text1: 'Success',
        text2: 'Check your email for a reset link.',
      });
    });

    it('shows error toast on API failure', async () => {
      mockAuth.resetPasswordForEmail.mockResolvedValue({
        error: {
          message: 'For security purposes, you can only request this once every 60 seconds',
        },
      } as any);
      render(<PasswordResetRequestScreen />);

      await submitForgotPasswordForm('test@example.com');

      expect(Toast.show).toHaveBeenCalledWith({
        type: 'error',
        text1: 'Error',
        text2: 'For security purposes, you can only request this once every 60 seconds',
      });
    });

    it('disables button and shows loading text while submitting', async () => {
      let resolvePromise: (value: any) => void;
      mockAuth.resetPasswordForEmail.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolvePromise = resolve;
          }),
      );
      render(<PasswordResetRequestScreen />);

      await submitForgotPasswordForm('test@example.com');

      const button = screen.getByText('Sending...');
      expect(button.parent?.parent?.props.accessibilityState?.disabled).toBe(true);

      resolvePromise!({ error: null });
      await waitFor(() => {
        expect(screen.getByText('Send Reset Link')).toBeTruthy();
      });
    });
  });

  describe('navigation', () => {
    it('navigates back to login when link pressed', async () => {
      const user = userEvent.setup();
      render(<PasswordResetRequestScreen />);

      await user.press(screen.getByText('Back to Login'));

      expect(mockPush).toHaveBeenCalledWith('/(auth)/login');
    });
  });
});
