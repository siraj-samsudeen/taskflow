import { act, fireEvent, render, screen, userEvent, waitFor } from '@testing-library/react-native';
import { BehaviorSubject } from 'rxjs';
import { useRxDBContext } from '../../../contexts/RxDBContext';
import { TaskListScreen } from './TaskListScreen';

jest.mock('../../../contexts/RxDBContext');

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

interface MockTaskDoc {
  id: string;
  title: string;
  status: string;
  created_at: string;
  description: null;
  priority: string;
  project_id: null;
  due_date: null;
  assigned_to: null;
  updated_at: string;
  isDeleted: boolean;
  modifiedAt: string;
  toJSON: () => MockTaskDoc;
}

function createMockDb(tasksData = initialTasks) {
  const createDoc = (t: (typeof tasksData)[0] & { isDeleted?: boolean }): MockTaskDoc => {
    const doc: MockTaskDoc = {
      ...t,
      description: null,
      priority: 'medium',
      project_id: null,
      due_date: null,
      assigned_to: null,
      updated_at: t.created_at,
      isDeleted: t.isDeleted ?? false,
      modifiedAt: t.created_at,
      toJSON() {
        return this;
      },
    };
    return doc;
  };

  const tasksSubject = new BehaviorSubject<MockTaskDoc[]>(tasksData.map(createDoc));

  const mockTasks = {
    find: jest.fn().mockReturnValue({
      $: tasksSubject.asObservable(),
    }),
    findOne: jest.fn().mockImplementation((id: string) => ({
      exec: jest.fn().mockImplementation(async () => {
        const task = tasksSubject.value.find((t) => t.id === id);
        if (!task) return null;
        return {
          ...task,
          patch: async (updates: Record<string, unknown>) => {
            const current = tasksSubject.value;
            const updated = current
              .map((t) => {
                if (t.id === id) {
                  const updatedDoc: MockTaskDoc = {
                    ...t,
                    ...(updates as Partial<MockTaskDoc>),
                    toJSON() {
                      return this;
                    },
                  };
                  return updatedDoc;
                }
                return t;
              })
              .filter((t) => !t.isDeleted);
            tasksSubject.next(updated);
          },
        };
      }),
    })),
    insert: jest.fn().mockImplementation(async (doc) => {
      const current = tasksSubject.value;
      const newDoc: MockTaskDoc = {
        ...doc,
        toJSON() {
          return this;
        },
      };
      tasksSubject.next([...current, newDoc]);
      return newDoc;
    }),
  };

  return {
    tasks: mockTasks,
    _tasksSubject: tasksSubject,
  };
}

