# 🔧 SOLUCIÓN DEFINITIVA: Desactivar RLS

## 🔴 Problema

Sigue habiendo errores 406 incluso con service_role_key.

## ✅ SOLUCIÓN: Ejecuta Este SQL en Supabase

### Paso 1: Ve a Supabase SQL Editor

1. Abre: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a **SQL Editor**

### Paso 2: Ejecuta ESTE SQL (Copia TODO)

```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

**Haz clic en "Run"** ✅

Luego ejecuta:

```sql
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
```

**Haz clic en "Run"** ✅

Luego ejecuta:

```sql
ALTER TABLE organization_members DISABLE ROW LEVEL SECURITY;
```

**Haz clic en "Run"** ✅

Luego ejecuta:

```sql
ALTER TABLE time_entries DISABLE ROW LEVEL SECURITY;
```

**Haz clic en "Run"** ✅

Luego ejecuta:

```sql
ALTER TABLE incidents DISABLE ROW LEVEL SECURITY;
```

**Haz clic en "Run"** ✅

Luego ejecuta:

```sql
ALTER TABLE scheduled_times DISABLE ROW LEVEL SECURITY;
```

**Haz clic en "Run"** ✅

Luego ejecuta:

```sql
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;
```

**Haz clic en "Run"** ✅

### Paso 3: Verifica

Ejecuta esto para verificar:

```sql
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('users', 'organizations', 'organization_members', 'time_entries', 'incidents', 'scheduled_times', 'audit_logs');
```

**Si `rowsecurity` es `f` (false)**, RLS está desactivado ✅

### Paso 4: Verifica Variables de Entorno

Abre `.env.local` y asegúrate de tener:

```env
NEXT_PUBLIC_SUPABASE_URL=https://jawofdrbqwarsnwqywah.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
NEXT_PUBLIC_USE_SUPABASE=true
```

### Paso 5: Reinicia el Servidor

1. **Detén el servidor** (Ctrl+C en la terminal)
2. **Inicia de nuevo:** `npm run dev`
3. **Recarga la página** en el navegador (F5)

---

## ✅ Después de Esto

1. ✅ RLS desactivado
2. ✅ Service role key configurado
3. ✅ Servidor reiniciado
4. ✅ **La app debería funcionar completamente**

---

**Ejecuta el SQL línea por línea y luego reinicia el servidor. ¿Funciona ahora?** 🔧



