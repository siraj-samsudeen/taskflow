# TaskFlow - Todo/Project Management App Specification

## Overview
A cross-platform todo/project management app for a 2-person dev team to manage tasks across multiple clients.

**Development Approach:** Minimal end-to-end first, then iterate. Each phase produces a working app.

---

## Phase 1: Tasks - Local State Only

### 1.1 Project Setup
- [x] Create new Expo project with TypeScript template
- [x] Configure linting (Biome)
- [x] Set up folder structure (src/app, src/features, src/components/ui, src/lib, src/contexts, src/types)
- [x] Add AGENTS.md with project conventions
- [x] Install Expo Router

### 1.2 Task List Screen
- [x] Display list of tasks (checkbox + title, done = strikethrough + dimmed)
- [x] Tap checkbox → toggle done state
- [x] Quick add input at top (always visible)
- [x] Tabs: All / Active (default, shows count) / Done
- [x] Sorting: Active tasks first (newest → oldest), Done tasks below (newest → oldest)
- [x] Tap row → inline edit mode ([✓] save, [🗑] delete)
- [ ] **Bug:** onBlur / Esc key not working on iPhone to save/exit inline edit mode
- [x] Delete task

### 1.3 Database Schema
- [ ] Create `tasks` table: id (uuid), title (text), done (boolean), created_at
- [ ] No RLS yet (public access for now)

### 1.4 Repository Layer
- [ ] `tasksRepository.ts`: getAll, create, update, delete
- [ ] Unit tests for repository

### 1.5 Connect UI to Database
- [ ] Replace useState with repository calls
- [ ] Loading states while fetching
- [ ] Error handling (toast on failure)

### 1.6 Task Detail Screen
- [ ] Long-press row → navigate to detail screen
- [ ] Title input (pre-filled)
- [ ] Save button → returns to list
- [ ] Delete button → removes task, returns to list
- [ ] (Future: project picker, priority, due date)

---

## Phase 2: Tasks - Offline Support (PowerSync)

### 2.1 PowerSync Setup
- [x] Install @powersync/react-native and dependencies
- [x] Configure PowerSync schema for tasks table
- [x] Set up PowerSync provider wrapper (SupabaseConnector)
- [x] Configure sync rules

### 2.2 Swap Repository to PowerSync
- [ ] Repository reads/writes via PowerSync
- [ ] Verify offline: toggle airplane mode, make changes, reconnect

### 2.3 Tests
- [ ] Offline sync behavior tests

**Done when:** Create task offline → reconnect → syncs to Supabase.

---

## Phase 3: Deploy & Test on Devices

### 3.1 Web Deploy
- [ ] `npx expo export --platform web`
- [ ] Deploy to Vercel/Netlify (or Supabase hosting)
- [ ] Test in mobile browser

### 3.2 Mobile Builds
- [ ] Configure EAS Build (`eas build:configure`)
- [ ] Development build for iOS/Android
- [ ] Install on physical devices

### 3.3 Smoke Test Checklist
- [ ] Add task on web → appears on phone
- [ ] Complete task on phone → syncs to web
- [ ] Offline edit on phone → reconnect → verify sync

**Done when:** Usable task app on phone + web, syncing in real-time.

---

## Phase 4: Projects

### 4.1 Database Schema
- [ ] Create `projects` table: id (uuid), name (text), description (text), status (text), created_at
- [ ] Add to PowerSync schema + sync rules

### 4.2 Project List Screen
- [ ] Display list of projects (name, task count)
- [ ] "Add Project" button → form
- [ ] Tap project → project detail screen

### 4.3 Project Form Screen
- [ ] Name input (required)
- [ ] Description input (optional)
- [ ] Status picker (active/completed/archived)
- [ ] Save/Delete buttons

### 4.4 Project Detail Screen
- [ ] Project header with name/description
- [ ] Placeholder for tasks (connected in Phase 5)

### 4.5 Repository & Tests
- [ ] `projectsRepository.ts`: getAll, create, update, delete
- [ ] Unit tests for repository
- [ ] Screen tests

