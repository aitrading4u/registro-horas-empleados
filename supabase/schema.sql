    -- ============================================
    -- ESQUEMA DE BASE DE DATOS PARA CONTROL HORARIO
    -- Multi-tenant SaaS para restaurantes
    -- ============================================

    -- Extensión para UUIDs
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- ============================================
    -- TABLA: users
    -- ============================================
    CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    password_hash TEXT, -- En producción usar bcrypt
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- ============================================
    -- TABLA: organizations (restaurantes)
    -- ============================================
    CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    allowed_radius INTEGER NOT NULL DEFAULT 75, -- en metros
    timezone TEXT NOT NULL DEFAULT 'Europe/Madrid',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- ============================================
    -- TABLA: organization_members (relación usuario-restaurante)
    -- ============================================
    CREATE TABLE IF NOT EXISTS organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('EMPLOYEE', 'MANAGER', 'ADMIN')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
    );

    -- ============================================
    -- TABLA: time_entries (fichajes)
    -- ============================================
    CREATE TABLE IF NOT EXISTS time_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('ENTRY', 'EXIT')),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    device_info TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- ============================================
    -- TABLA: incidents (incidencias)
    -- ============================================
    CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('FORGOT_ENTRY', 'LATE_ARRIVAL', 'NOT_WORKING')),
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    date DATE NOT NULL,
    description TEXT NOT NULL,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- ============================================
    -- TABLA: scheduled_times (horarios programados)
    -- ============================================
    CREATE TABLE IF NOT EXISTS scheduled_times (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Domingo, 6 = Sábado
    entry_time TIME NOT NULL, -- Formato HH:mm
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, organization_id, day_of_week, entry_time)
    );

    -- ============================================
    -- TABLA: audit_logs (auditoría)
    -- ============================================
    CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    action TEXT NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', etc.
    entity_type TEXT NOT NULL, -- 'TIME_ENTRY', 'INCIDENT', etc.
    entity_id UUID,
    changes JSONB, -- Cambios realizados
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- ============================================
    -- ÍNDICES para mejorar rendimiento
    -- ============================================
    CREATE INDEX IF NOT EXISTS idx_organization_members_org ON organization_members(organization_id);
    CREATE INDEX IF NOT EXISTS idx_organization_members_user ON organization_members(user_id);
    CREATE INDEX IF NOT EXISTS idx_time_entries_org ON time_entries(organization_id);
    CREATE INDEX IF NOT EXISTS idx_time_entries_user ON time_entries(user_id);
    CREATE INDEX IF NOT EXISTS idx_time_entries_timestamp ON time_entries(timestamp);
    CREATE INDEX IF NOT EXISTS idx_incidents_org ON incidents(organization_id);
    CREATE INDEX IF NOT EXISTS idx_incidents_user ON incidents(user_id);
    CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
    CREATE INDEX IF NOT EXISTS idx_scheduled_times_user_org ON scheduled_times(user_id, organization_id);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_org ON audit_logs(organization_id);

    -- ============================================
    -- FUNCIONES para actualizar updated_at
    -- ============================================
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
    END;
    $$ language 'plpgsql';

    -- Eliminar triggers si existen antes de crearlos
    DROP TRIGGER IF EXISTS update_users_updated_at ON users;
    DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
    DROP TRIGGER IF EXISTS update_incidents_updated_at ON incidents;

    CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON incidents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    -- ============================================
    -- ROW LEVEL SECURITY (RLS)
    -- ============================================

    -- Eliminar políticas existentes si hay
    DROP POLICY IF EXISTS "Users can view own profile" ON users;
    DROP POLICY IF EXISTS "Users can update own profile" ON users;
    DROP POLICY IF EXISTS "Members can view their organizations" ON organizations;
    DROP POLICY IF EXISTS "Admins can create organizations" ON organizations;
    DROP POLICY IF EXISTS "Admins can update their organizations" ON organizations;
    DROP POLICY IF EXISTS "Members can view organization members" ON organization_members;
    DROP POLICY IF EXISTS "Admins can add members" ON organization_members;
    DROP POLICY IF EXISTS "Admins can update members" ON organization_members;
    DROP POLICY IF EXISTS "Users can view own time entries" ON time_entries;
    DROP POLICY IF EXISTS "Users can create own time entries" ON time_entries;
    DROP POLICY IF EXISTS "Users can view incidents in their organizations" ON incidents;
    DROP POLICY IF EXISTS "Users can create own incidents" ON incidents;
    DROP POLICY IF EXISTS "Managers can update incidents" ON incidents;
    DROP POLICY IF EXISTS "Users can view scheduled times in their organizations" ON scheduled_times;
    DROP POLICY IF EXISTS "Admins can manage scheduled times" ON scheduled_times;
    DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;

    -- Habilitar RLS en todas las tablas
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
    ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
    ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
    ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
    ALTER TABLE scheduled_times ENABLE ROW LEVEL SECURITY;
    ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
    
    -- Políticas para users (los usuarios pueden ver su propio perfil)
    CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

    CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

    -- Políticas para organizations (solo miembros pueden ver)
    CREATE POLICY "Members can view their organizations" ON organizations
    FOR SELECT USING (
        id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
        )
    );

    CREATE POLICY "Admins can create organizations" ON organizations
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

    CREATE POLICY "Admins can update their organizations" ON organizations
    FOR UPDATE USING (
        created_by = auth.uid() OR
        id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND role = 'ADMIN'
        )
    );

    -- Políticas para organization_members
    CREATE POLICY "Members can view organization members" ON organization_members
    FOR SELECT USING (
        organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
        )
    );

    CREATE POLICY "Admins can add members" ON organization_members
    FOR INSERT WITH CHECK (
        organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND role IN ('ADMIN', 'MANAGER')
        )
    );

    CREATE POLICY "Admins can update members" ON organization_members
    FOR UPDATE USING (
        organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND role IN ('ADMIN', 'MANAGER')
        )
    );

    -- Políticas para time_entries
    CREATE POLICY "Users can view own time entries" ON time_entries
    FOR SELECT USING (
        user_id = auth.uid() OR
        organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND role IN ('ADMIN', 'MANAGER')
        )
    );

    CREATE POLICY "Users can create own time entries" ON time_entries
    FOR INSERT WITH CHECK (user_id = auth.uid());

    -- Políticas para incidents
    CREATE POLICY "Users can view incidents in their organizations" ON incidents
    FOR SELECT USING (
        organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
        )
    );

    CREATE POLICY "Users can create own incidents" ON incidents
    FOR INSERT WITH CHECK (user_id = auth.uid());

    CREATE POLICY "Managers can update incidents" ON incidents
    FOR UPDATE USING (
        organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND role IN ('ADMIN', 'MANAGER')
        )
    );

    -- Políticas para scheduled_times
    CREATE POLICY "Users can view scheduled times in their organizations" ON scheduled_times
    FOR SELECT USING (
        organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
        )
    );

    CREATE POLICY "Admins can manage scheduled times" ON scheduled_times
    FOR ALL USING (
        organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND role IN ('ADMIN', 'MANAGER')
        )
    );

    -- Políticas para audit_logs (solo admins)
    CREATE POLICY "Admins can view audit logs" ON audit_logs
    FOR SELECT USING (
        organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid() AND role = 'ADMIN'
        )
    );

