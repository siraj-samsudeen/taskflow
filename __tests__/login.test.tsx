import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import LoginScreen from '../src/app/(auth)/login';
import { supabase } from '../src/lib/supabase';

jest.mock('../src/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
    },
  },
}));

describe('LoginScreen', () => {
  beforeAll(() => {
    // Mock Alert.alert for all tests in this suite
    jest.spyOn(Alert, 'alert').mockImplementation();
  });

  afterAll(() => {
    // Restore Alert.alert to original after all tests
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls signInWithPassword with email and password on submit', async () => {
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({ error: null });

    render(<LoginScreen />);

    fireEvent.changeText(screen.getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(screen.getByPlaceholderText('Password'), 'password123');
    fireEvent.press(screen.getByText('Login'));

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('shows alert when email is empty', async () => {
    render(<LoginScreen />);

    fireEvent.changeText(screen.getByPlaceholderText('Password'), 'password123');
    fireEvent.press(screen.getByText('Login'));

    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter your email');
  });

  it('shows alert when email is invalid', async () => {
    render(<LoginScreen />);

    fireEvent.changeText(screen.getByPlaceholderText('Email'), 'notanemail');
    fireEvent.changeText(screen.getByPlaceholderText('Password'), 'password123');
    fireEvent.press(screen.getByText('Login'));

    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter a valid email');
  });

  it('shows alert when password is empty', async () => {
    render(<LoginScreen />);

    fireEvent.changeText(screen.getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.press(screen.getByText('Login'));

    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter your password');
  });

  it('shows alert when supabase returns an error', async () => {
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      error: { message: 'Invalid credentials' },
    });

    render(<LoginScreen />);

    fireEvent.changeText(screen.getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(screen.getByPlaceholderText('Password'), 'wrongpassword');
    fireEvent.press(screen.getByText('Login'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Invalid credentials');
    });
  });
});
