import type { RxJsonSchema, RxCollectionCreator } from 'rxdb';

export interface TeamMemberDoc {
  id: string;
  user_id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  created_at: string;
  isDeleted: boolean;
  modifiedAt: string;
}

export interface ClientDoc {
  id: string;
  name: string;
  color: string;
  created_at: string;
  isDeleted: boolean;
  modifiedAt: string;
}

export interface ProjectDoc {
  id: string;
  client_id: string | null;
  name: string;
  description: string | null;
  status: string;
  created_at: string;
  isDeleted: boolean;
  modifiedAt: string;
}

export interface TaskDoc {
  id: string;
  project_id: string | null;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  isDeleted: boolean;
  modifiedAt: string;
}

const teamMembersSchema: RxJsonSchema<TeamMemberDoc> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    user_id: { type: 'string' },
    name: { type: 'string' },
    email: { type: 'string' },
    avatar_url: { type: ['string', 'null'] },
    created_at: { type: 'string' },
    isDeleted: { type: 'boolean' },
    modifiedAt: { type: 'string' },
  },
  required: ['id', 'user_id', 'name', 'email', 'created_at', 'isDeleted', 'modifiedAt'],
};

const clientsSchema: RxJsonSchema<ClientDoc> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    name: { type: 'string' },
    color: { type: 'string' },
    created_at: { type: 'string' },
    isDeleted: { type: 'boolean' },
    modifiedAt: { type: 'string' },
  },
  required: ['id', 'name', 'color', 'created_at', 'isDeleted', 'modifiedAt'],
};

const projectsSchema: RxJsonSchema<ProjectDoc> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    client_id: { type: ['string', 'null'] },
    name: { type: 'string' },
    description: { type: ['string', 'null'] },
    status: { type: 'string' },
    created_at: { type: 'string' },
    isDeleted: { type: 'boolean' },
    modifiedAt: { type: 'string' },
  },
  required: ['id', 'name', 'status', 'created_at', 'isDeleted', 'modifiedAt'],
};

const tasksSchema: RxJsonSchema<TaskDoc> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    project_id: { type: ['string', 'null'] },
    title: { type: 'string' },
    description: { type: ['string', 'null'] },
    status: { type: 'string' },
    priority: { type: 'string' },
    due_date: { type: ['string', 'null'] },
    assigned_to: { type: ['string', 'null'] },
    created_at: { type: 'string' },
    updated_at: { type: 'string' },
    isDeleted: { type: 'boolean' },
    modifiedAt: { type: 'string' },
  },
  required: ['id', 'title', 'status', 'priority', 'created_at', 'updated_at', 'isDeleted', 'modifiedAt'],
};

export const collections: Record<string, RxCollectionCreator> = {
  team_members: { schema: teamMembersSchema },
  clients: { schema: clientsSchema },
  projects: { schema: projectsSchema },
  tasks: { schema: tasksSchema },
};

export type { RxJsonSchema };
