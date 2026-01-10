# Test Architecture: Four-Tier Testing Model

This document defines how tests are organized. See [STRUCTURE.md](STRUCTURE.md) for code organization.

---

## Mental Model (4 Tiers)

| Tier | Type | Definition | Scope | Example |
|------|------|-----------|-------|---------|
| 1 | **System Contracts** | Cross-system invariants; matrix tables; rarely change; human-owned | What happens when ANY feature changes? | Auth guards ALL routes regardless of which feature is accessed |
| 2 | **Feature Contracts** | End-to-end feature workflows; integration tests; 5-8 per feature; LLM-written | Does this feature work in isolation? | Tasks CRUD: add → filter → toggle → edit → delete |
| 3 | **Unit Tests** | Component behavior + edge cases; rendering; callbacks; colocated | Does this component work locally? | TaskItem checkbox deduplication; long title wrapping |
| 4 | **Smoke Tests** | Critical sanity checks; optional; minimal coverage | Is the app completely broken? | App loads without crashing; CI doesn't fail |

### Why All 4 Tiers Are Necessary

**Feature contracts alone are not enough.** Each tier catches bugs the others miss:

- **Unit tests** catch component bugs: Long titles overflow, callback deduplication fails
- **Feature contracts** catch feature bugs: Tasks CRUD broken, can't add/edit/delete
- **System contracts** catch coordination bugs: Routes exposed without auth, subscriptions leak on logout
- **Smoke tests** catch build bugs: App won't start, entire build broken in CI

**Example: What breaks without each tier?**

Scenario: You refactor auth to support role-based access (admin vs member).

❌ **Without System Contracts:** All feature contracts pass. But you forgot to add the role check to one endpoint. In production, members can access admin routes.

❌ **Without Feature Contracts:** Unit tests pass. But the entire Tasks feature is broken because you changed the API contract.

❌ **Without Unit Tests:** Feature and system contracts pass. But TaskItem has a memory leak in a specific edge case (checkbox rapid-clicked).

❌ **Without Smoke Tests:** Everything passes. But you misconfigured the build and the app doesn't load in CI.

**Each layer tests a different scope.** They're complementary, not redundant.

---

## Human-LLM Collaboration

| Tier | Test Type | Who Owns | Purpose | Can LLM Edit? |
|------|-----------|----------|---------|----------------|
| 1 | **System Contracts** | Human reviews | Hard gate, never regress | No—only add rows |
| 2 | **Feature Contracts** | LLM writes, human reviews | Acceptance criteria for feature | Yes—these ARE the spec |
| 3 | **Unit Tests** | LLM writes/maintains | Regression prevention + safety net | Yes—safe to refactor |
| 4 | **Smoke Tests** | Human-owned | Sanity check: is app broken? | Rarely—keep minimal |

**System Contracts are the hard gate.** Keep them:
- **Few:** Auth routing, auth lifecycle, offline/sync invariants
- **Clear:** Readable matrix tables, not abstract logic
- **Immutable:** LLMs refactor around them, not through them

**Feature Contracts are the feature spec.** LLM writes them:
- **Focused:** One per feature, 5-8 tests
- **End-to-end:** Tests UI → DB state, not just components
- **Journeys:** One happy path per CRUD action + 1 sad path
- **Maintained by LLM:** But define what "done" means

---

## Test Locations

### Unit Tests (Colocated)

Unit tests live next to their components:

```
src/features/tasks/components/
  TaskListScreen.tsx
  TaskListScreen.test.tsx      # Unit tests: rendering, callbacks, edge cases
  TaskItem.tsx
  TaskItem.test.tsx            # Unit tests: rendering, callbacks, edge cases
```

### Feature Contracts (Feature-Level)

Feature contracts live in `__tests__/features/<feature>/`:

```
__tests__/features/
  tasks/
    tasks.feature.test.ts      # Feature contract: CRUD end-to-end
  clients/
    clients.feature.test.ts
  projects/
    projects.feature.test.ts
```

### System Contracts & Smoke Tests (Cross-Cutting)

System-level tests remain in `__tests__/`:

```
__tests__/
  contracts/                   # System invariants (auth routing, auth lifecycle)
  smoke/                       # App sanity checks (optional)
  utils/                       # Shared mocks and helpers
```

---

## Reference Files

See these documents and living examples:

### Architecture & Strategy
- [TASK_TESTS.md](TASK_TESTS.md) — Complete example of Feature Contract (Tasks CRUD)
- [TEST_PATTERNS_COMPARISON.md](TEST_PATTERNS_COMPARISON.md) — Test organization frameworks
- [TEST_STRUCTURE_GUIDE.md](TEST_STRUCTURE_GUIDE.md) — Given-When-Then pattern (applies to all tiers)

### Unit Test Examples (Colocated)
- `src/features/auth/components/LoginScreen.test.tsx` — Form validation, API calls, navigation
- `src/features/tasks/components/TaskItem.test.tsx` — Rendering, callbacks, edge cases

### Feature Contract Examples
- `__tests__/features/tasks/tasks.feature.test.ts` — CRUD journeys end-to-end

