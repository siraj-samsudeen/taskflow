import { render, screen, userEvent, waitFor } from '@testing-library/react-native';

import HomeScreen from '../../src/app/index';
import { supabase } from '../../src/lib/supabase';

jest.mock('../../src/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
  },
}));

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: { email: 'test@example.com' } },
    } as any);
    jest.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    } as any);
  });

  it('renders welcome message', async () => {
    render(<HomeScreen />);

    await waitFor(() => {
      expect(screen.getByText('Welcome to TaskFlow')).toBeTruthy();
    });
  });

  it('calls signOut when logout button is pressed', async () => {
    const user = userEvent.setup();
    render(<HomeScreen />);

    await user.press(screen.getByText('Logout'));

    expect(supabase.auth.signOut).toHaveBeenCalled();
  });
});
