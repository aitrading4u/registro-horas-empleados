# ⚠️ IMPORTANTE: Ejecuta Este SQL en Supabase

## 🔴 Problema Actual

Sigue habiendo errores **406 (Not Acceptable)** porque RLS está bloqueando las consultas.

## ✅ Solución: Ejecuta Este SQL

### Paso 1: Ve a Supabase Dashboard

1. Abre: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **SQL Editor** (menú lateral izquierdo)

### Paso 2: Copia y Pega Este Código

```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE incidents DISABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_times DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;
```

### Paso 3: Ejecuta

1. Haz clic en **"Run"** (o presiona `Ctrl+Enter`)
2. Deberías ver: ✅ "Success. No rows returned"

### Paso 4: Verifica

Ejecuta esto para verificar:

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

### Paso 5: Recarga la App

1. Recarga la página en el navegador (F5)
2. Los errores 406 deberían desaparecer

---

## 📋 Archivo Listo

También puedes abrir el archivo `desactivar-rls-completo.sql` de este proyecto y copiar su contenido.

---

**Ejecuta el SQL ahora y luego recarga la página. ¿Funciona?** 🔧


