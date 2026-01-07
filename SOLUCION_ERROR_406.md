# 🔧 Solución: Error 406 (Not Acceptable)

## ✅ Buenas Noticias

El usuario ya tiene un UUID válido: `407df375-2df8-4564-960f-0f9026e1ee0e` ✅

La migración funcionó correctamente.

## 🔴 Problema Actual

Error: `406 (Not Acceptable)` al intentar leer `time_entries`

**Causa:** RLS (Row Level Security) está bloqueando las consultas.

## ✅ Solución Rápida

### Paso 1: Desactivar RLS en Supabase

1. **Ve a Supabase Dashboard** > **SQL Editor**
2. **Ejecuta este código:**

```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE incidents DISABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_times DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;
```

3. **Haz clic en "Run"** (o Ctrl+Enter)

### Paso 2: Verificar

Ejecuta esto para verificar que RLS está desactivado:

```sql
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('users', 'organizations', 'organization_members', 'time_entries', 'incidents', 'scheduled_times', 'audit_logs')
ORDER BY tablename;
```

**Si `rowsecurity` es `f` (false)**, RLS está desactivado ✅

### Paso 3: Recargar la App

1. **Recarga la página** en el navegador (F5)
2. **Los errores 406 deberían desaparecer**

---

## 📋 Archivo Creado

He creado el archivo `desactivar-rls-completo.sql` que puedes ejecutar directamente en SQL Editor.

---

## ✅ Después de Desactivar RLS

1. ✅ No más errores 406
2. ✅ Puedes leer y escribir datos sin problemas
3. ✅ La app debería funcionar completamente

---

**Ejecuta el SQL para desactivar RLS y luego recarga la página. ¿Funciona ahora?** 🔧



