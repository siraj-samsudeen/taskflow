import { render, screen, userEvent } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';

import RegisterScreen from '../../src/app/(auth)/register';
import { useAuth } from '../../src/contexts/AuthContext';
import { submitRegisterForm } from '../utils/form-helpers';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../src/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('RegisterScreen', () => {
  const mockPush = jest.fn();
  const mockSignup = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(useRouter).mockReturnValue({ push: mockPush });
    jest.mocked(useAuth).mockReturnValue({ signup: mockSignup });
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
    it('calls signup with credentials and shows success toast', async () => {
      mockSignup.mockResolvedValue({ error: null });

      render(<RegisterScreen />);
      await submitRegisterForm('test@example.com', 'password123', 'password123');

      expect(mockSignup).toHaveBeenCalledWith('test@example.com', 'password123');
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
