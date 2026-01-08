import { render } from '@testing-library/react-native';
import { useRouter, useSegments } from 'expo-router';
import RootLayout from '../../src/app/_layout';
import { supabase } from '../../src/lib/supabase';
import { setupAuthStateChangeMock } from '../utils/auth-mocks';

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

describe('Auth Lifecycle Contract', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ replace: jest.fn() });
    (useSegments as jest.Mock).mockReturnValue(['(auth)']);
  });

  it('unsubscribes from auth listener on unmount', () => {
    const mockUnsubscribe = jest.fn();
    setupAuthStateChangeMock(supabase as any, { unsubscribe: mockUnsubscribe });

    const { unmount } = render(<RootLayout />);
    unmount();

    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });
});
