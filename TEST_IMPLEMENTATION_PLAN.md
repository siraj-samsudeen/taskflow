# Test Implementation Plan: Tasks Feature (4-Tier Architecture)

## Executive Summary

Implement the Tasks CRUD feature tests across all 4 tiers of the new architecture. Current coverage: 0% for TaskListScreen and TaskItem. Target: 85%+ with ~35 tests total.

**Execution timeline:** Sequential by tier and component.

---

## Current State Assessment

### What Exists
- ✅ `jest.setup.js` - mocks InstantDB (db, id)
- ✅ Test documentation (TASK_TESTS.md, TEST_STRUCTURE_GUIDE.md, TEST_ARCHITECTURE.md)
- ✅ Component implementations (TaskListScreen.tsx, TaskItem.tsx)
- ✅ Reference implementations (LoginScreen.test.tsx, useZodForm.test.ts)

### What's Missing
- ❌ Feature contract: `__tests__/features/tasks/tasks.feature.test.ts` (integration tests)
- ❌ Unit tests: `src/features/tasks/components/TaskListScreen.test.tsx`
- ❌ Unit tests: `src/features/tasks/components/TaskItem.test.tsx`
- ❌ Test utilities: `__tests__/utils/task-mocks.ts` (optional but helpful)

### Tier Mapping for Tasks Feature

| Tier | File | Type | Count | Status | Owner |
|------|------|------|-------|--------|-------|
| 2 | `__tests__/features/tasks/tasks.feature.test.ts` | Feature contract (integration) | 5-8 | ❌ Missing | LLM |
| 3 | `src/features/tasks/components/TaskListScreen.test.tsx` | Unit tests | 8-10 | ❌ Missing | LLM |
| 3 | `src/features/tasks/components/TaskItem.test.tsx` | Unit tests | 6-8 | ❌ Missing | LLM |
| 1 | `__tests__/contracts/` | System contracts (existing) | - | ✅ Exists | Human |
| 4 | `__tests__/smoke/` | Smoke tests (optional) | - | ⏸ Defer | Optional |

**Tiers 1 & 4 are pre-existing / out of scope for this feature.**

---

## Phase 1: Feature Contract (Tier 2) - Integration Tests

**File:** `__tests__/features/tasks/tasks.feature.test.ts`  
**Purpose:** Verify Tasks CRUD works end-to-end (UI → DB state)  
**Count:** 5-8 tests  
**Pattern:** Given-When-Then with nested describes  
**Mocking:** Only InstantDB (db.useQuery, db.transact, id). Don't mock components.

### Reference for Test Scenarios
From `TASK_TESTS.md` (Integration Tests section), implement these workflows:

1. **Data Loading & Display** (1 test)
   - When screen loads → displays all/empty/multiple tasks from database

2. **Adding a New Task** (3 tests)
   - User enters valid title → saved to DB, input clears, appears at top
   - User enters whitespace → rejected, nothing changes
   - Keyboard return key = button press

3. **Filtering & Navigation** (2 tests)
   - Active/done tabs filter correctly and show counts
   - All tab shows combined, sorted newest first

4. **Toggling Task Status** (1 test)
   - User checks task → marked done in DB, moves to done tab, counts update

5. **Editing a Task** (1 test)
   - User edits title → saved to DB, updatedAt recorded, exits edit mode

6. **Deleting a Task** (1 test)
   - User deletes → removed from DB, disappears, counts update

**Total: 5-8 integration tests covering the happy path for each CRUD operation + 1 whitespace rejection edge case**

### Implementation Checklist

- [ ] Create `__tests__/features/tasks/` directory
- [ ] Create `tasks.feature.test.ts` with:
  - Mock `db.useQuery` to return test task data
  - Mock `db.transact` to verify called with correct shape
  - Render `<TaskListScreen />` (the full component)
  - Use `userEvent` for realistic interactions (type, press, tap)
  - Assert on screen output (text, counts) not internal state
  - Each test follows: render → user action → verify DB call + UI state

### Test Structure Template

