# 🔍 Debug: No Veo Datos en Supabase

## ✅ Checklist de Verificación

### 1. Verificar que Estás Usando Supabase

Abre `.env.local` y verifica:
```env
NEXT_PUBLIC_USE_SUPABASE=true
```

**Si es `false`:**
- Cámbialo a `true`
- Reinicia el servidor (Ctrl+C y luego `npm run dev`)
- Crea el restaurante de nuevo

### 2. Verificar Errores en la Consola

1. **Abre tu app** en `http://localhost:3000`
2. **Abre la consola** (F12)
3. **Ve a la pestaña "Console"**
4. **Busca errores en rojo**:
   - `401 Unauthorized` → Problema de permisos
   - `406 Not Acceptable` → Problema de RLS
   - `relation does not exist` → Las tablas no existen
   - `Failed to fetch` → Problema de conexión

**¿Qué errores ves?** Compártelos.

### 3. Verificar en Supabase SQL Editor

1. **Ve a Supabase Dashboard** > **SQL Editor**
2. **Ejecuta esto** para ver si hay datos:
   ```sql
   SELECT * FROM organizations;
   ```
3. **Haz clic en "Run"**
4. **¿Qué ves?**
   - Si ves tu restaurante → ✅ Los datos están ahí
   - Si está vacío → Los datos no se guardaron

### 4. Desactivar RLS Completamente

Si RLS está bloqueando, ejecuta esto en SQL Editor:

```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE incidents DISABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_times DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;
```

Luego:
1. Reinicia el servidor
2. Crea el restaurante de nuevo
3. Verifica en SQL Editor: `SELECT * FROM organizations;`

### 5. Verificar Variables de Entorno

Asegúrate de que `.env.local` tenga:

```env
NEXT_PUBLIC_USE_SUPABASE=true
NEXT_PUBLIC_SUPABASE_URL=https://jawofdrbqwarsnwqywah.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

**IMPORTANTE:** Después de cambiar `.env.local`, **SIEMPRE reinicia el servidor**.

### 6. Probar Crear un Restaurante de Nuevo

1. **Abre la app** (`localhost:3000`)
2. **Inicia sesión**
3. **Ve a "Restaurantes"**
4. **Crea un restaurante nuevo**
5. **Abre la consola** (F12) y revisa si hay errores
6. **Ve a Supabase** > SQL Editor
7. **Ejecuta**: `SELECT * FROM organizations;`
8. **¿Aparece el restaurante?**

---

## 🆘 Solución Rápida

### Paso 1: Desactivar RLS
En Supabase SQL Editor, ejecuta:
```sql
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members DISABLE ROW LEVEL SECURITY;
```

### Paso 2: Verificar .env.local
```env
NEXT_PUBLIC_USE_SUPABASE=true
```

### Paso 3: Reiniciar Servidor
```bash
# Detén (Ctrl+C)
npm run dev
```

### Paso 4: Crear Restaurante de Nuevo
En la app, crea un restaurante nuevo.

### Paso 5: Verificar en SQL Editor
```sql
SELECT * FROM organizations;
```

---

## 🔍 Verificar en Table Editor

1. **Ve a Table Editor** > `organizations`
2. **Haz clic en "Refresh"** (actualizar)
3. **O recarga la página** (F5)
4. **¿Ves tu restaurante?**

---

## 📋 Información que Necesito

Para ayudarte mejor, comparte:

1. **¿Qué ves en SQL Editor cuando ejecutas `SELECT * FROM organizations;`?**
   - Vacío
   - Tu restaurante
   - Error

2. **¿Qué errores hay en la consola del navegador (F12)?**
   - Copia los errores en rojo

3. **¿El restaurante aparece en la app?**
   - Sí / No

4. **¿Ejecutaste el SQL para desactivar RLS?**
   - Sí / No

---

**Con esta información podré ayudarte mejor.** 🔧



