-- Script de verificación y creación de tablas en Supabase
-- Copia y pega esto en SQL Editor de Supabase Dashboard

-- ============================================
-- VERIFICAR SI LAS TABLAS EXISTEN
-- ============================================

-- Verificar tablas existentes
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ============================================
-- SI NO EXISTEN, EJECUTA EL SCHEMA COMPLETO
-- ============================================
-- Abre el archivo supabase/schema.sql y ejecútalo completo

-- ============================================
-- DESACTIVAR RLS TEMPORALMENTE (SOLO DESARROLLO)
-- ============================================
-- Esto permite que la app funcione sin autenticación real de Supabase

ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS organization_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS time_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS incidents DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS scheduled_times DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_logs DISABLE ROW LEVEL SECURITY;

-- ============================================
-- VERIFICAR QUE RLS ESTÁ DESACTIVADO
-- ============================================

SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('users', 'organizations', 'organization_members', 'time_entries', 'incidents', 'scheduled_times', 'audit_logs')
ORDER BY tablename;

-- Si rowsecurity es 'f' (false), RLS está desactivado ✅