**Done when:** CRUD projects, view project details.

---

## Phase 5: Task → Project Relationship

### 5.1 Database Migration
- [ ] Add `project_id` (nullable FK) to tasks table
- [ ] Update PowerSync schema

### 5.2 UI Updates
- [ ] Project selector dropdown in task form
- [ ] Show project name on task list items
- [ ] Filter tasks by project on project detail screen

### 5.3 Tests
- [ ] Task-project relationship tests

**Done when:** Tasks can be assigned to projects, filtered by project.

---

## Phase 6: Clients

### 6.1 Database Schema
- [ ] Create `clients` table: id (uuid), name (text), color (text), created_at
- [ ] Add `client_id` (nullable FK) to projects table
- [ ] Update PowerSync schema + sync rules

### 6.2 Client List Screen
- [ ] Display list of clients (name, color badge, project count)
- [ ] "Add Client" button → form
- [ ] Tap client → filtered project list

### 6.3 Client Form Screen
- [ ] Name input (required)
- [ ] Color picker
- [ ] Save/Delete buttons

### 6.4 Connect Projects to Clients
- [ ] Client selector in project form
- [ ] Show client name/color on project list

### 6.5 Repository & Tests
- [ ] `clientsRepository.ts`: getAll, create, update, delete
- [ ] Unit tests for repository
- [ ] Screen tests

**Done when:** CRUD clients, projects grouped by client.

---

## Phase 7: Authentication & Security

### 7.1 Auth Screens
- [x] Login screen (email/password)
- [x] Register screen
- [x] Forgot password screen
- [x] Reset password screen

### 7.2 Auth Infrastructure
- [x] AuthContext provider for centralized auth state
- [x] Protected routing (redirect to login if not authenticated)
- [x] Logout button

### 7.3 Database Security
- [x] Create `team_members` table (id, user_id, name, email, avatar_url)
- [x] Enable RLS on all tables
- [x] Create policies for team member access
- [ ] Update PowerSync sync rules for user filtering

### 7.4 Form Validation
- [x] Add react-hook-form + zod to auth forms
- [x] Toast notifications for auth errors

### 7.5 Tests
- [x] Auth flow tests
- [x] Protected route tests

**Done when:** Secure multi-user app with login/logout.

---

## Phase 8: Navigation & Layout Polish

### 8.1 Navigation Structure
- [ ] Bottom tab navigation (Tasks, Projects, Clients, Settings)
- [ ] Header with user avatar + logout
- [ ] Stack navigation for detail screens

### 8.2 UI Components
- [ ] Define color palette and theme
- [ ] Reusable Button component variants
- [ ] Reusable Card component
- [ ] Loading states/skeletons
- [ ] Empty state messages

### 8.3 UX Polish
- [ ] Toast notifications (consistent)
- [ ] Offline indicator banner
- [ ] Haptic feedback (mobile)
- [ ] Pull-to-refresh

### 8.4 Tests
- [ ] Navigation tests

**Done when:** Polished, consistent UI across all screens.

---

## Phase 9: Task Enhancements

### 9.1 Additional Task Fields
- [ ] Add to schema: priority (text), due_date (date), assigned_to (uuid FK)
- [ ] Update PowerSync schema

### 9.2 Task Form Enhancements
- [ ] Priority picker (low/medium/high/urgent)
- [ ] Due date picker
- [ ] Team member assignment dropdown

### 9.3 Task List Views
- [ ] Filter views: All Tasks, My Tasks, Today, Overdue
- [ ] Sort by priority/due date

### 9.4 Tests
- [ ] Enhanced task form tests
- [ ] Filter/sort tests

**Done when:** Full-featured task management.

---

## Phase 11: Advanced Features (Future)

- [ ] 11.1 Global search across tasks/projects/clients
- [ ] 11.2 Advanced filter panel + save presets
- [ ] 11.3 Due date reminders (push notifications)
- [ ] 11.4 Task assignment notifications
- [ ] 11.5 Analytics dashboard (tasks per week, workload)
- [ ] 11.6 Drag-and-drop task reordering

---
