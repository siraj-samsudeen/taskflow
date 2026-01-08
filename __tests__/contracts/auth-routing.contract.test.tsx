import { render } from '@testing-library/react-native';
import { useRouter, useSegments } from 'expo-router';
import RootLayout from '../../src/app/_layout';
import { supabase } from '../../src/lib/supabase';
import { setupAuthStateChangeMock, triggerAuthEvent } from '../utils/auth-mocks';

jest.mock('expo-router', () => ({
  Slot: () => null,
  useRouter: jest.fn(),
  useSegments: jest.fn(),
}));

jest.mock('../../src/lib/supabase', () => ({
  supabase: {
    auth: {
      onAuthStateChange: jest.fn(),
    },
  },
}));

// Reusable session object for the matrix
const SESSION = { user: { id: '123' } };

describe('Auth Routing Contract', () => {
  const mockReplace = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ replace: mockReplace });
  });

  // Matrix is keyed by (segment, session), NOT by auth events.
  // This mirrors production logic: RootLayout checks session + segments, not event strings.
  test.each([
    // segment    | session  | expected redirect
    ['(auth)',     SESSION,   '/'],
    ['(auth)',     null,      null],
    ['(tabs)',     SESSION,   null],
    ['(tabs)',     null,      '/(auth)/login'],
    ['',           SESSION,   null],
    ['',           null,      '/(auth)/login'],
  ])(
    '[%s] + session=%p → %s',
    async (segment, session, expectedRedirect) => {
      (useSegments as jest.Mock).mockReturnValue(segment ? [segment] : []);
      const getAuthCallback = setupAuthStateChangeMock(supabase as any);

      render(<RootLayout />);
      await triggerAuthEvent(
        getAuthCallback,
        session ? 'SIGNED_IN' : 'SIGNED_OUT',
        session
      );

      if (expectedRedirect) {
        expect(mockReplace).toHaveBeenCalledWith(expectedRedirect);
      } else {
        expect(mockReplace).not.toHaveBeenCalled();
      }
    }
  );

  it('does not redirect while auth state is loading', () => {
    (useSegments as jest.Mock).mockReturnValue(['(tabs)']);
    setupAuthStateChangeMock(supabase as any);

    render(<RootLayout />);

    expect(mockReplace).not.toHaveBeenCalled();
  });
});