```typescript
// __tests__/features/tasks/tasks.feature.test.ts

/**
 * FEATURE CONTRACT TEST
 * Defines what it means for the Tasks feature to be "done".
 * Tests end-to-end: UI → hooks → API → database state
 */

import { render, screen, userEvent } from '@testing-library/react-native';
import { TaskListScreen } from 'src/features/tasks/components/TaskListScreen';
import { db, id } from 'src/lib/instant';

jest.mock('src/lib/instant', () => ({
  db: {
    useQuery: jest.fn(),
    transact: jest.fn(),
  },
  id: jest.fn().mockReturnValue('task-new'),
}));

describe('Tasks Feature Contract', () => {
  // Setup fixtures
  const mockTasks = [
    { id: 'task-1', title: 'Active', done: false, createdAt: 1000 },
    { id: 'task-2', title: 'Done', done: true, createdAt: 2000 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Given screen loads with tasks from database', () => {
    beforeEach(() => {
      jest.mocked(db.useQuery).mockReturnValue({
        isLoading: false,
        data: { tasks: mockTasks },
      });
      render(<TaskListScreen />);
    });

    it('Then displays all tasks from database', () => {
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Done')).toBeInTheDocument();
    });

    describe('When user enters new task and submits', () => {
      beforeEach(async () => {
        const user = userEvent.setup();
        await user.type(screen.getByPlaceholderText('Add a new task...'), 'Buy milk');
        await user.press(screen.getByLabelText('Add task'));
      });

      it('Then task saved to database with correct shape', () => {
        expect(db.transact).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Buy milk',
            description: '',
            done: false,
            priority: 'medium',
          })
        );
      });

      it('Then input field is cleared', () => {
        expect(screen.getByPlaceholderText('Add a new task...')).toHaveValue('');
      });
    });
  });

  // ... more describe blocks following the pattern above
});
```

**Success Criteria:**
- All 5-8 integration tests pass
- Each test verifies a complete workflow (render → action → verify DB call + UI state)
- Tests read like feature specs (Given-When-Then format)

---

## Phase 2: Unit Tests (Tier 3) - TaskListScreen Component

**File:** `src/features/tasks/components/TaskListScreen.test.tsx`  
**Purpose:** Test component rendering, callbacks, edge cases, input validation  
**Count:** 8-10 tests  
**Pattern:** Given-When-Then with nested describes  
**Mocking:** Only InstantDB hooks (db.useQuery, db.transact). Don't mock TaskItem.

### Test Scenarios (from TASK_TESTS.md)

**Rendering**
- Loading state shows "Loading..."
- Empty list shows empty state
- Loaded tasks render in FlatList
- Tabs show correct counts

**Form Input Validation**
- Empty input → add button disabled
- Non-empty input → add button enabled

**Tab Navigation**
- Tab clicks update filter
- Tab clicks don't clear form input
- Tab clicks preserve edit mode

**Mutation Integration**
- Add task → calls db.transact with correct shape, clears input
- Toggle task → calls db.transact with done flag + updatedAt
- Edit task → calls db.transact with new title + updatedAt, deduplicates blur+submit
- Delete task → calls db.transact with delete operation

**Edge Cases**
- Whitespace input rejected
- Edit mode persists across tab switches
- Long titles don't break layout

**Total: 8-10 unit tests covering component behavior, not feature workflow**

### Implementation Checklist

- [ ] Create `TaskListScreen.test.tsx` alongside `TaskListScreen.tsx`
- [ ] Mock `db.useQuery` and `db.transact`
- [ ] Test each rendering variant (loading, empty, loaded)
- [ ] Test each interaction (form submit, tab click, edit, delete)
- [ ] Verify callback shapes (db.transact call assertions)
- [ ] Test edge cases (empty/whitespace, long titles, duplicate saves)

### Test Structure Template

```typescript
// src/features/tasks/components/TaskListScreen.test.tsx

/**
 * UNIT TEST - Component Implementation Safety
 * Tests component-specific behavior, edge cases, rendering.
 * Focus: Does TaskListScreen work locally?
 */

import { render, screen, userEvent } from '@testing-library/react-native';
import { TaskListScreen } from './TaskListScreen';
import { db } from '../../../lib/instant';

jest.mock('../../../lib/instant');

describe('TaskListScreen', () => {
  const mockTasks = [
    { id: 'task-1', title: 'Buy milk', done: false, createdAt: 1000 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Given screen is loading', () => {
    beforeEach(() => {
      jest.mocked(db.useQuery).mockReturnValue({
        isLoading: true,
        data: null,
      });
      render(<TaskListScreen />);
    });

    it('Then shows loading message', () => {
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Given tasks are loaded', () => {
    beforeEach(() => {
      jest.mocked(db.useQuery).mockReturnValue({
        isLoading: false,
        data: { tasks: mockTasks },
      });
      render(<TaskListScreen />);
    });

    describe('When user enters empty input and presses add', () => {
      it('Then add button is disabled', () => {
        expect(screen.getByLabelText('Add task')).toBeDisabled();
      });
    });

    describe('When user types valid task and presses add button', () => {
      beforeEach(async () => {
        const user = userEvent.setup();
        const input = screen.getByPlaceholderText('Add a new task...');
        await user.type(input, 'New task');
        await user.press(screen.getByLabelText('Add task'));
      });

      it('Then db.transact called with correct shape', () => {
        expect(db.transact).toHaveBeenCalledWith(
          expect.objectContaining({ title: 'New task', done: false })
        );
      });

      it('Then input field clears', () => {
        expect(screen.getByPlaceholderText('Add a new task...')).toHaveValue('');
      });
    });

    describe('When user clicks active tab', () => {
      beforeEach(async () => {
        const user = userEvent.setup();
        await user.press(screen.getByRole('tab', { name: /Active/ }));
      });

      it('Then only incomplete tasks shown', () => {
        expect(screen.getByText('Buy milk')).toBeInTheDocument();
      });
    });

    // ... more describe blocks
  });
});
```

