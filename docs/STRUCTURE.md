# Codebase Structure & Conventions

This document defines how code and tests are organized to optimize for LLM-agent collaboration and fast iteration.

---

## Guiding Principles

1. **Predictable patterns** — Every entity (Clients, Projects, Tasks) follows the same structure
2. **Colocated tests** — Component/unit tests live next to their source files
3. **Copy-and-modify workflow** — LLMs can copy an existing feature and adapt it
4. **Thin route files** — `src/app/` delegates to feature screens; logic lives in features

---

## Directory Structure

```
src/
  app/                          # Expo Router - thin route entrypoints only
    (auth)/
      login.tsx                 # delegates to feature components
      register.tsx
      password-reset-request.tsx
      password-reset-confirm.tsx
    (tabs)/
      index.tsx
      clients.tsx
      projects.tsx
      tasks.tsx
    clients/
      [id].tsx
    projects/
      [id].tsx
    _layout.tsx

  features/                     # Domain logic lives here
    shared/
      form/
        useZodForm.ts           # shared react-hook-form + zod helper
    auth/
      forms/
        loginForm.ts
        loginForm.test.ts
        registerForm.ts
        registerForm.test.ts
    clients/
      api/
        clientsRepository.ts
        clientsRepository.test.ts
      components/
        ClientsScreen.tsx
        ClientsScreen.test.tsx
        ClientForm.tsx
        ClientForm.test.tsx
        ClientListItem.tsx
      hooks/
        useClientsQuery.ts
        useClientsQuery.test.ts
        useClientMutations.ts
        useClientMutations.test.ts
      schemas/
        clientSchemas.ts
    projects/
      ...                       # same structure as clients
    tasks/
      ...                       # same structure as clients

  components/
    ui/                         # Reusable UI primitives
      Button.tsx
      Card.tsx
      ScreenContainer.tsx
      EntityList.tsx
    CustomTextInput.tsx

  contexts/
    AuthContext.tsx

  lib/
    supabase.ts
    powersync.ts
    schema.ts
    SupabaseConnector.ts

  types/
    index.ts                    # Client, Project, Task, TeamMember

__tests__/                      # Cross-cutting tests only
  contracts/                    # System invariants (human-owned)
    auth-routing.contract.test.tsx
    auth-lifecycle.contract.test.tsx
  smoke/                        # App-level sanity checks (optional)
  utils/                        # Shared test utilities
    auth-mocks.ts
    form-helpers.ts
    router-mocks.ts
    render-helpers.ts
```

---

## Feature Module Pattern

Each entity (Clients, Projects, Tasks) follows this repeatable structure:

### Schemas (`features/<entity>/schemas/`)

Zod schemas for validation:

```ts
// features/clients/schemas/clientSchemas.ts
import { z } from 'zod';

export const clientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  color: z.string().min(1, 'Color is required'),
});

export type ClientFormValues = z.infer<typeof clientSchema>;
```

### Repository (`features/<entity>/api/`)

Data access layer — screens never talk to Supabase/PowerSync directly:

```ts
// features/clients/api/clientsRepository.ts
import type { Client } from '../../../types';

export async function listClients(): Promise<Client[]> { ... }
export async function getClientById(id: string): Promise<Client> { ... }
export async function createClient(input: ClientFormValues): Promise<Client> { ... }
export async function updateClient(id: string, input: ClientFormValues): Promise<Client> { ... }
export async function deleteClient(id: string): Promise<void> { ... }
```

### Hooks (`features/<entity>/hooks/`)

Query and mutation hooks that wrap the repository:

```ts
// features/clients/hooks/useClientsQuery.ts
export function useClientsQuery() { ... }

// features/clients/hooks/useClientMutations.ts
export function useClientMutations() {
  return { createClient, updateClient, deleteClient };
}
```

### Components (`features/<entity>/components/`)

Screen and form components with colocated tests:

```
ClientsScreen.tsx
ClientsScreen.test.tsx
ClientForm.tsx
ClientForm.test.tsx
```

---

## Shared Form Pattern

All forms use a common helper to reduce boilerplate:

```ts
// features/shared/form/useZodForm.ts
import { useForm, UseFormProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZodSchema, TypeOf } from 'zod';

export function useZodForm<S extends ZodSchema>(
  schema: S,
  options?: Omit<UseFormProps<TypeOf<S>>, 'resolver'>
) {
  return useForm<TypeOf<S>>({
    resolver: zodResolver(schema),
    ...options,
  });
}
```

