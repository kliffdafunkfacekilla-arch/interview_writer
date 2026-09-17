/*
# Story Forge — Complete Schema

1. Purpose
A story development workspace for writers. Stores structured data across
8 layers: Characters, Relationships, Plot, World, Meaning/Resonance,
Visual Style/Prose, Question Engine state, and Output Generation.

2. Single-tenant (no auth)
This app has no sign-in screen. All data is shared/public within the app.
Policies use `TO anon, authenticated` with `USING (true)`.

3. New Tables
- `projects` — top-level story container
- `characters` — Vol 1 character objects (identity, inner world, transformation, visual, voice, fingerprint as JSONB)
- `relationships` — Vol 2 relationship objects
- `relationship_clusters` — Vol 2 multi-party clusters
- `plot_pillars` — Vol 3 five structural pillars per project
- `subplots` — Vol 3 inferred subplot threads
- `plot_events` — Vol 3 plot event base units
- `structural_gaps` — Vol 3/Vol 7 structural gap flags
- `world_locations` — Vol 4 location objects
- `world_laws` — Vol 4 law objects
- `world_records` — Vol 4 historical/mythological records
- `world_snapshots` — Vol 4 world state at each of 5 pillars
- `themes` — Vol 5 central question, moral argument, symbols, emotional architecture
- `style_config` — Vol 6 visual style and prose voice config
- `question_state` — Vol 7 question engine state tracking
- `output_jobs` — Vol 8 output generation jobs

4. Security
- RLS enabled on all tables.
- All tables allow anon + authenticated full CRUD (single-tenant, no auth).
*/

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT 'Untitled Story',
  genre text DEFAULT '',
  logline text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Characters (Vol 1)
CREATE TABLE IF NOT EXISTS characters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Unnamed',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Relationships (Vol 2)
CREATE TABLE IF NOT EXISTS relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  label text NOT NULL DEFAULT 'Untitled Relationship',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Relationship Clusters (Vol 2)
CREATE TABLE IF NOT EXISTS relationship_clusters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  label text NOT NULL DEFAULT 'Untitled Cluster',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Plot Pillars (Vol 3) — created before plot_events for FK
CREATE TABLE IF NOT EXISTS plot_pillars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  pillar_type text NOT NULL DEFAULT 'inciting_incident',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Subplots (Vol 3) — created before plot_events for FK
CREATE TABLE IF NOT EXISTS subplots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  label text NOT NULL DEFAULT 'Untitled Subplot',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Plot Events (Vol 3)
CREATE TABLE IF NOT EXISTS plot_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  description text NOT NULL DEFAULT '',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  pillar_id uuid REFERENCES plot_pillars(id) ON DELETE SET NULL,
  subplot_id uuid REFERENCES subplots(id) ON DELETE SET NULL,
  timeline_position text DEFAULT '',
  emotional_weight text DEFAULT 'medium',
  filler_flag boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Structural Gaps (Vol 3 / Vol 7)
CREATE TABLE IF NOT EXISTS structural_gaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  gap_type text NOT NULL DEFAULT 'filler_scene',
  description text NOT NULL DEFAULT '',
  severity text DEFAULT 'medium',
  resolved boolean DEFAULT false,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- World Locations (Vol 4)
