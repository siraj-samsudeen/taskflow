import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
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
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls signInWithPassword with email and password on submit', async () => {
    // Without this, mock returns undefined and handleLogin's `if (error)` check fails
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
});
