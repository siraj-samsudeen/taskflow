import { render, waitFor } from '@testing-library/react-native';
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

describe('RootLayout', () => {
  const mockReplace = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ replace: mockReplace });
    (useSegments as jest.Mock).mockReturnValue(['(auth)']);
  });

  describe('password recovery', () => {
    it('navigates to reset-password screen on PASSWORD_RECOVERY event', async () => {
      const getCallback = setupAuthStateChangeMock(supabase);
      render(<RootLayout />);

      await triggerAuthEvent(getCallback, 'PASSWORD_RECOVERY', { user: { id: '123' } });

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/(auth)/reset-password');
      });
    });

    it('does not redirect away from reset-password screen even with session', async () => {
      (useSegments as jest.Mock).mockReturnValue(['(auth)', 'reset-password']);
      const getCallback = setupAuthStateChangeMock(supabase);
      render(<RootLayout />);

      await triggerAuthEvent(getCallback, 'SIGNED_IN', { user: { id: '123' } });

      await waitFor(() => {
        expect(mockReplace).not.toHaveBeenCalledWith('/');
      });
    });
  });
});
