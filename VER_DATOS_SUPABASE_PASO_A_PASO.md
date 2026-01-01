# 👀 Cómo Ver tu Restaurante en Supabase - Paso a Paso

## 📍 Paso 1: Acceder al Dashboard

1. **Abre tu navegador**
2. **Ve a**: [https://supabase.com/dashboard](https://supabase.com/dashboard)
3. **Inicia sesión** (si no estás logueado)
4. **Selecciona tu proyecto** (el que creaste antes)

---

## 📊 Paso 2: Ir al Table Editor

1. **En el menú lateral izquierdo**, busca:
   - **"Table Editor"** (en inglés)
   - O **"Editor de Tablas"** (en español)
   
2. **Haz clic** en "Table Editor"

   📍 **Ubicación visual:**
   ```
   Dashboard
   ├── 🏠 Overview
   ├── 📊 Table Editor ← AQUÍ
   ├── 🔍 SQL Editor
   ├── 🔐 Authentication
   └── ...
   ```

---

## 🏢 Paso 3: Ver tu Restaurante

1. **En la lista de tablas**, busca y haz clic en: **`organizations`**

2. **Deberías ver una tabla** con columnas como:
   - `id` - ID único
   - `name` - Nombre del restaurante
   - `address` - Dirección
   - `latitude` - Latitud
   - `longitude` - Longitud
   - `allowed_radius` - Radio permitido
   - `timezone` - Zona horaria
   - `created_at` - Fecha de creación

3. **Si ves tu restaurante** → ✅ **¡Funciona perfecto!**

4. **Si la tabla está vacía** → Sigue al Paso 4

---

## 🔍 Paso 4: Verificar que los Datos se Guardaron

### Opción A: Verificar en la App

1. **En tu app** (`localhost:3000`):
   - Ve a la pestaña **"Restaurantes"**
   - ¿Ves tu restaurante creado?
   - Si SÍ → Los datos están en la app
   - Si NO → El restaurante no se creó

### Opción B: Verificar en la Consola del Navegador

1. **Abre la consola** (F12 en Chrome/Edge)
2. **Ve a la pestaña "Console"**
3. **Busca errores en rojo**:
   - Si ves `401 Unauthorized` → Problema de permisos
   - Si ves `406 Not Acceptable` → Problema de RLS
   - Si ves `relation does not exist` → Las tablas no existen

---

## 🆘 Si No Ves el Restaurante en Supabase

### Problema 1: La Tabla Está Vacía

**Posibles causas:**
1. **RLS está bloqueando** (más probable)
2. **Los datos se guardaron en Mock DB** (no en Supabase)
3. **Error al guardar** (revisa la consola)

**Solución:**

1. **Verifica que estés usando Supabase:**
   - Abre `.env.local`
   - Verifica que: `NEXT_PUBLIC_USE_SUPABASE=true`
   - Si es `false`, cámbialo a `true` y reinicia el servidor

2. **Desactiva RLS temporalmente:**
   - Ve a **SQL Editor** en Supabase
   - Ejecuta esto:
   ```sql
   ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
   ALTER TABLE users DISABLE ROW LEVEL SECURITY;
   ALTER TABLE organization_members DISABLE ROW LEVEL SECURITY;
   ALTER TABLE time_entries DISABLE ROW LEVEL SECURITY;
   ALTER TABLE incidents DISABLE ROW LEVEL SECURITY;
   ALTER TABLE scheduled_times DISABLE ROW LEVEL SECURITY;
   ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;
   ```
   - Haz clic en **"Run"**

3. **Reinicia el servidor:**
   ```bash
   # Detén el servidor (Ctrl+C)
   npm run dev
   ```

4. **Crea el restaurante de nuevo** en la app

5. **Vuelve a Table Editor** > `organizations`
6. **Haz clic en el botón de "Refresh"** (actualizar) o recarga la página

### Problema 2: La Tabla No Existe

**Solución:**
1. Ve a **SQL Editor**
2. Ejecuta el archivo `supabase/schema-safe.sql`
3. Verifica en **Table Editor** que las tablas existan

### Problema 3: Los Datos Están en Mock DB

**Solución:**
1. Verifica `.env.local`:
   ```env
   NEXT_PUBLIC_USE_SUPABASE=true
   ```
2. Si estaba en `false`, los datos se guardaron en `localStorage` (Mock DB)
3. Reinicia el servidor
4. Crea el restaurante de nuevo (ahora se guardará en Supabase)

---

## ✅ Verificación Final

### Checklist:

- [ ] Accedí a Supabase Dashboard
- [ ] Veo "Table Editor" en el menú
- [ ] Hice clic en la tabla `organizations`
- [ ] Veo mi restaurante en la lista
- [ ] Si no lo veo, ejecuté el SQL para desactivar RLS
- [ ] Reinicié el servidor
- [ ] Creé el restaurante de nuevo
- [ ] Actualicé la vista en Table Editor

---

## 🎯 Ubicación Exacta en Supabase

```
Supabase Dashboard
└── Tu Proyecto
    └── Table Editor (menú lateral izquierdo)
        └── organizations (tabla)
            └── Aquí deberías ver tu restaurante
```

---

## 💡 Tip: Refrescar los Datos

Si creas un restaurante y no lo ves:
1. **Haz clic en el botón de "Refresh"** en Table Editor
2. O **recarga la página** (F5)
3. O **cambia de tabla y vuelve** a `organizations`

---

## 🔍 Ver Todos los Datos Relacionados

Después de ver tu restaurante en `organizations`, también puedes ver:

1. **`users`** - Usuarios creados
2. **`organization_members`** - Relación usuarios-restaurantes
3. **`time_entries`** - Fichajes (cuando los empleados fichan)
4. **`incidents`** - Incidencias
5. **`scheduled_times`** - Horarios programados

---

**¿Sigues sin verlo?** Comparte:
1. ¿Qué ves en Table Editor > `organizations`? (vacío, error, etc.)
2. ¿Qué errores hay en la consola del navegador (F12)?
3. ¿El restaurante aparece en la app?


