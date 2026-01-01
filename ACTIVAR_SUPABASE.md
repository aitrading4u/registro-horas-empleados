# 🚀 Activar Supabase - Guía Rápida

## ✅ Paso 1: Activar Supabase en tu App

Edita el archivo `.env.local` y cambia:

```env
NEXT_PUBLIC_USE_SUPABASE=true
```

**Asegúrate de tener estas variables configuradas:**
```env
NEXT_PUBLIC_USE_SUPABASE=true
NEXT_PUBLIC_SUPABASE_URL=https://jawofdrbqwarsnwqywah.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imphd29mZHJicXdhcnNud3F5d2FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2NjY1MzEsImV4cCI6MjA4MjI0MjUzMX0.nWcdpSUM-RZLO9fUNbHQDejpcimienR_v51TAgzbOCc
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imphd29mZHJicXdhcnNud3F5d2FoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjY2NjUzMSwiZXhwIjoyMDgyMjQyNTMxfQ.9XDkLiZ2h77vJpPHsUvCcLUIjSi8PnKv3vQUGpozexc
```

## 🔄 Paso 2: Reiniciar el Servidor

1. Detén el servidor (Ctrl+C en la terminal)
2. Inicia de nuevo: `npm run dev`
3. Abre `http://localhost:3000`

## 🧪 Paso 3: Probar

1. Inicia sesión
2. Crea un restaurante
3. Ve a Supabase Dashboard > Table Editor > `organizations`
4. Deberías ver tu restaurante creado

---

## 🌐 ¿Funciona 24/7 sin mi ordenador?

### Supabase (Base de Datos)
✅ **SÍ** - Funciona 24/7 en la nube, no necesitas tu ordenador

### Next.js (Aplicación Web)
- ❌ **NO** si solo corre en `localhost:3000` (necesitas tu PC encendido)
- ✅ **SÍ** si la despliegas en Vercel (gratis)

---

## 🚀 Desplegar en Vercel (GRATIS - Funciona 24/7)

### Opción Rápida:

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
   - **Configura estas variables de entorno:**
     - `NEXT_PUBLIC_USE_SUPABASE` = `true`
     - `NEXT_PUBLIC_SUPABASE_URL` = `https://jawofdrbqwarsnwqywah.supabase.co`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `tu-anon-key`
     - `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` = `tu-service-role-key`
   - Haz clic en **"Deploy"**

3. **¡Listo!** Tu app estará en `https://tu-app.vercel.app` funcionando 24/7

---

## 👥 Crear Empleados

### Desde la App (Recomendado):

1. Inicia sesión como **ADMIN**
2. Ve a **"Personal"** (pestaña en la barra superior)
3. Haz clic en **"Crear Trabajador"**
4. Completa:
   - Nombre completo
   - Email
   - Contraseña (3 dígitos)
   - Rol
   - Horarios programados
5. Guarda

Los empleados podrán iniciar sesión con su email y contraseña de 3 dígitos.

---

## 🆘 Problemas Comunes

### Error: "Cannot read properties of undefined"
- Verifica que `NEXT_PUBLIC_USE_SUPABASE=true` en `.env.local`
- Reinicia el servidor

### Error: "401 Unauthorized"
- Verifica que `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` esté configurado
- Reinicia el servidor

### Los datos no se guardan
- Abre la consola del navegador (F12)
- Revisa si hay errores
- Verifica en Supabase Dashboard que las tablas existan

---

## 📝 Resumen

| Componente | Funciona 24/7 | Notas |
|------------|---------------|-------|
| Supabase | ✅ SÍ | Siempre disponible |
| App localhost | ❌ NO | Necesitas tu PC |
| App en Vercel | ✅ SÍ | Gratis, 24/7 |

**Para producción:** Despliega en Vercel y funcionará 24/7 sin tu ordenador.