CREATE TABLE IF NOT EXISTS world_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Unnamed Location',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- World Laws (Vol 4)
CREATE TABLE IF NOT EXISTS world_laws (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  statement text NOT NULL DEFAULT '',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- World Records (Vol 4)
CREATE TABLE IF NOT EXISTS world_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Untitled Record',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- World Snapshots (Vol 4)
CREATE TABLE IF NOT EXISTS world_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  pillar text NOT NULL DEFAULT 'story_open',
  description text NOT NULL DEFAULT '',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Themes (Vol 5)
CREATE TABLE IF NOT EXISTS themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Style Config (Vol 6)
CREATE TABLE IF NOT EXISTS style_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Question State (Vol 7)
CREATE TABLE IF NOT EXISTS question_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  layer text NOT NULL DEFAULT 'character',
  question_id text NOT NULL DEFAULT '',
  question_text text NOT NULL DEFAULT '',
  status text DEFAULT 'pending',
  answer text DEFAULT '',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Output Jobs (Vol 8)
CREATE TABLE IF NOT EXISTS output_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  job_type text NOT NULL DEFAULT 'scene_draft',
  status text DEFAULT 'pending',
  prompt text DEFAULT '',
  output text DEFAULT '',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationship_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE plot_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE plot_pillars ENABLE ROW LEVEL SECURITY;
ALTER TABLE subplots ENABLE ROW LEVEL SECURITY;
ALTER TABLE structural_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE world_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE world_laws ENABLE ROW LEVEL SECURITY;
ALTER TABLE world_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE world_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE style_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE output_jobs ENABLE ROW LEVEL SECURITY;

-- Create policies for all tables (single-tenant, anon + authenticated)
DO $$
DECLARE
  tables text[] := ARRAY[
    'projects', 'characters', 'relationships', 'relationship_clusters',
    'plot_events', 'plot_pillars', 'subplots', 'structural_gaps',
    'world_locations', 'world_laws', 'world_records', 'world_snapshots',
    'themes', 'style_config', 'question_state', 'output_jobs'
  ];
  t text;
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS "anon_select_%s" ON %I;', t, t);
    EXECUTE format('CREATE POLICY "anon_select_%s" ON %I FOR SELECT TO anon, authenticated USING (true);', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "anon_insert_%s" ON %I;', t, t);
    EXECUTE format('CREATE POLICY "anon_insert_%s" ON %I FOR INSERT TO anon, authenticated WITH CHECK (true);', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "anon_update_%s" ON %I;', t, t);
    EXECUTE format('CREATE POLICY "anon_update_%s" ON %I FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "anon_delete_%s" ON %I;', t, t);
    EXECUTE format('CREATE POLICY "anon_delete_%s" ON %I FOR DELETE TO anon, authenticated USING (true);', t, t);
  END LOOP;
END $$;

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_characters_project ON characters(project_id);
CREATE INDEX IF NOT EXISTS idx_relationships_project ON relationships(project_id);
CREATE INDEX IF NOT EXISTS idx_plot_events_project ON plot_events(project_id);
CREATE INDEX IF NOT EXISTS idx_plot_pillars_project ON plot_pillars(project_id);
CREATE INDEX IF NOT EXISTS idx_subplots_project ON subplots(project_id);
CREATE INDEX IF NOT EXISTS idx_structural_gaps_project ON structural_gaps(project_id);
CREATE INDEX IF NOT EXISTS idx_world_locations_project ON world_locations(project_id);
CREATE INDEX IF NOT EXISTS idx_world_laws_project ON world_laws(project_id);
CREATE INDEX IF NOT EXISTS idx_world_records_project ON world_records(project_id);
CREATE INDEX IF NOT EXISTS idx_world_snapshots_project ON world_snapshots(project_id);
CREATE INDEX IF NOT EXISTS idx_themes_project ON themes(project_id);
CREATE INDEX IF NOT EXISTS idx_style_config_project ON style_config(project_id);
CREATE INDEX IF NOT EXISTS idx_question_state_project ON question_state(project_id);
CREATE INDEX IF NOT EXISTS idx_output_jobs_project ON output_jobs(project_id);

-- Insert a default project
INSERT INTO projects (title, genre, logline)
VALUES ('Untitled Story', '', '')
ON CONFLICT DO NOTHING;

-- Insert default 5 pillars for the default project
INSERT INTO plot_pillars (project_id, pillar_type, data)
SELECT p.id, pt.type, '{}'::jsonb
FROM projects p
CROSS JOIN (VALUES ('inciting_incident'), ('plot_point_1'), ('midpoint'), ('plot_point_2'), ('climax')) AS pt(type)
WHERE NOT EXISTS (
  SELECT 1 FROM plot_pillars pp
  WHERE pp.project_id = p.id AND pp.pillar_type = pt.type
);
