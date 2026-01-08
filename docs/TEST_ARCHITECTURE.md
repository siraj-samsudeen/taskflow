# Test Architecture: Two-Layer Contract Model

This document defines how tests are organized in this codebase. Follow this structure when adding or modifying tests.

---

## Mental Model

| Type | Definition | Role |
|------|------------|------|
| **Contracts** | "What must be true" | Matrix tables defining input→output pairs. Human-owned, few, focused. |
| **Properties** | "What cannot be false" | Invariants that hold across ALL states. Use sparingly. |
| **Smoke tests** | "Happy path works" | 1-2 end-to-end checks. Not for edge cases or completeness. |
| **Journeys** | "What happened once" | ❌ **Not used for testing**—use as documentation only. |

---

## The Mix: Human-LLM Collaboration

| Test Type | Who Owns It | Purpose |
|-----------|-------------|---------|
| **Contract matrices** | Human reviews for completeness | Hard gate. Few, clear, must never regress. |
| **Component tests** | LLM maintains, human spot-checks | Local correctness, safe to refactor around. |
| **Property tests** | Human defines invariant | True invariants only (loading gate, cleanup). |
| **Smoke tests** | Optional, human-owned | 1-2 happy paths max. Catches "app is broken." |

**Contracts are the hard gate.** Keep them:
- **Few:** Auth routing, auth lifecycle, offline/sync invariants
- **Clear:** Readable matrix tables, not abstract logic
- **Immutable:** LLMs refactor around them, not through them

**Why this mix works:**

- You can look at a matrix and ask "did we miss a case?"
- You cannot verify a property test covers all edge cases
- I can safely edit component tests without breaking system guarantees
- The matrix is the contract between us: you verify completeness, I implement against it
- Smoke tests catch catastrophic regressions without pretending to be exhaustive

---

## Core Principle

Tests serve two distinct purposes that require different organization:

| Layer | Purpose | Optimized For |
|-------|---------|---------------|
| **Component Tests** | Guard local correctness | LLM agents making edits |
| **Contract Tests** | Guarantee system invariants | Humans validating coverage |

**Never mix these concerns in the same file.**

---

## Directory Structure

```
__tests__/
├── contracts/                              # Hard gate (human-owned, few, must never regress)
│   ├── auth-routing.contract.test.tsx      # Segment × Session → Redirect matrix
│   └── auth-lifecycle.contract.test.tsx    # Subscription cleanup invariant
├── components/                             # Local correctness (LLM-optimized)
│   ├── login.test.tsx                      # LoginScreen validation + API
│   └── register.test.tsx                   # RegisterScreen validation + API
├── smoke/                                  # Optional: 1-2 happy path checks (empty for now)
└── utils/                                  # Shared test infrastructure
    ├── auth-mocks.ts                       # createAuthSubscription, setupAuthStateChangeMock, triggerAuthEvent
    └── form-helpers.ts                     # fillLoginForm, fillRegisterForm
```

---

## Layer 1: Component Tests

**Location:** `__tests__/components/<ComponentName>.test.tsx`

**Purpose:** Test that a single component behaves correctly in isolation.

**Rules:**
- Only test things the component directly owns
- No cross-component assumptions
- No routing matrix logic
- Keep files small and focused

**Example: login.test.tsx**

```typescript
import { render, screen, userEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import LoginScreen from '../../src/app/(auth)/login';
import { supabase } from '../../src/lib/supabase';
import { createAuthSubscription } from '../utils/auth-mocks';
import { fillLoginForm } from '../utils/form-helpers';

jest.mock('../../src/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
  },
}));

jest.spyOn(Alert, 'alert').mockImplementation();

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    (supabase.auth.onAuthStateChange as jest.Mock).mockReturnValue(
      createAuthSubscription()
    );
  });

  describe('validation', () => {
    it('empty email -> shows error', async () => {
      const user = userEvent.setup();
      render(<LoginScreen />);
      
      await user.type(screen.getByPlaceholderText('Password'), 'password123');
      await user.press(screen.getByText('Login'));
      
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter your email');
    });

    it('invalid email -> shows error', async () => { /* ... */ });
    it('empty password -> shows error', async () => { /* ... */ });
    it('API error -> shows error message', async () => { /* ... */ });
  });

  describe('submission', () => {
    it('calls signInWithPassword with credentials', async () => {
      const user = userEvent.setup();
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({ error: null });
      
      render(<LoginScreen />);
      await fillLoginForm(user, 'test@example.com', 'password123');
      await user.press(screen.getByText('Login'));
      
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });
});
```

**What component tests answer:**
- Does this component validate inputs correctly?
- Does this component call the right APIs?
- Does this component render the right UI states?

---

## Layer 2: Contract Tests

**Location:** `__tests__/contracts/<domain>.contract.test.ts`

**Purpose:** Encode system-wide invariants as explicit, exhaustive matrices.

**Rules:**
- Use `test.each` tables to make coverage visible
- Test behavior outcomes, not implementation details
- Don't import UI components unless testing integration boundaries
- Human-reviewed when adding new dimensions

**Example: auth-routing.contract.test.tsx**

