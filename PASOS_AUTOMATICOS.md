# 🚀 Pasos Automáticos - Todo Listo

## ✅ Lo que ya está hecho:

1. ✅ Código configurado para usar Supabase
2. ✅ Variables de entorno configuradas (`.env.local`)
3. ✅ Funciones de conexión listas
4. ✅ Scripts de verificación creados

## 📋 Lo que TÚ debes hacer (5 minutos):

### Paso 1: Ejecutar Schema SQL en Supabase (2 min)

1. **Abre**: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. **Selecciona** tu proyecto
3. **Ve a**: SQL Editor (menú lateral)
4. **Abre** el archivo `supabase/schema.sql` de este proyecto
5. **Copia TODO** el contenido (Ctrl+A, Ctrl+C)
6. **Pega** en SQL Editor (Ctrl+V)
7. **Ejecuta**: Haz clic en "Run" o presiona `Ctrl+Enter`
8. **Verifica**: Deberías ver ✅ "Success. No rows returned"

### Paso 2: Desactivar RLS (1 min)

1. **En SQL Editor**, ejecuta esto:

```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE incidents DISABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_times DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;
```

2. **Ejecuta** (Run o Ctrl+Enter)

### Paso 3: Reiniciar Servidor (30 seg)

1. **Detén** el servidor si está corriendo (Ctrl+C en la terminal)
2. **Inicia** de nuevo:
   ```bash
   npm run dev
   ```

### Paso 4: Probar (1 min)

1. **Abre**: `http://localhost:3000`
2. **Inicia sesión** (o crea un usuario)
3. **Crea un restaurante**
4. **Verifica en Supabase**:
   - Ve a Table Editor
   - Selecciona `organizations`
   - Deberías ver tu restaurante ✅

---

## 🎯 Resumen Rápido:

1. ✅ Ejecuta `schema.sql` en Supabase SQL Editor
2. ✅ Desactiva RLS (código SQL arriba)
3. ✅ Reinicia servidor (`npm run dev`)
4. ✅ Prueba creando un restaurante

---

## 📁 Archivos que creé para ti:

- ✅ `verificar-supabase.sql` - Script de verificación
- ✅ `TEST_CONEXION.md` - Guía de testing
- ✅ `PASOS_AUTOMATICOS.md` - Este archivo

---

## 🆘 Si algo falla:

1. **Revisa** la consola del navegador (F12)
2. **Verifica** que `NEXT_PUBLIC_USE_SUPABASE=true` en `.env.local`
3. **Revisa** los logs en Supabase Dashboard > Logs

---

**¡Solo necesitas ejecutar el SQL y reiniciar el servidor!** 🎉



