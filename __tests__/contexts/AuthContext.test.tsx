import { renderHook } from '@testing-library/react-native';
import type React from 'react';

import { AuthProvider, useAuth } from '../../src/contexts/AuthContext';
import { supabase } from '../../src/lib/supabase';
import {
  createAuthSubscription,
  setupAuthStateChangeMock,
  triggerAuthEvent,
} from '../utils/auth-mocks';

jest.mock('../../src/lib/supabase');

describe('AuthContext', () => {
  const mockAuth = jest.mocked(supabase.auth);

  beforeEach(() => {
    jest.resetAllMocks();
    mockAuth.onAuthStateChange.mockReturnValue(createAuthSubscription() as any);
  });

  it('throws error when useAuth is used outside AuthProvider', () => {
    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth must be used within an AuthProvider',
    );
  });

  it('exposes isLoading=true initially', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isLoading).toBe(true);
  });

  it('exposes session and user after auth state change', async () => {
    const mockSession = { user: { id: 'user-123', email: 'test@example.com' } };
    const getAuthCallback = setupAuthStateChangeMock({ auth: mockAuth } as any);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await triggerAuthEvent(getAuthCallback, 'SIGNED_IN', mockSession);

    expect(result.current.session).toBe(mockSession);
    expect(result.current.user).toBe(mockSession.user);
    expect(result.current.isLoading).toBe(false);
  });

  it('login() calls supabase.auth.signInWithPassword and returns result', async () => {
    const mockError = { message: 'Invalid credentials' };
    mockAuth.signInWithPassword.mockResolvedValue({ error: mockError } as any);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    const response = await result.current.login('test@example.com', 'password123');

    expect(mockAuth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(response).toEqual({ error: mockError });
  });

  it('signup() calls supabase.auth.signUp and returns result', async () => {
    mockAuth.signUp.mockResolvedValue({ error: null } as any);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    const response = await result.current.signup('new@example.com', 'newpass123');

    expect(mockAuth.signUp).toHaveBeenCalledWith({
      email: 'new@example.com',
      password: 'newpass123',
    });
    expect(response).toEqual({ error: null });
  });

  it('logout() calls supabase.auth.signOut', async () => {
    mockAuth.signOut.mockResolvedValue({ error: null });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await result.current.logout();

    expect(mockAuth.signOut).toHaveBeenCalled();
  });
});