### System Contract Examples
- `__tests__/contracts/auth-routing.contract.test.tsx` — `test.each` matrix for segment × session → redirect
- `__tests__/contracts/auth-lifecycle.contract.test.tsx` — subscription cleanup invariant

### Test Utilities
- `__tests__/utils/auth-mocks.ts` — `createAuthSubscription`, `setupAuthStateChangeMock`
- `__tests__/utils/form-helpers.ts` — `submitLoginForm`, `submitRegisterForm`

---

## Decision Guide

| Question | Answer | Location |
|----------|--------|----------|
| Does this component render long titles correctly? | Unit test | Colocated component test |
| Does clicking submit call the right callback? | Unit test | Colocated component test |
| Does the Tasks feature work end-to-end (add→filter→edit→delete)? | Feature contract | `__tests__/features/tasks/tasks.feature.test.ts` |
| What happens across ALL route segments when user signs in? | System contract | `__tests__/contracts/auth-routing.contract.test.tsx` |
| Are we cleaning up subscriptions correctly? | System contract | `__tests__/contracts/auth-lifecycle.contract.test.tsx` |
| Is the entire app broken? | Smoke test | `__tests__/smoke/` (optional) |

**Decision tree:**
- "Does this component work?" → Unit test (colocated)
- "Does this feature work end-to-end?" → Feature contract (`__tests__/features/`)
- "Does this apply across the whole system?" → System contract (`__tests__/contracts/`)
- "Is there a critical blocker?" → Smoke test (`__tests__/smoke/`)

---

## System Contract Test Rules

LLMs follow these rules when editing system contracts:

1. **MAY** add new rows to `test.each` matrices for new legitimate states
2. **SHOULD NOT** modify or delete existing rows without human instruction
3. **MUST** get human review before creating a new contract file

Add this header to system contract tests:

```ts
/**
 * SYSTEM CONTRACT TEST
 * - Do NOT change existing rows without human review.
 * - To support new states, ADD rows; don't delete old ones.
 */
```

---

## Feature Contract Test Rules

LLMs write feature contracts as part of completing a task. Rules:

1. **File naming:** `<feature>.feature.test.ts` (not `.spec.ts`, not `.unit.test.ts`)
2. **Location:** `__tests__/features/<feature>/`
3. **Size:** 5-8 tests per feature, one per user journey
4. **Scope:** Happy paths (1 per CRUD action) + 1 sad path per action
5. **Mocking:** Only external dependencies (db, API calls). Don't mock components.
6. **Verification:** Test data persists correctly, UI reflects state end-to-end
7. **Ownership:** LLM writes them as the feature specification; human reviews before "done"

Add this header to feature contract tests:

```ts
/**
 * FEATURE CONTRACT TEST
 * Defines what it means for this feature to be "done".
 * LLM: Write these as part of the task. Human: Review before accepting.
 */
```

Example: See [TASK_TESTS.md](TASK_TESTS.md) for Tasks CRUD feature contract

---

## For LLM Agents

### Writing tests for a new feature (Tasks CRUD example)

1. Read [TASK_TESTS.md](TASK_TESTS.md) for the feature specification
2. Create feature contract: `__tests__/features/tasks/tasks.feature.test.ts`
   - 5-8 integration tests covering happy paths + 1 sad path
   - Verify data persists and UI reflects DB state
3. Create unit tests colocated with components:
   - `src/features/tasks/components/TaskListScreen.test.tsx`
   - `src/features/tasks/components/TaskItem.test.tsx`
4. Run: `npm test -- --testPathPatterns="tasks"`
5. Both feature contract AND unit tests must pass

### Editing an existing component

1. Find the colocated test (e.g., `TaskItem.test.tsx` next to `TaskItem.tsx`)
2. Update tests for changed behavior
3. Run: `npm test -- --testPathPatterns="TaskItem"`
4. If the feature behavior changed, update feature contract too

### Adding a new route segment

1. Read `__tests__/contracts/auth-routing.contract.test.tsx`
2. Add a row to the `test.each` matrix
3. Run: `npm test -- --testPathPatterns="auth-routing"`
4. System contracts are immutable unless you have human approval

### Changing auth flow logic

- Check both colocated component tests AND system contract tests
- System contract failures indicate broken system invariants
- Feature contract failures indicate the feature no longer works

---

## Anti-Patterns

❌ Don't make unit tests exhaustive across feature boundaries  
✅ DO make feature contracts exhaustive across feature boundaries

❌ Don't use feature contracts for component rendering edge cases  
✅ DO use unit tests for component rendering edge cases

❌ Don't use unit tests to verify data persists correctly  
✅ DO use feature contracts to verify data persists correctly

❌ Don't let system contracts test UI implementation details  
✅ DO let feature contracts test full UI→DB flow

❌ Don't add new routing dimensions without updating system contract matrices  
✅ DO update system contracts when routing changes

❌ Don't mix "does this component work?" and "does this feature work?" in one file  
✅ DO separate unit tests (colocated) and feature contracts (`__tests__/features/`)

❌ Don't create many system contracts—keep them few and focused  
✅ DO create one feature contract per feature—they're the spec

❌ Don't edit system contracts without human approval  
✅ DO let LLM write feature contracts as part of the feature task
