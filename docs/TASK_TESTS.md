# Task Feature Tests - Two-Tier Testing Strategy

## Overview

This document defines the testing contract for Tasks CRUD feature. Tests are organized in two tiers:

1. **Integration Tests** (5-8 tests) - Feature specification. Tests the complete flow from UI → hooks → API → database. Component-agnostic. This is the LLM contract.
2. **Unit Tests** (15+ tests) - Implementation safety. Tests component-specific edge cases, rendering, callbacks, and state management. Helps prevent regressions.

---

## INTEGRATION TESTS: Tasks Feature Contract

**Location:** `__tests__/features/tasks/tasks.feature.test.ts`

**Purpose:** Verify the Tasks CRUD feature works end-to-end. These tests verify:
- Data persists to the database
- UI reflects database state
- Filters work correctly
- Complete user journeys work

**Note:** These tests verify behavior through the UI but don't care which component renders it. They test the feature, not the components.

### Test Scenarios

Tasks Feature
├── Data Loading & Display
│   └── ✓ When screen loads → displays all tasks from database (empty, single, multiple)
│
├── Adding a New Task
│   ├── User enters "Buy milk" and submits
│   │   ├── ✓ Task is saved to database with: title, description:"", done:false, priority:"medium", timestamps
│   │   ├── ✓ Input field clears
│   │   ├── ✓ New task appears at top of list (newest first)
│   │   ├── ✓ Active tab count increments
│   │   └── ✓ Works via button press OR return key (same result)
│   │
│   └── User enters whitespace only
│       └── ✓ Task is NOT saved, input remains, nothing changes
│
├── Filtering & Navigation
│   ├── User views "active" tab
│   │   ├── ✓ Shows only incomplete tasks
│   │   ├── ✓ Shows correct count
│   │   └── ✓ Sorted newest first
│   │
│   ├── User views "done" tab
│   │   ├── ✓ Shows only completed tasks
│   │   └── ✓ Shows correct count
│   │
│   └── User views "all" tab
│       ├── ✓ Shows all tasks (active + done)
│       └── ✓ Sorted newest first
│
├── Toggling Task Status
│   ├── User checks a task
│   │   ├── ✓ Task marked done in database
│   │   ├── ✓ Task moves from active → done tab
│   │   ├── ✓ Active count decrements
│   │   └── ✓ Done count increments
│   │
│   └── User unchecks a task
│       ├── ✓ Task marked active in database
│       ├── ✓ Task moves from done → active tab
│       └── ✓ Counts update
│
├── Editing a Task
│   ├── User taps task row
│   │   └── ✓ Task enters edit mode (shows input, save/delete buttons)
│   │
│   ├── User edits "Buy milk" → "Buy almond milk" and saves
│   │   ├── ✓ New title saved to database
│   │   ├── ✓ updatedAt timestamp recorded
│   │   ├── ✓ Task returns to normal display
│   │   └── ✓ Works via save button, return key, or blur (same result)
│   │
│   └── User edits to whitespace only
│       ├── ✓ Edit rejected
│       ├── ✓ Original title preserved
│       └── ✓ Edit mode exits
│
├── Deleting a Task
│   ├── User taps task row → enters edit mode
│   ├── User presses delete button
│   │   ├── ✓ Task removed from database
│   │   ├── ✓ Task disappears from list
│   │   ├── ✓ Active/done count updates
│   │   └── ✓ Edit mode exits
│
└── Complete CRUD Journey (Optional - combines above)
    └── ✓ User adds task → filters it → toggles it → edits it → deletes it (all DB state correct)

**Total Integration Tests: 5-8**

---

## UNIT TESTS: Component Implementation Safety

**Location:** `src/features/tasks/components/TaskListScreen.test.tsx` + `src/features/tasks/components/TaskItem.test.tsx`

**Purpose:** Test component-specific behavior, edge cases, rendering, and callback contracts. Catch regressions when code changes.

### TaskListScreen Unit Tests

TaskListScreen Rendering
├── Given tasks are loading
│   └── ✓ Shows loading message
│
├── Given no tasks exist
│   ├── ✓ Shows empty state
│   ├── ✓ Still shows input and tabs
│   └── ✓ Active/done counts are 0
│
└── Given tasks loaded
    ├── ✓ Renders all tasks in FlatList
    ├── ✓ Renders tabs with correct counts
    └── ✓ Renders input form and add button

TaskListScreen Form Input Validation
├── Given input is empty
│   ├── ✓ Add button is disabled
│   └── ✓ Pressing disabled button does nothing
│
└── Given input has value
    └── ✓ Add button is enabled

TaskListScreen Tab Navigation
├── ✓ Tab state updates when pressed
├── ✓ Switching tabs doesn't clear form input
└── ✓ Switching tabs preserves edit mode

TaskListScreen Mutation Integration
├── When user adds task
│   ├── ✓ db.transact called with correct shape
│   └── ✓ Input clears after submission
│
├── When user toggles task
│   └── ✓ db.transact called with done flag + updatedAt
│
├── When user saves edited task
│   ├── ✓ db.transact called with new title + updatedAt
│   └── ✓ Only called once (deduplication of blur + submit)
│
└── When user deletes task
    └── ✓ db.transact called with delete operation

