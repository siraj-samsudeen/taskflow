import { zodResolver } from '@hookform/resolvers/zod';
import { type FieldValues, type Resolver, type UseFormProps, useForm } from 'react-hook-form';
import type { z } from 'zod';

export function useZodForm<T extends FieldValues>(
  schema: z.ZodType<T, any, any>,
  options?: Omit<UseFormProps<T>, 'resolver'>,
) {
  return useForm<T>({
    resolver: zodResolver(schema) as Resolver<T>,
    ...options,
  });
}
