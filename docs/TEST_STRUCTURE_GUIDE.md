# Community Best Practices for Test Organization

Based on research from React Testing Library, Jest docs, and industry articles, here's what the testing community recommends:

## The Consensus: Hybrid Approach

**The community strongly favors combining BDD (Given/When/Then) with nested describe blocks.**

### Most Recommended Pattern: Given-When-Then with Nested Describes

This pattern appeared in multiple authoritative sources (Jest community articles, React Testing Library best practices):

```typescript
describe('MyComponent', () => {
  describe('Given the form is filled with valid data', () => {
    beforeEach(() => {
      // Setup: render component, fill form
    });

    describe('When the user clicks submit', () => {
      beforeEach(() => {
        // Act: click submit
      });

      it('Then the API should be called', () => {
        expect(mockApi).toHaveBeenCalled();
      });

      it('Then a success message should appear', () => {
        expect(screen.getByText('Success')).toBeInTheDocument();
      });
    });
  });

  describe('Given the form is filled with invalid data', () => {
    beforeEach(() => {
      // Different setup
    });

    describe('When the user clicks submit', () => {
      beforeEach(() => {
        // Click submit
      });

      it('Then validation error should show', () => {
        expect(screen.getByText('Invalid')).toBeInTheDocument();
      });
    });
  });
});
```

### Why This Pattern Wins

1. **Readable output** - Test results read like documentation:
   ```
   MyComponent
     Given the form is filled with valid data
       When the user clicks submit
         ✓ Then the API should be called
         ✓ Then a success message should appear
     Given the form is filled with invalid data
       When the user clicks submit
         ✓ Then validation error should show
   ```

2. **Organized by user workflow** - Gives you context about what's being tested

3. **Test isolation** - Each Given sets up clean state via `beforeEach`

4. **Reusable setup** - Multiple "Then" tests share the same Given/When setup

5. **Easy to add variants** - Want to test different user behavior? Add another When block

6. **Better debugging** - Failed test tells the full story: what was the setup, what happened, what should have happened

---

## Key Principles from Community Standards

### 1. **Test Behavior, Not Implementation**
- Test what users see and do, not internal state
- Use `screen.getByRole`, `screen.getByText` (user-focused) instead of `data-testid` when possible
- Avoid testing component state directly

### 2. **Arrange-Act-Assert (AAA) within Each Test**
```typescript
it('Then the API should be called', () => {
  // Arrange (Given) - handled by outer describe's beforeEach
  // Act (When) - handled by parent describe's beforeEach
  
  // Assert (Then) - done in this test
  expect(mockApi).toHaveBeenCalledWith(expectedArgs);
});
```

### 3. **One Assertion Per Test (Preferably)**
- Each `it` block tests one specific outcome
- If you have multiple assertions, they should all verify the **same behavior**
- ✅ Good: Multiple assertions on the same result
- ❌ Bad: One test checking 5 different features

### 4. **Meaningful Test Names**
- Test name + file name + assertion = should tell the full story
- From Jest community: "Name your tests so well that others can diagnose failures from the name alone"
- Example failure message should be self-explanatory:
  ```
  TaskListScreen > When user adds a task > Then input field should be cleared
    Expected: ''
    Received: 'old task title'
  ```

### 5. **Use beforeEach/afterEach for Setup & Cleanup**
- `beforeEach` runs before each test in that describe block (scoped)
- `beforeAll` runs once before all tests (less common for component tests)
- Keeps tests from depending on execution order
- Prevents test pollution

### 6. **Mock Only Dependencies, Not Everything**
- Mock external APIs, DB, heavy modules
- Don't mock the component itself
- Mock child components only if necessary for isolation
- Real user behavior matters more than internal details

### 7. **Use userEvent over fireEvent**
- `userEvent` simulates real user interactions (keyboard, mouse, etc.)
- `fireEvent` fires raw DOM events
- Community consensus: `userEvent` is better for testing real-world scenarios

### 8. **Use findBy/waitFor for Async**
- `findBy*` queries return a promise, perfect for async rendering
- `waitFor` for waiting on state changes or complex async logic
- Avoids flaky tests from timing issues

---

## How This Maps to Your Task Tests

### TaskListScreen Structure

```typescript
describe('TaskListScreen', () => {
  describe('Given tasks are loaded from the database', () => {
    beforeEach(() => {
      // Setup: mock db.useQuery with task data
      render(<TaskListScreen />);
    });

    describe('When user is on the active tab', () => {
      beforeEach(() => {
        // Switch to active tab
        userEvent.press(screen.getByRole('tab', { name: /Active/ }));
      });

      it('Then only incomplete tasks are displayed', () => {
        expect(screen.getByText('Active task 1')).toBeInTheDocument();
        expect(screen.queryByText('Completed task')).not.toBeInTheDocument();
      });

      it('Then task count is correct', () => {
        expect(screen.getByText(/Active \(3\)/)).toBeInTheDocument();
      });
    });

    describe('When user adds a task', () => {
      beforeEach(async () => {
        const input = screen.getByPlaceholderText('Add a new task...');
        await userEvent.type(input, 'New task');
        await userEvent.press(screen.getByLabelText('Add task'));
      });

      it('Then task appears in the list', () => {
        expect(screen.getByText('New task')).toBeInTheDocument();
      });

      it('Then input field is cleared', () => {
        expect(screen.getByPlaceholderText('Add a new task...')).toHaveValue('');
      });

      it('Then db.transact is called with correct shape', () => {
        expect(db.transact).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'New task',
            done: false,
            priority: 'medium',
          })
        );
      });
    });
  });

  describe('Given the input is empty', () => {
    beforeEach(() => {
      render(<TaskListScreen />);
    });

    it('Then the add button is disabled', () => {
      expect(screen.getByLabelText('Add task')).toBeDisabled();
    });
  });
});
```

