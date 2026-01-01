# 🚀 Guía: Activar Supabase y Desplegar para Producción

## 📋 Resumen Rápido

### ¿Funciona 24/7 sin mi ordenador?

**SÍ y NO** - Depende de dónde esté desplegada la app:

1. **Supabase (Base de Datos)**: ✅ **SÍ funciona 24/7** - Es un servicio en la nube
2. **Next.js (Aplicación Web)**: 
   - ❌ **NO** si solo corre en tu ordenador (desarrollo local)
   - ✅ **SÍ** si la despliegas en Vercel/Railway (gratis)

---

## 🎯 Paso 1: Activar Supabase en tu App

### 1.1 Verificar que el Schema esté ejecutado

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Ve a **SQL Editor**
3. Verifica que las tablas existan (ve a **Table Editor**):
   - ✅ `users`
   - ✅ `organizations`
   - ✅ `organization_members`
   - ✅ `time_entries`
   - ✅ `incidents`
   - ✅ `scheduled_times`
   - ✅ `audit_logs`

**Si no existen**, ejecuta el archivo `supabase/schema.sql` en el SQL Editor.

### 1.2 Activar Supabase en `.env.local`

Edita el archivo `.env.local` en la raíz del proyecto y asegúrate de tener:

```env
# Activar Supabase
NEXT_PUBLIC_USE_SUPABASE=true

# Credenciales de Supabase (ya las tienes)
NEXT_PUBLIC_SUPABASE_URL=https://jawofdrbqwarsnwqywah.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 1.3 Reiniciar el servidor

```bash
# Detén el servidor (Ctrl+C)
# Luego inicia de nuevo:
npm run dev
```

### 1.4 Probar la conexión

1. Abre `http://localhost:3000`
2. Inicia sesión
3. Crea un restaurante
4. Verifica en Supabase Dashboard > **Table Editor** > `organizations` que se haya creado

---

## 🌐 Paso 2: Desplegar para Producción (24/7)

### Opción A: Vercel (Recomendado - GRATIS)

**Ventajas:**
- ✅ Gratis para proyectos personales
- ✅ Funciona 24/7 sin tu ordenador
- ✅ Despliegue automático desde GitHub
- ✅ HTTPS incluido
- ✅ Dominio gratuito (tu-app.vercel.app)

**Pasos:**

1. **Sube tu código a GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/tu-usuario/tu-repo.git
   git push -u origin main
   ```

2. **Conecta con Vercel:**
   - Ve a [vercel.com](https://vercel.com)
   - Inicia sesión con GitHub
   - Haz clic en **"Add New Project"**
   - Selecciona tu repositorio
   - Configura las variables de entorno:
     - `NEXT_PUBLIC_USE_SUPABASE` = `true`
     - `NEXT_PUBLIC_SUPABASE_URL` = `https://jawofdrbqwarsnwqywah.supabase.co`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `tu-anon-key`
     - `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` = `tu-service-role-key`
   - Haz clic en **"Deploy"**

3. **¡Listo!** Tu app estará en `https://tu-app.vercel.app`

### Opción B: Railway (Alternativa - GRATIS con límites)

