import { screen, UserEvent } from '@testing-library/react-native';

export async function fillLoginForm(
  user: UserEvent,
  email: string,
  password: string
) {
  await user.type(screen.getByPlaceholderText('Email'), email);
  await user.type(screen.getByPlaceholderText('Password'), password);
}

export async function fillRegisterForm(
  user: UserEvent,
  email: string,
  password: string,
  confirmPassword: string
) {
  await user.type(screen.getByPlaceholderText('Email'), email);
  await user.type(screen.getByPlaceholderText('Password'), password);
  await user.type(screen.getByPlaceholderText('Confirm Password'), confirmPassword);
}
