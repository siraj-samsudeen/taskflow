# Test Migration Summary: 4-Tier Architecture Adoption

## The Shift

**Old Model:** Tests scattered by concern (unit, integration, e2e) with unclear ownership

**New Model:** 4-tier testing pyramid with clear scope, ownership, and location

```
                    ▲
                   / \
                  /   \  Smoke Tests (Optional)
                 /     \
                /───────\
               /         \  System Contracts (Human-owned, immutable)
              /           \
             /─────────────\
            /               \  Feature Contracts (LLM-written spec, 5-8 per feature)
           /                 \
          /─────────────────────\
         /                       \  Unit Tests (Colocated, LLM-maintained)
        /                         \
       ───────────────────────────
```

---

## What Changed for Tasks Feature

| Aspect | Old Approach | New Approach |
|--------|-------------|--------------|
| **Test Location** | Anywhere | Tier 2: `__tests__/features/tasks/` / Tier 3: Colocated with components |
| **Test Ownership** | Unclear | Tier 2: LLM writes spec / Tier 3: LLM maintains / Tier 1&4: Human-owned |
| **Test Purpose** | Generic | Tier 2: Feature spec / Tier 3: Regression prevention / Tier 1: System invariants |
| **Mocking Strategy** | Varied | Consistent: Only external deps (db, API) |
| **Test Pattern** | Mixed | Given-When-Then with nested describes |
| **Coverage Target** | Arbitrary | 85%+ (Tier 3) |
| **Mutability** | Ad-hoc | Tier 1: immutable / Tier 2-3: LLM-editable |

---

## Reconciliation: What Exists → Where It Goes

### Existing Tests (Passing)
- `authSchemas.test.ts` → Tier 1 (System Contract) ✓ Already correct location
- `LoginScreen.test.tsx` → Tier 3 (Unit Tests) ✓ Already correct location
- `useZodForm.test.ts` → Tier 3 (Unit Tests) ✓ Already correct location

**Action:** These stay where they are. They're already following the pattern.

### Missing Tests (For Tasks Feature)
- Feature Contract → New file: `__tests__/features/tasks/tasks.feature.test.ts` (Tier 2)
- TaskListScreen Unit Tests → New file: `src/features/tasks/components/TaskListScreen.test.tsx` (Tier 3)
- TaskItem Unit Tests → New file: `src/features/tasks/components/TaskItem.test.tsx` (Tier 3)

**Action:** Create these 3 files following the Given-When-Then pattern.

---

## Implementation Sequence

### Week 1: Foundation
1. ✅ Document 4-tier architecture (done)
2. ✅ Create test specifications (TASK_TESTS.md - done)
3. ✅ Create implementation plan (TEST_IMPLEMENTATION_PLAN.md - this file)
4. ⏳ Create feature contract (`tasks.feature.test.ts`)

### Week 2: Component Tests
5. ⏳ Create TaskListScreen unit tests (`TaskListScreen.test.tsx`)
6. ⏳ Create TaskItem unit tests (`TaskItem.test.tsx`)

### Week 3: Verification & Polish
7. ⏳ Verify all tests pass
8. ⏳ Verify 85%+ coverage
9. ⏳ Refactor duplicates (optional: create `task-mocks.ts`)

---

## Directory Structure (After Implementation)

```
taskflow/
├── __tests__/
│   ├── features/                    # Tier 2: Feature Contracts
│   │   ├── auth/
│   │   ├── clients/
│   │   ├── projects/
│   │   └── tasks/
│   │       └── tasks.feature.test.ts     # ⏳ NEW: Tasks CRUD integration tests
│   │
│   ├── contracts/                   # Tier 1: System Contracts (human-owned)
│   │   ├── auth-routing.contract.test.tsx
│   │   └── auth-lifecycle.contract.test.tsx
│   │
│   ├── smoke/                       # Tier 4: Smoke Tests (optional)
│   │   └── app.smoke.test.tsx
│   │
│   └── utils/                       # Shared helpers
│       ├── auth-mocks.ts
│       ├── form-helpers.ts
│       └── task-mocks.ts            # ⏳ OPTIONAL: Tasks fixtures
│
├── src/
│   └── features/
│       ├── auth/
│       │   └── components/
│       │       └── LoginScreen.test.tsx     # ✅ Tier 3: Unit tests
│       │
│       ├── shared/
│       │   └── form/
│       │       └── useZodForm.test.ts       # ✅ Tier 3: Unit tests
│       │
│       └── tasks/
│           └── components/
│               ├── TaskListScreen.tsx
│               ├── TaskListScreen.test.tsx  # ⏳ NEW: Tier 3 unit tests
│               ├── TaskItem.tsx
│               └── TaskItem.test.tsx        # ⏳ NEW: Tier 3 unit tests
```

