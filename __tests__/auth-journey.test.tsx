import { render, screen, userEvent, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import LoginScreen from '../src/app/(auth)/login';
import RegisterScreen from '../src/app/(auth)/register';
import RootLayout from '../src/app/_layout';
import { supabase } from '../src/lib/supabase';

jest.mock('expo-router', () => ({
  Slot: () => null,
  useRouter: jest.fn(),
  useSegments: jest.fn(),
}));

jest.mock('../src/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
  },
}));

// we use spy here instead of mock as we have done with supabase above 
// Here we want to replace the Alert component only with a mock no-op function
// because react-native is a large module and we don't want to replace it entirely
jest.spyOn(Alert, 'alert').mockImplementation();

describe('Authentication Journey', () => {
  const mockReplace = jest.fn();
  const mockUnsubscribe = jest.fn();

  function setSegments(segments: string[]) {
    (useSegments as jest.Mock).mockReturnValue(segments);
  }

  // Creates the subscription object structure that Supabase's onAuthStateChange returns.
  // This is shared between beforeEach (simple mock) and setupAuthStateChangeMock (callback capture).
  function createAuthSubscription() {
    return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
  }

  // Sets up onAuthStateChange mock to capture the callback for manual triggering.
  // Used in tests that need to simulate auth state changes (e.g., SIGNED_IN, SIGNED_OUT).
  // Returns a getter function to access the captured callback after RootLayout renders.
  function setupAuthStateChangeMock() {
    let authCallback: (event: string, session: unknown) => void;
    (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation((callback) => {
      authCallback = callback;
      return createAuthSubscription();
    });
    return () => authCallback!;
  }

  beforeEach(() => {
    // resetAllMocks clears call history AND resets implementations
    // (clearAllMocks only clears call history, leaving mockImplementation leaks between tests)
    jest.resetAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ replace: mockReplace });
    setSegments(['(auth)']);
    // Use mockReturnValue for simple cases where we don't need to capture callbacks.
    // Tests that need to trigger auth events manually will call setupAuthStateChangeMock()
    // which uses mockImplementation to capture the callback.
    (supabase.auth.onAuthStateChange as jest.Mock).mockReturnValue(createAuthSubscription());
  });

  // Triggers auth state change events using a callback captured by setupAuthStateChangeMock().
  // Usage: const getAuthCallback = setupAuthStateChangeMock(); render(<RootLayout />); await triggerSignedIn(getAuthCallback);
  async function triggerSignedIn(
    getAuthCallback: () => (event: string, session: unknown) => void,
    session: unknown = { user: { id: '123' } }
  ) {
    const authCallback = getAuthCallback();
    if (!authCallback) {
      throw new Error(
        'Auth callback not captured. Make sure RootLayout is rendered and onAuthStateChange has been called.'
      );
    }
    await act(async () => {
      authCallback('SIGNED_IN', session);
    });
  }

  async function triggerSignedOut(
    getAuthCallback: () => (event: string, session: unknown) => void
  ) {
    const authCallback = getAuthCallback();
    if (!authCallback) {
      throw new Error(
        'Auth callback not captured. Make sure RootLayout is rendered and onAuthStateChange has been called.'
      );
    }
    await act(async () => {
      authCallback('SIGNED_OUT', null);
    });
  }

  async function fillLoginForm(
    user: ReturnType<typeof userEvent.setup>,
    email: string,
    password: string
  ) {
    await user.type(screen.getByPlaceholderText('Email'), email);
    await user.type(screen.getByPlaceholderText('Password'), password);
  }

  async function fillRegisterForm(
    user: ReturnType<typeof userEvent.setup>,
    email: string,
    password: string,
    confirmPassword: string
  ) {
    await user.type(screen.getByPlaceholderText('Email'), email);
    await user.type(screen.getByPlaceholderText('Password'), password);
    await user.type(screen.getByPlaceholderText('Confirm Password'), confirmPassword);
  }

  function expectRedirectTo(path: string) {
    expect(mockReplace).toHaveBeenCalledWith(path);
  }

  function expectNoRedirect() {
    expect(mockReplace).not.toHaveBeenCalled();
  }
  describe('New User', () => {
    it('signs up -> gets confirmation message', async () => {
      const user = userEvent.setup();
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({ data: {}, error: null });

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

    it('confirms email (via Supabase link) -> app receives session -> stays on home', async () => {
      // Supabase redirects to app root (e.g. http://localhost:8081/#access_token=xxx)
      // User lands on index page, not auth group
      setSegments([]);

      // Supabase client parses token from URL and fires onAuthStateChange with session
      const getAuthCallback = setupAuthStateChangeMock();
      render(<RootLayout />);
      await triggerSignedIn(getAuthCallback);

      // User already on home with session - no redirect needed
      expectNoRedirect();
    });
  });

  describe('Returning User (unconfirmed)', () => {
    it('signs up again -> confirmation message is resent', () => {
      // covered by the New User signup test
    });
    it('confirms email -> redirected to home', () => {
      // covered by New User confirmation test
    });
  });

  describe('Returning User (confirmed)', () => {
    it('visits login page while logged in -> redirected to home', async () => {
      setSegments(['(auth)']);
      const getAuthCallback = setupAuthStateChangeMock();
      render(<RootLayout />);
      await triggerSignedIn(getAuthCallback);
      expectRedirectTo('/');
    });

    it('refreshes page while logged in -> stays on current page', () => {
      // covered by New User email confirmation test
    });

    it('logs in -> calls signInWithPassword with credentials', async () => {
      // Redirect is handled by RootLayout via onAuthStateChange, not LoginScreen
      const user = userEvent.setup();
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({ error: null });

      render(<LoginScreen />);
      await fillLoginForm(user, 'test@example.com', 'password123');
      await user.press(screen.getByText('Login'));

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('logs in -> redirected to home', () => {
      // covered by New User email confirmation test (same onAuthStateChange mechanism)
    });

    it('logs out -> redirected to login', async () => {
      setSegments(['(tabs)']);
      const getAuthCallback = setupAuthStateChangeMock();
      render(<RootLayout />);
      await triggerSignedOut(getAuthCallback);
      expectRedirectTo('/(auth)/login');
    });
  });

  describe('Validation Errors', () => {
    describe('signup', () => {
      it('empty email', async () => {
        const user = userEvent.setup();
        render(<RegisterScreen />);

        await user.type(screen.getByPlaceholderText('Password'), 'password123');
        await user.type(screen.getByPlaceholderText('Confirm Password'), 'password123');
        await user.press(screen.getByText('Register'));

        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter your email');
      });

      it('invalid email', async () => {
        const user = userEvent.setup();
        render(<RegisterScreen />);
        await fillRegisterForm(user, 'notanemail', 'password123', 'password123');
        await user.press(screen.getByText('Register'));

        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter a valid email');
      });

      it('empty password', async () => {
        const user = userEvent.setup();
        render(<RegisterScreen />);

        await user.type(screen.getByPlaceholderText('Email'), 'test@example.com');
        await user.press(screen.getByText('Register'));

        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter your password');
      });

      it('passwords do not match', async () => {
        const user = userEvent.setup();
        render(<RegisterScreen />);
        await fillRegisterForm(user, 'test@example.com', 'password123', 'differentpassword');
        await user.press(screen.getByText('Register'));

        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Passwords do not match');
      });

      it('API error', async () => {
        const user = userEvent.setup();
        (supabase.auth.signUp as jest.Mock).mockResolvedValue({
          error: { message: 'Email already registered' },
        });

        render(<RegisterScreen />);
        await fillRegisterForm(user, 'test@example.com', 'password123', 'password123');
        await user.press(screen.getByText('Register'));

        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Email already registered');
      });
    });

    describe('login', () => {
      it('empty email', async () => {
        const user = userEvent.setup();
        render(<LoginScreen />);

        await user.type(screen.getByPlaceholderText('Password'), 'password123');
        await user.press(screen.getByText('Login'));

        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter your email');
      });

      it('invalid email', async () => {
        const user = userEvent.setup();
        render(<LoginScreen />);
        await fillLoginForm(user, 'notanemail', 'password123');
        await user.press(screen.getByText('Login'));

        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter a valid email');
      });

      it('empty password', async () => {
        const user = userEvent.setup();
        render(<LoginScreen />);

        await user.type(screen.getByPlaceholderText('Email'), 'test@example.com');
        await user.press(screen.getByText('Login'));

        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter your password');
      });

      it('API error', async () => {
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
  });

  describe('Cleanup', () => {
    it('unsubscribes from auth listener on unmount', () => {
      setSegments(['(auth)']);
      const { unmount } = render(<RootLayout />);
      unmount();
      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });
});
