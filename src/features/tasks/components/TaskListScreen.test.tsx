import { render, screen, userEvent } from '@testing-library/react-native';
import { TaskListScreen } from './TaskListScreen';

describe('TaskListScreen', () => {
  it('displays all tasks with their titles', () => {
    render(<TaskListScreen />);

    expect(screen.getByText('Set up project structure')).toBeTruthy();
    expect(screen.getByText('Implement task list UI')).toBeTruthy();
    expect(screen.getByText('Add toggle done functionality')).toBeTruthy();
    expect(screen.getByText('Write tests')).toBeTruthy();
  });

  it('toggles task done state when checkbox is pressed', async () => {
    const user = userEvent.setup();
    render(<TaskListScreen />);

    const checkbox = screen.getByLabelText('Toggle Implement task list UI');
    expect(checkbox.props.accessibilityState.checked).toBe(false);

    await user.press(checkbox);

    expect(checkbox.props.accessibilityState.checked).toBe(true);
  });

  it('toggles done task back to active when checkbox is pressed', async () => {
    const user = userEvent.setup();
    render(<TaskListScreen />);

    const checkbox = screen.getByLabelText('Toggle Set up project structure');
    expect(checkbox.props.accessibilityState.checked).toBe(true);

    await user.press(checkbox);

    expect(checkbox.props.accessibilityState.checked).toBe(false);
  });
});
