-- Script para verificar datos en Supabase
-- Ejecuta esto en SQL Editor de Supabase

-- 1. Verificar que las tablas existan
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. Ver todos los restaurantes (organizations)
SELECT * FROM organizations ORDER BY created_at DESC;

-- 3. Ver todos los usuarios
SELECT id, email, full_name, created_at FROM users ORDER BY created_at DESC;

-- 4. Ver relaciones usuario-restaurante
SELECT 
    om.id,
    u.email,
    u.full_name,
    o.name as restaurant_name,
    om.role,
    om.created_at
FROM organization_members om
JOIN users u ON om.user_id = u.id
JOIN organizations o ON om.organization_id = o.id
ORDER BY om.created_at DESC;

-- 5. Verificar estado de RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('users', 'organizations', 'organization_members')
ORDER BY tablename;

-- Si rowsecurity es 't' (true), RLS está activado
-- Si rowsecurity es 'f' (false), RLS está desactivado



