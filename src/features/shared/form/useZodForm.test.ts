import { act, renderHook } from '@testing-library/react-native';
import { z } from 'zod';

import { useZodForm } from './useZodForm';

const testSchema = z.object({
  email: z.string().email('Invalid email'),
  name: z.string().min(1, 'Name is required'),
});

describe('useZodForm', () => {
  it('returns a form with the schema resolver applied', () => {
    const { result } = renderHook(() => useZodForm(testSchema));

    expect(result.current.register).toBeDefined();
    expect(result.current.handleSubmit).toBeDefined();
    expect(result.current.formState).toBeDefined();
  });

  it('accepts default values', () => {
    const { result } = renderHook(() =>
      useZodForm(testSchema, {
        defaultValues: { email: 'test@example.com', name: 'John' },
      }),
    );

    expect(result.current.getValues()).toEqual({
      email: 'test@example.com',
      name: 'John',
    });
  });

  it('validates according to the schema', async () => {
    const { result } = renderHook(() =>
      useZodForm(testSchema, {
        defaultValues: { email: 'invalid', name: '' },
      }),
    );

    let isValid: boolean | undefined;
    await act(async () => {
      isValid = await result.current.trigger();
    });

    expect(isValid).toBe(false);
  });

  it('passes validation with valid data', async () => {
    const { result } = renderHook(() =>
      useZodForm(testSchema, {
        defaultValues: { email: 'valid@example.com', name: 'Jane' },
      }),
    );

    let isValid: boolean | undefined;
    await act(async () => {
      isValid = await result.current.trigger();
    });

    expect(isValid).toBe(true);
  });
});