Usage in feature forms:

```ts
// features/clients/forms/clientForm.ts
import { clientSchema } from '../schemas/clientSchemas';
import { useZodForm } from '../../shared/form/useZodForm';

export function useClientForm(defaultValues?: Partial<ClientFormValues>) {
  return useZodForm(clientSchema, { defaultValues });
}
```

---

## Test Organization

### Colocated Tests (Feature-Specific)

Tests for feature code live next to the source file:

| Source | Test |
|--------|------|
| `features/clients/components/ClientForm.tsx` | `features/clients/components/ClientForm.test.tsx` |
| `features/clients/hooks/useClientsQuery.ts` | `features/clients/hooks/useClientsQuery.test.ts` |
| `features/clients/api/clientsRepository.ts` | `features/clients/api/clientsRepository.test.ts` |

### Separate Tests (Cross-Cutting)

System-level tests remain in `__tests__/`:

| Type | Location | Purpose |
|------|----------|---------|
| Contracts | `__tests__/contracts/` | System invariants, human-reviewed |
| Smoke | `__tests__/smoke/` | App-level sanity checks |
| Utilities | `__tests__/utils/` | Shared mocks and helpers |

### Test Utilities

Always use shared utilities instead of reimplementing mocks:

```ts
// __tests__/utils/router-mocks.ts
export function mockRouter(overrides = {}) { ... }
export function mockSegments(segments: string[]) { ... }

// __tests__/utils/render-helpers.ts
export function renderWithProviders(ui: React.ReactElement) { ... }
```

---

## Route Files

Route files in `src/app/` should be thin — they only wire up navigation:

```tsx
// src/app/(tabs)/clients.tsx
import { ClientsScreen } from '../../features/clients/components/ClientsScreen';

export default function ClientsRoute() {
  return <ClientsScreen />;
}
```

---

## Adding a New Entity Checklist

When adding Clients, Projects, or Tasks, create these files:

- [ ] `features/<entity>/schemas/<entity>Schemas.ts` — Zod validation schemas
- [ ] `features/<entity>/api/<entity>Repository.ts` — CRUD data access
- [ ] `features/<entity>/api/<entity>Repository.test.ts` — Repository tests
- [ ] `features/<entity>/hooks/use<Entity>Query.ts` — Query hook
- [ ] `features/<entity>/hooks/use<Entity>Mutations.ts` — Mutation hooks
- [ ] `features/<entity>/components/<Entity>Screen.tsx` — List screen
- [ ] `features/<entity>/components/<Entity>Screen.test.tsx` — Screen tests
- [ ] `features/<entity>/components/<Entity>Form.tsx` — Create/edit form
- [ ] `features/<entity>/components/<Entity>Form.test.tsx` — Form tests
- [ ] `src/app/(tabs)/<entity>.tsx` — Tab route (thin)
- [ ] `src/app/<entity>/[id].tsx` — Detail route (thin)

---

## Contract Test Rules

Contract tests encode system invariants. LLMs follow these rules:

1. **MAY** add new rows to `test.each` matrices when adding legitimate new states
2. **SHOULD NOT** modify or delete existing rows without explicit human instruction
3. **MUST** get human review before creating a new contract test file

Add this comment at the top of contract tests:

```ts
/**
 * CONTRACT TEST
 * - Do NOT change existing rows without human review.
 * - To support new routes/states, ADD rows; don't delete or edit old ones.
 * - Keep this table exhaustive for the defined dimensions.
 */
```

---

## Data Access Rule

**All reads and writes go through `<entity>Repository`.**

- Screens and components never import from `lib/supabase.ts` or `lib/powersync.ts` directly
- PowerSync-specific details (queries, sync state) live only in repositories and `lib/`
- This allows clean mocking in tests and future changes to the data layer

---

## Jest Configuration

To support colocated tests, Jest should match:

```js
testMatch: [
  '**/*.test.ts?(x)',
  '**/__tests__/**/*.test.ts?(x)'
]
```

Exclude from builds:

```js
// In metro.config.js or equivalent
resolver: {
  blockList: [/\.test\.(ts|tsx)$/]
}
```
