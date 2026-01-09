-- Make FK constraints optional for easier testing
-- Allows creating tasks without projects and projects without clients

ALTER TABLE tasks ALTER COLUMN project_id DROP NOT NULL;
ALTER TABLE projects ALTER COLUMN client_id DROP NOT NULL;
