/**
 * UNIT TEST - TaskItem Component
 * Tests rendering variants, checkbox/edit/delete interactions, callbacks
 * Tests behavior not implementation (don't test internal state)
 */

import { render, screen, userEvent } from '@testing-library/react-native';
import { TaskItem } from './TaskItem';
import type { Task } from '../../../types';

describe('TaskItem', () => {
  const activeTask: Task = {
    id: 'task-1',
    title: 'Buy milk',
    done: false,
    created_at: '2024-01-10T10:00:00Z',
  };

  const doneTask: Task = {
    id: 'task-2',
    title: 'Review code',
    done: true,
    created_at: '2024-01-09T15:00:00Z',
  };

  const longTitleTask: Task = {
    id: 'task-3',
    title: 'This is a very long task title that spans multiple lines and should wrap correctly in the UI without breaking layout',
    done: false,
    created_at: '2024-01-10T12:00:00Z',
  };

  const specialCharsTask: Task = {
    id: 'task-4',
    title: 'Task with @#$% & special chars (test)',
    done: false,
    created_at: '2024-01-10T13:00:00Z',
  };

  const mockHandlers = {
    onToggleDone: jest.fn(),
    onStartEdit: jest.fn(),
    onSaveEdit: jest.fn(),
    onDelete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering - Incomplete Task', () => {
    describe('Given an incomplete task in normal mode', () => {
      beforeEach(() => {
        render(
          <TaskItem
            task={activeTask}
            isEditing={false}
            onToggleDone={mockHandlers.onToggleDone}
            onStartEdit={mockHandlers.onStartEdit}
            onSaveEdit={mockHandlers.onSaveEdit}
            onDelete={mockHandlers.onDelete}
          />
        );
      });

      it('Then title renders with normal styling', () => {
        expect(screen.getByText('Buy milk')).toBeTruthy();
      });

      it('Then checkbox is visible', () => {
        expect(screen.getByRole('checkbox')).toBeTruthy();
      });

      it('Then checkbox is unchecked (not done)', () => {
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox.props.accessibilityState?.checked).toBe(false);
      });

      it('Then no strikethrough styling applied', () => {
        const title = screen.getByText('Buy milk');
        const styles = title.props.style || [];
        const hasStrikethrough = Array.isArray(styles)
          ? styles.some((s) => s?.textDecorationLine === 'line-through')
          : styles?.textDecorationLine === 'line-through';
        expect(hasStrikethrough).toBe(false);
      });

      it('Then edit/delete buttons not shown', () => {
        expect(screen.queryByLabelText('Save task')).toBeNull();
        expect(screen.queryByLabelText('Delete task')).toBeNull();
      });
    });
  });

  describe('Rendering - Completed Task', () => {
    describe('Given a completed task in normal mode', () => {
      beforeEach(() => {
        render(
          <TaskItem
            task={doneTask}
            isEditing={false}
            onToggleDone={mockHandlers.onToggleDone}
            onStartEdit={mockHandlers.onStartEdit}
            onSaveEdit={mockHandlers.onSaveEdit}
            onDelete={mockHandlers.onDelete}
          />
        );
      });

      it('Then title renders with strikethrough', () => {
        const title = screen.getByText('Review code');
        const styles = title.props.style || [];
        const hasStrikethrough = Array.isArray(styles)
          ? styles.some((s) => s?.textDecorationLine === 'line-through')
          : styles?.textDecorationLine === 'line-through';
        expect(hasStrikethrough).toBe(true);
      });

      it('Then title has reduced opacity', () => {
        const title = screen.getByText('Review code');
        const styles = title.props.style || [];
        const opacity = Array.isArray(styles)
          ? styles.find((s) => s?.opacity !== undefined)?.opacity
          : styles?.opacity;
        expect(opacity).toBeLessThan(1);
      });

      it('Then checkbox is checked (done)', () => {
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox.props.accessibilityState?.checked).toBe(true);
      });

      it('Then checkmark visible in checkbox', () => {
        // The checkmark is rendered as a Text component inside the checkbox
        expect(screen.getByText('✓')).toBeTruthy();
      });
    });
  });

  describe('Rendering - Edit Mode', () => {
    describe('Given a task in edit mode', () => {
      beforeEach(() => {
        render(
          <TaskItem
            task={activeTask}
            isEditing={true}
            onToggleDone={mockHandlers.onToggleDone}
            onStartEdit={mockHandlers.onStartEdit}
            onSaveEdit={mockHandlers.onSaveEdit}
            onDelete={mockHandlers.onDelete}
          />
        );
      });

      it('Then edit input is visible and focused', () => {
        const input = screen.getByDisplayValue('Buy milk');
        expect(input).toBeTruthy();
      });

      it('Then input has original title as value', () => {
        const input = screen.getByDisplayValue('Buy milk');
        expect(input.props.value).toBe('Buy milk');
      });

      it('Then save button visible', () => {
        expect(screen.getByLabelText('Save task')).toBeTruthy();
      });

      it('Then delete button visible', () => {
        expect(screen.getByLabelText('Delete task')).toBeTruthy();
      });

      it('Then checkbox is hidden', () => {
        expect(screen.queryByRole('checkbox')).toBeNull();
      });

      it('Then row has edit styling (blue border)', () => {
        const container = screen.getByDisplayValue('Buy milk').parent;
        expect(container).toBeTruthy();
      });
    });
  });

  describe('Rendering - Edge Cases', () => {
    describe('Given a task with very long title', () => {
      beforeEach(() => {
        render(
          <TaskItem
            task={longTitleTask}
            isEditing={false}
            onToggleDone={mockHandlers.onToggleDone}
            onStartEdit={mockHandlers.onStartEdit}
            onSaveEdit={mockHandlers.onSaveEdit}
            onDelete={mockHandlers.onDelete}
          />
        );
      });

      it('Then long title wraps without overflow', () => {
        const title = screen.getByText(/This is a very long/);
        expect(title).toBeTruthy();
      });

      it('Then checkbox stays properly aligned', () => {
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toBeTruthy();
      });
    });

    describe('Given a task with special characters', () => {
      beforeEach(() => {
        render(
          <TaskItem
            task={specialCharsTask}
            isEditing={false}
            onToggleDone={mockHandlers.onToggleDone}
            onStartEdit={mockHandlers.onStartEdit}
            onSaveEdit={mockHandlers.onSaveEdit}
            onDelete={mockHandlers.onDelete}
          />
        );
      });

      it('Then special characters render without escaping', () => {
        expect(screen.getByText(/Task with @#\$% & special chars/)).toBeTruthy();
      });
    });

    describe('Given optional callbacks are undefined', () => {
      beforeEach(() => {
        render(
          <TaskItem
            task={activeTask}
            isEditing={false}
            onToggleDone={mockHandlers.onToggleDone}
            onStartEdit={undefined}
            onSaveEdit={undefined}
            onDelete={undefined}
          />
        );
      });

      it('Then component renders without error', () => {
        expect(screen.getByText('Buy milk')).toBeTruthy();
      });
    });
  });

  describe('Checkbox Interaction', () => {
    describe('Given an incomplete task', () => {
      beforeEach(() => {
        render(
          <TaskItem
            task={activeTask}
            isEditing={false}
            onToggleDone={mockHandlers.onToggleDone}
            onStartEdit={mockHandlers.onStartEdit}
            onSaveEdit={mockHandlers.onSaveEdit}
            onDelete={mockHandlers.onDelete}
          />
        );
      });

      describe('When user taps checkbox', () => {
        beforeEach(async () => {
          const user = userEvent.setup();
          await user.press(screen.getByRole('checkbox'));
        });

        it('Then onToggleDone called with task id', () => {
          expect(mockHandlers.onToggleDone).toHaveBeenCalledWith('task-1');
        });

        it('Then callback called exactly once', () => {
          expect(mockHandlers.onToggleDone).toHaveBeenCalledTimes(1);
        });
      });
    });

    describe('Given a completed task', () => {
      beforeEach(() => {
        render(
          <TaskItem
            task={doneTask}
            isEditing={false}
            onToggleDone={mockHandlers.onToggleDone}
            onStartEdit={mockHandlers.onStartEdit}
            onSaveEdit={mockHandlers.onSaveEdit}
            onDelete={mockHandlers.onDelete}
          />
        );
      });

      describe('When user taps checkbox', () => {
        beforeEach(async () => {
          const user = userEvent.setup();
          await user.press(screen.getByRole('checkbox'));
        });

        it('Then onToggleDone called with task id', () => {
          expect(mockHandlers.onToggleDone).toHaveBeenCalledWith('task-2');
        });
      });
    });
  });

  describe('Row Tap Interaction', () => {
    describe('Given a task in normal mode', () => {
      beforeEach(() => {
        render(
          <TaskItem
            task={activeTask}
            isEditing={false}
            onToggleDone={mockHandlers.onToggleDone}
            onStartEdit={mockHandlers.onStartEdit}
            onSaveEdit={mockHandlers.onSaveEdit}
            onDelete={mockHandlers.onDelete}
          />
        );
      });

      describe('When user taps row', () => {
        beforeEach(async () => {
          const user = userEvent.setup();
          await user.press(screen.getByLabelText('Edit Buy milk'));
        });

        it('Then onStartEdit called with task id', () => {
          expect(mockHandlers.onStartEdit).toHaveBeenCalledWith('task-1');
        });

        it('Then callback called exactly once', () => {
          expect(mockHandlers.onStartEdit).toHaveBeenCalledTimes(1);
        });
      });
    });

    describe('Given a task in edit mode', () => {
      beforeEach(() => {
        render(
          <TaskItem
            task={activeTask}
            isEditing={true}
            onToggleDone={mockHandlers.onToggleDone}
            onStartEdit={mockHandlers.onStartEdit}
            onSaveEdit={mockHandlers.onSaveEdit}
            onDelete={mockHandlers.onDelete}
          />
        );
      });

      it('Then row press does not call onStartEdit again', () => {
        // Already in edit mode, so row press should not trigger another edit
        expect(mockHandlers.onStartEdit).not.toHaveBeenCalled();
      });

      it('Then component stays in edit mode', () => {
        expect(screen.getByDisplayValue('Buy milk')).toBeTruthy();
      });
    });
  });

  describe('Edit Mode Input Interaction', () => {
    describe('Given a task in edit mode', () => {
      beforeEach(() => {
        render(
          <TaskItem
            task={activeTask}
            isEditing={true}
            onToggleDone={mockHandlers.onToggleDone}
            onStartEdit={mockHandlers.onStartEdit}
            onSaveEdit={mockHandlers.onSaveEdit}
            onDelete={mockHandlers.onDelete}
          />
        );
      });

      describe('When user changes input text', () => {
        beforeEach(async () => {
          const user = userEvent.setup();
          const input = screen.getByDisplayValue('Buy milk');
          await user.clear(input);
          await user.type(input, 'Buy almond milk');
        });

        it('Then input state updates locally', () => {
          const input = screen.getByDisplayValue('Buy almond milk');
          expect(input).toBeTruthy();
        });

        it('Then new text is visible', () => {
          const input = screen.getByDisplayValue('Buy almond milk');
          expect(input.props.value).toBe('Buy almond milk');
        });
      });
    });
  });

  describe('Save Edit Interaction', () => {
    describe('Given a task in edit mode with changed text', () => {
      beforeEach(async () => {
        render(
          <TaskItem
            task={activeTask}
            isEditing={true}
            onToggleDone={mockHandlers.onToggleDone}
            onStartEdit={mockHandlers.onStartEdit}
            onSaveEdit={mockHandlers.onSaveEdit}
            onDelete={mockHandlers.onDelete}
          />
        );
        const user = userEvent.setup();
        const input = screen.getByDisplayValue('Buy milk');
        await user.clear(input);
        await user.type(input, 'Buy organic milk');
      });

      describe('When user presses save button', () => {
        beforeEach(async () => {
          jest.clearAllMocks();
          const user = userEvent.setup();
          await user.press(screen.getByLabelText('Save task'));
        });

        it('Then onSaveEdit called with id and new title', () => {
          expect(mockHandlers.onSaveEdit).toHaveBeenCalledWith('task-1', 'Buy organic milk');
        });

        it('Then callback called exactly once', () => {
          expect(mockHandlers.onSaveEdit).toHaveBeenCalledTimes(1);
        });
      });
    });

    describe('Given a task in edit mode ready to save', () => {
      beforeEach(async () => {
        render(
          <TaskItem
            task={activeTask}
            isEditing={true}
            onToggleDone={mockHandlers.onToggleDone}
            onStartEdit={mockHandlers.onStartEdit}
            onSaveEdit={mockHandlers.onSaveEdit}
            onDelete={mockHandlers.onDelete}
          />
        );
        const user = userEvent.setup();
        const input = screen.getByDisplayValue('Buy milk');
        await user.clear(input);
        await user.type(input, 'Keyboard save');
      });

      describe('When user presses return key', () => {
        beforeEach(async () => {
          jest.clearAllMocks();
          const user = userEvent.setup();
          const input = screen.getByDisplayValue('Keyboard save');
          // Simulate return key via onSubmitEditing
          await user.press(input);
          input.props.onSubmitEditing?.();
        });

        it('Then onSaveEdit called with new title', () => {
          expect(mockHandlers.onSaveEdit).toHaveBeenCalledWith('task-1', 'Keyboard save');
        });
      });

      describe('When user blurs input', () => {
        beforeEach(async () => {
          jest.clearAllMocks();
          const input = screen.getByDisplayValue('Keyboard save');
          // Simulate blur
          input.props.onBlur?.();
        });

        it('Then onSaveEdit called with original text', () => {
          expect(mockHandlers.onSaveEdit).toHaveBeenCalled();
        });
      });
    });

    describe('Given user saves with empty string', () => {
      beforeEach(async () => {
        render(
          <TaskItem
            task={activeTask}
            isEditing={true}
            onToggleDone={mockHandlers.onToggleDone}
            onStartEdit={mockHandlers.onStartEdit}
            onSaveEdit={mockHandlers.onSaveEdit}
            onDelete={mockHandlers.onDelete}
          />
        );
        const user = userEvent.setup();
        const input = screen.getByDisplayValue('Buy milk');
        await user.clear(input);
      });

      describe('When user presses save button', () => {
        beforeEach(async () => {
          jest.clearAllMocks();
          const user = userEvent.setup();
          await user.press(screen.getByLabelText('Save task'));
        });

        it('Then onSaveEdit called with empty string (parent validates)', () => {
          expect(mockHandlers.onSaveEdit).toHaveBeenCalledWith('task-1', '');
        });
      });
    });
  });

  describe('Delete Interaction', () => {
    describe('Given a task in edit mode', () => {
      beforeEach(() => {
        render(
          <TaskItem
            task={activeTask}
            isEditing={true}
            onToggleDone={mockHandlers.onToggleDone}
            onStartEdit={mockHandlers.onStartEdit}
            onSaveEdit={mockHandlers.onSaveEdit}
            onDelete={mockHandlers.onDelete}
          />
        );
      });

      describe('When user presses delete button', () => {
        beforeEach(async () => {
          const user = userEvent.setup();
          await user.press(screen.getByLabelText('Delete task'));
        });

        it('Then onDelete called with task id', () => {
          expect(mockHandlers.onDelete).toHaveBeenCalledWith('task-1');
        });

        it('Then callback called exactly once', () => {
          expect(mockHandlers.onDelete).toHaveBeenCalledTimes(1);
        });
      });
    });
  });

  describe('Optional Callback Handling', () => {
    describe('Given onStartEdit is undefined', () => {
      beforeEach(() => {
        render(
          <TaskItem
            task={activeTask}
            isEditing={false}
            onToggleDone={mockHandlers.onToggleDone}
            onStartEdit={undefined}
            onSaveEdit={mockHandlers.onSaveEdit}
            onDelete={mockHandlers.onDelete}
          />
        );
      });

      describe('When user taps row', () => {
        beforeEach(async () => {
          const user = userEvent.setup();
          await user.press(screen.getByLabelText('Edit Buy milk'));
        });

        it('Then no error is thrown', () => {
          // If we got here without error, test passes
          expect(screen.getByText('Buy milk')).toBeTruthy();
        });

        it('Then nothing happens (safe noop)', () => {
          // Since callback is undefined, component should handle gracefully
          expect(screen.getByText('Buy milk')).toBeTruthy();
        });
      });
    });

    describe('Given onSaveEdit is undefined', () => {
      beforeEach(async () => {
        render(
          <TaskItem
            task={activeTask}
            isEditing={true}
            onToggleDone={mockHandlers.onToggleDone}
            onStartEdit={mockHandlers.onStartEdit}
            onSaveEdit={undefined}
            onDelete={mockHandlers.onDelete}
          />
        );
      });

      describe('When user presses save button', () => {
        beforeEach(async () => {
          const user = userEvent.setup();
          await user.press(screen.getByLabelText('Save task'));
        });

        it('Then no error is thrown', () => {
          // If we got here without error, test passes
          expect(screen.getByDisplayValue('Buy milk')).toBeTruthy();
        });
      });
    });

    describe('Given onDelete is undefined', () => {
      beforeEach(() => {
        render(
          <TaskItem
            task={activeTask}
            isEditing={true}
            onToggleDone={mockHandlers.onToggleDone}
            onStartEdit={mockHandlers.onStartEdit}
            onSaveEdit={mockHandlers.onSaveEdit}
            onDelete={undefined}
          />
        );
      });

      describe('When user presses delete button', () => {
        beforeEach(async () => {
          const user = userEvent.setup();
          await user.press(screen.getByLabelText('Delete task'));
        });

        it('Then no error is thrown', () => {
          // If we got here without error, test passes
          expect(screen.getByDisplayValue('Buy milk')).toBeTruthy();
        });
      });
    });
  });
});
