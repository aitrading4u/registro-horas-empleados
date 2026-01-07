-- ⚠️ SOLO PARA DESARROLLO - Desactivar RLS temporalmente
-- Esto permite acceso sin autenticación para probar la app

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE incidents DISABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_times DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;

-- Verificar que RLS está desactivado
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'organizations', 'organization_members', 'time_entries', 'incidents', 'scheduled_times', 'audit_logs');



