-- Add session metadata columns
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS title VARCHAR(200);
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS event_date DATE;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS location VARCHAR(200);

-- Update policy for sessions to allow updates
CREATE POLICY "sessions_update" ON sessions FOR UPDATE USING (true);
