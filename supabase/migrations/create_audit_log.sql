-- Tabla de audit log para registrar todas las acciones de los cajeros/admins
-- Ejecutar este SQL en el editor SQL de Supabase (https://supabase.com/dashboard/project/xgxywmtwwqggpfczdrqz/sql/new)

CREATE TABLE IF NOT EXISTS audit_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id text NOT NULL,
  profile_name text NOT NULL,
  action text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_profile_id ON audit_log(profile_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_category ON audit_log(category);

-- Row Level Security
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for authenticated" ON audit_log FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon insert" ON audit_log FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon select" ON audit_log FOR SELECT TO anon USING (true);
