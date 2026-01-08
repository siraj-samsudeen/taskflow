import { render, screen, userEvent } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import LoginScreen from '../../src/app/(auth)/login';
import { supabase } from '../../src/lib/supabase';
import { createAuthSubscription } from '../utils/auth-mocks';
import { submitLoginForm } from '../utils/form-helpers';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../src/lib/supabase');

import Toast from 'react-native-toast-message';

describe('LoginScreen', () => {
  const mockPush = jest.fn();
  const mockAuth = jest.mocked(supabase.auth);

  beforeEach(() => {
    jest.resetAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    mockAuth.onAuthStateChange.mockReturnValue(createAuthSubscription());
  });

  describe('validation', () => {
    it('shows inline validation errors on invalid submit', async () => {
      const user = userEvent.setup();
      render(<LoginScreen />);

      await user.press(screen.getByText('Login'));

      expect(screen.getByText('Please enter a valid email')).toBeTruthy();
    });
  });

  describe('submission', () => {
    it('calls signInWithPassword with credentials', async () => {
      mockAuth.signInWithPassword.mockResolvedValue({ error: null } as any);

      render(<LoginScreen />);
      await submitLoginForm('test@example.com', 'password123');

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('shows error toast on invalid credentials', async () => {
      mockAuth.signInWithPassword.mockResolvedValue({
        error: { message: 'Invalid credentials' },
      } as any);

      render(<LoginScreen />);
      await submitLoginForm('test@example.com', 'wrongpassword');

      expect(Toast.show).toHaveBeenCalledWith({
        type: 'error',
        text1: 'Error',
        text2: 'Invalid credentials',
      });
    });
  });

  describe('navigation', () => {
    it('navigates to register screen when register link is pressed', async () => {
      const user = userEvent.setup();
      render(<LoginScreen />);

      await user.press(screen.getByText('Register'));

      expect(mockPush).toHaveBeenCalledWith('/(auth)/register');
    });

    it('navigates to forgot password screen when link pressed', async () => {
      const user = userEvent.setup();
      render(<LoginScreen />);

      await user.press(screen.getByText('Forgot Password?'));

      expect(mockPush).toHaveBeenCalledWith('/(auth)/password-reset-request');
    });
  });
});
