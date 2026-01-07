-- Políticas RLS para desarrollo (permiten acceso sin autenticación)
-- ⚠️ SOLO PARA DESARROLLO - NO USAR EN PRODUCCIÓN

-- Desactivar temporalmente las políticas restrictivas y crear políticas abiertas para desarrollo

-- Políticas para users (acceso abierto para desarrollo)
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

CREATE POLICY "dev_users_select" ON users
  FOR SELECT USING (true);

CREATE POLICY "dev_users_insert" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "dev_users_update" ON users
  FOR UPDATE USING (true);

-- Políticas para organizations (acceso abierto para desarrollo)
DROP POLICY IF EXISTS "Members can view their organizations" ON organizations;
DROP POLICY IF EXISTS "Admins can create organizations" ON organizations;
DROP POLICY IF EXISTS "Admins can update their organizations" ON organizations;

CREATE POLICY "dev_organizations_select" ON organizations
  FOR SELECT USING (true);

CREATE POLICY "dev_organizations_insert" ON organizations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "dev_organizations_update" ON organizations
  FOR UPDATE USING (true);

CREATE POLICY "dev_organizations_delete" ON organizations
  FOR DELETE USING (true);

-- Políticas para organization_members (acceso abierto para desarrollo)
DROP POLICY IF EXISTS "Members can view organization members" ON organization_members;
DROP POLICY IF EXISTS "Admins can add members" ON organization_members;
DROP POLICY IF EXISTS "Admins can update members" ON organization_members;

CREATE POLICY "dev_organization_members_select" ON organization_members
  FOR SELECT USING (true);

CREATE POLICY "dev_organization_members_insert" ON organization_members
  FOR INSERT WITH CHECK (true);

CREATE POLICY "dev_organization_members_update" ON organization_members
  FOR UPDATE USING (true);

CREATE POLICY "dev_organization_members_delete" ON organization_members
  FOR DELETE USING (true);

-- Políticas para time_entries (acceso abierto para desarrollo)
DROP POLICY IF EXISTS "Users can view own time entries" ON time_entries;
DROP POLICY IF EXISTS "Users can create own time entries" ON time_entries;

CREATE POLICY "dev_time_entries_select" ON time_entries
  FOR SELECT USING (true);

CREATE POLICY "dev_time_entries_insert" ON time_entries
  FOR INSERT WITH CHECK (true);

CREATE POLICY "dev_time_entries_update" ON time_entries
  FOR UPDATE USING (true);

CREATE POLICY "dev_time_entries_delete" ON time_entries
  FOR DELETE USING (true);

-- Políticas para incidents (acceso abierto para desarrollo)
DROP POLICY IF EXISTS "Users can view incidents in their organizations" ON incidents;
DROP POLICY IF EXISTS "Users can create own incidents" ON incidents;
DROP POLICY IF EXISTS "Managers can update incidents" ON incidents;

CREATE POLICY "dev_incidents_select" ON incidents
  FOR SELECT USING (true);

CREATE POLICY "dev_incidents_insert" ON incidents
  FOR INSERT WITH CHECK (true);

CREATE POLICY "dev_incidents_update" ON incidents
  FOR UPDATE USING (true);

CREATE POLICY "dev_incidents_delete" ON incidents
  FOR DELETE USING (true);

-- Políticas para scheduled_times (acceso abierto para desarrollo)
DROP POLICY IF EXISTS "Users can view scheduled times in their organizations" ON scheduled_times;
DROP POLICY IF EXISTS "Admins can manage scheduled times" ON scheduled_times;

CREATE POLICY "dev_scheduled_times_select" ON scheduled_times
  FOR SELECT USING (true);

CREATE POLICY "dev_scheduled_times_insert" ON scheduled_times
  FOR INSERT WITH CHECK (true);

CREATE POLICY "dev_scheduled_times_update" ON scheduled_times
  FOR UPDATE USING (true);

CREATE POLICY "dev_scheduled_times_delete" ON scheduled_times
  FOR DELETE USING (true);

-- Políticas para audit_logs (acceso abierto para desarrollo)
DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;

CREATE POLICY "dev_audit_logs_select" ON audit_logs
  FOR SELECT USING (true);

CREATE POLICY "dev_audit_logs_insert" ON audit_logs
  FOR INSERT WITH CHECK (true);



