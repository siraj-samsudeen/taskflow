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
    jest.mocked(useRouter).mockReturnValue({ replace: mockReplace } as any);
    jest.mocked(useSegments).mockReturnValue(['(auth)'] as any);
  });

  describe('password recovery', () => {
    it('navigates to password-reset-confirm screen on PASSWORD_RECOVERY event', async () => {
      const getCallback = setupAuthStateChangeMock(supabase as any);
      render(<RootLayout />);

      await triggerAuthEvent(getCallback, 'PASSWORD_RECOVERY', { user: { id: '123' } });

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/(auth)/password-reset-confirm');
      });
    });

    it('does not redirect away from password-reset-confirm screen even with session', async () => {
      jest.mocked(useSegments).mockReturnValue(['(auth)', 'password-reset-confirm'] as any);
      const getCallback = setupAuthStateChangeMock(supabase as any);
      render(<RootLayout />);

      await triggerAuthEvent(getCallback, 'SIGNED_IN', { user: { id: '123' } });

      await waitFor(() => {
        expect(mockReplace).not.toHaveBeenCalledWith('/');
      });
    });
  });
});
