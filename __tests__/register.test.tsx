import { render, screen, userEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import RegisterScreen from '../src/app/(auth)/register';
import { supabase } from '../src/lib/supabase';

jest.mock('../src/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
    },
  },
}));

jest.spyOn(Alert, 'alert').mockImplementation();

describe('RegisterScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls signUp with email and password on submit', async () => {
    const user = userEvent.setup();
    (supabase.auth.signUp as jest.Mock).mockResolvedValue({ data: {}, error: null });

    render(<RegisterScreen />);

    await user.type(screen.getByPlaceholderText('Email'), 'test@example.com');
    await user.type(screen.getByPlaceholderText('Password'), 'password123');
    await user.type(screen.getByPlaceholderText('Confirm Password'), 'password123');
    await user.press(screen.getByText('Register'));

    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('shows alert when email is empty', async () => {
    const user = userEvent.setup();
    render(<RegisterScreen />);

    await user.type(screen.getByPlaceholderText('Password'), 'password123');
    await user.type(screen.getByPlaceholderText('Confirm Password'), 'password123');
    await user.press(screen.getByText('Register'));

    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter your email');
  });

  it('shows alert when email is invalid', async () => {
    const user = userEvent.setup();
    render(<RegisterScreen />);

    await user.type(screen.getByPlaceholderText('Email'), 'notanemail');
    await user.type(screen.getByPlaceholderText('Password'), 'password123');
    await user.type(screen.getByPlaceholderText('Confirm Password'), 'password123');
    await user.press(screen.getByText('Register'));

    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter a valid email');
  });

  it('shows alert when password is empty', async () => {
    const user = userEvent.setup();
    render(<RegisterScreen />);

    await user.type(screen.getByPlaceholderText('Email'), 'test@example.com');
    await user.press(screen.getByText('Register'));

    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter your password');
  });

  it('shows alert when passwords do not match', async () => {
    const user = userEvent.setup();
    render(<RegisterScreen />);

    await user.type(screen.getByPlaceholderText('Email'), 'test@example.com');
    await user.type(screen.getByPlaceholderText('Password'), 'password123');
    await user.type(screen.getByPlaceholderText('Confirm Password'), 'differentpassword');
    await user.press(screen.getByText('Register'));

    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Passwords do not match');
  });

  it('shows alert when supabase returns an error', async () => {
    const user = userEvent.setup();
    // set up mock to return error
    (supabase.auth.signUp as jest.Mock).mockResolvedValue({
      error: { message: 'Email already registered' },
    });

    render(<RegisterScreen />);

    await user.type(screen.getByPlaceholderText('Email'), 'test@example.com');
    await user.type(screen.getByPlaceholderText('Password'), 'password123');
    await user.type(screen.getByPlaceholderText('Confirm Password'), 'password123');
    await user.press(screen.getByText('Register'));

    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Email already registered');
  });

  it('shows success alert on successful registration', async () => {
    const user = userEvent.setup();
    (supabase.auth.signUp as jest.Mock).mockResolvedValue({ data: {}, error: null });

    render(<RegisterScreen />);

    await user.type(screen.getByPlaceholderText('Email'), 'test@example.com');
    await user.type(screen.getByPlaceholderText('Password'), 'password123');
    await user.type(screen.getByPlaceholderText('Confirm Password'), 'password123');
    await user.press(screen.getByText('Register'));

    expect(Alert.alert).toHaveBeenCalledWith('Success', 'Check your email to confirm your account');
  });
});