### TaskItem Structure

```typescript
describe('TaskItem', () => {
  describe('Given an incomplete task is rendered', () => {
    beforeEach(() => {
      render(<TaskItem task={activeTask} {...handlers} />);
    });

    it('Then title displays with normal styling', () => {
      expect(screen.getByText('Task title')).toHaveStyle('textDecorationLine: none');
    });

    describe('When user taps the checkbox', () => {
      beforeEach(() => {
        userEvent.press(screen.getByRole('checkbox'));
      });

      it('Then onToggleDone callback is called with task id', () => {
        expect(onToggleDone).toHaveBeenCalledWith('task-1');
      });
    });

    describe('When user taps the task row', () => {
      beforeEach(() => {
        userEvent.press(screen.getByRole('button', { name: /Edit/ }));
      });

      it('Then onStartEdit is called with task id', () => {
        expect(onStartEdit).toHaveBeenCalledWith('task-1');
      });
    });
  });

  describe('Given a task is in edit mode', () => {
    beforeEach(() => {
      render(<TaskItem task={activeTask} isEditing={true} {...handlers} />);
    });

    it('Then edit input is focused with original title', () => {
      expect(screen.getByDisplayValue('Task title')).toHaveFocus();
    });

    describe('When user submits the edit', () => {
      beforeEach(async () => {
        const input = screen.getByDisplayValue('Task title');
        await userEvent.clear(input);
        await userEvent.type(input, 'Updated task');
        await userEvent.press(screen.getByLabelText('Save task'));
      });

      it('Then onSaveEdit is called with id and new title', () => {
        expect(onSaveEdit).toHaveBeenCalledWith('task-1', 'Updated task');
      });
    });
  });

  describe('Given a completed task', () => {
    beforeEach(() => {
      render(<TaskItem task={doneTask} {...handlers} />);
    });

    it('Then title shows strikethrough and reduced opacity', () => {
      const title = screen.getByText('Completed task');
      expect(title).toHaveStyle('textDecorationLine: line-through');
      expect(title).toHaveStyle('opacity: 0.5');
    });
  });
});
```

---

## Implementation Rules

1. **Naming Convention**: Always use Given-When-Then in describe blocks
2. **Assertion Style**: Use `it('Then X should happen')` for actual assertions
3. **Setup Scope**: Use `beforeEach` inside describe blocks for isolated setup
4. **One action per When**: Don't nest multiple actions
5. **Multiple outcomes per When**: OK to have multiple Then blocks
6. **No test dependencies**: Each test should work in isolation

---

## Summary for Your Codebase

**Use this structure:**
```
describe('ComponentName', () => {
  describe('Given <initial state/setup>', () => {
    beforeEach(() => { /* setup */ });
    
    describe('When <user action>', () => {
      beforeEach(() => { /* action */ });
      
      it('Then <expected outcome 1>', () => { /* assert */ });
      it('Then <expected outcome 2>', () => { /* assert */ });
    });
  });
  
  describe('Given <different setup>', () => {
    // ...
  });
});
```

This gives you:
- ✅ Clear user story context
- ✅ Organized by behavior
- ✅ Easy to debug failures
- ✅ Readable test output
- ✅ Reusable setup code
- ✅ Follows React Testing Library best practices
- ✅ Matches what your LoginScreen.test.tsx and useZodForm.test.ts should be doing

---

## Additional Community Recommendations

### Always Test User Interactions, Not Implementation Details
❌ Don't test:
- Internal state changes
- Component lifecycle hooks
- Props validation directly
- Redux action dispatches

✅ Do test:
- Rendered output
- User interactions (clicks, typing)
- Async behavior from user perspective
- Error messages and feedback

### Code Coverage Goals
- Aim for 80%+ coverage on business logic
- 70%+ on components is reasonable
- Don't chase 100%—diminishing returns
- Focus on critical paths and edge cases

### Async Testing Pattern
```typescript
describe('When user clicks submit', () => {
  beforeEach(async () => {
    await userEvent.press(screen.getByText('Submit'));
    // Auto-waits for DOM updates
  });

  it('Then loading message should appear', () => {
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('Then success message appears after API responds', async () => {
    await screen.findByText('Success'); // Waits for it
  });
});
```

---

## References
- [React Testing Library Best Practices](https://testing-library.com/)
- [Jest Official Docs - Setup and Teardown](https://jestjs.io/docs/setup-teardown)
- ["Jest a minute" Article](https://rtbell.dev/blog/testing/jest-a-minute-a-better-way-to-structure-your-unit-tests) - Industry best practices
- [React Functional Testing Best Practices](https://daily.dev/blog/react-functional-testing-best-practices)
- Community consensus from Stack Overflow, DEV, and Reddit /r/reactjs
