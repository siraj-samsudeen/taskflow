-- Phase 3.2: Row Level Security (RLS) Policies
-- Allows all authenticated team members full access to all data

-- Enable RLS on all tables
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Team Members: Authenticated users can read all, but only update their own profile
CREATE POLICY "Team members are viewable by authenticated users"
  ON team_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own team member profile"
  ON team_members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own team member profile"
  ON team_members FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Clients: Full access for all authenticated team members
CREATE POLICY "Clients are viewable by authenticated users"
  ON clients FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Clients are insertable by authenticated users"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Clients are updatable by authenticated users"
  ON clients FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Clients are deletable by authenticated users"
  ON clients FOR DELETE
  TO authenticated
  USING (true);

-- Projects: Full access for all authenticated team members
CREATE POLICY "Projects are viewable by authenticated users"
  ON projects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Projects are insertable by authenticated users"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Projects are updatable by authenticated users"
  ON projects FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Projects are deletable by authenticated users"
  ON projects FOR DELETE
  TO authenticated
  USING (true);

-- Tasks: Full access for all authenticated team members
CREATE POLICY "Tasks are viewable by authenticated users"
  ON tasks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Tasks are insertable by authenticated users"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Tasks are updatable by authenticated users"
  ON tasks FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Tasks are deletable by authenticated users"
  ON tasks FOR DELETE
  TO authenticated
  USING (true);
