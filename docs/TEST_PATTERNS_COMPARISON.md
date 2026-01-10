# Test Organization Frameworks for CRUD Operations

## Option 1: By CRUD Operation

```
TaskListScreen.test.tsx
├── CREATE
│   ├── renders add form
│   ├── submits valid task (happy path)
│   ├── rejects empty input
│   ├── trims whitespace
│   └── clears input after add
├── READ
│   ├── renders loading state
│   ├── renders task list from data
│   ├── handles empty list
│   └── sorts tasks by newest first
├── UPDATE
│   ├── toggles task done
│   ├── edits task title (happy path)
│   ├── rejects empty title
│   └── updates active/done tabs
└── DELETE
    ├── deletes task from database
    ├── removes from list immediately
    └── updates active count

TaskItem.test.tsx
├── CREATE: (N/A - TaskItem doesn't create)
├── READ
│   ├── renders active task (normal view)
│   ├── renders completed task (strikethrough)
│   ├── renders edit mode
│   └── handles long titles
├── UPDATE
│   ├── calls onStartEdit on row tap
│   ├── submits edit (button/key/blur)
│   ├── reverts on cancel
│   └── dedupes multiple saves
└── DELETE
    ├── calls onDelete on delete button
    └── exits edit mode
```

**Pros:**
- Immediately clear which operation is being tested
- Maps to database thinking (INSERT, SELECT, UPDATE, DELETE)
- Easy to ensure all CRUD operations are covered
- Good for data-heavy components

**Cons:**
- Splits up related user interactions (e.g., "edit and delete" is in different sections)
- Doesn't capture workflows (user journey across multiple operations)
- Can make it unclear how operations relate to each other
- Forces artificial grouping (some tests fit multiple categories)

---

## Option 2: By User Interaction Workflow

```
TaskListScreen.test.tsx
├── Adding a New Task
│   ├── user types and submits → task appears
│   ├── empty input → button disabled
│   ├── whitespace input → rejected
│   └── keyboard submit vs button press → same result
├── Managing Task Status
│   ├── user clicks checkbox → toggles done state
│   ├── task moves between active/done tabs
│   └── active count updates correctly
├── Filtering & Navigation
│   ├── clicking "active" tab → shows only incomplete
│   ├── clicking "done" tab → shows only complete
│   ├── clicking "all" tab → shows all tasks
│   └── tab counts update live
├── Editing a Task
│   ├── user taps row → enters edit mode
│   ├── user submits → saves to DB and exits edit
│   ├── empty title → rejected
│   └── user taps elsewhere → auto-saves
└── Deleting a Task
    ├── user enters edit mode
    ├── user clicks delete → removes from DB and list
    └── counts update

TaskItem.test.tsx
├── Initial Display
│   ├── active task → normal style
│   ├── completed task → strikethrough + opacity
│   └── long title → wraps correctly
├── User Marks Task Done
│   ├── user clicks checkbox → calls onToggleDone
│   └── visual state updates
├── User Enters Edit Mode
│   ├── user taps row → calls onStartEdit
│   ├── shows edit controls
│   └── autofocuses input
├── User Saves Edit
│   ├── submit button → calls onSaveEdit with new title
│   ├── return key → same
│   ├── blur → same
│   └── exits edit mode
└── User Deletes Task
    ├── delete button → calls onDelete
    └── exits edit mode
```

**Pros:**
- Tests read like user stories ("user clicks checkbox")
- Captures workflows naturally (related operations stay together)
- Easy to verify entire user journeys work
- Non-technical stakeholders can understand tests
- Closer to integration/E2E thinking

**Cons:**
- Can be verbose (many steps per test)
- Harder to isolate what failed (one test does many things)
- Different people might group interactions differently
- Edge cases get buried in workflow sections

---

## Option 3: By Test Concern Layer

```
TaskListScreen.test.tsx
├── Rendering (UI Output)
│   ├── renders loading state
│   ├── renders task list
│   ├── renders input form
│   ├── renders filter tabs
│   └── renders empty state
├── User Interactions (UI Input)
│   ├── add button press
│   ├── tab navigation
│   ├── text input changes
│   ├── checkbox presses
│   └── row taps to edit
├── Data Mutations (DB Calls)
│   ├── CREATE → calls db.transact with correct task shape
│   ├── UPDATE (toggle) → calls db.transact with updated done flag
│   ├── UPDATE (edit) → calls db.transact with new title
│   └── DELETE → calls db.transact delete
├── State & Filtering Logic
│   ├── filters active tasks correctly
│   ├── filters done tasks correctly
│   ├── sorts by newest first
│   └── counts update when tasks change
└── Edge Cases & Error Handling
    ├── empty/whitespace input validation
    ├── empty list handling
    ├── disabled button state
    └── edit with empty title rejection

TaskItem.test.tsx
├── Rendering (UI Output)
│   ├── renders task title
│   ├── renders checkbox
│   ├── shows strikethrough when done
│   ├── shows edit mode controls
│   └── shows loading skeletons (if applicable)
├── User Interactions (UI Input)
│   ├── checkbox press
│   ├── row press
│   ├── save button
│   ├── delete button
│   └── input blur/submit
├── Callback Verification (API Contract)
│   ├── onToggleDone(id)
│   ├── onStartEdit(id)
│   ├── onSaveEdit(id, title)
│   └── onDelete(id)
├── State Management
│   ├── edit text updates locally
│   ├── edit mode toggling
│   └── optional callback handling
└── Edge Cases
    ├── very long title wrapping
    ├── special characters rendering
    ├── undefined callbacks
    └── duplicate save prevention
```

**Pros:**
- Tests are focused and isolated (one concern per test)
- Easy to debug (exactly which layer failed)
- Aligns with testing pyramid (unit → integration → E2E)
- Reusable across different components (same framework applies)
- Clear what each test is responsible for
- Easy to measure which layer needs work

**Cons:**
- More test files/sections (more organization overhead)
- Requires understanding of test layers
- Callback tests can feel artificial if you're not used to that pattern
- Some tests might check the same thing in different layers
- Less obvious how tests relate to real user workflows

---

## Recommendation

**Use Option 3 (By Test Concern Layer)** because:
1. Matches your existing codebase structure (components → hooks → API → schemas)
2. Scales well as component complexity grows
3. Easier to maintain (find any broken layer quickly)
4. Follows React/testing-library best practices
5. Same framework applies to all future components

**Within each layer**, keep tests written as BDD (When/Then) for readability.

---

## Hybrid Approach (Best of Both Worlds)

Combine Options 2 and 3:

```
TaskListScreen.test.tsx
├── Workflow: Adding a Task
│   ├── [Rendering] form elements visible
│   ├── [Interaction] user types and submits
│   ├── [Mutation] calls db.transact with correct shape
│   └── [Logic] input clears, task appears
├── Workflow: Filtering Tasks
│   ├── [Rendering] tabs show counts
│   ├── [Interaction] tab clicks work
│   └── [Logic] correct tasks filtered/sorted
└── Workflow: Editing & Deleting
    ├── [Interaction] row tap enters edit
    ├── [Mutation] onSaveEdit calls transact
    └── [Mutation] onDelete removes task
```

This gives you:
- **Clear user stories** (what the user is doing)
- **Organized by layer** (what aspect of that story is tested)
- **Focused tests** (each test does one thing)
- **Traceable workflows** (easy to verify full flow works)
