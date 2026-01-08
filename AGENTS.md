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

## Commands
- Run tests: `npm test -- --testPathPatterns="pattern"` (note: plural `--testPathPatterns`, not `--testPathPattern`)

## Learnings
- use `npx expo install` to install the compatible versions of libraries
- Test behavior, not presence : Don't write separate "renders X" tests when a behavioral test already exercises that element (e.g., pressing a button implicitly verifies it exists)