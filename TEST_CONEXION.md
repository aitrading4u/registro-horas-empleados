# 🧪 Test de Conexión con Supabase

## ✅ Checklist de Verificación

### 1. Variables de Entorno (.env.local)

Asegúrate de tener esto en `.env.local`:

```env
NEXT_PUBLIC_USE_SUPABASE=true
NEXT_PUBLIC_SUPABASE_URL=https://jawofdrbqwarsnwqywah.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imphd29mZHJicXdhcnNud3F5d2FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2NjY1MzEsImV4cCI6MjA4MjI0MjUzMX0.nWcdpSUM-RZLO9fUNbHQDejpcimienR_v51TAgzbOCc
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imphd29mZHJicXdhcnNud3F5d2FoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjY2NjUzMSwiZXhwIjoyMDgyMjQyNTMxfQ.9XDkLiZ2h77vJpPHsUvCcLUIjSi8PnKv3vQUGpozexc
```

### 2. Ejecutar Schema SQL en Supabase

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **SQL Editor**
4. Abre el archivo `supabase/schema.sql` de este proyecto
5. Copia TODO el contenido
6. Pégalo en SQL Editor
7. Haz clic en **"Run"** (o Ctrl+Enter)
8. Deberías ver: ✅ "Success. No rows returned"

### 3. Desactivar RLS (Solo para desarrollo)

1. En SQL Editor, ejecuta el archivo `verificar-supabase.sql`
2. O ejecuta directamente:
```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE incidents DISABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_times DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;
```

### 4. Reiniciar el Servidor

```bash
# Detén el servidor (Ctrl+C)
# Luego:
npm run dev
```

### 5. Probar la Conexión

1. Abre `http://localhost:3000`
2. Inicia sesión (o crea un usuario nuevo)
3. Crea un restaurante
4. Ve a Supabase Dashboard > Table Editor > `organizations`
5. Deberías ver tu restaurante ✅

---

## 🆘 Si Algo Falla

### Error: "Cannot read properties of undefined"
- Verifica que `NEXT_PUBLIC_USE_SUPABASE=true` en `.env.local`
- Reinicia el servidor

### Error: "401 Unauthorized" o "406 Not Acceptable"
- Ejecuta el script para desactivar RLS (paso 3)
- Verifica que `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` esté configurado

### Error: "relation does not exist"
- Ejecuta el `schema.sql` completo en SQL Editor

### No veo datos en Supabase
- Abre la consola del navegador (F12)
- Revisa si hay errores
- Verifica que las tablas existan en Table Editor

---

## ✅ Todo Listo Cuando:

1. ✅ `NEXT_PUBLIC_USE_SUPABASE=true` en `.env.local`
2. ✅ Schema SQL ejecutado en Supabase
3. ✅ RLS desactivado (solo desarrollo)
4. ✅ Servidor reiniciado
5. ✅ Puedes crear restaurantes y verlos en Supabase

¡Listo para usar! 🎉



