import { render, screen, userEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';

import ResetPasswordScreen from '../../src/app/(auth)/reset-password';
import { supabase } from '../../src/lib/supabase';
import * as Linking from 'expo-linking';
import { submitResetPasswordForm } from '../utils/form-helpers';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('expo-linking', () => ({
  useURL: jest.fn(),
}));

jest.mock('../../src/lib/supabase', () => ({
  supabase: {
    auth: {
      setSession: jest.fn().mockResolvedValue({ error: null }),
      updateUser: jest.fn(),
    },
  },
}));

jest.spyOn(Alert, 'alert').mockImplementation();

describe('ResetPasswordScreen', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (Linking.useURL as jest.Mock).mockReturnValue(
      'http://localhost:8081/reset-password#access_token=test&refresh_token=test&type=recovery'
    );
  });

  describe('validation', () => {
    it('shows validation error when password empty', async () => {
      const user = userEvent.setup();
      render(<ResetPasswordScreen />);

      await user.press(screen.getByText('Reset Password'));

      expect(screen.getByText('Password is required')).toBeTruthy();
    });

    it('shows validation error when passwords do not match', async () => {
      const user = userEvent.setup();
      render(<ResetPasswordScreen />);

      await user.type(screen.getByPlaceholderText('New Password'), 'password123');
      await user.type(screen.getByPlaceholderText('Confirm Password'), 'different');
      await user.press(screen.getByText('Reset Password'));

      expect(screen.getByText('Passwords do not match')).toBeTruthy();
    });
  });

  describe('token handling', () => {
    it('calls setSession with tokens from URL on mount', async () => {
      (supabase.auth.setSession as jest.Mock).mockResolvedValue({ error: null });
      render(<ResetPasswordScreen />);

      await waitFor(() => {
        expect(supabase.auth.setSession).toHaveBeenCalledWith({
          access_token: 'test',
          refresh_token: 'test',
        });
      });
    });

    it('shows error and redirects to forgot-password when tokens missing', async () => {
      (Linking.useURL as jest.Mock).mockReturnValue('http://localhost:8081/reset-password');
      render(<ResetPasswordScreen />);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Invalid or expired reset link. Please request a new one.'
        );
        expect(mockPush).toHaveBeenCalledWith('/(auth)/forgot-password');
      });
    });
  });

  describe('submission', () => {
    it('calls updateUser with new password on submit', async () => {
      (supabase.auth.setSession as jest.Mock).mockResolvedValue({ error: null });
      (supabase.auth.updateUser as jest.Mock).mockResolvedValue({ error: null });
      render(<ResetPasswordScreen />);

      await submitResetPasswordForm('newpassword123', 'newpassword123');

      expect(supabase.auth.updateUser).toHaveBeenCalledWith({ password: 'newpassword123' });
    });

    it('shows success alert and navigates to login after password reset', async () => {
      (supabase.auth.setSession as jest.Mock).mockResolvedValue({ error: null });
      (supabase.auth.updateUser as jest.Mock).mockResolvedValue({ error: null });
      render(<ResetPasswordScreen />);

      await submitResetPasswordForm('newpassword123', 'newpassword123');

      expect(Alert.alert).toHaveBeenCalledWith('Success', 'Your password has been reset.');
      expect(mockPush).toHaveBeenCalledWith('/(auth)/login');
    });

    it('shows error alert on API failure', async () => {
      (supabase.auth.setSession as jest.Mock).mockResolvedValue({ error: null });
      (supabase.auth.updateUser as jest.Mock).mockResolvedValue({
        error: { message: 'Token expired' },
      });
      render(<ResetPasswordScreen />);

      await submitResetPasswordForm('newpassword123', 'newpassword123');

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Token expired');
    });

    it('disables button and shows loading text while submitting', async () => {
      let resolvePromise: (value: any) => void;
      (supabase.auth.setSession as jest.Mock).mockResolvedValue({ error: null });
      (supabase.auth.updateUser as jest.Mock).mockImplementation(
        () => new Promise((resolve) => { resolvePromise = resolve; })
      );
      render(<ResetPasswordScreen />);

      await submitResetPasswordForm('newpassword123', 'newpassword123');

      const button = screen.getByText('Resetting...');
      expect(button.parent?.parent?.props.accessibilityState?.disabled).toBe(true);

      resolvePromise!({ error: null });
    });
  });
});
