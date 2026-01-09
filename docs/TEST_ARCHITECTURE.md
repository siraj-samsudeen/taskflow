# Test Architecture: Two-Layer Contract Model

This document defines how tests are organized. See [STRUCTURE.md](STRUCTURE.md) for code organization.

---

## Mental Model

| Type | Definition | Role |
|------|------------|------|
| **Contracts** | "What must be true" | Matrix tables defining input→output pairs. Human-owned, few, focused. |
| **Component tests** | "Does this work?" | Local correctness for a single component. LLM-maintained. |
| **Smoke tests** | "Happy path works" | 1-2 end-to-end checks. Not for edge cases. |

---

## Human-LLM Collaboration

| Test Type | Who Owns It | Purpose |
|-----------|-------------|---------|
| **Contract matrices** | Human reviews | Hard gate. Few, clear, must never regress. |
| **Component tests** | LLM maintains | Local correctness, safe to refactor. |
| **Smoke tests** | Human-owned | 1-2 happy paths. Catches "app is broken." |

**Contracts are the hard gate.** Keep them:
- **Few:** Auth routing, auth lifecycle, offline/sync invariants
- **Clear:** Readable matrix tables, not abstract logic
- **Immutable:** LLMs refactor around them, not through them

---

## Test Locations

### Colocated Tests (Feature-Specific)

Component and unit tests live next to their source files:

```
src/features/clients/components/
  ClientForm.tsx
  ClientForm.test.tsx
```

### Cross-Cutting Tests

System-level tests remain in `__tests__/`:

```
__tests__/
  contracts/           # System invariants (human-owned)
  smoke/               # App-level sanity checks  
  utils/               # Shared mocks and helpers
```

---

## Reference Files

Instead of duplicating code here, refer to these living examples:

### Component Test Examples
- `__tests__/components/login.test.tsx` — form validation, API calls, navigation
- `__tests__/components/register.test.tsx` — similar pattern with success toast

### Contract Test Examples
- `__tests__/contracts/auth-routing.contract.test.tsx` — `test.each` matrix for segment × session → redirect
- `__tests__/contracts/auth-lifecycle.contract.test.tsx` — subscription cleanup invariant

### Test Utilities
- `__tests__/utils/auth-mocks.ts` — `createAuthSubscription`, `setupAuthStateChangeMock`, `triggerAuthEvent`
- `__tests__/utils/form-helpers.ts` — `submitLoginForm`, `submitRegisterForm`, etc.

---

## Decision Guide

| Question | Location |
|----------|----------|
| Does this component validate inputs correctly? | Colocated component test |
| Does clicking submit call the right API? | Colocated component test |
| What happens across ALL route segments when user signs in? | `contracts/auth-routing.contract.test.tsx` |
| Are we cleaning up subscriptions correctly? | `contracts/auth-lifecycle.contract.test.tsx` |

**Simple rule:**
- "Does this component work?" → Component test (colocated)
- "Did we cover all cases across the system?" → Contract test

---

## Contract Test Rules

LLMs follow these rules when editing contracts:

1. **MAY** add new rows to `test.each` matrices for new legitimate states
2. **SHOULD NOT** modify or delete existing rows without human instruction
3. **MUST** get human review before creating a new contract file

Add this header to contract tests:

```ts
/**
 * CONTRACT TEST
 * - Do NOT change existing rows without human review.
 * - To support new states, ADD rows; don't delete old ones.
 */
```

---

## For LLM Agents

### Editing a component

1. Find the colocated test (e.g., `ClientForm.test.tsx` next to `ClientForm.tsx`)
2. Update tests for changed behavior
3. Run: `npm test -- --testPathPatterns="ClientForm"`

### Adding a new route segment

1. Read `__tests__/contracts/auth-routing.contract.test.tsx`
2. Add a row to the `test.each` matrix
3. Run: `npm test -- --testPathPatterns="auth-routing"`

### Changing auth flow logic

- Check both colocated component tests AND contract tests
- Contract failures indicate broken system invariants

---

## Anti-Patterns

❌ Don't make component tests exhaustive across system boundaries  
❌ Don't use journey-style tests for coverage guarantees  
❌ Don't let contracts test UI implementation details  
❌ Don't add new routing dimensions without updating contract matrices  
❌ Don't mix "does this work?" and "did we cover everything?" in one file  
❌ Don't create many contracts—keep them few and focused
