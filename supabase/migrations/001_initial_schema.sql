CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Sessions
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(6) UNIQUE NOT NULL,
  leader_name VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_code ON sessions(code);

-- Wines
CREATE TABLE wines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  producer VARCHAR(200) NOT NULL,
  vintage INTEGER,
  region VARCHAR(200),
  wine_type VARCHAR(10) NOT NULL DEFAULT 'red' CHECK (wine_type IN ('white', 'rosé', 'red')),
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  results_revealed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_wines_session ON wines(session_id);

-- Participants
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  is_leader BOOLEAN NOT NULL DEFAULT FALSE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(session_id, name)
);

CREATE INDEX idx_participants_session ON participants(session_id);

-- Evaluations
CREATE TABLE evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wine_id UUID NOT NULL REFERENCES wines(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(wine_id, participant_id)
);

CREATE INDEX idx_evaluations_wine ON evaluations(wine_id);
CREATE INDEX idx_evaluations_participant ON evaluations(participant_id);

-- Row Level Security
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wines ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

-- Policies: allow reads via anon key, writes go through API routes with service role
CREATE POLICY "sessions_select" ON sessions FOR SELECT USING (true);
CREATE POLICY "sessions_insert" ON sessions FOR INSERT WITH CHECK (true);

CREATE POLICY "wines_select" ON wines FOR SELECT USING (true);
CREATE POLICY "wines_insert" ON wines FOR INSERT WITH CHECK (true);
CREATE POLICY "wines_update" ON wines FOR UPDATE USING (true);
CREATE POLICY "wines_delete" ON wines FOR DELETE USING (true);

CREATE POLICY "participants_select" ON participants FOR SELECT USING (true);
CREATE POLICY "participants_insert" ON participants FOR INSERT WITH CHECK (true);

CREATE POLICY "evaluations_select" ON evaluations FOR SELECT USING (true);
CREATE POLICY "evaluations_insert" ON evaluations FOR INSERT WITH CHECK (true);
CREATE POLICY "evaluations_update" ON evaluations FOR UPDATE USING (true);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE wines;
ALTER PUBLICATION supabase_realtime ADD TABLE evaluations;
ALTER PUBLICATION supabase_realtime ADD TABLE participants;
