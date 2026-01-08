import { render, screen, userEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import RegisterScreen from '../../src/app/(auth)/register';
import { supabase } from '../../src/lib/supabase';
import { createAuthSubscription } from '../utils/auth-mocks';
import { fillRegisterForm } from '../utils/form-helpers';

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
      render(<RegisterScreen />);

      await user.type(screen.getByPlaceholderText('Password'), 'password123');
      await user.type(screen.getByPlaceholderText('Confirm Password'), 'password123');
      await user.press(screen.getByText('Register'));

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter your email');
    });

    it('invalid email -> shows error', async () => {
      const user = userEvent.setup();
      render(<RegisterScreen />);

      await fillRegisterForm(user, 'notanemail', 'password123', 'password123');
      await user.press(screen.getByText('Register'));

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter a valid email');
    });

    it('empty password -> shows error', async () => {
      const user = userEvent.setup();
      render(<RegisterScreen />);

      await user.type(screen.getByPlaceholderText('Email'), 'test@example.com');
      await user.press(screen.getByText('Register'));

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter your password');
    });

    it('passwords do not match -> shows error', async () => {
      const user = userEvent.setup();
      render(<RegisterScreen />);

      await fillRegisterForm(user, 'test@example.com', 'password123', 'differentpassword');
      await user.press(screen.getByText('Register'));

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Passwords do not match');
    });

  });

  describe('submission', () => {
    it('calls signUp with credentials and shows confirmation', async () => {
      const user = userEvent.setup();
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: {},
        error: null,
      });

      render(<RegisterScreen />);
      await fillRegisterForm(user, 'test@example.com', 'password123', 'password123');
      await user.press(screen.getByText('Register'));

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
});
