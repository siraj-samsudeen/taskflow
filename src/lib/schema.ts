import { column, Schema, Table } from '@powersync/react-native';

const teamMembers = new Table({
  user_id: column.text,
  name: column.text,
  email: column.text,
  avatar_url: column.text,
  created_at: column.text,
});

const clients = new Table({
  name: column.text,
  color: column.text,
  created_at: column.text,
});

const projects = new Table({
  client_id: column.text,
  name: column.text,
  description: column.text,
  status: column.text,
  created_at: column.text,
});

const tasks = new Table({
  project_id: column.text,
  title: column.text,
  description: column.text,
  status: column.text,
  priority: column.text,
  due_date: column.text,
  assigned_to: column.text,
  created_at: column.text,
  updated_at: column.text,
});

export const AppSchema = new Schema({
  team_members: teamMembers,
  clients,
  projects,
  tasks,
});

export type Database = (typeof AppSchema)['types'];
export type TeamMember = Database['team_members'];
export type Client = Database['clients'];
export type Project = Database['projects'];
export type Task = Database['tasks'];
