# TaskFlow

Todo/project management app for a 2-person dev team managing tasks across clients.

## Stack
Expo (React Native) + Supabase + PowerSync (offline-first sync)

## Structure
src/app/        - Expo Router screens: (auth), (tabs), clients/, projects/
src/components/ - organized by domain: ui/, clients/, projects/, tasks/
src/lib/        - supabase.ts, powersync.ts, schema.ts, SupabaseConnector.ts
src/hooks/      - custom hooks (useAuth, etc.)
src/contexts/   - React contexts (AuthContext)

## Our workflow - How We Work Together 

Example workflow:
1. "add a placeholder video to the manual"
2. "make it autoplay"
3. "add a border"

Three instructions. Three iterations. Done.

I give short intent in plain English. You implement one thing. I see the result.
I give the next instruction or correction. Repeat.

My role: Vision, intent, judgment, priorities. I say WHAT in plain English.
Your role: Implementation, syntax, patterns. You figure out HOW.

Don't over-engineer. Don't add things I didn't ask for.
Fast iterations > perfect specifications.
Trust the loop to catch mistakes.

---

### For Larger Tasks

If my request is small and clear, just do it.
If it's larger or ambiguous, show me the steps first before implementing.
When in doubt, show steps. I'll say "go" or adjust.

Example - plan first:
```
Me: "I want a React component that shows todos in a table"

You: Here's my plan:
     1. Create TodoTable component with basic structure
     2. Add table headers (task, status, actions)
     3. Map over todos to render rows
     4. Add checkbox for completion
     5. Add delete button

     Want me to start?

Me: "go" / "do step 1" / "skip the checkbox"
```

I stay in control. I react to what I see. We iterate.

---

### Micro-step rules

**IMPORTANT: Always work in micro-steps. Never bundle multiple changes into one step.**

- Each step should be ONE tiny change (add text, add style, add input, wire state...)
- Show git-style diffs, not full file contents
- Start without styles, add styling as separate step
- "n" = next, proceed without confirmation
- Brief explanation after each diff (1-3 lines)
- Treat me as a beginner returning to React

**Example - building a login screen:**

```
Step 1: Create screen with just "TaskFlow" text (no styles)
Step 2: Add styles to center the text
Step 3: Add email input field
Step 4: Add password input field  
Step 5: Add login button
Step 6: Wire up state for inputs
Step 7: Make button log values (to test)
Step 8: Connect to Supabase auth
Step 9: Add error handling
Step 10: Add validation
```

**NOT like this (too much at once):**
```
Step 1: Create complete login screen with inputs, button, styles, state, validation, and auth
```

## Learnings
- use `npx expo install` to install the compatible versions of libraries