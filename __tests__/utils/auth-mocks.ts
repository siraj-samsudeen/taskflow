import { act } from '@testing-library/react-native';

/**
 * Creates the subscription object structure that Supabase's onAuthStateChange returns.
 * This is shared between simple mocks and setupAuthStateChangeMock (callback capture).
 */
export function createAuthSubscription(unsubscribe = jest.fn()) {
  return { data: { subscription: { unsubscribe } } };
}

/**
 * Sets up onAuthStateChange mock to capture the callback for manual triggering.
 * Used in tests that need to simulate auth state changes (e.g., SIGNED_IN, SIGNED_OUT).
 * @returns A getter function to access the captured callback after RootLayout renders.
 */
export function setupAuthStateChangeMock(
  supabase: { auth: { onAuthStateChange: jest.Mock } },
  options?: { unsubscribe?: jest.Mock }
) {
  let authCallback: ((event: string, session: unknown) => void) | undefined;
  supabase.auth.onAuthStateChange.mockImplementation((callback) => {
    authCallback = callback;
    return createAuthSubscription(options?.unsubscribe);
  });
  return () => {
    if (!authCallback) {
      throw new Error(
        'Auth callback not captured. Make sure the component is rendered and onAuthStateChange has been called.'
      );
    }
    return authCallback;
  };
}

/**
 * Triggers an auth state change event on the captured callback.
 * Wraps the call in `act()` to handle React state updates.
 */
export async function triggerAuthEvent(
  getCallback: () => (event: string, session: unknown) => void,
  event: string,
  session: unknown
) {
  await act(async () => {
    getCallback()(event, session);
  });
}
