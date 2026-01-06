import { render, screen, userEvent } from '@testing-library/react-native';
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

jest.spyOn(Alert, 'alert').mockImplementation();

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls signInWithPassword with email and password on submit', async () => {
    const user = userEvent.setup();
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({ error: null });

    render(<LoginScreen />);

    await user.type(screen.getByPlaceholderText('Email'), 'test@example.com');
    await user.type(screen.getByPlaceholderText('Password'), 'password123');
    await user.press(screen.getByText('Login'));

    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('shows alert when email is empty', async () => {
    const user = userEvent.setup();
    render(<LoginScreen />);

    await user.type(screen.getByPlaceholderText('Password'), 'password123');
    await user.press(screen.getByText('Login'));

    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter your email');
  });

  it('shows alert when email is invalid', async () => {
    const user = userEvent.setup();
    render(<LoginScreen />);

    await user.type(screen.getByPlaceholderText('Email'), 'notanemail');
    await user.type(screen.getByPlaceholderText('Password'), 'password123');
    await user.press(screen.getByText('Login'));

    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter a valid email');
  });

  it('shows alert when password is empty', async () => {
    const user = userEvent.setup();
    render(<LoginScreen />);

    await user.type(screen.getByPlaceholderText('Email'), 'test@example.com');
    await user.press(screen.getByText('Login'));

    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter your password');
  });

  it('shows alert when supabase returns an error', async () => {
    const user = userEvent.setup();
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      error: { message: 'Invalid credentials' },
    });

    render(<LoginScreen />);

    await user.type(screen.getByPlaceholderText('Email'), 'test@example.com');
    await user.type(screen.getByPlaceholderText('Password'), 'wrongpassword');
    await user.press(screen.getByText('Login'));

    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Invalid credentials');
  });
});
