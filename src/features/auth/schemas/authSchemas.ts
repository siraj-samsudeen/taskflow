import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email({ message: 'Please enter a valid email' }),
  password: z.string({ message: 'Password is required' }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    email: z.email({ message: 'Please enter a valid email' }),
    password: z.string({ message: 'Password is required' }),
    confirmPassword: z.string({ message: 'Confirm password is required' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
