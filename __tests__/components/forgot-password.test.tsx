import { render, screen, userEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';

import ForgotPasswordScreen from '../../src/app/(auth)/forgot-password';
import { supabase } from '../../src/lib/supabase';
import { submitForgotPasswordForm } from '../utils/form-helpers';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../src/lib/supabase', () => ({
  supabase: {
    auth: {
      resetPasswordForEmail: jest.fn(),
    },
  },
}));

jest.spyOn(Alert, 'alert').mockImplementation();

describe('ForgotPasswordScreen', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  describe('validation', () => {
    it('shows inline validation errors on invalid submit', async () => {
      const user = userEvent.setup();
      render(<ForgotPasswordScreen />);

      await user.press(screen.getByText('Send Reset Link'));

      expect(screen.getByText('Please enter a valid email')).toBeTruthy();
    });
  });

  describe('submission', () => {
    it('calls resetPasswordForEmail with email and redirectTo', async () => {
      (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({ error: null });
      render(<ForgotPasswordScreen />);

      await submitForgotPasswordForm('test@example.com');

      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('test@example.com', {
        redirectTo: `${process.env.EXPO_PUBLIC_APP_URL}/reset-password`,
      });
    });

    it('shows success alert after email sent', async () => {
      (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({ error: null });
      render(<ForgotPasswordScreen />);

      await submitForgotPasswordForm('test@example.com');

      expect(Alert.alert).toHaveBeenCalledWith('Success', 'Check your email for a reset link.');
    });

    it('shows error alert on API failure', async () => {
      (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
        error: { message: 'For security purposes, you can only request this once every 60 seconds' },
      });
      render(<ForgotPasswordScreen />);

      await submitForgotPasswordForm('test@example.com');

      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'For security purposes, you can only request this once every 60 seconds'
      );
    });

    it('disables button and shows loading text while submitting', async () => {
      let resolvePromise: (value: any) => void;
      (supabase.auth.resetPasswordForEmail as jest.Mock).mockImplementation(
        () => new Promise((resolve) => { resolvePromise = resolve; })
      );
      render(<ForgotPasswordScreen />);

      await submitForgotPasswordForm('test@example.com');

      const button = screen.getByText('Sending...');
      expect(button.parent?.parent?.props.accessibilityState?.disabled).toBe(true);

      resolvePromise!({ error: null });
    });
  });

  describe('navigation', () => {
    it('navigates back to login when link pressed', async () => {
      const user = userEvent.setup();
      render(<ForgotPasswordScreen />);

      await user.press(screen.getByText('Back to Login'));

      expect(mockPush).toHaveBeenCalledWith('/(auth)/login');
    });
  });
});