---

## Test Count Progression

### Current State
```
authSchemas.test.ts           : 4 tests ✓
useZodForm.test.ts            : 4 tests ✓
LoginScreen.test.tsx          : 7 tests ✓
────────────────────────────────────────
Total                          : 15 tests passing (21.53% coverage)
```

### After Phase 1 (Feature Contract)
```
+ tasks.feature.test.ts        : 5-8 tests ⏳
────────────────────────────────────────
Total                          : 20-23 tests (~30% coverage)
```

### After Phase 2 (TaskListScreen Units)
```
+ TaskListScreen.test.tsx      : 8-10 tests ⏳
────────────────────────────────────────
Total                          : 28-33 tests (~40% coverage)
```

### After Phase 3 (TaskItem Units)
```
+ TaskItem.test.tsx            : 6-8 tests ⏳
────────────────────────────────────────
Total                          : 34-41 tests (~50%+ coverage)
Target                         : 85%+ on TaskListScreen & TaskItem
```

---

## Key Decisions Embedded in Architecture

### 1. **Feature Contracts Are LLM-Writable**
- Define what "done" means for a feature
- Written as part of feature implementation
- 5-8 tests per feature (not exhaustive)
- Happy paths + 1 edge case per operation
- Human reviews before accepting feature

### 2. **Unit Tests Are Colocated**
- Live next to components: `TaskItem.tsx` → `TaskItem.test.tsx`
- Component-specific edge cases (long titles, rapid clicks, etc.)
- Prevent regressions when refactoring
- 8-16 tests per component
- LLM maintains as component changes

### 3. **System Contracts Are Immutable**
- Few, focused tests (auth routing, auth lifecycle)
- Human-owned, rarely change
- Matrix-style test.each for dimensions
- Cross-cutting concerns (not per-feature)
- LLM can only ADD rows, not delete/modify

### 4. **Mocking Strategy Is Consistent**
- Only mock external dependencies (InstantDB, APIs)
- Don't mock components (test real behavior)
- Don't mock child components (test integration)
- Enables regression detection
- Makes tests faster than E2E but safer than unit

---

## What Each Tier Tests

### Tier 1: System Contracts
**Question:** What happens when ANY feature changes?  
**Example:** "Auth guards ALL routes. When I add a new Tasks feature, are routes protected?"  
**Human:** Writes matrix tables of dimensions (segment × session × role)  
**LLM:** Adds rows for new states, doesn't modify existing  
**Files:** `__tests__/contracts/`

### Tier 2: Feature Contracts
**Question:** Does this feature work end-to-end?  
**Example:** "Can users add → filter → toggle → edit → delete tasks?"  
**LLM:** Writes this as the spec (5-8 tests)  
**Human:** Reviews before accepting  
**Files:** `__tests__/features/<feature>/`

### Tier 3: Unit Tests
**Question:** Does this component work in isolation?  
**Example:** "Does TaskItem render strikethrough when done? Deduplicate saves?"  
**LLM:** Writes and maintains (8-16 tests)  
**Human:** Spot-checks for regressions  
**Files:** Colocated with components

### Tier 4: Smoke Tests
**Question:** Is the whole app broken?  
**Example:** "Does the app start? Can I navigate without crashing?"  
**Human:** Writes (minimal, 2-3 tests)  
**Files:** `__tests__/smoke/`

