# 🚀 Guía de Configuración de Supabase

## Plan Gratuito de Supabase

El plan gratuito incluye:
- ✅ **2 proyectos** por organización
- ✅ **500 MB** de almacenamiento en base de datos
- ✅ **1 GB** de almacenamiento de archivos
- ✅ **50,000 usuarios activos** mensuales
- ✅ **500,000 invocaciones** de Edge Functions
- ✅ **2 millones de mensajes** en tiempo real
- ✅ **200 conexiones concurrentes** en tiempo real
- ✅ **5 GB de ancho de banda**

**¡Perfecto para desarrollo y pruebas!** 🎉

---

## Paso 1: Crear Proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Inicia sesión o crea una cuenta
3. Haz clic en **"New Project"**
4. Completa el formulario:
   - **Name**: `control-horario` (o el nombre que prefieras)
   - **Database Password**: Crea una contraseña segura (guárdala)
   - **Region**: Elige la más cercana (ej: `West Europe` para España)
5. Espera 2-3 minutos mientras se crea el proyecto

---

## Paso 2: Obtener Credenciales

1. En el Dashboard de Supabase, ve a **Settings** > **API**
2. Copia estos valores:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (clave larga)

---

## Paso 3: Configurar Variables de Entorno

1. Crea un archivo `.env.local` en la raíz del proyecto:

```bash
cp .env.local.example .env.local
```

2. Edita `.env.local` y añade tus credenciales:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

---

## Paso 4: Crear el Esquema de Base de Datos

1. En Supabase Dashboard, ve a **SQL Editor**
2. Haz clic en **"New Query"**
3. Abre el archivo `supabase/schema.sql` de este proyecto
4. Copia TODO el contenido y pégalo en el editor SQL
5. Haz clic en **"Run"** (o presiona `Ctrl+Enter`)
6. Deberías ver: ✅ "Success. No rows returned"

---

## Paso 5: Verificar las Tablas

1. Ve a **Table Editor** en el Dashboard
2. Deberías ver estas tablas:
   - ✅ `users`
   - ✅ `organizations`
   - ✅ `organization_members`
   - ✅ `time_entries`
   - ✅ `incidents`
   - ✅ `scheduled_times`
   - ✅ `audit_logs`

---

## Paso 6: Configurar Autenticación (Opcional)

Por ahora, la app usa autenticación mock. Para usar autenticación real de Supabase:

1. Ve a **Authentication** > **Providers**
2. Habilita **Email** (ya viene habilitado por defecto)
3. Opcional: Configura otros proveedores (Google, GitHub, etc.)

---

## Paso 7: Probar la Conexión

1. Reinicia tu servidor de desarrollo:
```bash
npm run dev
```

2. La app debería conectarse a Supabase automáticamente

---

## 🔧 Migración desde Mock Database

Para migrar tus datos del mock database a Supabase:

1. Los datos están en `localStorage` del navegador
2. Puedes crear un script de migración (próximamente)
3. O simplemente empezar de cero en Supabase

---

## 📝 Notas Importantes

### Row Level Security (RLS)
- ✅ Ya está configurado en el esquema
- ✅ Protege los datos por organización (multi-tenant)
- ✅ Solo los miembros pueden ver datos de su organización

### Autenticación
- Por ahora, la app usa `auth-mock.ts`
- Para producción, necesitarás migrar a autenticación real de Supabase
- El esquema ya está preparado para `auth.uid()`

### Límites del Plan Gratuito
- **500 MB** es suficiente para ~100,000 fichajes
- Si necesitas más, considera el plan Pro ($25/mes)

---

## 🆘 Solución de Problemas

### Error: "relation does not exist"
- Verifica que ejecutaste el `schema.sql` completo
- Revisa que todas las tablas se crearon en Table Editor

### Error: "permission denied"
- Verifica que RLS está habilitado
- Revisa las políticas de seguridad en SQL Editor

### Error: "invalid API key"
- Verifica que copiaste correctamente las credenciales
- Asegúrate de usar `NEXT_PUBLIC_` en las variables de entorno

---

## 🎯 Próximos Pasos

1. ✅ Crear proyecto en Supabase
2. ✅ Ejecutar schema.sql
3. ✅ Configurar .env.local
4. ⏳ Migrar código de mock a Supabase real
5. ⏳ Configurar autenticación real
6. ⏳ Desplegar en Vercel (gratis también)

---

¿Necesitas ayuda? Revisa la [documentación de Supabase](https://supabase.com/docs)


