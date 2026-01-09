import { render, screen, userEvent, waitFor } from '@testing-library/react-native';

import HomeScreen from '../../src/app/index';
import { supabase } from '../../src/lib/supabase';

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('../../src/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: { email: 'test@example.com' } } }),
      signOut: jest.fn(),
    },
  },
}));

describe('HomeScreen', () => {
  it('renders task list with Active tab by default', () => {
    render(<HomeScreen />);

    expect(screen.getByText('Implement task list UI')).toBeTruthy();
    expect(screen.getByText(/Active/)).toBeTruthy();
  });

  it('displays logged-in user email', async () => {
    render(<HomeScreen />);

    await waitFor(() => {
      expect(screen.getByText('test@example.com')).toBeTruthy();
    });
  });

  it('calls signOut when logout button is pressed', async () => {
    const user = userEvent.setup();
    render(<HomeScreen />);

    await user.press(screen.getByText('Logout'));

    expect(supabase.auth.signOut).toHaveBeenCalled();
  });
});