**Success Criteria:**
- All 8-10 unit tests pass
- Tests focus on component behavior (not feature workflows)
- Each test verifies a single concern (rendering, interaction, or mutation)
- Callbacks (db.transact) are verified with correct arguments

---

## Phase 3: Unit Tests (Tier 3) - TaskItem Component

**File:** `src/features/tasks/components/TaskItem.test.tsx`  
**Purpose:** Test rendering variants, checkbox/edit/delete interactions, callbacks  
**Count:** 6-8 tests  
**Pattern:** Given-When-Then with nested describes  
**Mocking:** None (pure component, all callbacks are mocks passed as props)

### Test Scenarios (from TASK_TESTS.md)

**Rendering**
- Incomplete task → normal styling, checkbox unchecked
- Completed task → strikethrough, opacity 0.5, checkbox checked
- Edit mode → edit input focused, save/delete buttons visible, checkbox hidden
- Long titles wrap correctly

**Interactions - Checkbox**
- Pressing checkbox calls onToggleDone(id)

**Interactions - Row Tap**
- Pressing row calls onStartEdit(id) (only in normal mode, not edit mode)

**Interactions - Edit Submit**
- Save button calls onSaveEdit(id, newTitle)
- Return key calls onSaveEdit
- Blur calls onSaveEdit
- Multiple events deduplicated (only called once)

**Interactions - Delete**
- Delete button calls onDelete(id)

**Edge Cases**
- Optional callbacks don't throw errors
- Empty title edits still call callback (parent validates)

**Total: 6-8 unit tests covering TaskItem rendering and callback verification**

### Implementation Checklist

- [ ] Create `TaskItem.test.tsx` alongside `TaskItem.tsx`
- [ ] Don't mock dependencies (TaskItem is pure)
- [ ] Pass mock callbacks as props
- [ ] Test each rendering state (normal, done, editing)
- [ ] Test each callback (toggle, startEdit, saveEdit, delete)
- [ ] Test edge cases (long title, optional callbacks, duplicate saves)

### Test Structure Template

