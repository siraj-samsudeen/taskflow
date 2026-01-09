# TaskFlow

Todo/project management app for a 2-person dev team managing tasks across clients.

## Stack
Expo (React Native) + Supabase + PowerSync (offline-first sync)

## Structure

See [docs/STRUCTURE.md](docs/STRUCTURE.md) for full details.

```
src/app/           - Expo Router (thin route files only)
src/features/      - Domain logic: auth/, clients/, projects/, tasks/
src/components/ui/ - Shared UI primitives
src/contexts/      - React contexts (AuthContext)
src/lib/           - supabase.ts, powersync.ts, schema.ts
src/types/         - TypeScript types

__tests__/contracts/ - System invariants (human-owned)
__tests__/utils/     - Shared test utilities
```

### Key Patterns

- **Feature modules**: Each entity has `schemas/`, `api/`, `hooks/`, `components/`
- **Colocated tests**: `ClientForm.tsx` → `ClientForm.test.tsx` (same folder)
- **Repository layer**: Screens never import supabase/powersync directly
- **Thin routes**: `src/app/` delegates to `src/features/` components

### Adding a New Entity

- [ ] `features/<entity>/schemas/<entity>Schemas.ts`
- [ ] `features/<entity>/api/<entity>Repository.ts` + test
- [ ] `features/<entity>/hooks/use<Entity>Query.ts`
- [ ] `features/<entity>/hooks/use<Entity>Mutations.ts`
- [ ] `features/<entity>/components/<Entity>Screen.tsx` + test
- [ ] `features/<entity>/components/<Entity>Form.tsx` + test
- [ ] `src/app/(tabs)/<entity>.tsx` (thin route)

## Commands
- Run tests: `npm test -- --testPathPatterns="pattern"` (note: plural `--testPathPatterns`, not `--testPathPattern`)

## Learnings
- use `npx expo install` to install the compatible versions of libraries
- Test behavior, not presence : Don't write separate "renders X" tests when a behavioral test already exercises that element (e.g., pressing a button implicitly verifies it exists)