import { render, screen, userEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import LoginScreen from '../../src/app/(auth)/login';
import { supabase } from '../../src/lib/supabase';
import { createAuthSubscription } from '../utils/auth-mocks';
import { fillLoginForm } from '../utils/form-helpers';

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
  beforeEach(() => {
    // resetAllMocks clears call history AND resets implementations
    // (clearAllMocks only clears call history, leaving mockImplementation leaks between tests)
    jest.resetAllMocks();
    (supabase.auth.onAuthStateChange as jest.Mock).mockReturnValue(
      createAuthSubscription()
    );
  });

  describe('validation', () => {
    it('empty email -> shows error', async () => {
      const user = userEvent.setup();
      render(<LoginScreen />);

      await user.type(screen.getByPlaceholderText('Password'), 'password123');
      await user.press(screen.getByText('Login'));

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter your email');
    });

    it('invalid email -> shows error', async () => {
      const user = userEvent.setup();
      render(<LoginScreen />);

      await fillLoginForm(user, 'notanemail', 'password123');
      await user.press(screen.getByText('Login'));

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter a valid email');
    });

    it('empty password -> shows error', async () => {
      const user = userEvent.setup();
      render(<LoginScreen />);

      await user.type(screen.getByPlaceholderText('Email'), 'test@example.com');
      await user.press(screen.getByText('Login'));

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter your password');
    });

    it('Invalid Login credentials -> shows error message', async () => {
      const user = userEvent.setup();
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        error: { message: 'Invalid credentials' },
      });

      render(<LoginScreen />);
      await fillLoginForm(user, 'test@example.com', 'wrongpassword');
      await user.press(screen.getByText('Login'));

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Invalid credentials');
    });
  });

  describe('submission', () => {
    it('calls signInWithPassword with credentials', async () => {
      const user = userEvent.setup();
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        error: null,
      });

      render(<LoginScreen />);
      await fillLoginForm(user, 'test@example.com', 'password123');
      await user.press(screen.getByText('Login'));

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });
});
