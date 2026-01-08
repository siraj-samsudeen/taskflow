import { render, screen, userEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
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

// We use spy here instead of mock as we have done with supabase above.
// Here we want to replace the Alert component only with a mock no-op function
// because react-native is a large module and we don't want to replace it entirely.
jest.spyOn(Alert, 'alert').mockImplementation();

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
    it('calls signUp with credentials and shows confirmation', async () => {
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
      expect(Alert.alert).toHaveBeenCalledWith(
        'Success',
        'Check your email to confirm your account'
      );
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
