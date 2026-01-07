# 🔓 Desactivar RLS para Desarrollo

## Problema
Las políticas de Row Level Security (RLS) están bloqueando el acceso porque la app usa autenticación mock, pero Supabase requiere autenticación real.

## Solución Rápida

### Paso 1: Abre SQL Editor en Supabase
1. Ve a tu Dashboard de Supabase
2. Haz clic en **"SQL Editor"** (menú lateral izquierdo)
3. Haz clic en **"New Query"**

### Paso 2: Copia y ejecuta este SQL

```sql
-- ⚠️ SOLO PARA DESARROLLO - Desactivar RLS temporalmente
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE incidents DISABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_times DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;
```

### Paso 3: Ejecutar
- Haz clic en **"Run"** (o presiona `Ctrl+Enter`)
- Deberías ver: ✅ "Success. No rows returned"

### Paso 4: Probar la app
1. Recarga la página de tu app (`http://localhost:3000`)
2. Intenta iniciar sesión con cualquier email
3. Debería funcionar ahora

## ⚠️ Importante
- Esto desactiva la seguridad - **SOLO para desarrollo**
- En producción, necesitarás autenticación real de Supabase
- Las políticas RLS se pueden reactivar después

## Verificar que funcionó
Después de ejecutar el SQL, puedes verificar que RLS está desactivado:

```sql
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'organizations', 'organization_members', 'time_entries', 'incidents', 'scheduled_times', 'audit_logs');
```

Todas las tablas deberían mostrar `rowsecurity = false`



