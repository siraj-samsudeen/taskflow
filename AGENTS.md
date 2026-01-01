# TaskFlow - Project Conventions

## Overview
TaskFlow is a todo/project management app for a 2-person dev team to manage tasks across clients.

## Tech Stack
- **Frontend**: Expo (React Native) with React Native for Web
- **Backend**: Supabase (Postgres, Auth, Storage)
- **Sync**: PowerSync for offline-first sync (Postgres to SQLite)
- **Language**: TypeScript

## Commands
```bash
npm run start        # Start Expo dev server
npm run ios          # Run on iOS simulator
npm run android      # Run on Android emulator
npm run web          # Run in web browser
npm run lint         # Run ESLint
npm run lint:fix     # Run ESLint with auto-fix
npm run format       # Run Prettier
npm run typecheck    # Run TypeScript type checking
```

## Folder Structure
```
src/
├── app/              # Expo Router screens
│   ├── (auth)/       # Auth screens (login, register)
│   ├── (tabs)/       # Tab navigation screens
│   ├── clients/      # Client-related screens
│   └── projects/     # Project-related screens
├── components/       # React components
│   ├── ui/           # Reusable UI components
│   ├── clients/      # Client-specific components
│   ├── projects/     # Project-specific components
│   └── tasks/        # Task-specific components
├── lib/              # Utilities and configurations
│   ├── supabase.ts   # Supabase client
│   ├── powersync.ts  # PowerSync configuration
│   └── schema.ts     # Database schema
├── hooks/            # Custom React hooks
│   ├── useAuth.ts
│   ├── useClients.ts
│   ├── useProjects.ts
│   └── useTasks.ts
├── contexts/         # React contexts
│   └── AuthContext.tsx
└── types/            # TypeScript type definitions
```

## Code Conventions
- Use functional components with TypeScript
- Use named exports for components
- Prefix custom hooks with `use`
- Keep components small and focused
- Colocate styles with components using StyleSheet.create

## Naming Conventions
- **Files**: PascalCase for components (e.g., `TaskCard.tsx`), camelCase for utilities
- **Components**: PascalCase (e.g., `TaskCard`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth`)
- **Types/Interfaces**: PascalCase (e.g., `Task`, `Client`)
- **Constants**: SCREAMING_SNAKE_CASE

## Testing
- Tests go in `__tests__/` directories or alongside files with `.test.ts(x)` suffix
- Use React Native Testing Library for component tests
