-- PowerSync Replication Setup
-- Creates user and publication for PowerSync to sync data

-- 1. Create PowerSync database user with replication privileges
CREATE ROLE powersync_role WITH REPLICATION BYPASSRLS LOGIN PASSWORD 'TaskFlow2026!PowerSync';

-- Grant read access to all current tables
GRANT SELECT ON ALL TABLES IN SCHEMA public TO powersync_role;

-- Grant read access to future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO powersync_role;

-- 2. Create publication for PowerSync to replicate these tables
CREATE PUBLICATION powersync FOR TABLE team_members, clients, projects, tasks;
