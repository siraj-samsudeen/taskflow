import { screen, userEvent } from '@testing-library/react-native';

/**
 * Fills the login form with credentials and submits it.
 */
export async function submitLoginForm(email: string, password: string) {
  const user = userEvent.setup();
  await user.type(screen.getByPlaceholderText('Email'), email);
  await user.type(screen.getByPlaceholderText('Password'), password);
  await user.press(screen.getByText('Login'));
}

/**
 * Fills the register form with credentials and submits it.
 */
export async function submitRegisterForm(
  email: string,
  password: string,
  confirmPassword: string
) {
  const user = userEvent.setup();
  await user.type(screen.getByPlaceholderText('Email'), email);
  await user.type(screen.getByPlaceholderText('Password'), password);
  await user.type(screen.getByPlaceholderText('Confirm Password'), confirmPassword);
  await user.press(screen.getByText('Register'));
}
