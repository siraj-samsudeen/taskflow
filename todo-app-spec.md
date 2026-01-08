# TaskFlow - Todo/Project Management App Specification

## Overview
A cross-platform todo/project management app for a 2-person dev team to manage tasks across multiple clients.

## Tech Stack
- **Frontend**: Expo (React Native) with React Native for Web
- **Offline-First Sync**: PowerSync (Postgres → SQLite)
- **Backend**: Supabase (Postgres, Auth, Storage)

---

## Phase 1: Project Setup & Infrastructure

### 1.1 Initialize Expo Project
- [x] Create new Expo project with TypeScript template
- [x] Configure ESLint and Prettier
- [x] Set up folder structure (src/screens, src/components, src/lib, src/hooks, src/types)
- [x] Add AGENTS.md with project conventions

### 1.2 Supabase Setup
- [x] Create Supabase project
- [x] Configure environment variables (.env)
- [x] Install @supabase/supabase-js
- [x] Create Supabase client utility

### 1.3 PowerSync Setup
- [x] Install @powersync/react-native and dependencies
- [x] Configure PowerSync schema
- [x] Set up PowerSync provider wrapper (SupabaseConnector)
- [ ] Test offline/online sync

---

## Phase 2: Authentication

### 2.1 Auth Screens
- [x] Create Login screen (email/password)
- [x] Create Sign Up screen
- [x] Create Forgot Password screen
- [x] Create Reset Password screen (handles redirect URL with recovery tokens)
- [x] Add form validation (CustomTextInput + react-hook-form + zod)
- [x] Add navigation links between login/signup screens

### 2.2 Auth State Management
- [ ] Create AuthContext provider
- [ ] Implement login function
- [ ] Implement signup function
- [x] Implement logout function
- [x] Add session persistence

### 2.3 Navigation Guards
- [x] Set up React Navigation
- [x] Create auth stack (login/signup)
- [x] Create main stack (protected routes)
- [x] Implement auth state listener

---

## Phase 3: Database Schema

### 3.1 Supabase Tables
- [x] Create `clients` table (id, name, color, created_at)
- [x] Create `projects` table (id, client_id, name, description, status, created_at)
- [x] Create `tasks` table (id, project_id, title, description, status, priority, due_date, assigned_to, created_at, updated_at)
- [x] Create `team_members` table (id, user_id, name, email, avatar_url)

### 3.2 Row Level Security (RLS)
- [x] Enable RLS on all tables
- [x] Create policies for team member access
- [ ] Test RLS policies

### 3.3 PowerSync Schema Sync
- [x] Define PowerSync schema matching Supabase tables
- [x] Configure sync rules
- [ ] Test bidirectional sync

---

## Phase 4: Core Features - Clients

### 4.1 Client List Screen
- [ ] Create ClientListScreen component
- [ ] Fetch clients from PowerSync
- [ ] Display clients in FlatList with color badges
- [ ] Add pull-to-refresh

### 4.2 Client CRUD
- [ ] Create AddClientModal component
- [ ] Implement create client function
- [ ] Create EditClientModal component
- [ ] Implement update client function
- [ ] Implement delete client (with confirmation)

---

## Phase 5: Core Features - Projects

### 5.1 Project List Screen
- [ ] Create ProjectListScreen component
- [ ] Filter projects by client
- [ ] Display project cards with status
- [ ] Add project count per client

### 5.2 Project CRUD
- [ ] Create AddProjectScreen component
- [ ] Implement create project function
- [ ] Create EditProjectScreen component
- [ ] Implement update project function
- [ ] Implement archive/delete project

### 5.3 Project Detail Screen
- [ ] Create ProjectDetailScreen component
- [ ] Show project info header
- [ ] List tasks within project
- [ ] Show progress indicator

---

## Phase 6: Core Features - Tasks

### 6.1 Task List Views
- [ ] Create TaskListScreen component
- [ ] Implement "All Tasks" view
- [ ] Implement "My Tasks" view (filtered by assigned_to)
- [ ] Implement "Today" view (due_date = today)
- [ ] Add task filtering (status, priority)

### 6.2 Task CRUD
- [ ] Create AddTaskModal component
- [ ] Implement create task function
- [ ] Create TaskDetailScreen component
- [ ] Implement update task function
- [ ] Implement delete task function

### 6.3 Task Interactions
- [ ] Quick toggle task status (checkbox)
- [ ] Drag to reorder tasks (optional)
- [ ] Assign task to team member
- [ ] Set due date with date picker
- [ ] Set priority (low/medium/high/urgent)

---

## Phase 7: UI/UX Polish

### 7.1 Design System
- [ ] Define color palette and theme
- [ ] Create reusable Button component
- [ ] Create reusable Input component
- [ ] Create reusable Card component
- [ ] Add loading states/skeletons

### 7.2 Navigation
- [ ] Set up bottom tab navigation
- [ ] Add header with user avatar
- [ ] Implement stack navigation for detail screens

### 7.3 Empty States & Feedback
- [ ] Create empty state illustrations
- [x] Add toast notifications
- [ ] Add haptic feedback (mobile)
- [ ] Add offline indicator banner

---

## Phase 8: Advanced Features (Future)

### 8.1 Search & Filters
- [ ] Global search across tasks/projects
- [ ] Advanced filter panel
- [ ] Save filter presets

### 8.2 Notifications
- [ ] Due date reminders (push notifications)
- [ ] Task assignment notifications

### 8.3 Analytics Dashboard
- [ ] Tasks completed per week
- [ ] Client workload distribution
- [ ] Team member activity

---

## Data Models

```typescript
// types/index.ts

interface Client {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

interface Project {
  id: string;
  client_id: string;
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'archived';
  created_at: string;
}

interface Task {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

interface TeamMember {
  id: string;
  user_id: string;
  name: string;
  email: string;
  avatar_url?: string;
}
```

---

## Folder Structure

```
src/
├── app/                    # Expo Router screens
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── (tabs)/
│   │   ├── index.tsx       # Home/Dashboard
│   │   ├── tasks.tsx
│   │   ├── projects.tsx
│   │   └── settings.tsx
│   ├── clients/
│   │   └── [id].tsx
│   ├── projects/
│   │   └── [id].tsx
│   └── _layout.tsx
├── components/
│   ├── ui/                 # Reusable UI components
│   ├── clients/
│   ├── projects/
│   └── tasks/
├── lib/
│   ├── supabase.ts
│   ├── powersync.ts
│   └── schema.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useClients.ts
│   ├── useProjects.ts
│   └── useTasks.ts
├── contexts/
│   └── AuthContext.tsx
└── types/
    └── index.ts
```

---

## Getting Started Sequence

1. **Phase 1.1** → Initialize project
2. **Phase 1.2** → Set up Supabase
3. **Phase 3.1** → Create database tables
4. **Phase 2.1-2.3** → Implement auth
5. **Phase 1.3** → Set up PowerSync
6. **Phase 4** → Build clients feature
7. **Phase 5** → Build projects feature
8. **Phase 6** → Build tasks feature
9. **Phase 7** → Polish UI/UX
