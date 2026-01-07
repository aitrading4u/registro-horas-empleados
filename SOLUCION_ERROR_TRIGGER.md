# ✅ Solución al Error del Trigger

## 🔧 Problema
Error: `trigger "update_users_updated_at" for relation "users" already exists`

Esto significa que ya ejecutaste parte del schema antes.

## ✅ Solución Rápida

### Opción 1: Usar el Schema Seguro (Recomendado)

1. **Abre** Supabase Dashboard > SQL Editor
2. **Abre** el archivo `supabase/schema-safe.sql` de este proyecto
3. **Copia TODO** el contenido
4. **Pega** en SQL Editor
5. **Ejecuta** (Run o Ctrl+Enter)

Este script elimina los triggers y políticas existentes antes de crearlos de nuevo.

### Opción 2: Eliminar Manualmente y Re-ejecutar

Ejecuta esto primero en SQL Editor:

```sql
-- Eliminar triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
DROP TRIGGER IF EXISTS update_incidents_updated_at ON incidents;

-- Eliminar todas las políticas RLS
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.tablename);
    END LOOP;
END $$;
```

Luego ejecuta el `schema.sql` original.

### Opción 3: Solo Desactivar RLS (Más Rápido)

Si solo quieres que funcione ahora, ejecuta esto:

```sql
-- Desactivar RLS completamente
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE incidents DISABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_times DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;
```

Esto permitirá que la app funcione sin problemas de permisos.

---

## 🎯 Recomendación

**Usa `schema-safe.sql`** - Es el más seguro y puede ejecutarse múltiples veces sin errores.

---

## ✅ Después de Ejecutar

1. Verifica que no haya errores
2. Ve a Table Editor y verifica que las tablas existan
3. Reinicia tu servidor: `npm run dev`
4. Prueba creando un restaurante en la app

¡Listo! 🎉



