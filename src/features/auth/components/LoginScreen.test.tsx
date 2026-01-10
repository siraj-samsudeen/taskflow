import { render, screen, userEvent } from '@testing-library/react-native';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../../contexts/AuthContext';
import { LoginScreen } from './LoginScreen';

jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('LoginScreen', () => {
  const mockSendMagicCode = jest.fn();
  const mockVerifyMagicCode = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(useAuth).mockReturnValue({
      sendMagicCode: mockSendMagicCode,
      verifyMagicCode: mockVerifyMagicCode,
    } as any);
  });

  describe('email step', () => {
    it('shows validation error for empty email', async () => {
      const user = userEvent.setup();
      render(<LoginScreen />);

      await user.press(screen.getByText('Send Magic Code'));

      expect(screen.getByText('Please enter a valid email')).toBeTruthy();
    });

    it('sends magic code on valid email submission', async () => {
      mockSendMagicCode.mockResolvedValue(undefined);
      const user = userEvent.setup();
      render(<LoginScreen />);

      await user.type(screen.getByPlaceholderText('Email'), 'test@example.com');
      await user.press(screen.getByText('Send Magic Code'));

      expect(mockSendMagicCode).toHaveBeenCalledWith('test@example.com');
    });

    it('shows success toast after sending code', async () => {
      mockSendMagicCode.mockResolvedValue(undefined);
      const user = userEvent.setup();
      render(<LoginScreen />);

      await user.type(screen.getByPlaceholderText('Email'), 'test@example.com');
      await user.press(screen.getByText('Send Magic Code'));

      expect(Toast.show).toHaveBeenCalledWith({
        type: 'success',
        text1: 'Code sent',
        text2: 'Check your email for the magic code.',
      });
    });
  });

  describe('code verification step', () => {
    it('shows code input after sending email', async () => {
      mockSendMagicCode.mockResolvedValue(undefined);
      const user = userEvent.setup();
      render(<LoginScreen />);

      await user.type(screen.getByPlaceholderText('Email'), 'test@example.com');
      await user.press(screen.getByText('Send Magic Code'));

      expect(screen.getByText('Enter Code')).toBeTruthy();
      expect(screen.getByText('We sent a code to test@example.com')).toBeTruthy();
    });

    it('verifies magic code on submit', async () => {
      mockSendMagicCode.mockResolvedValue(undefined);
      mockVerifyMagicCode.mockResolvedValue(undefined);
      const user = userEvent.setup();
      render(<LoginScreen />);

      await user.type(screen.getByPlaceholderText('Email'), 'test@example.com');
      await user.press(screen.getByText('Send Magic Code'));

      await user.type(screen.getByPlaceholderText('Enter code'), '123456');
      await user.press(screen.getByText('Verify'));

      expect(mockVerifyMagicCode).toHaveBeenCalledWith('test@example.com', '123456');
    });

    it('allows user to change email', async () => {
      mockSendMagicCode.mockResolvedValue(undefined);
      const user = userEvent.setup();
      render(<LoginScreen />);

      await user.type(screen.getByPlaceholderText('Email'), 'test@example.com');
      await user.press(screen.getByText('Send Magic Code'));

      await user.press(screen.getByText('Use different email'));

      expect(screen.getByPlaceholderText('Email')).toBeTruthy();
    });
  });
});