```typescript
// src/features/tasks/components/TaskItem.test.tsx

/**
 * UNIT TEST - Component Implementation Safety
 * Tests component-specific rendering, callbacks, edge cases.
 * Focus: Does TaskItem render correctly and call the right callbacks?
 */

import { render, screen, userEvent } from '@testing-library/react-native';
import { TaskItem } from './TaskItem';
import type { Task } from '../../../types';

describe('TaskItem', () => {
  const activeTask: Task = {
    id: 'task-1',
    title: 'Buy milk',
    done: false,
    created_at: '2024-01-10T10:00:00Z',
  };

  const doneTask: Task = {
    id: 'task-2',
    title: 'Review code',
    done: true,
    created_at: '2024-01-09T15:00:00Z',
  };

  const mockHandlers = {
    onToggleDone: jest.fn(),
    onStartEdit: jest.fn(),
    onSaveEdit: jest.fn(),
    onDelete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Given an incomplete task in normal mode', () => {
    beforeEach(() => {
      render(
        <TaskItem
          task={activeTask}
          isEditing={false}
          onToggleDone={mockHandlers.onToggleDone}
          onStartEdit={mockHandlers.onStartEdit}
          onSaveEdit={mockHandlers.onSaveEdit}
          onDelete={mockHandlers.onDelete}
        />
      );
    });

    it('Then title renders with normal styling (no strikethrough)', () => {
      const title = screen.getByText('Buy milk');
      expect(title).toHaveStyle({ textDecorationLine: 'none' });
    });

    it('Then checkbox visible and unchecked', () => {
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).not.toHaveProperty('checked', true);
    });

    describe('When user taps checkbox', () => {
      beforeEach(async () => {
        const user = userEvent.setup();
        await user.press(screen.getByRole('checkbox'));
      });

      it('Then onToggleDone called with task id', () => {
        expect(mockHandlers.onToggleDone).toHaveBeenCalledWith('task-1');
        expect(mockHandlers.onToggleDone).toHaveBeenCalledTimes(1);
      });
    });

    describe('When user taps row', () => {
      beforeEach(async () => {
        const user = userEvent.setup();
        await user.press(screen.getByRole('button', { name: /Edit/ }));
      });

      it('Then onStartEdit called with task id', () => {
        expect(mockHandlers.onStartEdit).toHaveBeenCalledWith('task-1');
      });
    });
  });

  describe('Given a completed task', () => {
    beforeEach(() => {
      render(
        <TaskItem
          task={doneTask}
          isEditing={false}
          onToggleDone={mockHandlers.onToggleDone}
          onStartEdit={mockHandlers.onStartEdit}
          onSaveEdit={mockHandlers.onSaveEdit}
          onDelete={mockHandlers.onDelete}
        />
      );
    });

    it('Then title shows strikethrough and reduced opacity', () => {
      const title = screen.getByText('Review code');
      expect(title).toHaveStyle({
        textDecorationLine: 'line-through',
        opacity: 0.5,
      });
    });
  });

  describe('Given task is in edit mode', () => {
    beforeEach(() => {
      render(
        <TaskItem
          task={activeTask}
          isEditing={true}
          onToggleDone={mockHandlers.onToggleDone}
          onStartEdit={mockHandlers.onStartEdit}
          onSaveEdit={mockHandlers.onSaveEdit}
          onDelete={mockHandlers.onDelete}
        />
      );
    });

    it('Then edit input visible and focused', () => {
      expect(screen.getByDisplayValue('Buy milk')).toHaveFocus();
    });

    it('Then save and delete buttons visible', () => {
      expect(screen.getByLabelText('Save task')).toBeInTheDocument();
      expect(screen.getByLabelText('Delete task')).toBeInTheDocument();
    });

    describe('When user submits edited title via save button', () => {
      beforeEach(async () => {
        const user = userEvent.setup();
        const input = screen.getByDisplayValue('Buy milk');
        await user.clear(input);
        await user.type(input, 'Buy almond milk');
        await user.press(screen.getByLabelText('Save task'));
      });

      it('Then onSaveEdit called with id and new title', () => {
        expect(mockHandlers.onSaveEdit).toHaveBeenCalledWith('task-1', 'Buy almond milk');
      });
    });

    describe('When user deletes task', () => {
      beforeEach(async () => {
        const user = userEvent.setup();
        await user.press(screen.getByLabelText('Delete task'));
      });

      it('Then onDelete called with task id', () => {
        expect(mockHandlers.onDelete).toHaveBeenCalledWith('task-1');
        expect(mockHandlers.onDelete).toHaveBeenCalledTimes(1);
      });
    });
  });
});
```

**Success Criteria:**
- All 6-8 unit tests pass
- Tests verify component rendering in all states
- Tests verify all callbacks are called with correct arguments
- Tests don't depend on implementation details (no state inspection)

---

## Phase 4: Test Utilities (Optional but Helpful)

**File:** `__tests__/utils/task-mocks.ts`  
**Purpose:** Reusable mock data and setup functions for Tasks tests  
**Benefit:** Reduces boilerplate, keeps fixtures consistent

### Template

```typescript
// __tests__/utils/task-mocks.ts

import type { Task } from '../../src/types';

export const MOCK_TASKS = {
  active: {
    id: 'task-1',
    title: 'Buy milk',
    done: false,
    created_at: '2024-01-10T10:00:00Z',
    createdAt: 1000,
  } as Task & { createdAt: number },

  done: {
    id: 'task-2',
    title: 'Review code',
    done: true,
    created_at: '2024-01-09T15:00:00Z',
    createdAt: 2000,
  } as Task & { createdAt: number },

  newer: {
    id: 'task-3',
    title: 'Write tests',
    done: false,
    created_at: '2024-01-10T12:00:00Z',
    createdAt: 1500,
  } as Task & { createdAt: number },
};

export const setupMockDb = (mockDb: any) => {
  mockDb.useQuery.mockReturnValue({
    isLoading: false,
    data: { tasks: [MOCK_TASKS.active, MOCK_TASKS.done, MOCK_TASKS.newer] },
  });
  mockDb.transact.mockImplementation(() => {});
};
```

### Implementation Checklist

- [ ] Create `__tests__/utils/task-mocks.ts`
- [ ] Export task fixtures
- [ ] Export helper functions (setupMockDb, etc.)
- [ ] Import and use in both feature contract and unit tests

