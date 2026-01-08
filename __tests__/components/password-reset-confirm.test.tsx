import { render, screen, userEvent, waitFor } from '@testing-library/react-native';
import { useLinkingURL } from 'expo-linking';
import { useRouter } from 'expo-router';

import PasswordResetConfirmScreen from '../../src/app/(auth)/password-reset-confirm';
import { supabase } from '../../src/lib/supabase';
import { submitResetPasswordForm } from '../utils/form-helpers';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('expo-linking', () => ({
  useLinkingURL: jest.fn(),
}));

jest.mock('../../src/lib/supabase');

import Toast from 'react-native-toast-message';

describe('PasswordResetConfirmScreen', () => {
  const mockPush = jest.fn();
  const mockAuth = jest.mocked(supabase.auth);

  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(useRouter).mockReturnValue({ push: mockPush } as any);
    jest.mocked(useLinkingURL).mockReturnValue(null);
  });

  describe('validation', () => {
    it('shows validation error when password empty', async () => {
      const user = userEvent.setup();
      render(<PasswordResetConfirmScreen />);

      await user.press(screen.getByText('Reset Password'));

      expect(screen.getByText('Password is required')).toBeTruthy();
    });

    it('shows validation error when passwords do not match', async () => {
      const user = userEvent.setup();
      render(<PasswordResetConfirmScreen />);

      await user.type(screen.getByPlaceholderText('New Password'), 'password123');
      await user.type(screen.getByPlaceholderText('Confirm Password'), 'different');
      await user.press(screen.getByText('Reset Password'));

      expect(screen.getByText('Passwords do not match')).toBeTruthy();
    });
  });

  describe('expired link handling', () => {
    it('shows error toast and redirects when link is expired', async () => {
      const errorMessage = 'Email link is invalid or has expired';
      jest
        .mocked(useLinkingURL)
        .mockReturnValue(
          `#error=access_denied&error_description=${errorMessage.replace(/ /g, '+')}`,
        );
      render(<PasswordResetConfirmScreen />);

      await waitFor(() => {
        expect(Toast.show).toHaveBeenCalledWith({
          type: 'error',
          text1: 'Error',
          text2: errorMessage,
        });
        expect(mockPush).toHaveBeenCalledWith('/(auth)/password-reset-request');
      });
    });
  });

  describe('submission', () => {
    it('calls updateUser with new password on submit', async () => {
      mockAuth.updateUser.mockResolvedValue({ error: null } as any);
      render(<PasswordResetConfirmScreen />);

      await submitResetPasswordForm('newpassword123', 'newpassword123');

      expect(mockAuth.updateUser).toHaveBeenCalledWith({ password: 'newpassword123' });
    });

    it('shows success toast and navigates to login after password reset', async () => {
      mockAuth.updateUser.mockResolvedValue({ error: null } as any);
      render(<PasswordResetConfirmScreen />);

      await submitResetPasswordForm('newpassword123', 'newpassword123');

      expect(Toast.show).toHaveBeenCalledWith({
        type: 'success',
        text1: 'Success',
        text2: 'Your password has been reset.',
      });
      expect(mockPush).toHaveBeenCalledWith('/(auth)/login');
    });

    it('shows error toast on API failure', async () => {
      mockAuth.updateUser.mockResolvedValue({
        error: { message: 'Token expired' },
      } as any);
      render(<PasswordResetConfirmScreen />);

      await submitResetPasswordForm('newpassword123', 'newpassword123');

      expect(Toast.show).toHaveBeenCalledWith({
        type: 'error',
        text1: 'Error',
        text2: 'Token expired',
      });
    });

    it('disables button and shows loading text while submitting', async () => {
      let resolvePromise: (value: any) => void;
      mockAuth.updateUser.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolvePromise = resolve;
          }),
      );
      render(<PasswordResetConfirmScreen />);

      await submitResetPasswordForm('newpassword123', 'newpassword123');

      const button = screen.getByText('Resetting...');
      expect(button.parent?.parent?.props.accessibilityState?.disabled).toBe(true);

      resolvePromise!({ error: null });
      await waitFor(() => {
        expect(screen.getByText('Reset Password')).toBeTruthy();
      });
    });
  });
});
