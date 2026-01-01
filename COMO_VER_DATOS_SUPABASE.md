# 👀 Cómo Ver tus Datos en Supabase - Guía Paso a Paso

## 📍 Paso 1: Acceder al Dashboard de Supabase

1. **Abre tu navegador** y ve a: [https://supabase.com/dashboard](https://supabase.com/dashboard)

2. **Inicia sesión** con tu cuenta de Supabase (la misma que usaste para crear el proyecto)

3. **Selecciona tu proyecto**:
   - Deberías ver un proyecto llamado algo como `control-horario` o el nombre que le pusiste
   - Haz clic en él para entrar

---

## 📊 Paso 2: Ver las Tablas (Table Editor)

Una vez dentro de tu proyecto:

1. **En el menú lateral izquierdo**, busca y haz clic en **"Table Editor"** (o "Editor de Tablas")
   - Está en la sección de "Database" o "Base de Datos"

2. **Verás una lista de tablas**:
   - `users` - Usuarios de la app
   - `organizations` - Restaurantes
   - `organization_members` - Relación usuarios-restaurantes
   - `time_entries` - Fichajes (entradas/salidas)
   - `incidents` - Incidencias
   - `scheduled_times` - Horarios programados
   - `audit_logs` - Registro de auditoría

---

## 🔍 Paso 3: Ver Datos Específicos

### Ver Restaurantes Creados:

1. Haz clic en la tabla **`organizations`**
2. Verás una tabla con columnas:
   - `id` - ID único del restaurante
   - `name` - Nombre del restaurante
   - `address` - Dirección
   - `latitude` - Latitud GPS
   - `longitude` - Longitud GPS
   - `allowed_radius` - Radio permitido
   - `timezone` - Zona horaria
   - `created_at` - Fecha de creación

**Si no ves datos**, significa que aún no has creado un restaurante desde la app.

### Ver Usuarios/Empleados:

1. Haz clic en la tabla **`users`**
2. Verás:
   - `id` - ID único del usuario
   - `email` - Email del usuario
   - `full_name` - Nombre completo
   - `password_hash` - Hash de la contraseña
   - `created_at` - Fecha de creación

### Ver Fichajes:

1. Haz clic en la tabla **`time_entries`**
2. Verás:
   - `id` - ID único del fichaje
   - `organization_id` - ID del restaurante
   - `user_id` - ID del usuario que fichó
   - `type` - `ENTRY` (entrada) o `EXIT` (salida)
   - `timestamp` - Fecha y hora del fichaje
   - `latitude` - Latitud GPS
   - `longitude` - Longitud GPS
   - `device_info` - Información del dispositivo

---

## 🧪 Paso 4: Probar que Funciona

### Test Completo:

1. **Abre tu app** en `http://localhost:3000`

2. **Inicia sesión** como ADMIN

3. **Crea un restaurante**:
   - Ve a la pestaña "Restaurantes"
   - Haz clic en "Crear Restaurante"
   - Completa el formulario y guarda

4. **Vuelve a Supabase Dashboard**:
   - Ve a **Table Editor** > **`organizations`**
   - Deberías ver tu restaurante recién creado
   - Si lo ves, ¡funciona! ✅

5. **Crea un empleado**:
   - En la app, ve a "Personal"
   - Crea un trabajador
   - Vuelve a Supabase > **`users`**
   - Deberías ver el nuevo usuario

6. **Ficha entrada/salida**:
   - Inicia sesión como el empleado
   - Ficha entrada
   - Vuelve a Supabase > **`time_entries`**
   - Deberías ver el fichaje

---

## 🔧 Paso 5: Usar SQL Editor (Avanzado)

Si quieres hacer consultas más complejas:

1. En el menú lateral, haz clic en **"SQL Editor"** (o "Editor SQL")

2. **Escribe una consulta**, por ejemplo:
   ```sql
   -- Ver todos los restaurantes
   SELECT * FROM organizations;
   
   -- Ver todos los fichajes de hoy
   SELECT * FROM time_entries 
   WHERE timestamp::date = CURRENT_DATE;
   
   -- Ver usuarios con sus restaurantes
   SELECT u.email, u.full_name, o.name as restaurant
   FROM users u
   JOIN organization_members om ON u.id = om.user_id
   JOIN organizations o ON om.organization_id = o.id;
   ```

3. Haz clic en **"Run"** (o presiona `Ctrl+Enter`)

---

## 📸 Ubicación Visual en el Dashboard

```
Supabase Dashboard
├── 🏠 Overview (Vista general)
├── 📊 Table Editor ← AQUÍ VES TUS DATOS
├── 🔍 SQL Editor (Consultas SQL)
├── 🔐 Authentication (Autenticación)
├── ⚙️ Settings (Configuración)
└── ...
```

---

## 🆘 Si No Ves Datos

### Problema 1: No hay tablas
**Solución**: Ejecuta el schema SQL
1. Ve a **SQL Editor**
2. Abre el archivo `supabase/schema.sql` de tu proyecto
3. Copia TODO el contenido
4. Pégalo en SQL Editor
5. Haz clic en **"Run"**

### Problema 2: Las tablas existen pero están vacías
**Solución**: 
1. Verifica que `NEXT_PUBLIC_USE_SUPABASE=true` en `.env.local`
2. Reinicia el servidor (`npm run dev`)
3. Crea datos desde la app
4. Vuelve a verificar en Table Editor

### Problema 3: No puedo acceder al Dashboard
**Solución**:
1. Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Inicia sesión
3. Si no ves tu proyecto, verifica que estés en la cuenta correcta

---

## 🎯 Resumen Rápido

1. **Abre**: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. **Selecciona** tu proyecto
3. **Haz clic** en **"Table Editor"** (menú lateral izquierdo)
4. **Selecciona** una tabla (`organizations`, `users`, `time_entries`, etc.)
5. **Verás** todos los datos guardados

---

## 💡 Tip: Refrescar Datos

Si creas datos en la app y no los ves en Supabase:
- Haz clic en el botón de **"Refresh"** (actualizar) en Table Editor
- O simplemente cambia de tabla y vuelve

¡Ya puedes ver todos tus datos! 🎉