---

## Why All 4 Tiers Matter

Each tier catches different bugs:

| Bug Type | Caught By | Example |
|----------|-----------|---------|
| Component rendering | Tier 3 (Unit) | Long task titles overflow checkbox |
| Component callback | Tier 3 (Unit) | Save button called twice (not deduplicated) |
| Feature workflow | Tier 2 (Feature) | "Add task" works but "filter" doesn't |
| Cross-feature coordination | Tier 1 (System) | Unauth user can access Tasks even with auth guard |
| Build/startup | Tier 4 (Smoke) | App won't load in CI |

**Without Tier 3:** Feature tests pass but component has memory leak (rapid checkbox clicks crash)  
**Without Tier 2:** Unit tests pass but add+filter is broken  
**Without Tier 1:** Feature tests pass but auth is bypassed  
**Without Tier 4:** Everything passes but app won't start  

**All 4 are necessary.**

---

## Testing Principles Embedded

### 1. Test Behavior, Not Implementation
```typescript
// ❌ Bad: Tests internal state
expect(component.state.editingTaskId).toBe('task-1');

// ✅ Good: Tests user-visible behavior
expect(screen.getByDisplayValue('Buy milk')).toHaveFocus();
```

### 2. Mock Only External Dependencies
```typescript
// ❌ Bad: Mocks component, loses regression detection
jest.mock('./TaskItem');

// ✅ Good: Only mock external db
jest.mock('../../../lib/instant');
```

### 3. One Assertion Per Test (Or One Behavior)
```typescript
// ❌ Bad: Tests multiple independent things
it('adds task and updates counts', () => {
  expect(db.transact).toHaveBeenCalled();
  expect(screen.getByText('New')).toBeInTheDocument();
  expect(screen.getByText('Active (3)')).toBeInTheDocument();
});

// ✅ Good: One behavior with multiple assertions on same result
it('adds task with correct shape', () => {
  expect(db.transact).toHaveBeenCalledWith(
    expect.objectContaining({ title: 'Buy milk', done: false })
  );
});

// ✅ Also good: Separate tests for separate outcomes
it('clears input after add', () => {
  expect(screen.getByPlaceholderText('Add...')).toHaveValue('');
});
```

### 4. Use Given-When-Then Structure
```typescript
describe('Given task is in edit mode', () => {      // Setup
  beforeEach(() => { /* render with isEditing=true */ });
  
  describe('When user presses save button', () => {  // Action
    beforeEach(async () => { /* press button */ });
    
    it('Then callback called with new title', () => { // Assert
      expect(onSaveEdit).toHaveBeenCalledWith('task-1', 'New');
    });
  });
});
```

---

## Transition Checklist

- [ ] Read TEST_IMPLEMENTATION_PLAN.md (detailed step-by-step)
- [ ] Read TASK_TESTS.md (test specifications)
- [ ] Read TEST_STRUCTURE_GUIDE.md (Given-When-Then pattern)
- [ ] Review LoginScreen.test.tsx (reference unit test)
- [ ] Verify jest.setup.js mocks (already done ✓)
- [ ] Create `__tests__/features/tasks/` directory
- [ ] Implement tasks.feature.test.ts (5-8 integration tests)
- [ ] Implement TaskListScreen.test.tsx (8-10 unit tests)
- [ ] Implement TaskItem.test.tsx (6-8 unit tests)
- [ ] Run `npm test -- --testPathPatterns="tasks"` (all pass)
- [ ] Verify coverage: `npm test -- --coverage --testPathPatterns="TaskListScreen|TaskItem"`
- [ ] Target: 85%+ coverage

---

## Next Steps

1. **Immediate:** Read TEST_IMPLEMENTATION_PLAN.md in detail
2. **Phase 1:** Implement feature contract (tasks.feature.test.ts)
3. **Phase 2:** Implement TaskListScreen unit tests
4. **Phase 3:** Implement TaskItem unit tests
5. **Phase 4 (optional):** Create task-mocks.ts for test utilities

Each phase is ~1-2 hours of focused work.
