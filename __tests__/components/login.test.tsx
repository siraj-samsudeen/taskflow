import { render, screen, userEvent } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';

import LoginScreen from '../../src/app/(auth)/login';
import { useAuth } from '../../src/contexts/AuthContext';
import { submitLoginForm } from '../utils/form-helpers';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../src/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('LoginScreen', () => {
  const mockPush = jest.fn();
  const mockLogin = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(useRouter).mockReturnValue({ push: mockPush } as any);
    jest.mocked(useAuth).mockReturnValue({ login: mockLogin } as any);
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
    it('calls login with credentials', async () => {
      mockLogin.mockResolvedValue({ error: null });

      render(<LoginScreen />);
      await submitLoginForm('test@example.com', 'password123');

      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    it('shows error toast on invalid credentials', async () => {
      mockLogin.mockResolvedValue({
        error: { message: 'Invalid credentials' },
      });

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