---

## Execution Order & Dependencies

### ✅ Phase 1: Feature Contract (Tier 2)
**Status:** Ready to start  
**Blocker:** None  
**Deliverable:** `__tests__/features/tasks/tasks.feature.test.ts` (5-8 tests passing)

### ✅ Phase 2: TaskListScreen Unit Tests (Tier 3)
**Status:** Can start after Phase 1 OR parallel (independent)  
**Blocker:** Jest setup (already done)  
**Deliverable:** `src/features/tasks/components/TaskListScreen.test.tsx` (8-10 tests passing)

### ✅ Phase 3: TaskItem Unit Tests (Tier 3)
**Status:** Can start after Phase 1 OR parallel (independent)  
**Blocker:** Jest setup (already done)  
**Deliverable:** `src/features/tasks/components/TaskItem.test.tsx` (6-8 tests passing)

### ⏸ Phase 4: Test Utilities (Optional)
**Status:** Can do anytime  
**Blocker:** None  
**Deliverable:** `__tests__/utils/task-mocks.ts` (reduces test boilerplate)

**Recommended execution:** Do Phases 1-3 sequentially to catch issues early. Phase 4 is nice-to-have for future refactoring.

---

## Success Criteria

### Phase 1 Complete ✓
```
npm test -- --testPathPatterns="tasks.feature.test"
✓ 5-8 tests passing
✓ All feature workflows verified
✓ Integration tests read like feature spec
```

### Phase 2 Complete ✓
```
npm test -- --testPathPatterns="TaskListScreen.test"
✓ 8-10 tests passing
✓ ~85% component coverage
✓ Edge cases covered
```

### Phase 3 Complete ✓
```
npm test -- --testPathPatterns="TaskItem.test"
✓ 6-8 tests passing
✓ ~85% component coverage
✓ All callbacks verified
```

### All Phases Complete ✓
```
npm test -- --testPathPatterns="tasks"
✓ 19-26 tests passing (5-8 + 8-10 + 6-8)
✓ ~85%+ coverage on TaskListScreen and TaskItem
✓ Feature contract validates all CRUD operations
✓ Unit tests catch regressions on components
```

---

## Key Patterns to Follow

### Do's ✅
- Use `Given-When-Then` nested describe blocks
- Mock **only** InstantDB (db.useQuery, db.transact, id)
- Use `userEvent` (not fireEvent) for interactions
- Test **behavior** (what users see/do), not implementation
- One assertion per test (or one behavior)
- Use `screen.getByText`, `screen.getByRole` (user-focused queries)
- Use `findBy`/`waitFor` for async (if needed)

### Don'ts ❌
- Don't mock components (test real component behavior)
- Don't test internal state (test rendered output)
- Don't use `fireEvent` (use `userEvent`)
- Don't create brittle tests (avoid `data-testid` overuse)
- Don't write tests that depend on execution order
- Don't mock child components (test integration)

---

## File Checklist

### Create
- [ ] `__tests__/features/tasks/` (directory)
- [ ] `__tests__/features/tasks/tasks.feature.test.ts`
- [ ] `src/features/tasks/components/TaskListScreen.test.tsx`
- [ ] `src/features/tasks/components/TaskItem.test.tsx`
- [ ] `__tests__/utils/task-mocks.ts` (optional)

### Verify
- [ ] Jest setup.js already mocks InstantDB ✓
- [ ] Component types exported correctly
- [ ] Test command works: `npm test -- --testPathPatterns="tasks"`

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Feature contract too broad | Keep to 5-8 tests; one per workflow. Reference TASK_TESTS.md strictly. |
| Duplicate coverage | Feature contract tests workflows; unit tests edge cases. |
| Flaky async tests | Use `userEvent.setup()` (handles async automatically). Avoid raw timeouts. |
| Component changes break tests | That's intentional! Tests catch regressions. Update tests + component together. |
| Coverage% doesn't hit 85% | Add more edge case unit tests (long titles, rapid clicks, etc.). Feature contract covers happy paths. |

---

## Related Documents

- [TASK_TESTS.md](TASK_TESTS.md) - Detailed test specifications
- [TEST_STRUCTURE_GUIDE.md](TEST_STRUCTURE_GUIDE.md) - Given-When-Then pattern examples
- [TEST_ARCHITECTURE.md](TEST_ARCHITECTURE.md) - 4-tier model explanation
- [LoginScreen.test.tsx](src/features/auth/components/LoginScreen.test.tsx) - Reference unit test
- [useZodForm.test.ts](src/features/shared/form/useZodForm.test.ts) - Reference hook test
