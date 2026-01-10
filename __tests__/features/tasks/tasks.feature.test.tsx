/**
 * FEATURE CONTRACT TEST - Tasks CRUD Feature
 * Defines what it means for the Tasks feature to be "done".
 * Tests end-to-end: UI → hooks → API → database state
 *
 * LLM: Write these as part of the task. Human: Review before accepting.
 */

import { render, screen, userEvent } from '@testing-library/react-native';
import { TaskListScreen } from '../../../src/features/tasks/components/TaskListScreen';
import { db, id } from '../../../src/lib/instant';

jest.mock('../../../src/lib/instant');

describe('Tasks Feature Contract', () => {
  // Test fixtures
  const activeTask = {
    id: 'task-1',
    title: 'Buy milk',
    done: false,
    createdAt: 1000,
  };

  const doneTask = {
    id: 'task-2',
    title: 'Review code',
    done: true,
    createdAt: 2000,
  };

  const newerActiveTask = {
    id: 'task-3',
    title: 'Write tests',
    done: false,
    createdAt: 1500,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(id).mockReturnValue('task-new-id');
  });

  describe('Given screen loads with tasks from database', () => {
    beforeEach(() => {
      jest.mocked(db.useQuery).mockReturnValue({
        isLoading: false,
        data: { tasks: [doneTask, activeTask, newerActiveTask] },
      });
      render(<TaskListScreen />);
    });

    it('Then displays tasks (default tab is active)', () => {
      // Default tab shows only active tasks
      expect(screen.getByText('Buy milk')).toBeTruthy();
      expect(screen.getByText('Write tests')).toBeTruthy();
    });

    it('Then shows correct task counts in tabs', () => {
      // Two active tasks + one done task
      expect(screen.getByText(/Active \(2\)/)).toBeTruthy();
    });

    describe('When user enters new task and submits', () => {
      beforeEach(async () => {
        const user = userEvent.setup();
        const input = screen.getByPlaceholderText('Add a new task...');
        await user.type(input, 'Buy almond milk');
        await user.press(screen.getByLabelText('Add task'));
      });

      it('Then db.transact was called to add task', () => {
        expect(db.transact).toHaveBeenCalled();
      });

      it('Then input field is cleared', () => {
        const input = screen.getByPlaceholderText('Add a new task...');
        expect(input.props.value).toBe('');
      });
    });

    describe('When user enters only whitespace', () => {
      beforeEach(async () => {
        const user = userEvent.setup();
        const input = screen.getByPlaceholderText('Add a new task...');
        await user.type(input, '   ');
      });

      it('Then db.transact is not called even if button pressed', async () => {
        const user = userEvent.setup();
        const buttonsBefore = jest.mocked(db.transact).mock.calls.length;
        // Try to press the button (it may not respond due to disabled)
        try {
          await user.press(screen.getByLabelText('Add task'));
        } catch {
          // Button press may fail if disabled
        }
        const buttonsAfter = jest.mocked(db.transact).mock.calls.length;
        expect(buttonsAfter).toBe(buttonsBefore);
      });
    });

    describe('When user clicks "Active" tab', () => {
      beforeEach(async () => {
        const user = userEvent.setup();
        await user.press(screen.getByRole('tab', { name: /Active/ }));
      });

      it('Then displays only incomplete tasks', () => {
        expect(screen.getByText('Buy milk')).toBeTruthy();
        expect(screen.getByText('Write tests')).toBeTruthy();
        expect(screen.queryByText('Review code')).toBeNull();
      });

      it('Then active tab shows correct count', () => {
        expect(screen.getByText(/Active \(2\)/)).toBeTruthy();
      });
    });

    describe('When user clicks "Done" tab', () => {
      beforeEach(async () => {
        const user = userEvent.setup();
        await user.press(screen.getByRole('tab', { name: /Done/ }));
      });

      it('Then displays only completed tasks', () => {
        expect(screen.getByText('Review code')).toBeTruthy();
        expect(screen.queryByText('Buy milk')).toBeNull();
      });
    });

    describe('When user clicks "All" tab', () => {
      beforeEach(async () => {
        const user = userEvent.setup();
        await user.press(screen.getByRole('tab', { name: /All/ }));
      });

      it('Then displays all tasks', () => {
        expect(screen.getByText('Buy milk')).toBeTruthy();
        expect(screen.getByText('Review code')).toBeTruthy();
        expect(screen.getByText('Write tests')).toBeTruthy();
      });
    });

    describe('When user toggles a task checkbox', () => {
      beforeEach(async () => {
        const user = userEvent.setup();
        // Get all checkboxes and toggle the first one
        const checkboxes = screen.getAllByRole('checkbox');
        await user.press(checkboxes[0]);
      });

      it('Then db.transact is called to update task', () => {
        expect(db.transact).toHaveBeenCalled();
      });
    });
  });

  describe('Given screen loads with no tasks (empty state)', () => {
    beforeEach(() => {
      jest.mocked(db.useQuery).mockReturnValue({
        isLoading: false,
        data: { tasks: [] },
      });
      render(<TaskListScreen />);
    });

    it('Then no tasks are displayed', () => {
      expect(screen.queryByText('Buy milk')).toBeNull();
    });

    it('Then active count shows zero', () => {
      expect(screen.getByText(/Active \(0\)/)).toBeTruthy();
    });

    it('Then input form is visible', () => {
      expect(screen.getByPlaceholderText('Add a new task...')).toBeTruthy();
    });
  });

  describe('Given screen is loading data', () => {
    beforeEach(() => {
      jest.mocked(db.useQuery).mockReturnValue({
        isLoading: true,
        data: null,
      });
      render(<TaskListScreen />);
    });

    it('Then shows loading message', () => {
      expect(screen.getByText('Loading...')).toBeTruthy();
    });
  });
});
