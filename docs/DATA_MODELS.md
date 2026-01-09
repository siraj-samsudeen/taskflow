# Data Models

> **Note:** These models evolve as phases complete. Start minimal, add fields as needed.

## Phase 1-4: Minimal Task

```typescript
interface Task {
  id: string;
  title: string;
  done: boolean;
  created_at: string;
}
```

## Phase 5: Add Projects

```typescript
interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'archived';
  created_at: string;
}
```

## Phase 6: Task → Project Relationship

```typescript
interface Task {
  id: string;
  project_id?: string;  // Added
  title: string;
  done: boolean;
  created_at: string;
  updated_at: string;   // Added
}
```

## Phase 7: Add Clients

```typescript
interface Client {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

interface Project {
  id: string;
  client_id?: string;  // Added
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'archived';
  created_at: string;
}
```

## Phase 8: Add Team Members

```typescript
interface TeamMember {
  id: string;
  user_id: string;
  name: string;
  email: string;
  avatar_url?: string;
}
```

## Phase 10: Full Task Model

```typescript
interface Task {
  id: string;
  project_id?: string;
  title: string;
  description?: string;
  done: boolean;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}
```

---

## Final State (All Models)

```typescript
interface Client {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

interface Project {
  id: string;
  client_id?: string;
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'archived';
  created_at: string;
}

interface Task {
  id: string;
  project_id?: string;
  title: string;
  description?: string;
  done: boolean;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
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
