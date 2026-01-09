import { loginSchema, registerSchema } from './authSchemas';

describe('authSchemas', () => {
  describe('loginSchema', () => {
    it('validates valid login data', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid email', () => {
      const result = loginSchema.safeParse({
        email: 'invalid',
        password: 'password123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Please enter a valid email');
      }
    });
  });

  describe('registerSchema', () => {
    it('validates valid registration data', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('rejects mismatched passwords', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'different',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Passwords do not match');
      }
    });

    it('rejects invalid email', () => {
      const result = registerSchema.safeParse({
        email: 'invalid',
        password: 'password123',
        confirmPassword: 'password123',
      });
      expect(result.success).toBe(false);
    });
  });
});
