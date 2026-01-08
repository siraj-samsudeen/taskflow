import { render, screen, userEvent } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import RegisterScreen from '../../src/app/(auth)/register';
import { supabase } from '../../src/lib/supabase';
import { createAuthSubscription } from '../utils/auth-mocks';
import { submitRegisterForm } from '../utils/form-helpers';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../src/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
  },
}));

jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
}));

import Toast from 'react-native-toast-message';

describe('RegisterScreen', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    // resetAllMocks clears call history AND resets implementations
    // (clearAllMocks only clears call history, leaving mockImplementation leaks between tests)
    jest.resetAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (supabase.auth.onAuthStateChange as jest.Mock).mockReturnValue(
      createAuthSubscription()
    );
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
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: {},
        error: null,
      });

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