1. Ve a [railway.app](https://railway.app)
2. Inicia sesión con GitHub
3. Crea un nuevo proyecto
4. Conecta tu repositorio
5. Configura las variables de entorno
6. Railway desplegará automáticamente

### Opción C: Render (Alternativa - GRATIS)

1. Ve a [render.com](https://render.com)
2. Crea una cuenta
3. Conecta tu repositorio
4. Configura las variables de entorno
5. Render desplegará automáticamente

---

## 👥 Paso 3: Crear Empleados en Supabase

### Opción A: Desde la App (Recomendado)

1. Inicia sesión como **ADMIN**
2. Ve a la pestaña **"Personal"**
3. Haz clic en **"Crear Trabajador"**
4. Completa el formulario:
   - Nombre completo
   - Email
   - Contraseña (3 dígitos)
   - Rol (EMPLEADO, ENCARGADO, ADMIN)
   - Horarios programados (opcional)
5. Guarda

### Opción B: Desde Supabase Dashboard (Manual)

1. Ve a **Table Editor** > `users`
2. Haz clic en **"Insert row"**
3. Completa:
   - `id`: Genera un UUID (usa el botón de generar)
   - `email`: `empleado@ejemplo.com`
   - `full_name`: `Nombre del Empleado`
   - `password_hash`: Hash de la contraseña (por ahora usa texto plano para pruebas)
   - `created_at`: Fecha actual
4. Luego ve a `organization_members` y crea la relación:
   - `user_id`: El ID del usuario que acabas de crear
   - `organization_id`: El ID de tu restaurante
   - `role`: `EMPLOYEE` o `MANAGER`

---

## 🔐 Paso 4: Configurar RLS para Producción

**IMPORTANTE:** Para producción, necesitas configurar RLS correctamente.

### 4.1 Desactivar RLS temporalmente (Solo para desarrollo)

Si aún tienes problemas, ejecuta en SQL Editor:

```sql
-- SOLO PARA DESARROLLO - Desactiva RLS
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE incidents DISABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_times DISABLE ROW LEVEL SECURITY;
```

### 4.2 Configurar RLS para producción (Más adelante)

Cuando migres a autenticación real de Supabase, necesitarás políticas RLS adecuadas. Por ahora, con `service_role_key` funciona sin RLS.

---

## 📊 Paso 5: Verificar que Funciona

### 5.1 Probar desde la App

1. Inicia sesión como ADMIN
2. Crea un restaurante
3. Crea un empleado
4. Cierra sesión
5. Inicia sesión como el empleado
6. Ficha entrada/salida
7. Verifica en Supabase Dashboard > `time_entries` que se haya guardado

### 5.2 Verificar en Supabase Dashboard

1. Ve a **Table Editor**
2. Revisa las tablas:
   - `users`: Deberías ver tus usuarios
   - `organizations`: Deberías ver tus restaurantes
   - `time_entries`: Deberías ver los fichajes

---

## 🎯 Resumen: ¿Qué Funciona 24/7?

| Servicio | Funciona 24/7 | Notas |
|----------|---------------|-------|
| **Supabase (BD)** | ✅ SÍ | Siempre disponible en la nube |
| **App en localhost** | ❌ NO | Solo cuando tu PC está encendido |
| **App en Vercel** | ✅ SÍ | Funciona 24/7, gratis |
| **App en Railway** | ✅ SÍ | Funciona 24/7, gratis con límites |

---

## 🚨 Problemas Comunes

### Error: "Cannot read properties of undefined"
- **Solución**: Verifica que `NEXT_PUBLIC_USE_SUPABASE=true` en `.env.local`
- Reinicia el servidor después de cambiar `.env.local`

### Error: "401 Unauthorized" o "406 Not Acceptable"
- **Solución**: Usa `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` en desarrollo
- O desactiva RLS temporalmente (ver Paso 4.1)

### Error: "relation does not exist"
- **Solución**: Ejecuta `supabase/schema.sql` en SQL Editor de Supabase

### Los datos no se guardan
- **Solución**: 
  1. Verifica que `NEXT_PUBLIC_USE_SUPABASE=true`
  2. Revisa la consola del navegador para errores
  3. Verifica en Supabase Dashboard que las tablas existan

---

## 📝 Próximos Pasos

1. ✅ Activar Supabase en `.env.local`
2. ✅ Probar crear restaurantes y empleados
3. ✅ Desplegar en Vercel para producción
4. ⏳ Migrar a autenticación real de Supabase (opcional)
5. ⏳ Configurar dominio personalizado (opcional)

---

## 🆘 ¿Necesitas Ayuda?

- Revisa los logs en la consola del navegador
- Revisa los logs en Supabase Dashboard > **Logs**
- Verifica que todas las variables de entorno estén configuradas

¡Tu app estará funcionando 24/7 en la nube! 🎉


