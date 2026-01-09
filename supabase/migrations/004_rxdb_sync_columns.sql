-- RxDB Sync Columns Setup
-- Adds _modified and _deleted columns required for RxDB replication with Supabase

-- Enable moddatetime extension for auto-updating _modified
CREATE EXTENSION IF NOT EXISTS moddatetime SCHEMA extensions;

-- Add _modified and _deleted columns to team_members
ALTER TABLE team_members
  ADD COLUMN IF NOT EXISTS _deleted BOOLEAN DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS _modified TIMESTAMPTZ DEFAULT now() NOT NULL;

CREATE TRIGGER update_team_members_modified
  BEFORE UPDATE ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION extensions.moddatetime('_modified');

-- Add _modified and _deleted columns to clients
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS _deleted BOOLEAN DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS _modified TIMESTAMPTZ DEFAULT now() NOT NULL;

CREATE TRIGGER update_clients_modified
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION extensions.moddatetime('_modified');

-- Add _modified and _deleted columns to projects
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS _deleted BOOLEAN DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS _modified TIMESTAMPTZ DEFAULT now() NOT NULL;

CREATE TRIGGER update_projects_modified
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION extensions.moddatetime('_modified');

-- Add _modified and _deleted columns to tasks
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS _deleted BOOLEAN DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS _modified TIMESTAMPTZ DEFAULT now() NOT NULL;

CREATE TRIGGER update_tasks_modified
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION extensions.moddatetime('_modified');

-- Create indexes on _modified for efficient sync queries
CREATE INDEX IF NOT EXISTS idx_team_members_modified ON team_members(_modified);
CREATE INDEX IF NOT EXISTS idx_clients_modified ON clients(_modified);
CREATE INDEX IF NOT EXISTS idx_projects_modified ON projects(_modified);
CREATE INDEX IF NOT EXISTS idx_tasks_modified ON tasks(_modified);

-- Enable Realtime on all tables for live sync
ALTER PUBLICATION supabase_realtime ADD TABLE team_members;
ALTER PUBLICATION supabase_realtime ADD TABLE clients;
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