TaskListScreen Complex Interactions
├── Editing state persisted across tab switches
│   └── ✓ User in edit mode → switch tabs → switch back → still editing
│
└── Edit with whitespace rejected
    ├── ✓ Original title preserved
    ├── ✓ Edit mode exits
    └── ✓ No db.transact call

**Total TaskListScreen Unit Tests: 8-10**

---

### TaskItem Unit Tests

TaskItem Rendering - Incomplete Task
├── ✓ Title renders with normal color/weight
├── ✓ Checkbox visible and unchecked
├── ✓ No edit/delete buttons shown
└── ✓ Row has normal styling

TaskItem Rendering - Completed Task
├── ✓ Title shows strikethrough
├── ✓ Title has reduced opacity (0.5)
├── ✓ Checkbox visible and checked
└── ✓ Checkmark shows in checkbox

TaskItem Rendering - Edit Mode
├── ✓ Edit input visible and focused
├── ✓ Save and delete buttons visible
├── ✓ Checkbox hidden
├── ✓ Row has edit styling (blue border + light blue background)
└── ✓ Input prefilled with current title

TaskItem Rendering - Edge Cases
├── Long titles
│   ├── ✓ Title wraps correctly (respects flex)
│   └── ✓ Checkbox stays aligned left
│
├── Special characters
│   └── ✓ Render without escaping issues
│
└── Empty title (edge case in edit mode)
    └── ✓ Still renders as input (parent validates)

TaskItem Checkbox Interaction
├── Given incomplete task
│   ├── When user taps checkbox
│   │   ├── ✓ onToggleDone called with task.id
│   │   └── ✓ Called exactly once
│
└── Given completed task
    └── When user taps checkbox
        └── ✓ onToggleDone called with task.id

TaskItem Row Tap Interaction
├── Given normal mode
│   └── When user taps row
│       ├── ✓ onStartEdit called with task.id
│       └── ✓ Called exactly once
│
└── Given edit mode
    └── When user taps row
        ├── ✓ onStartEdit NOT called (already editing)
        └── ✓ Remains in edit mode

TaskItem Edit Mode Interactions
├── When user changes input text
│   ├── ✓ Input state updates locally
│   └── ✓ No callback fired yet
│
├── When user submits (save button)
│   └── ✓ onSaveEdit called with (id, newTitle)
│
├── When user submits (return key)
│   └── ✓ onSaveEdit called with (id, newTitle)
│
├── When user submits (blur)
│   └── ✓ onSaveEdit called with (id, newTitle)
│
├── When multiple save events fire simultaneously (blur + submit)
│   └── ✓ onSaveEdit called exactly once (deduplicated)
│
└── When user saves empty string
    └── ✓ onSaveEdit called with empty string (parent validates)

TaskItem Delete Interaction
├── When user taps delete button
│   ├── ✓ onDelete called with task.id
│   └── ✓ Called exactly once

TaskItem Optional Callbacks
├── Given onStartEdit is undefined
│   └── When user taps row
│       └── ✓ No error, nothing happens
│
└── Given onSaveEdit or onDelete undefined
    └── When user presses button
        └── ✓ No error, nothing happens

**Total TaskItem Unit Tests: 6-8**

---

## Test Data Fixtures

All tests use consistent fixtures:

```
activeTask = {
  id: 'task-1',
  title: 'Complete project',
  done: false,
  created_at: '2024-01-10T10:00:00Z'
}

doneTask = {
  id: 'task-2',
  title: 'Review code',
  done: true,
  created_at: '2024-01-09T15:00:00Z'
}

newerTask = {
  id: 'task-3',
  title: 'Write tests',
  done: false,
  created_at: '2024-01-10T12:00:00Z'
}
```

---

## Coverage Map

| Component | Type | Count | Coverage Target |
|-----------|------|-------|-----------------|
| TaskListScreen | Integration | 5-8 | Feature spec |
| TaskListScreen | Unit | 8-10 | 85%+ |
| TaskItem | Unit | 6-8 | 85%+ |
| **Total** | **Both** | **20-25** | **Confidence + Safety** |

---

## How to Use This Document

### For Product Manager (You):
- Review Integration Tests section → That's the contract with LLM
- Those 5-8 tests define "feature is done"

### For Prompting LLM:
"Write tests in this structure:
1. Integration tests in `__tests__/features/tasks/tasks.feature.test.ts` (5-8 tests)
   - These verify the feature works end-to-end
   - [Copy the integration test section above]

2. Unit tests in component files (8-16 tests)
   - These prevent regressions
   - [Copy the unit test sections above]

All tests must pass for this task to be complete."

### For Code Review:
- Integration tests fail? → Feature doesn't work
- Unit tests fail? → Regression or edge case bug
- Both pass? → Ship it

---

## Key Testing Principles

1. **Integration tests** = What (the feature requirement)
2. **Unit tests** = How (implementation quality)
3. **Mock only InstantDB**, don't mock components
4. **Use `userEvent` not `fireEvent`** for realistic interactions
5. **Test behavior, not implementation** (what users see/do)
6. **One assertion per test** (or one behavior with multiple assertions on same result)

---

## Next Steps

1. Create `__tests__/features/tasks/tasks.feature.test.ts` with integration scenarios
2. Create `src/features/tasks/components/TaskListScreen.test.tsx` with unit tests
3. Create `src/features/tasks/components/TaskItem.test.tsx` with unit tests
4. Run: `npm test -- --testPathPatterns="tasks"`
5. Verify coverage: Integration + Unit = 85%+
