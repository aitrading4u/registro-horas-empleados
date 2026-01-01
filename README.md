# Control Horario - Restaurantes

Sistema SaaS de control horario profesional para múltiples restaurantes.

## 🚀 Tecnologías

- **Next.js 14** (App Router)
- **TypeScript**
- **Supabase** (Backend, Auth, Database)
- **Tailwind CSS**
- **PWA Ready**

## 📋 Requisitos Previos

- Node.js 18+ 
- Cuenta de Supabase (gratuita)

## 🔧 Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
   - Copiar `.env.local.example` a `.env.local`
   - Completar con tus credenciales de Supabase

3. Ejecutar en desarrollo:
```bash
npm run dev
```

4. Abrir [http://localhost:3000](http://localhost:3000)

## 📁 Estructura del Proyecto

```
/
├── app/              # Next.js App Router
├── components/       # Componentes React
├── lib/             # Utilidades y configuración
├── types/           # TypeScript types
└── supabase/        # Configuración Supabase
```

## 🔐 Seguridad

- Row Level Security (RLS) en todas las tablas
- Aislamiento multi-tenant por organización
- Verificación de roles en cada operación

## 🗄️ Configuración de Supabase

**¡El plan gratuito es suficiente para empezar!** Incluye:
- 500 MB de base de datos
- 50,000 usuarios activos mensuales
- 5 GB de ancho de banda

### Pasos Rápidos:

1. **Crear proyecto en Supabase**: [https://supabase.com](https://supabase.com)
2. **Obtener credenciales**: Settings > API
3. **Configurar `.env.local`**: Copia `env.example` y añade tus credenciales
4. **Ejecutar schema SQL**: Ve a SQL Editor en Supabase y ejecuta `supabase/schema.sql`

📖 **Guía completa**: Lee `SUPABASE_SETUP.md` para instrucciones detalladas

## 📝 Estado del Proyecto

1. ✅ Estructura del proyecto
2. ✅ Configuración Supabase (preparado)
3. ✅ Esquema de base de datos
4. ✅ Sistema de fichaje (mock)
5. ✅ Gestión de restaurantes (mock)
6. ✅ Gestión de personal (mock)
7. ✅ Sistema de incidencias (mock)
8. ✅ Calendario y reportes (mock)
9. ⏳ Migración a Supabase real
10. ⏳ Autenticación real
11. ⏳ Despliegue en producción

