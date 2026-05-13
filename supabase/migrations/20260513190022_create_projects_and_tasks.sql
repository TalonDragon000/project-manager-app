/*
  # Create projects and tasks tables

  ## New Tables

  ### projects
  - id, name, mission, user_id, created_at

  ### tasks
  - id, project_id (FK), title, reach, impact, confidence, effort,
    moscow, priority_column, completed, tags, created_at

  Note: "column" is a reserved word so the field is named priority_column.

  ## Security
  - RLS enabled on both tables with open anon/authenticated policies for MVP
*/

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  mission text NOT NULL DEFAULT '',
  user_id uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read projects"
  ON projects FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Anyone can insert projects"
  ON projects FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Anyone can update projects"
  ON projects FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can delete projects"
  ON projects FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  reach int NOT NULL DEFAULT 3,
  impact int NOT NULL DEFAULT 3,
  confidence int NOT NULL DEFAULT 3,
  effort int NOT NULL DEFAULT 3,
  moscow text NOT NULL DEFAULT 'Should',
  priority_column text NOT NULL DEFAULT 'To Sort',
  completed boolean NOT NULL DEFAULT false,
  tags text[] NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read tasks"
  ON tasks FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Anyone can insert tasks"
  ON tasks FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Anyone can update tasks"
  ON tasks FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can delete tasks"
  ON tasks FOR DELETE TO anon, authenticated USING (true);

INSERT INTO projects (id, name, mission) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Web3 MMORPG', 'Build the core battle loop for beta launch.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO tasks (project_id, title, reach, impact, confidence, effort, moscow, priority_column, completed, tags) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Setup Authentication', 5, 8, 5, 3, 'Must', 'High', false, ARRAY['Core Loop']),
  ('00000000-0000-0000-0000-000000000001', 'Design Landing Page', 8, 5, 8, 5, 'Should', 'Med', false, ARRAY['Growth']),
  ('00000000-0000-0000-0000-000000000001', 'Refactor State Management', 8, 3, 3, 8, 'Could', 'Low', false, ARRAY['Tech Debt'])
ON CONFLICT DO NOTHING;