```typescript
import { render } from '@testing-library/react-native';
import { useRouter, useSegments } from 'expo-router';
import RootLayout from '../../src/app/_layout';
import { supabase } from '../../src/lib/supabase';
import { setupAuthStateChangeMock, triggerAuthEvent } from '../utils/auth-mocks';

jest.mock('expo-router', () => ({
  Slot: () => null,
  useRouter: jest.fn(),
  useSegments: jest.fn(),
}));

jest.mock('../../src/lib/supabase', () => ({
  supabase: { auth: { onAuthStateChange: jest.fn() } },
}));

const SESSION = { user: { id: '123' } };

describe('Auth Routing Contract', () => {
  const mockReplace = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ replace: mockReplace });
  });

  // Matrix is keyed by (segment, session), NOT by auth events.
  // This mirrors production logic: RootLayout checks session + segments, not event strings.
  test.each([
    // segment    | session  | expected redirect
    ['(auth)',     SESSION,   '/'],
    ['(auth)',     null,      null],
    ['(tabs)',     SESSION,   null],
    ['(tabs)',     null,      '/(auth)/login'],
    ['',           SESSION,   null],
    ['',           null,      '/(auth)/login'],
  ])(
    '[%s] + session=%p → %s',
    async (segment, session, expectedRedirect) => {
      (useSegments as jest.Mock).mockReturnValue(segment ? [segment] : []);
      const getAuthCallback = setupAuthStateChangeMock(supabase as any);

      render(<RootLayout />);
      await triggerAuthEvent(
        getAuthCallback,
        session ? 'SIGNED_IN' : 'SIGNED_OUT',
        session
      );

      if (expectedRedirect) {
        expect(mockReplace).toHaveBeenCalledWith(expectedRedirect);
      } else {
        expect(mockReplace).not.toHaveBeenCalled();
      }
    }
  );

  // Loading gate: most regression-prone behavior in auth routing
  it('does not redirect while auth state is loading', () => {
    (useSegments as jest.Mock).mockReturnValue(['(tabs)']);
    setupAuthStateChangeMock(supabase as any);

    render(<RootLayout />);

    expect(mockReplace).not.toHaveBeenCalled();
  });
});
```

**Example: auth-lifecycle.contract.test.tsx**

```typescript
describe('Auth Lifecycle Contract', () => {
  it('unsubscribes from auth listener on unmount', () => {
    const mockUnsubscribe = jest.fn();
    setupAuthStateChangeMock(supabase as any, { unsubscribe: mockUnsubscribe });

    const { unmount } = render(<RootLayout />);
    unmount();

    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });
});
```

**What contract tests answer:**
- Are all auth routing cases covered?
- Do SIGNED_IN and SIGNED_OUT behave consistently?
- Did we miss a segment combination?
- What happens when we add a new route group?

---

## Shared Utilities

**Location:** `__tests__/utils/`

Keep test helpers small and focused. Explicit imports make dependencies traceable.

**auth-mocks.ts**
```typescript
import { act } from '@testing-library/react-native';

// Creates the subscription object structure that Supabase's onAuthStateChange returns.
export function createAuthSubscription(unsubscribe = jest.fn()) {
  return { data: { subscription: { unsubscribe } } };
}

// Sets up onAuthStateChange mock to capture the callback for manual triggering.
// Returns a getter function to access the captured callback after component renders.
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

export async function triggerAuthEvent(
  getCallback: () => (event: string, session: unknown) => void,
  event: string,
  session: unknown
) {
  await act(async () => {
    getCallback()(event, session);
  });
}
```

**form-helpers.ts**
```typescript
import { screen, UserEvent } from '@testing-library/react-native';

export async function fillLoginForm(user: UserEvent, email: string, password: string) {
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
```

---

## Decision Guide

Use this to determine where a test belongs:

| Question | Answer | Location |
|----------|--------|----------|
| Does this component validate input X correctly? | Component owns it | `components/<Component>.test.tsx` |
| Does clicking submit call the right API? | Component owns it | `components/<Component>.test.tsx` |
| What happens across ALL route segments when user signs in? | System invariant | `contracts/auth-routing.contract.test.ts` |
| Are we cleaning up subscriptions correctly? | System invariant | `contracts/auth-lifecycle.contract.test.ts` |
| Did we cover all validation cases for this form? | Component owns it | `components/<Component>.test.tsx` |
| Did we cover all routing combinations? | System invariant | `contracts/auth-routing.contract.test.ts` |

**Simple rule:**
- "Does this component work?" → Component test
- "Did we cover all cases?" → Contract test

---

## For LLM Agents

When modifying code:

1. **Editing a component** (e.g., `login.tsx`):
   - Read `__tests__/components/login.test.tsx`
   - Update tests for changed behavior
   - Run: `npm test -- login.test.tsx`

2. **Adding a new route segment**:
   - Read `__tests__/contracts/auth-routing.contract.test.ts`
   - Add a row to the `test.each` matrix
   - Run: `npm test -- auth-routing.contract.test.ts`

3. **Changing auth flow logic**:
   - Check both component tests AND contract tests
   - Contract failures indicate broken system invariants

---

## Anti-Patterns

❌ **Don't** make component tests exhaustive across system boundaries  
❌ **Don't** use journey-style tests for coverage guarantees  
❌ **Don't** let contracts test UI implementation details  
❌ **Don't** add new routing dimensions without updating contract matrices  
❌ **Don't** mix "does this work?" and "did we cover everything?" in one file  
❌ **Don't** create many contracts—keep them few and focused (routing, lifecycle, sync)  
❌ **Don't** use smoke tests for edge cases—they're for "app launches and works" only
