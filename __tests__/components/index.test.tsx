import { render, screen, userEvent, waitFor } from '@testing-library/react-native';
import { BehaviorSubject } from 'rxjs';

import HomeScreen from '../../src/app/index';
import { useRxDBContext } from '../../src/contexts/RxDBContext';
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

jest.mock('../../src/contexts/RxDBContext');

const mockUseRxDBContext = useRxDBContext as jest.MockedFunction<typeof useRxDBContext>;

const initialTasks = [
  {
    id: '1',
    title: 'Set up project structure',
    status: 'done',
    created_at: '2024-01-01T00:00:00Z',
  },
  { id: '2', title: 'Implement task list UI', status: 'todo', created_at: '2024-01-02T00:00:00Z' },
  {
    id: '3',
    title: 'Add toggle done functionality',
    status: 'todo',
    created_at: '2024-01-03T00:00:00Z',
  },
  { id: '4', title: 'Write tests', status: 'todo', created_at: '2024-01-04T00:00:00Z' },
];

function createMockDb() {
  const tasksSubject = new BehaviorSubject(
    initialTasks.map((t) => ({
      ...t,
      description: null,
      priority: 'medium',
      project_id: null,
      due_date: null,
      assigned_to: null,
      updated_at: t.created_at,
      isDeleted: false,
      modifiedAt: t.created_at,
      toJSON() {
        return this;
      },
    })),
  );

  return {
    tasks: {
      find: jest.fn().mockReturnValue({
        $: tasksSubject.asObservable(),
      }),
      findOne: jest.fn(),
      insert: jest.fn(),
    },
  };
}

describe('HomeScreen', () => {
  beforeEach(() => {
    const mockDb = createMockDb();
    mockUseRxDBContext.mockReturnValue({
      db: mockDb as any,
      isReady: true,
      isReplicating: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders task list with Active tab by default', async () => {
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
