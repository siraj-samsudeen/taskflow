import { render, screen, userEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';

import LoginScreen from '../../src/app/(auth)/login';
import { supabase } from '../../src/lib/supabase';
import { createAuthSubscription } from '../utils/auth-mocks';
import { submitLoginForm } from '../utils/form-helpers';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../src/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
  },
}));

// We use spy here instead of mock as we have done with supabase above.
// Here we want to replace the Alert component only with a mock no-op function
// because react-native is a large module and we don't want to replace it entirely.
jest.spyOn(Alert, 'alert').mockImplementation();

describe('LoginScreen', () => {
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
      render(<LoginScreen />);

      await user.press(screen.getByText('Login'));

      expect(screen.getByText('Please enter a valid email')).toBeTruthy();
    });
  });

  describe('submission', () => {
    it('calls signInWithPassword with credentials', async () => {
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        error: null,
      });

      render(<LoginScreen />);
      await submitLoginForm('test@example.com', 'password123');

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('shows error alert on invalid credentials', async () => {
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        error: { message: 'Invalid credentials' },
      });

      render(<LoginScreen />);
      await submitLoginForm('test@example.com', 'wrongpassword');

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Invalid credentials');
    });
  });

  describe('navigation', () => {
    it('navigates to register screen when register link is pressed', async () => {
      const user = userEvent.setup();
      render(<LoginScreen />);

      await user.press(screen.getByText('Register'));

      expect(mockPush).toHaveBeenCalledWith('/(auth)/register');
    });
  });
});
