import { render, screen, userEvent } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import RegisterScreen from '../../src/app/(auth)/register';
import { supabase } from '../../src/lib/supabase';
import { createAuthSubscription } from '../utils/auth-mocks';
import { submitRegisterForm } from '../utils/form-helpers';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../src/lib/supabase');

import Toast from 'react-native-toast-message';

describe('RegisterScreen', () => {
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
      render(<RegisterScreen />);

      await user.press(screen.getByText('Register'));

      expect(screen.getByText('Please enter a valid email')).toBeTruthy();
    });
  });

  describe('submission', () => {
    it('calls signUp with credentials and shows success toast', async () => {
      mockAuth.signUp.mockResolvedValue({ data: {}, error: null } as any);

      render(<RegisterScreen />);
      await submitRegisterForm('test@example.com', 'password123', 'password123');

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(Toast.show).toHaveBeenCalledWith({
        type: 'success',
        text1: 'Success',
        text2: 'Check your email to confirm your account',
      });
    });
  });

  describe('navigation', () => {
    it('navigates to login screen when login link is pressed', async () => {
      const user = userEvent.setup();
      render(<RegisterScreen />);

      await user.press(screen.getByText('Login'));

      expect(mockPush).toHaveBeenCalledWith('/(auth)/login');
    });
  });
});
