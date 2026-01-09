import { fireEvent, render, screen, userEvent } from '@testing-library/react-native';
import { TaskListScreen } from './TaskListScreen';

describe('TaskListScreen', () => {
  it('defaults to Active tab showing only incomplete tasks', () => {
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

    expect(input.props.value).toBe('');
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
});