describe('TaskListScreen', () => {
  let mockDb: ReturnType<typeof createMockDb>;

  beforeEach(() => {
    mockDb = createMockDb();
    mockUseRxDBContext.mockReturnValue({
      db: mockDb as any,
      isReady: true,
      isReplicating: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('defaults to Active tab showing only incomplete tasks', async () => {
    render(<TaskListScreen />);

    expect(screen.getByText('Implement task list UI')).toBeTruthy();
    expect(screen.getByText('Add toggle done functionality')).toBeTruthy();
    expect(screen.getByText('Write tests')).toBeTruthy();
    expect(screen.queryByText('Set up project structure')).toBeNull();
  });

  it('shows active count in Active tab label', () => {
    render(<TaskListScreen />);

    expect(screen.getByText('Active (3)')).toBeTruthy();
  });

  it('shows all tasks when All tab is pressed', async () => {
    const user = userEvent.setup();
    render(<TaskListScreen />);

    await user.press(screen.getByText('All'));

    expect(screen.getByText('Set up project structure')).toBeTruthy();
    expect(screen.getByText('Implement task list UI')).toBeTruthy();
    expect(screen.getByText('Add toggle done functionality')).toBeTruthy();
    expect(screen.getByText('Write tests')).toBeTruthy();
  });

  it('shows only completed tasks when Done tab is pressed', async () => {
    const user = userEvent.setup();
    render(<TaskListScreen />);

    await user.press(screen.getByText('Done'));

    expect(screen.getByText('Set up project structure')).toBeTruthy();
    expect(screen.queryByText('Implement task list UI')).toBeNull();
    expect(screen.queryByText('Add toggle done functionality')).toBeNull();
    expect(screen.queryByText('Write tests')).toBeNull();
  });

  it('toggles task done state when checkbox is pressed', async () => {
    const user = userEvent.setup();
    render(<TaskListScreen />);

    const checkbox = screen.getByLabelText('Toggle Implement task list UI');
    expect(checkbox.props.accessibilityState.checked).toBe(false);

    await user.press(checkbox);

    await user.press(screen.getByText('Done'));
    expect(
      screen.getByLabelText('Toggle Implement task list UI').props.accessibilityState.checked,
    ).toBe(true);
  });

  it('toggles done task back to active when checkbox is pressed', async () => {
    const user = userEvent.setup();
    render(<TaskListScreen />);

    await user.press(screen.getByText('Done'));
    const checkbox = screen.getByLabelText('Toggle Set up project structure');
    expect(checkbox.props.accessibilityState.checked).toBe(true);

    await user.press(checkbox);

    await user.press(screen.getByText(/Active/));
    expect(
      screen.getByLabelText('Toggle Set up project structure').props.accessibilityState.checked,
    ).toBe(false);
  });

  it('adds a new task when submitting the input', async () => {
    const user = userEvent.setup();
    render(<TaskListScreen />);

    const input = screen.getByPlaceholderText('Add a new task...');
    await user.type(input, 'My new task');
    fireEvent(input, 'submitEditing');

    expect(screen.getByText('My new task')).toBeTruthy();
  });

  it('clears the input after adding a task', async () => {
    const user = userEvent.setup();
    render(<TaskListScreen />);

    const input = screen.getByPlaceholderText('Add a new task...');
    await user.type(input, 'My new task');
    fireEvent(input, 'submitEditing');

    await waitFor(() => {
      expect(input.props.value).toBe('');
    });
  });

  it('does not add a task when input is empty or whitespace', async () => {
    const user = userEvent.setup();
    render(<TaskListScreen />);

    const input = screen.getByPlaceholderText('Add a new task...');
    await user.type(input, '   ');
    fireEvent(input, 'submitEditing');

    await user.press(screen.getByText('All'));
    const allTasks = screen.getAllByRole('checkbox');
    expect(allTasks).toHaveLength(4);
  });

  it('updates active count when tasks are toggled', async () => {
    const user = userEvent.setup();
    render(<TaskListScreen />);

    expect(screen.getByText('Active (3)')).toBeTruthy();

    const checkbox = screen.getByLabelText('Toggle Implement task list UI');
    await user.press(checkbox);

    expect(screen.getByText('Active (2)')).toBeTruthy();
  });

  it('sorts tasks with active first (newest to oldest), then done (newest to oldest)', async () => {
    const user = userEvent.setup();
    render(<TaskListScreen />);

    await user.press(screen.getByText('All'));

    const checkboxes = screen.getAllByRole('checkbox');
    const taskOrder = checkboxes.map((cb) => cb.props.accessibilityLabel.replace('Toggle ', ''));

    expect(taskOrder).toEqual([
      'Write tests',
      'Add toggle done functionality',
      'Implement task list UI',
      'Set up project structure',
    ]);
  });

  it('enters inline edit mode when row is tapped', async () => {
    const user = userEvent.setup();
    render(<TaskListScreen />);

    await user.press(screen.getByLabelText('Edit Write tests'));

    expect(screen.getByLabelText('Edit task title')).toBeTruthy();
    expect(screen.getByLabelText('Save task')).toBeTruthy();
    expect(screen.getByLabelText('Delete task')).toBeTruthy();
  });

  it('saves edited task title when save button is pressed', async () => {
    const user = userEvent.setup();
    render(<TaskListScreen />);

    await user.press(screen.getByLabelText('Edit Write tests'));
    const input = screen.getByLabelText('Edit task title');
    fireEvent.changeText(input, 'Updated task title');
    await user.press(screen.getByLabelText('Save task'));

    expect(screen.getByText('Updated task title')).toBeTruthy();
    expect(screen.queryByText('Write tests')).toBeNull();
  });

  it('deletes task when delete button is pressed', async () => {
    const user = userEvent.setup();
    render(<TaskListScreen />);

    expect(screen.getByText('Active (3)')).toBeTruthy();

    await user.press(screen.getByLabelText('Edit Write tests'));
    await user.press(screen.getByLabelText('Delete task'));

    expect(screen.queryByText('Write tests')).toBeNull();
    expect(screen.getByText('Active (2)')).toBeTruthy();
  });

  it('does not save empty task title on blur', async () => {
    const user = userEvent.setup();
    render(<TaskListScreen />);

    await user.press(screen.getByLabelText('Edit Write tests'));
    const input = screen.getByLabelText('Edit task title');
    fireEvent.changeText(input, '');
    fireEvent(input, 'blur');

    expect(screen.getByText('Write tests')).toBeTruthy();
  });

  it('exits edit mode on blur', async () => {
    const user = userEvent.setup();
    render(<TaskListScreen />);

    await user.press(screen.getByLabelText('Edit Write tests'));
    const input = screen.getByLabelText('Edit task title');

    await act(async () => {
      fireEvent(input, 'blur');
    });

    await waitFor(() => {
      expect(screen.queryByLabelText('Edit task title')).toBeNull();
    });
    expect(screen.getByText('Write tests')).toBeTruthy();
  });
});
